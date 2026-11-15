const assert = require('node:assert/strict');
const FairMath = require('./fair-math.js');

const appleHrv = { value: 74, source: 'apple', metric: 'SDNN', baseline: { median: 65, mad: 6, validDays: 30, source: 'apple', metric: 'SDNN' } };
const samsungHrv = { value: 54, source: 'samsung', metric: 'HEART_RATE_VARIABILITY', baseline: { median: 45, mad: 6, validDays: 30, source: 'samsung', metric: 'HEART_RATE_VARIABILITY' } };

// Equal personal deviations must score equally even when the vendors report different raw values.
assert.equal(FairMath.scoreHrv(appleHrv).score, FairMath.scoreHrv(samsungHrv).score);
assert.equal(FairMath.scoreHrv({ ...appleHrv, baseline: { ...appleHrv.baseline, metric: 'RMSSD' } }).available, false);
assert.equal(FairMath.scoreRhr({ value: 52, source: 'apple', metric: 'RestingHR', baseline: { median: 56, mad: 3, validDays: 30, source: 'apple', metric: 'RestingHR' } }).score > 50, true);
assert.equal(FairMath.scoreSleep({ durationHours: 8, efficiency: 95 }).score, 100);

const steps = FairMath.scoreSteps({ count: 30000, target: 10000, checks: { monotonicTotal: true, plausibleRate: true, noDuplicateSource: true, locationConsistent: true } });
assert.deepEqual({ tar: steps.targetAchievementRatio, score: steps.score, bonus: steps.bonusPoints, points: steps.cappedPoints }, { tar: 1.2, score: 100, bonus: 20, points: 120 });

const daily = FairMath.calculateDailyScore({
    hrv: appleHrv,
    rhr: { value: 52, source: 'apple', metric: 'RestingHR', baseline: { median: 56, mad: 3, validDays: 30, source: 'apple', metric: 'RestingHR' } },
    sleep: { durationHours: 8, efficiency: 95 },
    steps: { count: 10000, target: 10000, checks: { monotonicTotal: true, plausibleRate: true, noDuplicateSource: true, locationConsistent: true } },
});
assert.equal(daily.recovery.available, true);
assert.equal(daily.composite.available, true);
assert.equal(daily.leaderboardEligible, true);

console.log('fair-math tests passed');
