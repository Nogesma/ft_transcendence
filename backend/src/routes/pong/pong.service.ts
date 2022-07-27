import { Injectable } from "@nestjs/common";
import { Game } from "../../game/game.js";

@Injectable()
export class PongService {
  private games = new Map<string, Game>();

  //todo change into get game data (pos etc)
  getGame = (id: string) => this.games.get(id);

  disconnectClient = (id: number) =>
    this.games.forEach((x) =>
      x.isPlayer(id) ? x.playerDisconnect(id) : x.removeSpectator(id)
    );

  newGame = async (gameId: string, player1: number, player2: number) => {
    const game = new Game(gameId, player1, player2, 1600, 30, 900, 2);
    this.games.set(gameId, game);
    return { game_id: game, params: game.get_params() };
  };
}
