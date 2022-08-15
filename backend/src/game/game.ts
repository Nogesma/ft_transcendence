import type { Socket } from "socket.io";

export class Game {
  private spectatorList = new Set<number>();

  private readonly gameId: string;
  private readonly type: boolean;
  private readonly player1: number;
  private readonly player2: number;

  private readonly box: {
    width: number;
    length: number;
    height: number;
    thick: number;
  };
  private readonly speed: number = 0.2;
  private readonly tick_speed: number = 33;

  constructor(
    gameId: string,
    p1: number,
    p2: number,
    type: boolean,
    width: number,
    length: number,
    height: number,
    thick: number
  ) {
    this.type = type;
    this.box = { width, length, height, thick };
    this.gameId = gameId;
    this.player1 = p1;
    this.player2 = p2;
  }

  get_params = () => {
    return { box: this.box, speed: this.speed, tick_speed: this.tick_speed };
  };

  getGameId = () => this.gameId;

  newSpectator = (id: number) => this.spectatorList.add(id);

  removeSpectator = (client: Socket, id: number) => {
    this.spectatorList.delete(id);
    client.to(this.gameId).emit("delSpectator", id);
  };

  getInfo = () => ({
    width: this.box.width,
    height: this.box.height,
    p1: this.player1,
    p2: this.player2,
    spectators: Array.from(this.spectatorList),
  });

  isPlayer = (id: number) => id === this.player1 || id === this.player2;

  isSpectator = (id: number) => id !== this.player1 && id !== this.player2;

  playerDisconnect = (id: number) => {
    //todo: handle player disconnection, maybe allow him 10s to reconnect?
    console.log("player disconnected: ", id);
  };
}
