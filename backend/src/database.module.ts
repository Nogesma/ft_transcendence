import { SequelizeModule } from "@nestjs/sequelize";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User } from "./user/user.model.js";
import { Session } from "./session/session.model.js";
import { TFASession } from "./TFASession/TFASession.model.js";
import { TFASecret } from "./TFASecret/TFASecret.model.js";

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: "postgres",
        host: "localhost",
        port: 5432,
        username: configService.get("DB_USER"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_NAME"),
        logging: false,
        models: [User, Session, TFASession, TFASecret],
      }),
    }),
  ],
})
export class DatabaseModule {}
