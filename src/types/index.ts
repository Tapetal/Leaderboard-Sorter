/**
 * Type definitions for leaderboard system
 */

export interface Player {
  name: string;
  eventScores: number[];        // Numeric scores for each event (D$Q and - converted to 0)
  eventSpending: number[];      // Spending for each event
  totalPoints: number;          // Sum of all event scores
  totalSpending: number;        // Sum of all spending
  rank?: number;                // Final rank after sorting
  isTied?: boolean;             // Flag if player is tied after all tiebreakers
}

export interface RawPlayerData {
  name: string;
  scores: string[];             // Raw scores from Excel (may contain "D$Q", "-", etc)
  spending: string[];           // Raw spending from Excel
}

export interface LeaderboardData {
  players: Player[];
  eventCount: number;
}

export interface TieGroup {
  players: Player[];
  totalPoints: number;
  totalSpending: number;
}