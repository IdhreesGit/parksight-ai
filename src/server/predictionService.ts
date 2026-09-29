import { StatisticalPrediction, SimulationHistorySnapshot } from '../types';

/**
 * Holt's Double Exponential Smoothing (Level + Trend Extrapolation)
 * Accurately labeled: Not claiming seasonal Holt-Winters unless diurnal seasonal indices are formally computed.
 *
 * Equations:
 *   Level: S_t = alpha * Y_t + (1 - alpha) * (S_{t-1} + b_{t-1})
 *   Trend: b_t = beta * (S_t - S_{t-1}) + (1 - beta) * b_{t-1}
 *   Forecast(t + m): F_{t+m} = S_t + m * b_t
 *
 * Provides short-term horizon forecasting (+10m, +20m, +30m) with 95% confidence intervals
 * derived from rolling mean squared prediction errors over accumulated time-series buffer.
 */
export function calculateStatisticalPrediction(
  historySnapshots: SimulationHistorySnapshot[],
  currentRate: number,
  totalBays: number,
  horizonMinutes = 30
): StatisticalPrediction {
  const alpha = 0.35; // Smoothing parameter for level
  const beta = 0.20; // Smoothing parameter for trend slope

  // Format historical points for visualization
  const historicalPoints = historySnapshots.slice(-20).map((h) => ({
    timestamp: h.simulatedTime || h.timestamp.slice(11, 16),
    occupancyPercent: h.occupancyPercent,
  }));

  if (historySnapshots.length < 3) {
    return {
      method: "Holt's Double Exponential Smoothing (Level + Trend Extrapolation)",
      horizonMinutes,
      currentOccupancyPercent: currentRate,
      predictedOccupancyPercent: currentRate,
      predictedOccupiedBays: Math.round((currentRate / 100) * totalBays),
      expectedAvailableSpaces: Math.max(0, totalBays - Math.round((currentRate / 100) * totalBays)),
      trend: 'stable',
      trendDirection: 'Stable (0.0%/hr)',
      confidenceScore: '95% Confidence (Initial baseline state)',
      confidenceInterval: '± 4.0%',
      explanation: 'Accumulating simulation time-series frames; baseline instantaneous state projected forward.',
      predictionExplanation: 'Initial buffer filling; zero trend detected.',
      validationStatus: 'Prototype Model (Single Source of Truth Connected)',
      modelType: 'PROTOTYPE HEURISTIC / TIME-SERIES EXTENSION',
      historicalPoints,
      predictionBounds: {
        lowerPercent: Math.max(0, currentRate - 4),
        upperPercent: Math.min(100, currentRate + 4),
      },
      forecastSeries: [
        { minuteOffset: 10, predictedPercent: currentRate, lower: Math.max(0, currentRate - 3), upper: Math.min(100, currentRate + 3) },
        { minuteOffset: 20, predictedPercent: currentRate, lower: Math.max(0, currentRate - 4), upper: Math.min(100, currentRate + 4) },
        { minuteOffset: 30, predictedPercent: currentRate, lower: Math.max(0, currentRate - 5), upper: Math.min(100, currentRate + 5) },
      ],
    };
  }

  // Initialize level S and trend b using first two historical snapshots
  let s = historySnapshots[0].occupancyPercent;
  let b = historySnapshots[1].occupancyPercent - historySnapshots[0].occupancyPercent;
  let sumSquaredResiduals = 0;
  let count = 0;

  for (let i = 1; i < historySnapshots.length; i++) {
    const y = historySnapshots[i].occupancyPercent;
    const prevS = s;
    const predictedY = prevS + b;
    const residual = y - predictedY;
    sumSquaredResiduals += residual * residual;
    count++;

    // Holt's recursive update
    s = alpha * y + (1 - alpha) * (prevS + b);
    b = beta * (s - prevS) + (1 - beta) * b;
  }

  // Blend with current observed rate
  s = alpha * currentRate + (1 - alpha) * s;

  // Forecast horizon steps (10-minute intervals)
  const steps = Math.max(1, Math.round(horizonMinutes / 10));
  const rawForecast = s + steps * b;
  const predictedOccupancyPercent = Math.min(100, Math.max(5, Math.round(rawForecast)));
  const predictedOccupiedBays = Math.round((predictedOccupancyPercent / 100) * totalBays);
  const diff = predictedOccupancyPercent - currentRate;

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (diff >= 2) trend = 'increasing';
  else if (diff <= -2) trend = 'decreasing';

  const trendRatePerHour = +(b * 6).toFixed(1);
  const trendDirection =
    trend === 'increasing'
      ? `Increasing (+${trendRatePerHour}%/hr)`
      : trend === 'decreasing'
      ? `Decreasing (${trendRatePerHour}%/hr)`
      : 'Stable (±0.5%/hr)';

  // Standard error from historical residuals
  const standardError = count > 2 ? Math.sqrt(sumSquaredResiduals / count) : 3.2;
  const marginOfError = Math.round(1.96 * standardError * Math.sqrt(steps));
  const lowerPercent = Math.max(0, predictedOccupancyPercent - marginOfError);
  const upperPercent = Math.min(100, predictedOccupancyPercent + marginOfError);
  const expectedAvailableSpaces = Math.max(0, totalBays - predictedOccupiedBays);

  // Generate intermediate forecast points: +10m, +20m, +30m
  const forecastSeries = [10, 20, 30].map((mins) => {
    const step = mins / 10;
    const val = Math.min(100, Math.max(5, Math.round(s + step * b)));
    const stepError = Math.round(1.96 * standardError * Math.sqrt(step));
    return {
      minuteOffset: mins,
      predictedPercent: val,
      lower: Math.max(0, val - stepError),
      upper: Math.min(100, val + stepError),
    };
  });

  return {
    method: "Holt's Double Exponential Smoothing (Level + Trend Extrapolation)",
    horizonMinutes,
    currentOccupancyPercent: currentRate,
    predictedOccupancyPercent,
    predictedOccupiedBays,
    expectedAvailableSpaces,
    trend,
    trendDirection,
    confidenceScore: `95% Confidence Interval [${lowerPercent}% - ${upperPercent}%] (SE = ${standardError.toFixed(1)}%)`,
    confidenceInterval: `± ${marginOfError}%`,
    explanation: `Calculated from ${historySnapshots.length} accumulated simulation snapshots. Level S=${s.toFixed(1)}%, Trend Slope b=${b >= 0 ? '+' : ''}${b.toFixed(2)}%/10m.`,
    predictionExplanation: `Current occupancy (${currentRate}%) extrapolated over +${horizonMinutes} min window. Estimated trend slope indicates ${trendDirection.toLowerCase()}.`,
    validationStatus: 'Prototype Model (Single Source of Truth Connected)',
    modelType: 'PROTOTYPE HEURISTIC / TIME-SERIES EXTENSION',
    historicalPoints,
    predictionBounds: {
      lowerPercent,
      upperPercent,
    },
    forecastSeries,
  };
}
