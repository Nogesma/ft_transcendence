import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Block } from "./block.model.js";
import { BlockService } from "./block.service.js";

@Module({
  imports: [SequelizeModule.forFeature([Block])],
  providers: [BlockService],
  exports: [BlockService],
})
export class BlockModule {}
