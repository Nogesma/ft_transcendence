import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { TFASession } from "./TFASession.model.js";
import { TFASessionService } from "./TFASession.service.js";

@Module({
  imports: [SequelizeModule.forFeature([TFASession])],
  providers: [TFASessionService],
  exports: [TFASessionService],
})
export class TFASessionModule {}
