import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { GameService } from "../../models/game/game.service.js";

@Injectable()
export class PongService {
  private games: Array<GameService> = [];

  getGame = async (game_id: string) => {
    const game = this.games.find((game) => game.game_id === game_id);
    if (!game)
      throw new HttpException(
        "Could not find game",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    return game.get_params();
  };

  newGame = async () => {
    const game = new GameService(500, 250, 15);
    this.games.push(game);
    return game.game_id;
  };
}