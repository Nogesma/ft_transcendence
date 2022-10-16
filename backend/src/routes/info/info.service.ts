import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  andThen,
  ifElse,
  isNil,
  map,
  mergeLeft,
  omit,
  pick,
  pipe,
  prop,
  when,
} from "ramda";
import { ConfigService } from "@nestjs/config";
import { UserService } from "../../models/user/user.service.js";
import { FriendService } from "../../models/friend/friend.service.js";
import { BlockService } from "../../models/block/block.service.js";
import { GameService } from "../../models/game/game.service.js";
import { StatsService } from "../../models/stats/stats.service.js";

@Injectable()
export class InfoService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly userService: UserService,
    private readonly statsService: StatsService,
    private readonly gameService: GameService,
    private readonly friendService: FriendService,
    private readonly blockService: BlockService
  ) {}

  getUserStats = pipe(
    this.statsService.getStats,
    andThen(
      when(isNil, () => {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      })
    )
  );

  getUserInfo = pipe(
    this.userService.getUser,
    andThen(
      ifElse(
        isNil,
        () => {
          throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        },
        (x) => omit(["id"], x.toJSON())
      )
    )
  );

  getUserId = pipe(
    this.userService.getUserByLogin,
    andThen(
      ifElse(
        isNil,
        () => {
          throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        },
        (x) => prop("id", x.toJSON())
      )
    )
  );

  a = async (id: number) => {
    const user = this.userService.getUser(id);

    if (!user)
      throw new HttpException("Could not find user", HttpStatus.NOT_FOUND);

    return pick(["login", "displayname", "status"], user);
  };

  getGameHistory = pipe(
    this.gameService.gameHistory,
    andThen(
      map((y) =>
        pipe(
          async (x) => (await x.$get("opponent")).toJSON(),
          andThen(pick(["login", "displayname", "id"])),
          andThen(mergeLeft(y.toJSON()))
        )(y)
      )
    ),
    andThen((x) => Promise.all(x))
  );
}
