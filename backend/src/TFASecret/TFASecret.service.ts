import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { TFASecret } from "./TFASecret.model.js";

@Injectable()
export class TFASecretService {
  constructor(
    @InjectModel(TFASecret)
    private tfaSecretModel: typeof TFASecret
  ) {}

  createTFASecret = (id: number, secret: string, temp: boolean) =>
    this.tfaSecretModel.create({ id, secret, temp });

  setTFASecretTemp = (id: number, temp: boolean) =>
    this.tfaSecretModel.update({ temp }, { where: { id } });

  getTFASecret = (id: number) => this.tfaSecretModel.findByPk(id);
}
