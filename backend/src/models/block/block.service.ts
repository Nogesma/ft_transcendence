import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Block } from "./block.model.js";

@Injectable()
export class BlockService {
  constructor(
    @InjectModel(Block)
    private blockModel: typeof Block
  ) {}

  blockUser = (user: number, block: number) =>
    this.blockModel.create({ user, block });

  unblockUser = (user: number, block: number) =>
    this.blockModel.destroy({ where: { user, block } });
}
