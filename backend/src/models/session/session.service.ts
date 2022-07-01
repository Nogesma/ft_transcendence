import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Session } from "./session.model.js";
import { User } from "../user/user.model.js";

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session)
    private sessionModel: typeof Session
  ) {}

  createSession = (user: User, token: string, expires: Date) =>
    this.sessionModel.create({ userId: user.id, token, expires });

  getSession = (token: string) =>
    this.sessionModel.findOne({ where: { token } });
}
