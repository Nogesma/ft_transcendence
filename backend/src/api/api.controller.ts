import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  Post,
  Param,
  Body,
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
    const uid = req?.uid;
    if (!uid) return res.status(HttpStatus.UNAUTHORIZED).end();

    const user = await getUser(uid);
    if (!user) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
    const { login, displayname } = user.toJSON();

    res.json({ login, displayname }).end();
  }

  @Get("2fa")
  async generateNew2FA(@Req() req: Request, @Res() res: Response) {
    const uid = req?.uid;
    if (!uid) return res.status(HttpStatus.UNAUTHORIZED).end();

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
    @Param() params: { code: string | undefined }
  ) {
    const uid = req?.uid;
    if (!uid) return res.status(HttpStatus.UNAUTHORIZED).end();
    if (!params.code) return res.status(HttpStatus.BAD_REQUEST).end();

    const TFA = await get2FASecret(uid);
    if (!TFA) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
    const { secret } = TFA.toJSON();

    const hasValidCode = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: params.code,
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
    const uid = req?.uid;
    if (!uid) return res.status(HttpStatus.UNAUTHORIZED).end();
    if (!body.name) return res.status(HttpStatus.BAD_REQUEST).end();

    await updateUserName(uid, body.name);
    res.end();
  }

  @Post("me/avatar")
  async updateAvatar(@Req() req: Request, @Res() res: Response) {
    const uid = req?.uid;
    if (!uid) return res.status(HttpStatus.UNAUTHORIZED).end();

    const bb = busboy({
      headers: req.headers,
      limits: { files: 1, fileSize: 1024 ** 2 }, // 1MB Max Size
    });

    bb.on("file", async (_, file, info) => {
      if ("image/jpeg" !== info.mimeType)
        return res.status(HttpStatus.BAD_REQUEST).end();

      file.once("readable", async () => {
        // Checks that magicNumber of file matches jpeg
        const magicNumber = file.read(3);
        const fileTypeResult = await fileTypeFromBuffer(magicNumber);
        if (!fileTypeResult || fileTypeResult.ext !== "jpg")
          return res.status(HttpStatus.BAD_REQUEST).end();

        const login = await getUserName(uid);
        if (!login) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();

        const imagePath = path.join(process.env.AVATAR_UPLOAD_PATH, login);

        // Checks for directory traversal
        if (imagePath.indexOf(process.env.AVATAR_UPLOAD_PATH) !== 0)
          return res.status(HttpStatus.FORBIDDEN).end();

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
