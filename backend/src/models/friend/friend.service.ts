import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Friend } from "./friend.model.js";

@Injectable()
export class FriendService {
  constructor(
    @InjectModel(Friend)
    private friendModel: typeof Friend
  ) {}

  addFriend = (u1: number, u2: number) =>
    Promise.all([
      this.friendModel.create({ user: u1, friend: u2, isFriend: true }),
      this.friendModel.create({ user: u2, friend: u1 }),
    ]);

  getPendingFriendRequest = (user: number) =>
    this.friendModel.findAll({ where: { user, isFriend: false } });

  acceptFriendRequest = (user: number, friend: number) =>
    this.friendModel.update({ isFriend: true }, { where: { user, friend } });

  delFriend = (u1: number, u2: number) =>
    Promise.all([
      this.friendModel.destroy({ where: { user: u1, friend: u2 } }),
      this.friendModel.destroy({ where: { user: u2, friend: u1 } }),
    ]);
}
