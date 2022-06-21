import { MiddlewareConsumer, Module } from "@nestjs/common";
import { AuthenticateMiddleware } from "../authenticate.middleware.js";
import { AuthModule } from "./auth/auth.module.js";
import { UserModule } from "./user/user.module.js";

@Module({
  imports: [AuthModule, UserModule],
  controllers: [],
  providers: [],
})
export class ApiModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticateMiddleware).forRoutes(UserModule);
  }
}
