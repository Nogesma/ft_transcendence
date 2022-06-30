import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UserBlock } from "./userBlock.model.js";

@Injectable()
export class UserBlockService {
  constructor(
    @InjectModel(UserBlock)
    private userBlockModel: typeof UserBlock
  ) {}

  blockUser = (user: number, blocked: number) =>
    this.userBlockModel.create({ user, blocked });

  unBlockUser = (user: number, blocked: number) =>
    this.userBlockModel.destroy({ where: { user, blocked } });

  isBlocked = (user: number, blocked: number) =>
    this.userBlockModel.findOne({ where: { user, blocked } });

  getBlocked = (user: number) =>
    this.userBlockModel.findAll({ where: { user } });
}
