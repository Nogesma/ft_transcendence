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
      this.friendModel.create({ user: u1, friend: u2 }),
      this.friendModel.create({ user: u2, friend: u1, isFriend: false }),
    ]);

  getPendingFriendRequest = (user: number) =>
    this.friendModel.findAll({
      where: { user, isFriend: false },
      attributes: { include: ["friend"] },
    });

  acceptFriendRequest = (user: number, friend: number) =>
    Promise.all([
      this.friendModel.update({ isFriend: true }, { where: { user, friend } }),
      this.friendModel.update(
        { isFriend: true },
        { where: { user: friend, friend: user } }
      ),
    ]);

  delFriend = (u1: number, u2: number) =>
    Promise.all([
      this.friendModel.destroy({ where: { user: u1, friend: u2 } }),
      this.friendModel.destroy({ where: { user: u2, friend: u1 } }),
    ]);

  getAllFriends = (user: number) =>
    this.friendModel.findAll({
      where: { user, isFriend: true },
      attributes: { include: ["friend"] },
    });

  isFriend = (user: number, friend: number) =>
    this.friendModel.findOne({ where: { user, friend } });
}
