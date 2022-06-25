import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { TFASessionService } from "./TFASession.service.js";
import { TFASession } from "./TFASession.model.js";

@Module({
  imports: [SequelizeModule.forFeature([TFASession])],
  providers: [TFASessionService],
  exports: [TFASessionService],
})
export class TFASessionModule {}
