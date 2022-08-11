import { SequelizeModule } from "@nestjs/sequelize";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User } from "../models/user/user.model.js";
import { Session } from "../models/session/session.model.js";
import { TFASession } from "../models/TFASession/TFASession.model.js";
import { TFASecret } from "../models/TFASecret/TFASecret.model.js";
import { DatabaseService } from "./database.service.js";
import { Channel } from "../models/channel/channel.model.js";
import { ChannelBan } from "../models/channelBan/channelBan.model.js";
import { ChannelMember } from "../models/channelMember/channelMember.model.js";
import { ChannelAdmin } from "../models/channelAdmin/channelAdmin.model.js";
import { Game } from "../models/game/game.model.js";
import { Stats } from "../models/stats/stats.model.js";
import { Friend } from "../models/friend/friend.model.js";
import { Block } from "../models/block/block.model.js";

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: "postgres",
        host: configService.get("DB_HOST"),
        port: 5432,
        username: configService.get("DB_USER"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_NAME"),
        logging: false,
        models: [
          User,
          Session,
          TFASession,
          TFASecret,
          Channel,
          ChannelMember,
          ChannelBan,
          ChannelAdmin,
          Game,
          Stats,
          Friend,
          Block,
        ],
      }),
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
