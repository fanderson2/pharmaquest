const DEFAULT_EF = 2.5;
const MIN_EF = 1.3;
const EF_DECREASE = 0.2;
const EF_INCREASE = 0.1;

export function calculateNextInterval(
  repetitionCount: number,
  currentInterval: number,
  easinessFactor: number
): number {
  if (repetitionCount === 1) return 1;
  if (repetitionCount === 2) return 6;
  return Math.round(currentInterval * easinessFactor);
}

export function calculateNewEasinessFactor(
  currentEF: number,
  isCorrect: boolean
): number {
  return isCorrect
    ? Math.min(currentEF + EF_INCREASE, 2.5)
    : Math.max(currentEF - EF_DECREASE, MIN_EF);
}

export function getDefaultSRSData() {
  return {
    repetitionCount: 0,
    interval: 1,
    easinessFactor: DEFAULT_EF,
    nextReviewDate: new Date(),
    lastReviewDate: new Date()
  };
}