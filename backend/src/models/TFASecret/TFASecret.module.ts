import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { TFASecretService } from "./TFASecret.service.js";
import { TFASecret } from "./TFASecret.model.js";

@Module({
  imports: [SequelizeModule.forFeature([TFASecret])],
  providers: [TFASecretService],
  exports: [TFASecretService],
})
export class TFASecretModule {}
