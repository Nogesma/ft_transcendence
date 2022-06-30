import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { BlockedUser } from "./blockedUser.model.js";

@Injectable()
export class BlockedUserService {
  constructor(
    @InjectModel(BlockedUser)
    private blockedUserModel: typeof BlockedUser
  ) {}
}
