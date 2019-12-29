export const formatRank = (rank: number) => {
  const last = rank % 10;
  const second = Math.floor(rank / 10) % 10;
  if (second === 1) {
    return `${rank}th`;
  } else if (last === 1) {
    return `${rank}st`;
  } else if (last === 2) {
    return `${rank}nd`;
  } else if (last === 3) {
    return `${rank}rd`;
  } else {
    return `${rank}th`;
  }
};

const GP30 = [
  100,
  75,
  60,
  50,
  45,
  40,
  36,
  32,
  29,
  26,
  24,
  22,
  20,
  18,
  16,
  15,
  14,
  13,
  12,
  11,
  10,
  9,
  8,
  7,
  6,
  5,
  4,
  3,
  2,
  1
];
export const earnedPoint = (rank: number) =>
  rank <= 30 ? GP30[rank - 1] : undefined;
