import type { Ball, Bar, Player } from "../game";

const checkCollision = (a: Ball, b: Bar) => {
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
const calculateState = (
  p1: Player,
  p2: Player,
  ball: Ball,
  dt: number,
  HEIGHT: number
) => {
  // Apply player move
  p1.bar.y += p1.bar.direction * p1.bar.speed * dt;
  p2.bar.y += p2.bar.direction * p2.bar.speed * dt;

  // Bar should not go out of frame
  if (p1.bar.y < 0) p1.bar.y = 0;
  else if (p1.bar.y + p1.bar.h > HEIGHT) p1.bar.y = HEIGHT - p1.bar.h;
  if (p2.bar.y < 0) p2.bar.y = 0;
  else if (p2.bar.y + p2.bar.h > HEIGHT) p2.bar.y = HEIGHT - p2.bar.h;

  // Move ball
  ball.x += ball.dx * dt;
  ball.y += ball.dy * dt;

  if (ball.y < 0 || ball.y > HEIGHT - ball.h) ball.dy = -ball.dy;
};
export { checkCollision, calculateState };
