import { Module } from "@nestjs/common";
import { SettingsController } from "./settings.controller.js";
import { SettingsService } from "./settings.service.js";
import { UserModule } from "../user/user.module.js";
import { TFASecretModule } from "../TFASecret/TFASecret.module.js";

@Module({
  imports: [UserModule, TFASecretModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
