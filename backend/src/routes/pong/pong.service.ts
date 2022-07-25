import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Game } from "../../game/game.js";

@Injectable()
export class PongService {
  private games: Array<Game> = [];

  //todo change into get game data (pos etc)
  getGame = async (game_id: string) => {
    const game = this.games.find((game) => game.gameId === game_id);
    if (!game)
      throw new HttpException(
        "Could not find game",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    return game.get_params();
  };

  newGame = async (gameId: string, player1: number, player2: number) => {
    console.log({ player1, player2, gameId });
    const game = new Game(gameId, 15, 30, 4, 2);
    this.games.push(game);
    return { game_id: game, params: game.get_params() };
  };
}
