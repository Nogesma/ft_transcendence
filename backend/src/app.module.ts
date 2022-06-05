import { Module } from "@nestjs/common";
import { ApiController } from "./api/api.controller.js";
import { Oauth2Controller } from "./api/oauth2/oauth2.controller.js";

@Module({
  imports: [],
  controllers: [ApiController, Oauth2Controller],
  providers: [],
})
export class AppModule {}
