import { Injectable } from "@nestjs/common";
import { Game } from "../../game/game.js";
import type { Socket } from "socket.io";

@Injectable()
export class PongService {
  private games = new Map<string, Game>();

  //todo change into get game data (pos etc)
  getGame = (id: string) => this.games.get(id);

  disconnectClient = (client: Socket, id: number) =>
    this.games.forEach((x) =>
      x.isPlayer(id) ? x.playerDisconnect(id) : x.removeSpectator(client, id)
    );

  newGame = async (
    gameId: string,
    player1: number,
    player2: number,
    type: number
  ) => {
    const game = new Game(gameId, player1, player2, type, 400, 30, 300, 2);
    this.games.set(gameId, game);
    return { game_id: game, params: game.get_params() };
  };
}
