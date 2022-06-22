import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { Temporary2FAToken } from "../models/temporary2FAToken.model.js";
import { TwoFactorSecret } from "../models/twoFactorSecrets.model.js";

const newUser = (id: number, login: string, displayname: string, tfa = false) =>
  User.create({ id, login, displayname, tfa });

const getUser = (id: number) => User.findByPk(id);

const getUserName = async (id: number) =>
  (await User.findByPk(id, { attributes: ["login"] }))?.toJSON()?.login;

const enableUser2FA = (id: number) =>
  User.update({ tfa: true }, { where: { id } });

const updateUserName = (id: number, displayname: string) =>
  User.update({ displayname }, { where: { id } });

const newSession = (id: number, token: string, expires: Date) =>
  Session.create({ id, token, expires });

const getSession = (token: string) => Session.findOne({ where: { token } });

const new2FAToken = (id: number, token: string, expires: Date) =>
  Temporary2FAToken.create({ id, token, expires });

const getTemporary2FAToken = (token: string) =>
  Temporary2FAToken.findOne({ where: { token } });

const destroyTemporary2FAToken = (id: number) =>
  Temporary2FAToken.destroy({ where: { id } });

const set2FASecret = (id: number, secret: string, temp = true) =>
  TwoFactorSecret.create({ id, secret, temp });

const setPermanent2FASecret = (id: number) =>
  TwoFactorSecret.update({ temp: false }, { where: { id } });

const get2FASecret = (id: number) => TwoFactorSecret.findByPk(id);

export {
  enableUser2FA,
  setPermanent2FASecret,
  set2FASecret,
  get2FASecret,
  getTemporary2FAToken,
  getUser,
  newUser,
  newSession,
  new2FAToken,
  destroyTemporary2FAToken,
  getSession,
  updateUserName,
  getUserName,
};
