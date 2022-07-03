import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";

//put in models??
export class Game {
  game_id;
  private width: number;
  private length: number;
  private height: number;
  constructor(width: number, lenght: number, height: number) {
    this.width = width;
    this.length = lenght;
    this.height = height;
    this.game_id = nanoid();
  }
}

@Injectable()
export class PongService {
  private games: Array<Game> = [];

  getGame = async (game_id: string) => {
    const game = this.games.find((game) => game.game_id === game_id);
    if (!game)
      throw new HttpException(
        "Could not find game",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    return game;
  };

  newGame = async () => {
    const game = new Game(100, 100, 100);
    this.games.push(game);
    return game.game_id;
  };
}
