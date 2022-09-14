import { Injectable } from "@nestjs/common";
import { Game } from "../../game/game.js";
import type { Socket } from "socket.io";
import { GameService } from "../../models/game/game.service.js";

@Injectable()
export class PongService {
  constructor(private readonly gameService: GameService) {}

  private games = new Map<string, Game>();

  getGame = (id: string) => this.games.get(id);

  pruneGames = () => {
    this.games.forEach((game) => {
      if (game.isFinished) this.games.delete(game.gameId);
    });
  };

  disconnectClient = (client: Socket, id: number) =>
    this.games.forEach((x) =>
      x.isPlayer(id) ? x.playerDisconnect(id) : x.removeSpectator(client, id)
    );

  newGame = async (
    gameId: string,
    player1: number,
    player2: number,
    type: boolean
  ) => {
    const game = new Game(gameId, player1, player2, type, this.gameService);

    this.games.set(gameId, game);
    this.pruneGames();
  };
}
