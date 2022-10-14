import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Block } from "./block.model.js";

@Injectable()
export class BlockService {
  constructor(
    @InjectModel(Block)
    private blockModel: typeof Block
  ) {}

  getBlocked = async (user: number) =>
    await this.blockModel.findAll({ where: { user } });

  getblocker = async (user: number) =>
    await this.blockModel.findAll({ where: { block: user } });

  blockUser = (user: number, block: number) =>
    this.blockModel.findOrCreate({ where: { user, block } });

  unblockUser = (user: number, block: number) =>
    this.blockModel.destroy({ where: { user, block } });
}
