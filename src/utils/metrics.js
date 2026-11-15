const FairMath = require('../../fair-math.js');

export function dailyMetrics() {
  const score = FairMath.calculateDailyScore({
    hrv: { value: 74, source: 'samsung', metric: 'HEART_RATE_VARIABILITY', baseline: { median: 65, mad: 6, validDays: 30, source: 'samsung', metric: 'HEART_RATE_VARIABILITY' }, freshnessHours: 4 },
    rhr: { value: 52, source: 'samsung', metric: 'HEART_RATE (resting)', baseline: { median: 56, mad: 3, validDays: 30, source: 'samsung', metric: 'HEART_RATE (resting)' }, freshnessHours: 4 },
    sleep: { durationHours: 8.2, efficiency: 92, freshnessHours: 4 },
    steps: { count: 10420, target: 10000, checks: { monotonicTotal: true, plausibleRate: true, noDuplicateSource: true, locationConsistent: true } }
  });
  return { recovery: score.recovery.score || 0, fairScore: score.composite.score || 0, eligible: score.leaderboardEligible };
}
