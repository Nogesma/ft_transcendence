export class Game {
  private spectatorList = new Set<number>();

  private gameId: string;
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
    width: number,
    length: number,
    height: number,
    thick: number
  ) {
    this.box = { width, length, height, thick };
    this.gameId = gameId;
    this.player1 = p1;
    this.player2 = p2;
  }

  get_params = () => {
    return { box: this.box, speed: this.speed, tick_speed: this.tick_speed };
  };

  newSpectator = (id: number) => this.spectatorList.add(id);

  removeSpectator = (id: number) => this.spectatorList.delete(id);

  getInfo = () => ({
    width: this.box.width,
    height: this.box.height,
    p1: this.player1,
    p2: this.player2,
    spectators: this.spectatorList,
  });

  isSpectator = (id: number) => id !== this.player1 && id !== this.player2;
}
