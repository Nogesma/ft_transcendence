import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { TFASecret } from "./TFASecret.model.js";

@Injectable()
export class TFASecretService {
  constructor(
    @InjectModel(TFASecret)
    private tfaSecretModel: typeof TFASecret
  ) {}

  createTFASecret = (user: number, secret: string, temp: boolean) =>
    this.tfaSecretModel.create({ user, secret, temp });

  setTFASecretTemp = (user: number, temp: boolean) =>
    this.tfaSecretModel.update({ temp }, { where: { user } });

  getTFASecret = (user: number) => this.tfaSecretModel.findByPk(user);
}
