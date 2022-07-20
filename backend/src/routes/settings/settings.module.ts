import { Module } from "@nestjs/common";
import { SettingsController } from "./settings.controller.js";
import { SettingsService } from "./settings.service.js";
import { UserModule } from "../../models/user/user.module.js";
import { TFASecretModule } from "../../models/TFASecret/TFASecret.module.js";
import { ChannelModule } from "../../models/channel/channel.module.js";
import { FriendModule } from "../../models/friend/friend.module.js";
import { BlockModule } from "../../models/block/block.module.js";

@Module({
  imports: [
    UserModule,
    TFASecretModule,
    ChannelModule,
    FriendModule,
    BlockModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
