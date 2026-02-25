export const getBackoffTime = (
  attempt: number = 1,
  baseDelay: number = 500,
  factor: number = 2,
  maxDelay: number = 10000,
) => {
  const exponential = baseDelay * Math.pow(factor, attempt - 1);
  const jitter = Math.random() * 100;
  return Math.min(exponential + jitter, maxDelay);
};
