const getElo = (
  numberOfGames: number,
  highestElo: number,
  playerElo: number,
  opponentElo: number,
  win: boolean
) => {
  const winProbability =
    1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));

  const applyKFactor = (K: number) =>
    Math.ceil(K * (Number(win) - winProbability));

  // Using FIDE K-Factor
  if (numberOfGames <= 30) return applyKFactor(40);

  if (highestElo < 2400) return applyKFactor(20);

  return applyKFactor(10);
};

export { getElo };
