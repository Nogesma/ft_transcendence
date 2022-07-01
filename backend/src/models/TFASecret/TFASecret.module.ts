import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { TFASecret } from "./TFASecret.model.js";
import { TFASecretService } from "./TFASecret.service.js";

@Module({
  imports: [SequelizeModule.forFeature([TFASecret])],
  providers: [TFASecretService],
  exports: [TFASecretService],
})
export class TFASecretModule {}
