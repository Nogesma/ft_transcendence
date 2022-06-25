import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UserBlock } from "./userBlock.model.js";

@Injectable()
export class UserBlockService {
  constructor(
    @InjectModel(UserBlock)
    private userBlockModel: typeof UserBlock
  ) {}

  blockUser = (id: number, blocked: number) =>
    this.userBlockModel.create({ id, blocked });

  unBlockUser = (id: number, blocked: number) =>
    this.userBlockModel.destroy({ where: { id, blocked } });

  isBlocked = (id: number, blocked: number) =>
    this.userBlockModel.findOne({ where: { id, blocked } });

  getBlocked = (id: number) => this.userBlockModel.findAll({ where: { id } });
}
