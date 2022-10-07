import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import type { Response, Request } from "express";
import { andThen, map, pick, pipe, prop } from "ramda";
import busboy from "busboy";
import { fileTypeFromBuffer } from "file-type";
import path from "path";
import fs from "fs";
import speakeasy from "speakeasy";
import { ConfigService } from "@nestjs/config";
import { UserService } from "../../models/user/user.service.js";
import { TFASecretService } from "../../models/TFASecret/TFASecret.service.js";
import type { User } from "../../models/user/user.model.js";
import { FriendService } from "../../models/friend/friend.service.js";
import { BlockService } from "../../models/block/block.service.js";

@Injectable()
export class SettingsService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly userService: UserService,
    private readonly tfaSecretService: TFASecretService,
    private readonly friendService: FriendService,
    private readonly blockService: BlockService
  ) {}

  getUserData = async (user: User) => {
    if (!user)
      throw new HttpException(
        "Could not find user",
        HttpStatus.INTERNAL_SERVER_ERROR
      );

    return pick(["login", "displayname", "id"], user);
  };

  get2FAStatus = async (id: number) => {
    const has2FA = await this.tfaSecretService.getTFASecret(id);

    return Boolean(has2FA && !has2FA.temp);
  };

  generateNew2FA = async (user: User) => {
    const tfaSecret = await user.$get("tfa_secret");
    if (tfaSecret) {
      if (tfaSecret.temp) await tfaSecret.destroy();
      else
        throw new HttpException("2FA already enabled", HttpStatus.BAD_REQUEST);
    }

    const secret = speakeasy.generateSecret().base32;
    await this.tfaSecretService.createTFASecret(user.id, secret, true);

    const otpauthURL = speakeasy.otpauthURL({
      secret: secret,
      encoding: "base32",
      algorithm: "sha512",
      label: user.login,
      issuer: "ft_transcendence",
    });

    return { otpauthURL };
  };

  validate2FA = async (id: number, token: string) => {
    const tfaSecret = await this.tfaSecretService.getTFASecret(id);
    if (!tfaSecret)
      throw new HttpException(
        "User does not have 2FA enabled",
        HttpStatus.BAD_REQUEST
      );

    const hasValidCode = speakeasy.totp.verify({
      secret: tfaSecret.secret,
      encoding: "base32",
      token,
      window: 1,
      algorithm: "sha512",
    });

    if (!hasValidCode)
      throw new HttpException("Invalid 2FA Code", HttpStatus.FORBIDDEN);

    tfaSecret.temp = false;
    await tfaSecret.save();
  };

  disable2FA = async (id: number, token: string) => {
    const tfaSecret = await this.tfaSecretService.getTFASecret(id);

    if (!tfaSecret)
      throw new HttpException(
        "Could not retrieve 2FA Secret",
        HttpStatus.INTERNAL_SERVER_ERROR
      );

    const hasValidCode = speakeasy.totp.verify({
      secret: tfaSecret.secret,
      encoding: "base32",
      token,
      window: 1,
      algorithm: "sha512",
    });

    if (!hasValidCode)
      throw new HttpException("Invalid 2FA Code", HttpStatus.FORBIDDEN);

    await tfaSecret.destroy();
  };

  postDisplayName = (id: number, name: string) =>
    this.userService.setUserDisplayName(id, name);

  postAvatar = (req: Request, res: Response, login: string) => {
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

        const imagePath = path.join(
          this.configService.get("AVATAR_UPLOAD_PATH"),
          login
        );

        // Checks for directory traversal
        if (
          imagePath.indexOf(this.configService.get("AVATAR_UPLOAD_PATH")) !== 0
        )
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
  };

  getFriendList = pipe(
    this.friendService.getAllFriends,
    andThen(map(prop("friend")))
  );

  getPendingFriendRequests = pipe(
    this.friendService.getPendingFriendRequest,
    andThen(map(prop("friend")))
  );

  deleteAvatar = (req: Request, login: string) => {
    const imagePath = path.join(
      this.configService.get("AVATAR_UPLOAD_PATH"),
      login
    );

    // Checks for directory traversal
    if (imagePath.indexOf(this.configService.get("AVATAR_UPLOAD_PATH")) !== 0)
      throw new HttpException("Login is invalid", HttpStatus.FORBIDDEN);

    try {
      fs.unlinkSync(`${imagePath}.jpg`);
    } catch (e) {
      throw new HttpException(
        "User does not have a custom PFP",
        HttpStatus.BAD_REQUEST
      );
    }
  };

  acceptFriendRequest = this.friendService.acceptFriendRequest;

  denyFriendRequest = this.friendService.delFriend;

  addFriend = async (uid: number, fid: number) => {
    const isFriend = Boolean(await this.friendService.isFriend(uid, fid));

    if (isFriend)
      throw new HttpException(
        "Friend request already sent",
        HttpStatus.BAD_REQUEST
      );

    await this.friendService.addFriend(uid, fid).catch(console.error);
  };

  delFriend = async (uid: number, fid: number) => {
    const isFriend = Boolean(await this.friendService.isFriend(uid, fid));

    if (!isFriend)
      throw new HttpException("User is not a friend.", HttpStatus.BAD_REQUEST);

    await this.friendService.delFriend(uid, fid).catch(console.error);
  };

  block = this.blockService.blockUser;
  unblock = this.blockService.unblockUser;
}
