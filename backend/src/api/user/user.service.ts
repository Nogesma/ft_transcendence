import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  getUser,
  getUserName,
  updateUserName,
} from "../../database/controller.js";
import { Response, Request } from "express";
import { pick } from "ramda";
import busboy from "busboy";
import { fileTypeFromBuffer } from "file-type";
import path from "path";
import fs from "fs";

@Injectable()
export class UserService {
  async getUserData(id: number) {
    const user = await getUser(id);
    if (!user)
      throw new HttpException(
        "Could not find user",
        HttpStatus.INTERNAL_SERVER_ERROR
      );

    return pick(["login", "displayname"], user.toJSON());
  }

  async postDisplayName(id: number, name: string) {
    await updateUserName(id, name);
  }
  async postAvatar(req: Request, res: Response, id: number) {
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

        const login = await getUserName(id);
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
