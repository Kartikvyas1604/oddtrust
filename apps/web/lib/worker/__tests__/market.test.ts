import { describe, it, expect } from 'vitest';
import {
  computeImpliedProbability,
  oddsToProbability,
  normalizeMargin,
  getBookmakerMargin,
} from '../market';
import type { MarketOdds } from '../types';

describe('computeImpliedProbability', () => {
  it('regular odds', () => {
    expect(computeImpliedProbability(2.0)).toBe(0.5);
    expect(computeImpliedProbability(4.0)).toBe(0.25);
    expect(computeImpliedProbability(1.5)).toBeCloseTo(0.666667, 4);
  });

  it('edge cases', () => {
    expect(computeImpliedProbability(1)).toBe(1);
    expect(computeImpliedProbability(0.5)).toBe(1);
  });
});

describe('oddsToProbability', () => {
  it('converts 3-outcome market', () => {
    const market: MarketOdds = { type: 'match_winner', outcomes: { home: 2.5, draw: 3.2, away: 3.0 } };
    const prob = oddsToProbability(market);
    expect(prob.outcomes.home).toBeCloseTo(0.4, 4);
    expect(prob.outcomes.draw).toBeCloseTo(0.3125, 4);
    expect(prob.outcomes.away).toBeCloseTo(1 / 3.0, 4);
  });
});

describe('getBookmakerMargin', () => {
  it('5% margin', () => {
    expect(getBookmakerMargin({ home: 0.4, draw: 0.3, away: 0.35 })).toBeCloseTo(0.05, 4);
  });

  it('fair odds have zero margin', () => {
    expect(getBookmakerMargin({ home: 0.5, away: 0.5 })).toBeCloseTo(0, 4);
  });
});

describe('normalizeMargin', () => {
  it('normalizes to sum 1', () => {
    const raw = { home: 0.5, draw: 0.3, away: 0.25 };
    const n = normalizeMargin(raw);
    expect(Object.values(n).reduce((s, p) => s + p, 0)).toBeCloseTo(1, 10);
  });
});
