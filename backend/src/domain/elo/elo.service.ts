export interface EloCalculationResult {
  newElo: number;
  delta: number;
}

export class EloCalculator {
  public static readonly INITIAL_ELO = 1200;
  public static readonly K_FACTOR = 32;

  /**
   * Calculates new Elo and delta according to PRD RF5.3:
   * Elo' = round(Elo + K * (S - E))
   * E = 1 / (1 + 10^((Elo_rival - Elo) / 400))
   *
   * Special rule: Technical Draw (score = 0.5) DOES NOT alter Elo (delta = 0).
   */
  public static calculate(
    currentElo: number,
    opponentElo: number,
    score: 0 | 0.5 | 1,
  ): EloCalculationResult {
    // PRD RF5.3: Technical draw does not move Elo
    if (score === 0.5) {
      return {
        newElo: currentElo,
        delta: 0,
      };
    }

    const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
    const delta = Math.round(this.K_FACTOR * (score - expectedScore));
    const newElo = currentElo + delta;

    return {
      newElo,
      delta,
    };
  }
}
