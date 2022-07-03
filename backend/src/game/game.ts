import { nanoid } from "nanoid";

export class Game {
  game_id: string;
  private readonly box: {
    width: number;
    length: number;
    height: number;
    thick: number;
  };
  private readonly speed: number = 0.2;
  private readonly tick_speed: number = 33;

  constructor(width: number, length: number, height: number, thick: number) {
    this.box = { width, length, height, thick };
    this.game_id = nanoid();
  }

  get_params = () => {
    return { box: this.box, speed: this.speed, tick_speed: this.tick_speed };
  };
}
