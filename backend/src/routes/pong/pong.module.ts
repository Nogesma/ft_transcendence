import { Module } from "@nestjs/common";
import { PongService } from "./pong.service.js";
import { PongGateway } from "./pong.gateway.js";
import { SessionModule } from "../../models/session/session.module.js";

@Module({
  imports: [SessionModule],
  providers: [PongService, PongGateway],
})
export class PongModule {}
