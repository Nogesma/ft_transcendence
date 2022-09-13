import type { Socket } from "socket.io";
import type { Server } from "socket.io";

type Bar = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type Ball = {
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
};

export class Game {
  private spectatorList = new Set<number>();

  private readonly WIDTH = 640;
  private readonly HEIGHT = 480;

  private ball: Ball = {
    x: this.WIDTH / 2,
    y: this.HEIGHT / 2,
    w: 10,
    h: 10,
    dy: 1,
    dx: 1,
  };

  private bars: [Bar, Bar] = [
    { x: 20, y: this.HEIGHT / 2 - 25, w: 10, h: 50 },
    { x: this.WIDTH - 10 - 10, y: this.HEIGHT / 2 - 25, w: 10, h: 50 },
  ];

  private score = [0, 0];

  // -1: down, 0: nothing, 1: up
  private move = [0, 0];

  private readonly gameId: string;
  private readonly type: boolean;
  private readonly player1: number;
  private readonly player2: number;

  private readonly speed: number = 0.2;
  private readonly tick_speed: number = 33;

  constructor(gameId: string, p1: number, p2: number, type: boolean) {
    this.type = type;
    this.gameId = gameId;
    this.player1 = p1;
    this.player2 = p2;
  }

  get_params = () => {
    return { speed: this.speed, tick_speed: this.tick_speed };
  };

  getGameId = () => this.gameId;

  newSpectator = (id: number) => this.spectatorList.add(id);

  removeSpectator = (client: Socket, id: number) => {
    this.spectatorList.delete(id);
    client.to(this.gameId).emit("delSpectator", id);
  };

  getInfo = () => ({
    width: this.WIDTH,
    height: this.HEIGHT,
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

  sendState = (server: Server) =>
    server
      .to(this.gameId)
      .volatile.emit("gameState", { ball: this.ball, bars: this.bars });

  applyMove = (id: number, dir: number) => {
    if (dir !== -1 && dir !== 0 && dir !== 1) return;

    if (id === this.player1) this.move[0] = dir;
    else if (id === this.player2) this.move[1] = dir;
  };

  calculateState = () => {
    this.bars[0].y += this.move[0] * 5;
    this.bars[1].y += this.move[1] * 5;

    if (this.bars[0].y + this.bars[0].h > this.HEIGHT)
      this.bars[0].y = this.HEIGHT - this.bars[0].h;
    if (this.bars[1].y + this.bars[1].h > this.HEIGHT)
      this.bars[1].y = this.HEIGHT - this.bars[1].h;

    if (this.bars[0].y < 0) this.bars[0].y = 0;
    if (this.bars[1].y < 0) this.bars[1].y = 0;
  };

  private interval: NodeJS.Timer | null;

  startGame = (server: Server) => {
    this.interval = setInterval(() => {
      this.calculateState();
      this.sendState(server);
    }, 33);
  };
}
