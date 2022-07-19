import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./user.model.js";
import { StatsService } from "../stats/stats.service.js";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private readonly statsService: StatsService
  ) {}

  createUser = async (
    id: number,
    login: string,
    displayname: string,
    tfa: boolean
  ) => {
    const user = await this.userModel.create({ id, login, displayname, tfa });

    await this.statsService.initStats(id);

    return user;
  };

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

  getUserByName = (name: string) => this.userModel.findOne({ where: { name } });
  getUserByLogin = (login: string) =>
    this.userModel.findOne({ where: { login } });
  getUserLogin = async (id: number) =>
    (await this.userModel.findByPk(id, { attributes: { include: ["login"] } }))
      ?.login;

  setUser2FA = (id: number, tfa: boolean) =>
    this.userModel.update({ tfa }, { where: { id } });

  setUserDisplayName = (id: number, displayname: string) =>
    this.userModel.update({ displayname }, { where: { id } });
}
