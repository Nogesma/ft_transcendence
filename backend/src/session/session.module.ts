import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Session } from "./session.model.js";
import { SessionService } from "./session.service.js";

@Module({
  imports: [SequelizeModule.forFeature([Session])],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
