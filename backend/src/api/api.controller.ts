import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  Post,
  Param,
  Body,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import speakeasy from "speakeasy";
import {
  enableUser2FA,
  get2FASecret,
  getUser,
  set2FASecret,
  setPermanent2FASecret,
  updateUserName,
} from "../database/controller.js";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  fileTypeFromBuffer,
  fileTypeFromStream,
  fileTypeStream,
} from "file-type";
import busboy from "busboy";
import fs from "fs";

@Controller("api")
export class ApiController {
  @Get("me")
  async getUserData(@Req() req, @Res() res) {
    const uid = req?.uid;

    if (!uid) return res.status(HttpStatus.UNAUTHORIZED).end();

    const { login, displayname } = (await getUser(uid)).toJSON();

    res.json({ login, displayname }).end();
  }

  @Get("2fa")
  async generateNew2FA(@Req() req, @Res() res) {
    const uid = req?.uid;

    if (!uid) return res.status(HttpStatus.UNAUTHORIZED).end();

    const secret = speakeasy.generateSecret().base32;

    await set2FASecret(uid, secret);

    const otpauthURL = speakeasy.otpauthURL({
      secret: secret,
      encoding: "base32",
      algorithm: "sha512",
      label: await (await getUser(uid)).toJSON().login,
      issuer: "ft_transcendence",
    });

    res.json({ otpauthURL }).end();
  }

  @Post("2fa/:code")
  async validate2FA(@Req() req, @Res() res, @Param() params) {
    const uid = req?.uid;

    if (!uid) return res.status(HttpStatus.UNAUTHORIZED).end();

    const { secret } = (await get2FASecret(uid)).toJSON();

    const hasValidCode = speakeasy.totp.verify({
      secret: secret,
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
  async updateName(@Req() req, @Res() res, @Body() body) {
    const uid = req?.uid;

    if (!uid) return res.status(HttpStatus.UNAUTHORIZED).end();

    const { name } = body;

    await updateUserName(uid, name);

    res.end();
  }

  @Post("me/avatar")
  async updateAvatar(@Req() req, @Res() res) {
    const uid = req?.uid;

    if (!uid) return res.status(HttpStatus.UNAUTHORIZED).end();

    const bb = busboy({
      headers: req.headers,
      limits: { files: 1, fileSize: 1024 ** 2 }, // 1MB Max Size
    });

    bb.on("file", async (name, file, info) => {
      if ("image/jpeg" !== info.mimeType) {
        console.log("BAD MIME", info);
        return res.status(HttpStatus.BAD_REQUEST).end();
      }

      file.once("readable", async () => {
        const magicNumber = file.read(3);

        const fileTypeResult = await fileTypeFromBuffer(magicNumber);

        if (!fileTypeResult || fileTypeResult.ext !== "jpg")
          return res.status(HttpStatus.BAD_REQUEST).end();

        const { login } = (await getUser(uid)).toJSON();
        // todo: maybe validate username to avoid path escape?

        const path = `${process.env.AVATAR_UPLOAD_PATH}/${login}`;

        file.on("limit", () => {
          res.writeHead(HttpStatus.PAYLOAD_TOO_LARGE, { Connection: "close" });
          req.unpipe(bb);
          fs.unlinkSync(path);
          return res.end();
        });

        bb.on("close", async () => {
          if (res.writableFinished) return;

          res.writeHead(HttpStatus.CREATED, { Connection: "close" });

          await fs.renameSync(path, `${path}.jpg`);

          return res.end();
        });

        await file.unshift(magicNumber);
        file.pipe(fs.createWriteStream(path));
      });
    });

    req.pipe(bb);
  }
}
