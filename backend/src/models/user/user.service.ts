import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./user.model.js";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User
  ) {}

  createUser = (id: number, login: string, displayname: string, tfa: boolean) =>
    this.userModel.create({ id, login, displayname, tfa });

  createUserIfNotExist = async ({
    id,
    login,
    displayname,
  }: {
    id: number;
    login: string;
    displayname: string;
  }) => {
    const user = await this.getUser(id);

    if (!user) return this.createUser(id, login, displayname, false);

    return user;
  };

  getUser = (id: number) => this.userModel.findByPk(id);

  getUserLogin = async (id: number) =>
    (await this.userModel.findByPk(id, { attributes: { include: ["login"] } }))
      ?.login;

  setUser2FA = (id: number, tfa: boolean) =>
    this.userModel.update({ tfa }, { where: { id } });

  setUserDisplayName = (id: number, displayname: string) =>
    this.userModel.update({ displayname }, { where: { id } });
}
