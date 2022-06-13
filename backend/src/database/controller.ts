import Users from "../models/Users.js";
import Sessions from "../models/Sessions.js";
import Temporary2FATokens from "../models/Temporary2FATokens.js";
import TwoFactorSecrets from "../models/TwoFactorSecrets.js";

const newUser = (id, login, displayname, image_url, tfa = false) =>
  Users.create({ id, login, displayname, image_url, tfa });

const getUser = (id) => Users.findOne({ id });

const newSession = (id, token, expires) =>
  Sessions.create({ id, token, expires });

const new2FAToken = (id, token, expires) =>
  Temporary2FATokens.create({ id, token, expires });

const getTemporary2FAToken = (token) => Temporary2FATokens.findOne({ token });

const set2FASecret = (id, secret, temp = true) =>
  TwoFactorSecrets.create({ id, secret, temp });

const setPermanent2FASecret = (id) =>
  TwoFactorSecrets.update({ id }, { temp: false });

const enableUser2FA = (id) => Users.update({ id }, { tfa: true });

const get2FASecret = (id) => TwoFactorSecrets.findOne({ id });

const destroyTemporary2FAToken = (opt) => Temporary2FATokens.destroy(opt);

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
};
