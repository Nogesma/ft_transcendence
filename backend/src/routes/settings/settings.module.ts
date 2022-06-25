import { Module } from "@nestjs/common";
import { SettingsController } from "./settings.controller.js";
import { SettingsService } from "./settings.service.js";
import { UserModule } from "../../models/user/user.module.js";
import { TFASecretModule } from "../../models/TFASecret/TFASecret.module.js";

@Module({
  imports: [UserModule, TFASecretModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
