const getNewElo = (
  numberOfGames: number,
  highestElo: number,
  playerElo: number,
  opponentElo: number,
  win: boolean
) => {
  const winProbability =
    1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));

  const getElo = (K: number) =>
    playerElo + Math.ceil(K * (Number(win) - winProbability));

  // Using FIDE K-Factor
  if (numberOfGames <= 30) return getElo(40);

  if (highestElo < 2400) return getElo(20);

  return getElo(10);
};

export { getNewElo };
