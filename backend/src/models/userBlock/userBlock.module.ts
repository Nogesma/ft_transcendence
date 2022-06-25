import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UserBlockService } from "./userBlock.service.js";
import { UserBlock } from "./userBlock.model.js";

@Module({
  imports: [SequelizeModule.forFeature([UserBlock])],
  providers: [UserBlockService],
  exports: [UserBlockService],
})
export class UserBlockModule {}
