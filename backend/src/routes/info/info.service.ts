import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { andThen, map, mergeLeft, pick, pipe } from "ramda";
import { ConfigService } from "@nestjs/config";
import { UserService } from "../../models/user/user.service.js";
import { FriendService } from "../../models/friend/friend.service.js";
import { BlockService } from "../../models/block/block.service.js";
import { GameService } from "../../models/game/game.service.js";

@Injectable()
export class InfoService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly userService: UserService,
    private readonly gameService: GameService,
    private readonly friendService: FriendService,
    private readonly blockService: BlockService
  ) {}

  getUserData = async (id: number) => {
    const user = this.userService.getUser(id);

    if (!user)
      throw new HttpException("Could not find user", HttpStatus.NOT_FOUND);

    return pick(["login", "displayname"], user);
  };

  getGameHistory = pipe(
    this.gameService.gameHistory,
    andThen(
      map((y) =>
        pipe(
          (x) => x.$get("opponent"),
          andThen(pick(["login", "displayname"])),
          andThen(mergeLeft(y.toJSON()))
        )(y)
      )
    ),
    andThen((x) => Promise.all(x))
  );
}
