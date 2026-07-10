export const getGridMod = (count: number): 2 | 3 | 5 => {
  if (count === 3) {
    return 3;
  }

  if (count === 5) {
    return 5;
  }

  return 2;
};
