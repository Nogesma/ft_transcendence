import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { TFASecret } from "./TFASecret.model.js";

@Injectable()
export class TFASecretService {
  constructor(
    @InjectModel(TFASecret)
    private tfaSecretModel: typeof TFASecret
  ) {}

  createTFASecret = (userId: number, secret: string, temp: boolean) =>
    this.tfaSecretModel.create({ userId, secret, temp });

  getTFASecret = (userId: number) =>
    this.tfaSecretModel.findOne({ where: { userId } });
}
