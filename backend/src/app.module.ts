import { Module } from "@nestjs/common";
import { AuthModule } from "./routes/auth/auth.module.js";
import { SettingsModule } from "./routes/settings/settings.module.js";
import { DatabaseModule } from "./database/database.module.js";
import { ConfigModule } from "@nestjs/config";
import Joi from "joi";
import { SessionModule } from "./models/session/session.module.js";
import { ChatModule } from "./routes/chat/chat.module.js";
import { PongModule } from "./routes/pong/pong.module.js";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./authenticate.guard.js";
import { InfoModule } from "./routes/info/info.module.js";
import { PrivatemessagesModule } from "./routes/PrivateMessages/privatemessages.module.js";

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        CLIENT_ID: Joi.string().required(),
        CLIENT_SECRET: Joi.string().required(),
        REDIRECT_URI: Joi.string().required(),
        COOKIE_SECRET: Joi.string().required(),
        DB_USER: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        AVATAR_UPLOAD_PATH: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    PrivatemessagesModule,
    AuthModule,
    SettingsModule,
    SessionModule,
    ChatModule,
    PongModule,
    InfoModule,
  ],
})
export class AppModule {}
