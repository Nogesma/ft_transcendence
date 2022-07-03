import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AuthModule } from "./routes/auth/auth.module.js";
import { SettingsModule } from "./routes/settings/settings.module.js";
import { AuthenticateMiddleware } from "./authenticate.middleware.js";
import { DatabaseModule } from "./database/database.module.js";
import { ConfigModule } from "@nestjs/config";
import Joi from "joi";
import { SessionModule } from "./models/session/session.module.js";
import { SettingsController } from "./routes/settings/settings.controller.js";
import { ChatModule } from "./routes/chat/chat.module.js";
import { PongModule } from "./routes/pong/pong.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        CLIENT_ID: Joi.string().required(),
        CLIENT_SECRET: Joi.string().required(),
        REDIRECT_URI: Joi.string().required(),
        COOKIE_SECRET: Joi.string().required(),
        DB_USER: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        AVATAR_UPLOAD_PATH: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    AuthModule,
    SettingsModule,
    SessionModule,
    ChatModule,
    PongModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticateMiddleware).forRoutes(SettingsController);
  }
}
