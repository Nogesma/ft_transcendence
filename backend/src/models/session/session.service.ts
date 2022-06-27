import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Session } from "./session.model.js";

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session)
    private sessionModel: typeof Session
  ) {}

  createSession = (user: number, token: string, expires: Date) =>
    this.sessionModel.create({ user, token, expires });

  getSession = (token: string) =>
    this.sessionModel.findOne({ where: { token } });
}
