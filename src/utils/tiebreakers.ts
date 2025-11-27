import { Player } from '../types';

/**
 * Tiebreaker utilities for leaderboard ranking
 */

/**
 * Compare two players using countback system
 * Returns: -1 if p1 ranks higher, 1 if p2 ranks higher, 0 if still tied
 */
export function countbackCompare(p1: Player, p2: Player): number {
  // Get all non-zero scores for both players
  const p1Scores = p1.eventScores.filter(s => s > 0).sort((a, b) => b - a);
  const p2Scores = p2.eventScores.filter(s => s > 0).sort((a, b) => b - a);

  // Find the maximum length to compare
  const maxLength = Math.max(p1Scores.length, p2Scores.length);

  // Compare from highest to lowest score
  for (let i = 0; i < maxLength; i++) {
    const score1 = p1Scores[i] || 0;
    const score2 = p2Scores[i] || 0;

    if (score1 > score2) {
      return -1; // p1 ranks higher
    } else if (score2 > score1) {
      return 1; // p2 ranks higher
    }

    // If scores are equal, check occurrences of this score
    if (score1 === score2 && score1 > 0) {
      const count1 = p1Scores.filter(s => s === score1).length;
      const count2 = p2Scores.filter(s => s === score2).length;

      if (count1 > count2) {
        return -1; // p1 has more occurrences
      } else if (count2 > count1) {
        return 1; // p2 has more occurrences
      }
    }
  }

  return 0; // Still tied after countback
}

/**
 * Get all scores sorted in descending order with their occurrence counts
 */
export function getScoreFrequency(player: Player): Map<number, number> {
  const frequency = new Map<number, number>();
  
  for (const score of player.eventScores) {
    if (score > 0) {
      frequency.set(score, (frequency.get(score) || 0) + 1);
    }
  }

  return frequency;
}

/**
 * Detailed countback comparison (alternative implementation)
 */
export function detailedCountback(p1: Player, p2: Player): number {
  const freq1 = Array.from(getScoreFrequency(p1).entries()).sort((a, b) => {
    // Sort by score descending, then by count descending
    if (b[0] !== a[0]) return b[0] - a[0];
    return b[1] - a[1];
  });

  const freq2 = Array.from(getScoreFrequency(p2).entries()).sort((a, b) => {
    if (b[0] !== a[0]) return b[0] - a[0];
    return b[1] - a[1];
  });

  const maxLength = Math.max(freq1.length, freq2.length);

  for (let i = 0; i < maxLength; i++) {
    const [score1, count1] = freq1[i] || [0, 0];
    const [score2, count2] = freq2[i] || [0, 0];

    // Compare score first
    if (score1 > score2) return -1;
    if (score2 > score1) return 1;

    // If scores equal, compare count
    if (count1 > count2) return -1;
    if (count2 > count1) return 1;
  }

  return 0;
}

/**
 * Check if two players are tied after all tiebreakers
 */
export function arePlayersTied(p1: Player, p2: Player): boolean {
  // Same total points
  if (p1.totalPoints !== p2.totalPoints) return false;

  // Same total spending
  if (p1.totalSpending !== p2.totalSpending) return false;

  // Countback doesn't break tie
  if (countbackCompare(p1, p2) !== 0) return false;

  return true;
}

/**
 * Find all groups of tied players
 */
export function findTieGroups(players: Player[]): Player[][] {
  const tieGroups: Player[][] = [];
  const processed = new Set<string>();

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (!player) continue; // Type guard
    
    if (processed.has(player.name)) continue;

    const group: Player[] = [player];
    processed.add(player.name);

    for (let j = i + 1; j < players.length; j++) {
      const otherPlayer = players[j];
      if (!otherPlayer) continue; // Type guard
      
      if (processed.has(otherPlayer.name)) continue;

      if (arePlayersTied(player, otherPlayer)) {
        group.push(otherPlayer);
        processed.add(otherPlayer.name);
      }
    }

    if (group.length > 1) {
      tieGroups.push(group);
    }
  }

  return tieGroups;
}

/**
 * Log countback details for debugging
 */
export function logCountbackDetails(p1: Player, p2: Player): void {
  console.log(`\n🔍 Countback Details:`);
  console.log(`Player 1: ${p1.name}`);
  console.log(`  Scores: [${p1.eventScores.filter(s => s > 0).sort((a, b) => b - a).join(', ')}]`);
  console.log(`  Total: ${p1.totalPoints}, Spending: $${p1.totalSpending}`);
  
  console.log(`Player 2: ${p2.name}`);
  console.log(`  Scores: [${p2.eventScores.filter(s => s > 0).sort((a, b) => b - a).join(', ')}]`);
  console.log(`  Total: ${p2.totalPoints}, Spending: $${p2.totalSpending}`);
  
  const result = countbackCompare(p1, p2);
  console.log(`Result: ${result === -1 ? `${p1.name} wins` : result === 1 ? `${p2.name} wins` : 'Still tied'}`);
}