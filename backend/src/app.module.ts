import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ApiController } from "./api/api.controller.js";
import { Oauth2Controller } from "./api/oauth2/oauth2.controller.js";
import { AuthenticateMiddleware } from "./authenticate.middleware.js";

@Module({
  imports: [],
  controllers: [ApiController, Oauth2Controller],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticateMiddleware).forRoutes(ApiController);
  }
}
