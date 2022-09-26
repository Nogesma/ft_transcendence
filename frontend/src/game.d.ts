export type Bar = {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  // -1: down, 0: nothing, 1: up
  direction: number;
};

export type Ball = {
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
};

export type Player = {
  id: number;
  bar: Bar;
  score: number;
};
