import { nanoid } from "nanoid";

export class Game {
  game_id: string;
  private box: {
    width: number;
    length: number;
    height: number;
  };
  private readonly speed: number = 33;
  private readonly tick_speed: number = 0.2;

  constructor(w: number, h: number, l: number) {
    this.box.width = w;
    this.box.length = l;
    this.box.height = h;
    this.game_id = nanoid();
  }

  get_params = () => {
    return { box: this.box, speed: this.speed, tick_speed: this.tick_speed };
  };
}
