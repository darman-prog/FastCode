import { describe, it, expect } from 'vitest';
import { EloCalculator } from './elo.service';

describe('EloCalculator (PRD RF5.1 - RF5.3)', () => {
  it('should initialize with 1200 Elo and K=32 by default', () => {
    expect(EloCalculator.INITIAL_ELO).toBe(1200);
    expect(EloCalculator.K_FACTOR).toBe(32);
  });

  it('should calculate +16 for win between equal Elo players (1200 vs 1200)', () => {
    const result = EloCalculator.calculate(1200, 1200, 1);
    expect(result.delta).toBe(16);
    expect(result.newElo).toBe(1216);
  });

  it('should calculate -16 for loss between equal Elo players (1200 vs 1200)', () => {
    const result = EloCalculator.calculate(1200, 1200, 0);
    expect(result.delta).toBe(-16);
    expect(result.newElo).toBe(1184);
  });

  it('PRD RF5.3: Technical draw (score 0.5) must NOT alter Elo (delta = 0)', () => {
    const equalDraw = EloCalculator.calculate(1200, 1200, 0.5);
    expect(equalDraw.delta).toBe(0);
    expect(equalDraw.newElo).toBe(1200);

    const unequalDraw = EloCalculator.calculate(1350, 1100, 0.5);
    expect(unequalDraw.delta).toBe(0);
    expect(unequalDraw.newElo).toBe(1350);
  });

  it('underdog victory should reward greater delta', () => {
    // Player 1000 wins against Player 1400
    const result = EloCalculator.calculate(1000, 1400, 1);
    expect(result.delta).toBeGreaterThan(16);
    expect(result.newElo).toBe(1000 + result.delta);
  });

  it('favorite victory should reward smaller delta', () => {
    // Player 1400 wins against Player 1000
    const result = EloCalculator.calculate(1400, 1000, 1);
    expect(result.delta).toBeLessThan(16);
    expect(result.delta).toBeGreaterThan(0);
    expect(result.newElo).toBe(1400 + result.delta);
  });
});
