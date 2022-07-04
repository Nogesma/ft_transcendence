import { Module } from "@nestjs/common";
import { SettingsController } from "./settings.controller.js";
import { SettingsService } from "./settings.service.js";
import { UserModule } from "../../models/user/user.module.js";
import { TFASecretModule } from "../../models/TFASecret/TFASecret.module.js";
import { ChannelModule } from "../../models/channel/channel.module.js";

@Module({
  imports: [UserModule, TFASecretModule, ChannelModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
