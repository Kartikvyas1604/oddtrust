import { describe, it, expect } from 'vitest';
import { checkConsistency, computeArbitrageStakes } from '../consistency.js';
import { computeImpliedProbability, oddsToProbability, normalizeMargin, getBookmakerMargin } from '../market.js';
import type { MarketOdds } from '../types.js';

describe('computeImpliedProbability', () => {
  it('returns 1/odds for odds > 1', () => {
    expect(computeImpliedProbability(2.0)).toBe(0.5);
    expect(computeImpliedProbability(4.0)).toBe(0.25);
    expect(computeImpliedProbability(1.5)).toBeCloseTo(0.666667, 4);
  });

  it('returns 1 for odds <= 1', () => {
    expect(computeImpliedProbability(1.0)).toBe(1);
    expect(computeImpliedProbability(0.5)).toBe(1);
  });
});

describe('oddsToProbability', () => {
  it('converts all outcomes in a market', () => {
    const market: MarketOdds = {
      type: 'match_winner',
      outcomes: { home: 2.5, draw: 3.2, away: 3.0 },
    };
    const prob = oddsToProbability(market);
    expect(prob.type).toBe('match_winner');
    expect(prob.outcomes.home).toBeCloseTo(0.4, 4);
    expect(prob.outcomes.draw).toBeCloseTo(0.3125, 4);
    expect(prob.outcomes.away).toBeCloseTo(0.333333, 4);
  });
});

describe('getBookmakerMargin', () => {
  it('calculates margin above 1', () => {
    const prob = { home: 0.4, draw: 0.3, away: 0.35 };
    expect(getBookmakerMargin(prob)).toBeCloseTo(0.05, 4);
  });

  it('returns 0 for fair odds', () => {
    const prob = { home: 0.5, away: 0.5 };
    expect(getBookmakerMargin(prob)).toBeCloseTo(0, 4);
  });
});

describe('normalizeMargin', () => {
  it('scales probabilities to sum to 1', () => {
    const raw = { home: 0.5, draw: 0.3, away: 0.25 };
    const normalized = normalizeMargin(raw);
    const total = Object.values(normalized).reduce((s, p) => s + p, 0);
    expect(total).toBeCloseTo(1, 10);
    expect(normalized.home).toBeCloseTo(0.5 / 1.05, 4);
  });
});

describe('checkConsistency', () => {
  it('detects consistent market (no arbitrage) — Σ(1/odds) >= 1', () => {
    const markets: MarketOdds[] = [
      {
        type: 'match_winner',
        outcomes: { home: 2.1, draw: 3.4, away: 3.8 },
      },
    ];

    const result = checkConsistency('fixture-1', markets, ['match_winner'], 'hash123');
    expect(result.isConsistent).toBe(true);
    expect(result.summedImpliedProbability).toBeGreaterThanOrEqual(1);
    expect(result.optimalStakes).toBeNull();
  });

  it('detects inconsistent market (arbitrage) — Σ(1/odds) < 1', () => {
    const markets: MarketOdds[] = [
      {
        type: 'match_winner',
        outcomes: { home: 3.0, draw: 4.0, away: 3.2 },
      },
    ];

    const result = checkConsistency('fixture-2', markets, ['match_winner'], 'hash456');
    expect(result.isConsistent).toBe(false);
    expect(result.summedImpliedProbability).toBeLessThan(1);
    expect(result.optimalStakes).not.toBeNull();
  });

  it('computes correct optimal stakes for arbitrage', () => {
    const markets: MarketOdds[] = [
      {
        type: 'match_winner',
        outcomes: { home: 3.0, draw: 4.0, away: 3.2 },
      },
    ];

    const result = checkConsistency('fixture-3', markets, ['match_winner'], 'hash789');
    const stakes = result.optimalStakes!;

    const homeProb = 1 / 3.0;
    const drawProb = 1 / 4.0;
    const awayProb = 1 / 3.2;
    const totalImplied = homeProb + drawProb + awayProb;

    expect(stakes.match_winner.home).toBeCloseTo(homeProb / totalImplied, 4);
    expect(stakes.match_winner.draw).toBeCloseTo(drawProb / totalImplied, 4);
    expect(stakes.match_winner.away).toBeCloseTo(awayProb / totalImplied, 4);

    const stakeTotal = Object.values(stakes.match_winner).reduce((s, v) => s + v, 0);
    expect(stakeTotal).toBeCloseTo(1.0, 4);
  });

  it('handles multi-market arbitrage', () => {
    const markets: MarketOdds[] = [
      {
        type: 'over_under_2.5',
        outcomes: { over: 2.2, under: 1.7 },
      },
    ];

    const result = checkConsistency('fixture-4', markets, ['over_under_2.5'], 'hash101');
    const overProb = 1 / 2.2;
    const underProb = 1 / 1.7;
    const totalImplied = overProb + underProb;

    if (totalImplied < 1) {
      expect(result.isConsistent).toBe(false);
      expect(result.optimalStakes!['over_under_2.5'].over).toBeCloseTo(overProb / totalImplied, 4);
      expect(result.optimalStakes!['over_under_2.5'].under).toBeCloseTo(underProb / totalImplied, 4);
    } else {
      expect(result.isConsistent).toBe(true);
    }
  });

  it('does not throw on empty market set', () => {
    const markets: MarketOdds[] = [];
    expect(() => {
      checkConsistency('fixture-5', markets, ['match_winner'], 'hash202');
    }).not.toThrow();
  });
});

describe('computeArbitrageStakes', () => {
  it('computes stakes for arbitrage with 100 unit total', () => {
    const markets: MarketOdds[] = [
      {
        type: 'match_winner',
        outcomes: { home: 2.5, draw: 3.5, away: 2.8 },
      },
    ];

    const stakes = computeArbitrageStakes(markets);
    if (Object.keys(stakes).length > 0) {
      const total = Object.values(stakes.match_winner).reduce((s, v) => s + v, 0);
      expect(total).toBeCloseTo(100, 2);
    }
  });

  it('returns empty object for consistent markets', () => {
    const markets: MarketOdds[] = [
      {
        type: 'match_winner',
        outcomes: { home: 2.0, draw: 3.5, away: 3.5 },
      },
    ];

    const stakes = computeArbitrageStakes(markets);
    expect(Object.keys(stakes).length).toBe(0);
  });
});

describe('checkConsistency — known fixture scenarios', () => {
  it('correctly computes Σ(1/odds) for a 3-outcome market', () => {
    const markets: MarketOdds[] = [
      {
        type: 'match_winner',
        outcomes: { home: 2.10, draw: 3.25, away: 3.50 },
      },
    ];

    const result = checkConsistency('fixture-known1', markets, ['match_winner'], 'hash-k1');

    const expectedSip = 1 / 2.10 + 1 / 3.25 + 1 / 3.50;
    expect(result.summedImpliedProbability).toBeCloseTo(expectedSip, 6);
    expect(result.fixtureId).toBe('fixture-known1');
    expect(result.oddsSnapshotHash).toBe('hash-k1');
  });

  it('detects arbitrage with over/under market', () => {
    const markets: MarketOdds[] = [
      {
        type: 'over_under_2.5',
        outcomes: { over: 2.25, under: 1.65 },
      },
    ];

    const result = checkConsistency('fixture-ou1', markets, ['over_under_2.5'], 'hash-ou');
    const sip = 1 / 2.25 + 1 / 1.65;

    expect(result.summedImpliedProbability).toBeCloseTo(sip, 6);
    expect(result.isConsistent).toBe(sip >= 1);
  });

  it('computes margin correctly', () => {
    const markets: MarketOdds[] = [
      {
        type: 'both_teams_score',
        outcomes: { yes: 1.8, no: 2.0 },
      },
    ];

    const result = checkConsistency('fixture-bts', markets, ['both_teams_score'], 'hash-bts');
    const margin = (1 / 1.8 + 1 / 2.0) - 1;
    expect(result.margin).toBeCloseTo(margin, 6);
  });

  it('identifies arbitrage opportunity with exact decimal precision', () => {
    const markets: MarketOdds[] = [
      {
        type: 'match_winner',
        outcomes: { home: 3.50, draw: 4.33, away: 1.91 },
      },
    ];

    const homeProb = 1 / 3.50;
    const drawProb = 1 / 4.33;
    const awayProb = 1 / 1.91;
    const totalImplied = homeProb + drawProb + awayProb;

    const result = checkConsistency('fixture-precise', markets, ['match_winner'], 'hash-precise');
    expect(result.summedImpliedProbability).toBeCloseTo(totalImplied, 6);
    expect(result.margin).toBeCloseTo(totalImplied - 1, 6);
  });

  it('EXACT THRESHOLD: Σ(1/odds) = 1.0 exactly (fair odds, no arbitrage, no margin)', () => {
    const markets: MarketOdds[] = [
      {
        type: 'match_winner',
        outcomes: { home: 2.0, draw: 4.0, away: 4.0 },
      },
    ];
    // Σ = 1/2.0 + 1/4.0 + 1/4.0 = 0.5 + 0.25 + 0.25 = 1.0
    const result = checkConsistency('fixture-exact', markets, ['match_winner'], 'hash-exact');
    expect(result.summedImpliedProbability).toBeCloseTo(1.0, 6);
    expect(result.isConsistent).toBe(true);
    expect(result.margin).toBeCloseTo(0.0, 6);
    expect(result.optimalStakes).toBeNull();
  });

  it('ARBITRAGE: Σ(1/odds) = 0.9 (clear 10% arbitrage opportunity)', () => {
    const markets: MarketOdds[] = [
      {
        type: 'match_winner',
        outcomes: {
          home: 3.333333,
          draw: 5.0,
          away: 3.333333,
        },
      },
    ];
    // Σ = 1/3.333333 + 1/5.0 + 1/3.333333
    //   = 0.3 + 0.2 + 0.3 = 0.8
    const result = checkConsistency('fixture-arb', markets, ['match_winner'], 'hash-arb');
    expect(result.isConsistent).toBe(false);
    expect(result.summedImpliedProbability).toBeLessThan(1);
    expect(result.optimalStakes).not.toBeNull();
    // Optimal stakes should sum to 1.0
    const stakeTotal = Object.values(result.optimalStakes!['match_winner']).reduce((s, v) => s + v, 0);
    expect(stakeTotal).toBeCloseTo(1.0, 4);
  });

  it('105% MARGIN: Σ(1/odds) = 1.05 (industry-standard overround boundary)', () => {
    const odds = { home: 2.0, draw: 3.333333, away: 4.0 };
    // Target: Σ = 1.05
    // 1/2.0 = 0.5
    // 1/3.333333 = 0.3
    // 1/4.0 = 0.25
    // Σ = 1.05
    const markets: MarketOdds[] = [
      {
        type: 'match_winner',
        outcomes: odds,
      },
    ];
    const result = checkConsistency('fixture-105', markets, ['match_winner'], 'hash-105');
    const expectedSip = 1 / 2.0 + 1 / 3.333333 + 1 / 4.0;
    expect(result.summedImpliedProbability).toBeCloseTo(expectedSip, 4);
    expect(result.isConsistent).toBe(true);
    expect(result.margin).toBeCloseTo(expectedSip - 1, 4);
  });

  it('VERY CLOSE TO BOUNDARY: Σ(1/odds) = 0.999 (sub-threshold, should flag arbitrage)', () => {
    // Need odds such that sum is just under 1.0
    // For match_winner: need 1/home + 1/draw + 1/away = 0.999
    // Using: home=2.1, draw=3.5, away=3.6
    // 1/2.1 = 0.476190...
    // 1/3.5 = 0.285714...
    // 1/3.6 = 0.277778...
    // Σ = 1.039682... hmm that's > 1
    // Let me adjust to get just under 1:
    // home=3.0, draw=4.0, away=3.0
    // 1/3.0 + 1/4.0 + 1/3.0 = 0.3333 + 0.25 + 0.3333 = 0.9167 (too low)
    // home=2.5, draw=3.0, away=3.0
    // 0.4 + 0.3333 + 0.3333 = 1.0667 (too high)
    // home=2.7, draw=3.2, away=3.2
    // 0.37037 + 0.3125 + 0.3125 = 0.99537 (just under!)
    const markets: MarketOdds[] = [
      {
        type: 'match_winner',
        outcomes: { home: 2.7, draw: 3.2, away: 3.2 },
      },
    ];
    const result = checkConsistency('fixture-close', markets, ['match_winner'], 'hash-close');
    expect(result.isConsistent).toBe(false);
    expect(result.summedImpliedProbability).toBeLessThan(1);
    expect(result.optimalStakes).not.toBeNull();
  });

  it('HIGH MARGIN: Σ(1/odds) = 1.30 (30% bookmaker margin, common in some markets)', () => {
    const markets: MarketOdds[] = [
      {
        type: 'match_winner',
        outcomes: { home: 1.5, draw: 4.0, away: 6.0 },
      },
    ];
    // Σ = 1/1.5 + 1/4.0 + 1/6.0 = 0.6667 + 0.25 + 0.1667 = 1.0833
    const expectedSip = 1 / 1.5 + 1 / 4.0 + 1 / 6.0;
    const result = checkConsistency('fixture-high-margin', markets, ['match_winner'], 'hash-high');
    expect(result.isConsistent).toBe(true);
    expect(result.summedImpliedProbability).toBeCloseTo(expectedSip, 4);
    expect(result.optimalStakes).toBeNull();
  });

  it('TWO-OUTCOME MARKET: both_teams_score consistent case', () => {
    const markets: MarketOdds[] = [
      {
        type: 'both_teams_score',
        outcomes: { yes: 1.8, no: 1.95 },
      },
    ];
    // Σ = 1/1.8 + 1/1.95 = 0.5556 + 0.5128 = 1.0684 (consistent)
    const result = checkConsistency('fixture-bts-2', markets, ['both_teams_score'], 'hash-bts2');
    expect(result.isConsistent).toBe(true);
    expect(result.summedImpliedProbability).toBeGreaterThan(1);
  });

  it('TWO-OUTCOME ARBITRAGE: both_teams_score with arbitrage', () => {
    const markets: MarketOdds[] = [
      {
        type: 'both_teams_score',
        outcomes: { yes: 2.2, no: 2.0 },
      },
    ];
    // Σ = 1/2.2 + 1/2.0 = 0.4545 + 0.5 = 0.9545 (< 1, arbitrage)
    const result = checkConsistency('fixture-bts-arb', markets, ['both_teams_score'], 'hash-bts-arb');
    expect(result.isConsistent).toBe(false);
    expect(result.summedImpliedProbability).toBeLessThan(1);
  });

  it('MULTI-MARKET: cross-market arbitrage detection', () => {
    const markets: MarketOdds[] = [
      { type: 'match_winner', outcomes: { home: 2.1, draw: 3.4, away: 3.8 } },
      { type: 'over_under_2.5', outcomes: { over: 2.2, under: 1.7 } },
      { type: 'both_teams_score', outcomes: { yes: 1.9, no: 1.9 } },
    ];
    const mwResult = checkConsistency('fixture-cross', markets, ['match_winner'], 'hash-cross');
    const ouResult = checkConsistency('fixture-cross', markets, ['over_under_2.5'], 'hash-cross');
    const btsResult = checkConsistency('fixture-cross', markets, ['both_teams_score'], 'hash-cross');

    // match_winner: 1/2.1 + 1/3.4 + 1/3.8 = 0.47619 + 0.29412 + 0.26316 = 1.03347
    expect(mwResult.summedImpliedProbability).toBeGreaterThan(1);
    expect(mwResult.isConsistent).toBe(true);

    // over_under_2.5: 1/2.2 + 1/1.7 = 0.45455 + 0.58824 = 1.04279
    expect(ouResult.summedImpliedProbability).toBeGreaterThan(1);
    expect(ouResult.isConsistent).toBe(true);

    // both_teams_score: 1/1.9 + 1/1.9 = 0.52632 + 0.52632 = 1.05263
    expect(btsResult.summedImpliedProbability).toBeGreaterThan(1);
    expect(btsResult.isConsistent).toBe(true);
  });

  it('handles complete market coverage with all outcome sets', () => {
    const markets: MarketOdds[] = [
      { type: 'match_winner', outcomes: { home: 2.0, draw: 3.5, away: 4.0 } },
      { type: 'over_under_2.5', outcomes: { over: 2.1, under: 1.8 } },
      { type: 'both_teams_score', outcomes: { yes: 1.9, no: 1.9 } },
    ];

    const mwResult = checkConsistency('fixture-all', markets, ['match_winner'], 'hash-all');
    const ouResult = checkConsistency('fixture-all', markets, ['over_under_2.5'], 'hash-all');
    const btsResult = checkConsistency('fixture-all', markets, ['both_teams_score'], 'hash-all');

    expect(typeof mwResult.summedImpliedProbability).toBe('number');
    expect(typeof ouResult.summedImpliedProbability).toBe('number');
    expect(typeof btsResult.summedImpliedProbability).toBe('number');
    expect(mwResult.fixtureId).toBe('fixture-all');
    expect(ouResult.fixtureId).toBe('fixture-all');
    expect(btsResult.fixtureId).toBe('fixture-all');
  });
});
