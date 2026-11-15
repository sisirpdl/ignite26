/*
 * Fair Math v1
 *
 * A dependency-free scoring module that works in the browser and in Node.
 * Raw HRV values are intentionally never converted between vendors.  Each
 * reading is assessed only against its own user's source-and-metric baseline.
 */
(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.FairMath = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const WEIGHTS = Object.freeze({ hrv: 35, sleep: 35, rhr: 15, steps: 15 });
    const MIN_BASELINE_DAYS = 14;
    const FULL_BASELINE_DAYS = 30;

    const clamp = (value, low = 0, high = 100) => Math.max(low, Math.min(high, value));
    const round = (value, places = 0) => {
        const factor = 10 ** places;
        return Math.round(value * factor) / factor;
    };
    const isFiniteNumber = (value) => Number.isFinite(value);

    function reason(code, message) {
        return { code, message };
    }

    function baselineScore(reading, options) {
        const { value, source, metric, baseline, freshnessHours = 0 } = reading;
        const { direction, minimumScale } = options;
        if (!isFiniteNumber(value)) return { available: false, reason: reason('missing-reading', 'No current reading.') };
        if (!baseline || !isFiniteNumber(baseline.median) || !isFiniteNumber(baseline.mad)) {
            return { available: false, reason: reason('missing-baseline', 'A personal baseline is required.') };
        }
        if (baseline.source !== source || baseline.metric !== metric) {
            return { available: false, reason: reason('baseline-mismatch', 'Baseline must use the same source and metric as the reading.') };
        }
        if ((baseline.validDays || 0) < MIN_BASELINE_DAYS) {
            return { available: false, reason: reason('short-baseline', `At least ${MIN_BASELINE_DAYS} valid baseline days are required.`) };
        }

        // MAD is robust against a few travel, illness, or sensor-error outliers.
        const robustSigma = Math.max(Math.abs(baseline.mad) * 1.4826, minimumScale);
        const z = clamp((direction * (value - baseline.median)) / robustSigma, -3, 3);
        const score = clamp(50 + 45 * Math.tanh(z / 1.35));
        const baselineConfidence = clamp((baseline.validDays || 0) / FULL_BASELINE_DAYS);
        const freshnessConfidence = clamp(1 - Math.max(0, freshnessHours - 24) / 48);

        return {
            available: true,
            score: round(score),
            z: round(z, 2),
            delta: round(value - baseline.median, 1),
            confidence: round(baselineConfidence * freshnessConfidence, 2),
        };
    }

    function scoreHrv(reading) {
        return baselineScore(reading, { direction: 1, minimumScale: 1 });
    }

    function scoreRhr(reading) {
        return baselineScore(reading, { direction: -1, minimumScale: 1 });
    }

    function scoreSleep({ durationHours, efficiency, freshnessHours = 0 }) {
        if (!isFiniteNumber(durationHours) || !isFiniteNumber(efficiency)) {
            return { available: false, reason: reason('missing-sleep', 'Duration and efficiency are both required.') };
        }
        if (durationHours < 0 || durationHours > 24 || efficiency < 0 || efficiency > 100) {
            return { available: false, reason: reason('invalid-sleep', 'Sleep values are outside plausible bounds.') };
        }

        // The optimum is a plateau, not a single magic number: 7.5–8.5 hours earns full duration credit.
        const durationScore = durationHours < 7.5
            ? clamp(100 - (7.5 - durationHours) * 18)
            : durationHours > 8.5
                ? clamp(100 - (durationHours - 8.5) * 16)
                : 100;
        const efficiencyScore = clamp((efficiency - 65) * (100 / 30));
        const freshnessConfidence = clamp(1 - Math.max(0, freshnessHours - 30) / 42);

        return {
            available: true,
            score: round(durationScore * 0.8 + efficiencyScore * 0.2),
            durationScore: round(durationScore),
            efficiencyScore: round(efficiencyScore),
            confidence: round(freshnessConfidence, 2),
        };
    }

    function scoreSteps({ count, target, checks = {} }) {
        if (!isFiniteNumber(count) || !isFiniteNumber(target) || target <= 0 || count < 0) {
            return { available: false, reason: reason('invalid-steps', 'A non-negative count and positive personal target are required.') };
        }

        // This cap applies before points are awarded. Hitting the target earns 100;
        // the optional bonus can only reach 20 points, even if someone walks far more.
        const targetAchievementRatio = clamp(count / target, 0, 1.2);
        const targetScore = round(Math.min(targetAchievementRatio, 1) * 100);
        const bonusPoints = round(Math.max(0, targetAchievementRatio - 1) * 100);
        const checkValues = [checks.monotonicTotal, checks.plausibleRate, checks.noDuplicateSource, checks.locationConsistent];
        const knownChecks = checkValues.filter((value) => typeof value === 'boolean');
        const integrity = knownChecks.length ? knownChecks.filter(Boolean).length / knownChecks.length : 0;

        return {
            available: true,
            targetAchievementRatio: round(targetAchievementRatio, 2),
            score: targetScore,
            bonusPoints,
            cappedPoints: round(targetScore + bonusPoints),
            integrity: round(integrity, 2),
            verified: knownChecks.length === 4 && integrity === 1,
        };
    }

    function weightedAverage(items, places = 0) {
        const totalWeight = items.reduce((total, item) => total + item.weight, 0);
        return totalWeight ? round(items.reduce((total, item) => total + item.score * item.weight, 0) / totalWeight, places) : null;
    }

    function calculateDailyScore({ hrv, rhr, sleep, steps }) {
        const hrvResult = scoreHrv(hrv);
        const rhrResult = scoreRhr(rhr);
        const sleepResult = scoreSleep(sleep);
        const stepResult = scoreSteps(steps);
        const healthResults = [hrvResult, sleepResult, rhrResult];
        const healthReady = healthResults.every((result) => result.available);
        const dailyReady = healthReady && stepResult.available;

        // Recovery deliberately excludes steps: readiness is not a reward for movement.
        const recovery = healthReady
            ? weightedAverage([
                { score: hrvResult.score, weight: WEIGHTS.hrv },
                { score: sleepResult.score, weight: WEIGHTS.sleep },
                { score: rhrResult.score, weight: WEIGHTS.rhr },
            ])
            : null;
        // The arena's daily score uses the requested 35 / 35 / 15 / 15 matrix.
        const composite = dailyReady
            ? weightedAverage([
                { score: hrvResult.score, weight: WEIGHTS.hrv },
                { score: sleepResult.score, weight: WEIGHTS.sleep },
                { score: rhrResult.score, weight: WEIGHTS.rhr },
                { score: stepResult.score, weight: WEIGHTS.steps },
            ])
            : null;
        const evidence = [
            hrvResult.confidence || 0,
            sleepResult.confidence || 0,
            rhrResult.confidence || 0,
            stepResult.integrity || 0,
        ];
        const confidence = weightedAverage(evidence.map((score, index) => ({ score, weight: Object.values(WEIGHTS)[index] })), 2);
        const reasons = [hrvResult, sleepResult, rhrResult, stepResult]
            .filter((result) => !result.available)
            .map((result) => result.reason);
        if (stepResult.available && !stepResult.verified) reasons.push(reason('unverified-steps', 'Step data has not passed all four integrity checks.'));

        return {
            version: 'fair-math-v1',
            weights: WEIGHTS,
            recovery: { score: recovery, available: healthReady },
            composite: { score: composite, available: dailyReady },
            hrv: hrvResult,
            sleep: sleepResult,
            rhr: rhrResult,
            steps: stepResult,
            confidence,
            leaderboardEligible: dailyReady && stepResult.verified && confidence >= 0.8,
            reasons,
        };
    }

    return Object.freeze({ WEIGHTS, MIN_BASELINE_DAYS, scoreHrv, scoreRhr, scoreSleep, scoreSteps, calculateDailyScore });
}));
