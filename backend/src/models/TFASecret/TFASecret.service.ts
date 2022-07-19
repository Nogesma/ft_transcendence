import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { TFASecret } from "./TFASecret.model.js";
import { type User } from "../user/user.model.js";

@Injectable()
export class TFASecretService {
  constructor(
    @InjectModel(TFASecret)
    private tfaSecretModel: typeof TFASecret
  ) {}

  createTFASecret = (id: number, secret: string, temp: boolean) =>
    this.tfaSecretModel.create({ id, secret, temp });

  setTFASecretTemp = (user: User, temp: boolean) =>
    this.tfaSecretModel.update({ temp }, { where: { user } });
}
