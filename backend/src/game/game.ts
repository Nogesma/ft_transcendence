import type { Socket } from "socket.io";
import type { Server } from "socket.io";
import type { GameService } from "../models/game/game.service";

type Bar = {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  // -1: down, 0: nothing, 1: up
  direction: number;
};

type Ball = {
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
};

type Player = {
  id: number;
  bar: Bar;
  ready: boolean;
  score: number;
};

export class Game {
  private readonly WIDTH = 640;
  private readonly HEIGHT = 480;

  private readonly TICK_RATE = 16;
  private interval: NodeJS.Timer | null;

  private readonly BAR_W = 10;
  private readonly BAR_H = 50;
  private readonly BAR_SPEED = 400;

  private readonly BALL_W = 10;
  private readonly BALL_H = 10;
  private readonly BALL_SPEED = 200;
  private readonly MAX_SPEED = 400;

  private readonly type: boolean;
  private readonly p1: Player;
  private readonly p2: Player;
  private readonly spectatorList = new Set<number>();

  private ball: Ball;

  private readonly gameService: GameService;

  public readonly gameId: string;
  public isFinished = false;

  constructor(
    gameId: string,
    id1: number,
    id2: number,
    type: boolean,
    gameService: GameService
  ) {
    this.type = type;
    this.gameId = gameId;
    this.gameService = gameService;
    this.p1 = {
      id: id1,
      bar: this.initBar(false),
      ready: false,
      score: 0,
    };

    console.log(
      "started game:\n gameID: ",
      gameId,
      "\n custom: ",
      type,
      "\n player1: ",
      id1,
      "\n player2: ",
      id2
    );

    this.p2 = {
      id: id2,
      bar: this.initBar(true),
      ready: false,
      score: 0,
    };

    this.ball = {
      x: this.WIDTH / 2,
      y: this.HEIGHT / 2,
      w: this.BALL_W,
      h: this.BALL_H,
      dy: this.getRandomSpeed(this.BALL_SPEED),
      dx: this.BALL_SPEED,
    };
    this.normalize_speed();
  }

  newSpectator = (id: number) => this.spectatorList.add(id);

  removeSpectator = (client: Socket, id: number) => {
    this.spectatorList.delete(id);
    client.to(this.gameId).emit("delSpectator", id);
  };

  getInfo = () => ({
    width: this.WIDTH,
    height: this.HEIGHT,
    player1: this.p1,
    player2: this.p2,
    spectators: Array.from(this.spectatorList),
  });

  isPlayer = (id: number) => id === this.p1.id || id === this.p2.id;

  playerDisconnect = (id: number) => {
    //todo: handle player disconnection, maybe allow him 10s to reconnect?
    console.log("player disconnected: ", id);
  };

  applyMove = (id: number, dir: number) => {
    if (dir !== -1 && dir !== 0 && dir !== 1) return;

    if (id === this.p1.id) this.p1.bar.direction = dir;
    else if (id === this.p2.id) this.p2.bar.direction = dir;
  };

  setReady = (server: Server, id: number) => {
    if (this.p1.id === id) this.p1.ready = true;
    if (this.p2.id === id) this.p2.ready = true;

    if (this.p1.ready && this.p2.ready && !this.interval)
      this.startGame(server);
  };

  private initBar = (r: boolean) =>
    r
      ? {
          x: this.WIDTH - 10 - 10,
          y: this.HEIGHT / 2 - 25,
          w: this.BAR_W,
          h: this.BAR_H,
          speed: this.BAR_SPEED,
          direction: 0,
        }
      : {
          x: 20,
          y: this.HEIGHT / 2 - 25,
          w: this.BAR_W,
          h: this.BAR_H,
          speed: this.BAR_SPEED,
          direction: 0,
        };

  private resetGameState = (dir: boolean) => {
    this.ball = {
      x: this.WIDTH / 2,
      y: this.HEIGHT / 2,
      w: this.BALL_W,
      h: this.BALL_H,
      dy: Math.floor(Math.random() * this.BALL_SPEED * 2) - this.BALL_SPEED,
      dx: dir ? this.BALL_SPEED : -this.BALL_SPEED,
    };
    this.normalize_speed();

    this.p1.bar.w = this.BAR_W;
    this.p1.bar.h = this.BAR_H;
    this.p1.bar.speed = this.BAR_SPEED;

    this.p2.bar.w = this.BAR_W;
    this.p2.bar.h = this.BAR_H;
    this.p2.bar.speed = this.BAR_SPEED;
  };

  private sendState = (server: Server) =>
    server.to(this.gameId).volatile.emit("gameState", {
      ball: this.ball,
      bars: [this.p1.bar, this.p2.bar],
    });

  private calculateState = (server: Server, dt: number) => {
    // Apply player move
    this.p1.bar.y += this.p1.bar.direction * this.p1.bar.speed * dt;
    this.p2.bar.y += this.p2.bar.direction * this.p2.bar.speed * dt;

    // Bar should not go out of frame
    if (this.p1.bar.y < 0) this.p1.bar.y = 0;
    else if (this.p1.bar.y + this.p1.bar.h > this.HEIGHT)
      this.p1.bar.y = this.HEIGHT - this.p1.bar.h;
    if (this.p2.bar.y < 0) this.p2.bar.y = 0;
    else if (this.p2.bar.y + this.p2.bar.h > this.HEIGHT)
      this.p2.bar.y = this.HEIGHT - this.p2.bar.h;

    // Move ball
    this.ball.x += this.ball.dx * dt;
    this.ball.y += this.ball.dy * dt;

    // Ball bounce on top/bottom
    if (
      (this.ball.y < 0 && this.ball.dy < 0) ||
      (this.ball.y > this.HEIGHT - this.ball.h && this.ball.dy > 0)
    )
      this.ball.dy = -this.ball.dy;

    // If ball is out of frame on the x-axis, score a point.
    if (this.ball.x < 0 || this.ball.x > this.WIDTH - this.ball.w) {
      if (this.ball.x < 0) this.p2.score++;
      else this.p1.score++;

      server
        .to(this.gameId)
        .emit("updateScore", [this.p1.score, this.p2.score]);

      if (this.p1.score >= 10 || this.p2.score >= 10) this.endGame();

      // Reset ball and bars to default
      this.resetGameState(this.ball.x < 0);
    }

    // Check collision with paddles
    if (this.checkCollision(this.ball, this.p1.bar)) {
      // dx is negative
      if (this.ball.dx > -this.MAX_SPEED) this.ball.dx -= 50;
      this.ball.dx = -this.ball.dx;
      // tp ball in front of the bar to avoid multiple collisions.
      if (this.ball.x < 30) this.ball.x = 30;
      this.ball.dy =
        this.BALL_SPEED *
        ((this.ball.y + this.ball.h / 2 - this.p1.bar.y) / (this.p1.bar.h / 2) -
          1) *
        1.3;
    } else if (this.checkCollision(this.ball, this.p2.bar)) {
      // dx is positive
      if (this.ball.dx < this.MAX_SPEED) this.ball.dx += 50;
      this.ball.dx = -this.ball.dx;
      // tp ball in front of the bar to avoid multiple collisions.
      if (this.ball.x > this.WIDTH - 30) this.ball.x = this.WIDTH - 30;
      this.ball.dy =
        this.BALL_SPEED *
        ((this.ball.y + this.ball.h / 2 - this.p2.bar.y) / (this.p2.bar.h / 2) -
          1) *
        1.3;
    }
    this.normalize_speed();
  };

  private startGame = (server: Server) => {
    let timestamp = null;
    let prev = Date.now();

    this.interval = setInterval(() => {
      timestamp = Date.now();
      this.calculateState(server, (timestamp - prev) * 0.001);
      prev = timestamp;

      this.sendState(server);
    }, this.TICK_RATE);
  };

  private endGame = async () => {
    if (!this.interval) return;
    clearInterval(this.interval);

    await this.gameService.newGame(
      this.p1.id,
      this.p2.id,
      this.p1.score > this.p2.score
    );

    // I don't think we can delete the game from the list from here,
    // so set a boolean to true so that it gets deleted in the pruneGame function.
    this.isFinished = true;
  };

  private checkCollision = (a: Ball, b: Bar) => {
    // left a, right b
    if (a.x > b.x + b.w) return 0;
    // right a, left b
    if (a.x + a.w < b.x) return 0;
    // top a, bottom b
    if (a.y > b.y + b.h) return 0;
    // bottom a, top b
    if (a.y + a.h < b.y) return 0;

    return 1;
  };

  private getRandomSpeed = (max: number) =>
    Math.floor(Math.random() * max * 2) - max;

  private normalize_speed = () => {
    let ratio =
      this.BALL_SPEED /
      Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
    this.ball.dx = this.ball.dx * ratio;
    this.ball.dy = this.ball.dy * ratio;
  };
}
