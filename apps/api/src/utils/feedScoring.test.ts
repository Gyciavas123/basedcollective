import { describe, it, expect } from 'vitest';
import { calculatePostScore, calculateHotScore } from './feedScoring';

describe('calculatePostScore', () => {
  const baseDate = new Date('2026-01-01T00:00:00Z');

  it('should return correct score for fresh post', () => {
    const score = calculatePostScore(10, 2, 5, 1, baseDate, baseDate);
    // (10 - 2 + 5*0.5) * 1.0 * 2^0 = 10.5
    expect(score).toBeCloseTo(10.5);
  });

  it('should apply time decay', () => {
    const sixHoursLater = new Date(baseDate.getTime() + 6 * 60 * 60 * 1000);
    const score = calculatePostScore(10, 2, 5, 1, baseDate, sixHoursLater);
    // (10.5) * 1.0 * 2^(-1) = 5.25
    expect(score).toBeCloseTo(5.25);
  });

  it('should apply poster multiplier for rank 5', () => {
    const score = calculatePostScore(10, 2, 5, 5, baseDate, baseDate);
    // (10.5) * 2.0 * 1.0 = 21.0
    expect(score).toBeCloseTo(21.0);
  });

  it('should apply poster multiplier for rank 3', () => {
    const score = calculatePostScore(10, 0, 0, 3, baseDate, baseDate);
    // (10) * 1.5 * 1.0 = 15.0
    expect(score).toBeCloseTo(15.0);
  });

  it('should handle negative raw score', () => {
    const score = calculatePostScore(1, 10, 0, 1, baseDate, baseDate);
    // (1 - 10) * 1.0 * 1.0 = -9.0
    expect(score).toBeCloseTo(-9.0);
  });

  it('should decrease score as post ages', () => {
    const score1h = calculatePostScore(10, 0, 0, 1, baseDate, new Date(baseDate.getTime() + 3600000));
    const score6h = calculatePostScore(10, 0, 0, 1, baseDate, new Date(baseDate.getTime() + 6 * 3600000));
    const score24h = calculatePostScore(10, 0, 0, 1, baseDate, new Date(baseDate.getTime() + 24 * 3600000));
    expect(score1h).toBeGreaterThan(score6h);
    expect(score6h).toBeGreaterThan(score24h);
  });
});

describe('calculateHotScore', () => {
  const baseDate = new Date('2026-01-01T00:00:00Z');

  it('should return 0 for posts outside hot window', () => {
    const outside = new Date(baseDate.getTime() + 7 * 60 * 60 * 1000); // 7 hours
    const score = calculateHotScore(10, 0, 0, baseDate, outside, 21600);
    expect(score).toBe(0);
  });

  it('should return positive velocity for posts within hot window', () => {
    const oneHourLater = new Date(baseDate.getTime() + 3600000);
    const score = calculateHotScore(10, 0, 0, baseDate, oneHourLater, 21600);
    expect(score).toBeGreaterThan(0);
  });
});
