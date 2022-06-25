import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { TFASession } from "./TFASession.model.js";

@Injectable()
export class TFASessionService {
  constructor(
    @InjectModel(TFASession)
    private tfaSessionModel: typeof TFASession
  ) {}

  createTFASession = (id: number, token: string, expires: Date) =>
    this.tfaSessionModel.create({ id, token, expires });

  getTFASession = (token: string) =>
    this.tfaSessionModel.findOne({ where: { token } });

  destroyTFASession = (id: number, token: string) =>
    this.tfaSessionModel.destroy({ where: { id, token } });
}
