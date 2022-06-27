import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { UserModule } from "../../models/user/user.module.js";
import { SessionModule } from "../../models/session/session.module.js";
import { TFASessionModule } from "../../models/TFASession/TFASession.module.js";
import { TFASecretModule } from "../../models/TFASecret/TFASecret.module.js";

@Module({
  imports: [UserModule, SessionModule, TFASessionModule, TFASecretModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
