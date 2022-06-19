import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  Post,
  Param,
  Body,
  HttpException,
} from "@nestjs/common";
import speakeasy from "speakeasy";
import {
  enableUser2FA,
  get2FASecret,
  getUser,
  getUserName,
  set2FASecret,
  setPermanent2FASecret,
  updateUserName,
} from "../database/controller.js";
import { fileTypeFromBuffer } from "file-type";
import busboy from "busboy";
import fs from "fs";
import path from "path";
import { Request, Response } from "express";

@Controller("api")
export class ApiController {
  @Get("me")
  async getUserData(@Req() req: Request, @Res() res: Response) {
    const user = await getUser(req.uid);
    if (!user)
      throw new HttpException(
        "Could not find user",
        HttpStatus.INTERNAL_SERVER_ERROR
      );

    const { login, displayname } = user.toJSON();

    res.json({ login, displayname }).end();
  }

  @Get("2fa")
  async generateNew2FA(@Req() req: Request, @Res() res: Response) {
    const uid = req.uid;

    const secret = speakeasy.generateSecret().base32;
    await set2FASecret(uid, secret);

    const login = await getUserName(uid);
    if (!login) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();

    const otpauthURL = speakeasy.otpauthURL({
      secret: secret,
      encoding: "base32",
      algorithm: "sha512",
      label: login,
      issuer: "ft_transcendence",
    });

    res.json({ otpauthURL }).end();
  }

  @Post("2fa/:code")
  async validate2FA(
    @Req() req: Request,
    @Res() res: Response,
    @Param("code") code: string
  ) {
    const uid = req.uid;

    const TFA = await get2FASecret(uid);
    if (!TFA) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
    const { secret } = TFA.toJSON();

    const hasValidCode = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: code,
      window: 1,
      algorithm: "sha512",
    });

    if (!hasValidCode) return res.status(HttpStatus.UNAUTHORIZED).end();

    setPermanent2FASecret(uid);
    enableUser2FA(uid);

    res.end();
  }

  @Post("me/name")
  async updateName(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: { name: string | undefined }
  ) {
    if (!body.name)
      throw new HttpException("Missing name in body", HttpStatus.BAD_REQUEST);

    await updateUserName(req.uid, body.name);
    res.end();
  }

  @Post("me/avatar")
  async updateAvatar(@Req() req: Request, @Res() res: Response) {
    const bb = busboy({
      headers: req.headers,
      limits: { files: 1, fileSize: 1024 ** 2 }, // 1MB Max Size
    });

    bb.on("file", async (_, file, info) => {
      if ("image/jpeg" !== info.mimeType)
        throw new HttpException(
          "Image mime type is not jpeg",
          HttpStatus.BAD_REQUEST
        );

      file.once("readable", async () => {
        // Checks that magicNumber of file matches jpeg
        const magicNumber = file.read(3);
        const fileTypeResult = await fileTypeFromBuffer(magicNumber);
        if (!fileTypeResult || fileTypeResult.ext !== "jpg")
          throw new HttpException("Image is not jpeg", HttpStatus.BAD_REQUEST);

        const login = await getUserName(req.uid);
        if (!login)
          throw new HttpException(
            "Could not find user",
            HttpStatus.INTERNAL_SERVER_ERROR
          );

        const imagePath = path.join(process.env.AVATAR_UPLOAD_PATH, login);

        // Checks for directory traversal
        if (imagePath.indexOf(process.env.AVATAR_UPLOAD_PATH) !== 0)
          throw new HttpException("Login is invalid", HttpStatus.FORBIDDEN);

        file.on("limit", () => {
          res.writeHead(HttpStatus.PAYLOAD_TOO_LARGE, { Connection: "close" });
          req.unpipe(bb);
          fs.unlinkSync(imagePath);
          return res.end();
        });

        bb.on("close", async () => {
          // This event fires when file is not valid or when we hit file size limit
          if (res.writableFinished) return;

          await fs.renameSync(imagePath, `${imagePath}.jpg`);
          res.writeHead(HttpStatus.CREATED, { Connection: "close" });
          return res.end();
        });

        // Rollback the number of bytes we read when checking the magic number
        await file.unshift(magicNumber);

        file.pipe(fs.createWriteStream(imagePath));
      });
    });

    req.pipe(bb);
  }
}
