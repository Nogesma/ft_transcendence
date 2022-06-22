import { SequelizeModule } from "@nestjs/sequelize";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User } from "./models/user.model.js";
import { Session } from "./models/session.model.js";
import { Temporary2FAToken } from "./models/temporary2FAToken.model.js";
import { TwoFactorSecret } from "./models/twoFactorSecrets.model.js";

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
        models: [User, Session, Temporary2FAToken, TwoFactorSecret],
      }),
    }),
  ],
})
export class DatabaseModule {}
