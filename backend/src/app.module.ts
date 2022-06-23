import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module.js";
import { SettingsModule } from "./settings/settings.module.js";
import { AuthenticateMiddleware } from "./authenticate.middleware.js";
import { DatabaseModule } from "./database.module.js";
import { ConfigModule } from "@nestjs/config";
import Joi from "joi";
import { SessionModule } from "./session/session.module.js";
import { SettingsController } from "./settings/settings.controller.js";

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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticateMiddleware).forRoutes(SettingsController);
  }
}
