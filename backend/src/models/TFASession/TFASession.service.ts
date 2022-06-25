import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { TFASession } from "./TFASession.model.js";

@Injectable()
export class TFASessionService {
  constructor(
    @InjectModel(TFASession)
    private tfaSessionModel: typeof TFASession
  ) {}

  createTFASession = (user: number, token: string, expires: Date) =>
    this.tfaSessionModel.create({ user, token, expires });

  getTFASession = (token: string) =>
    this.tfaSessionModel.findOne({ where: { token } });

  destroyTFASession = (user: number, token: string) =>
    this.tfaSessionModel.destroy({ where: { user, token } });
}
