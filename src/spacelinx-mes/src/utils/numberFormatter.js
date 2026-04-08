export const formatAmount = (value, decimals = 4) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 0;
  }
  return Number(Number(value).toFixed(decimals));
};
