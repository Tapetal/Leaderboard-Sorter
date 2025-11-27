import { Player } from '../types';
import { countbackCompare, findTieGroups } from '../utils/tiebreakers';

/**
 * LeaderboardSorter handles the complex sorting logic with multiple tiebreakers
 */
export class LeaderboardSorter {
  
  /**
   * Main sorting function with all tiebreaker rules
   */
  sortPlayers(players: Player[]): Player[] {
    console.log('\n📊 Starting leaderboard sort...');
    console.log(`Players to sort: ${players.length}`);

    // Sort players using all criteria
    const sorted = [...players].sort((a, b) => {
      // 1. Primary: Total points (descending - higher is better)
      if (a.totalPoints !== b.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }

      // 2. First tiebreaker: Total spending (ascending - lower is better)
      if (a.totalSpending !== b.totalSpending) {
        return a.totalSpending - b.totalSpending;
      }

      // 3. Second tiebreaker: Countback system
      const countbackResult = countbackCompare(a, b);
      if (countbackResult !== 0) {
        return countbackResult;
      }

      // 4. Final tiebreaker: Alphabetical order
      return a.name.localeCompare(b.name);
    });

    // Assign ranks
    this.assignRanks(sorted);

    // Find and mark tied players (after all tiebreakers)
    this.markTiedPlayers(sorted);

    console.log('✅ Sorting complete\n');
    
    return sorted;
  }

  /**
   * Assign rank numbers to players
   */
  private assignRanks(players: Player[]): void {
    let currentRank = 1;

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (!player) continue; // Type guard
      
      player.rank = currentRank;

      // Check if next player has same total points
      if (i < players.length - 1) {
        const current = players[i];
        const next = players[i + 1];

        // Type guards - ensure both exist
        if (!current || !next) continue;

        // If points differ, increment rank
        if (current.totalPoints !== next.totalPoints) {
          currentRank = i + 2;
        }
        // If points same but other tiebreakers resolved, still increment
        else if (current.totalSpending !== next.totalSpending ||
                 countbackCompare(current, next) !== 0) {
          currentRank = i + 2;
        }
      }
    }
  }

  /**
   * Mark players who are tied even after all tiebreakers
   */
  private markTiedPlayers(players: Player[]): void {
    const tieGroups = findTieGroups(players);

    if (tieGroups.length > 0) {
      console.log(`⚠️ Found ${tieGroups.length} tie group(s) after all tiebreakers:`);
      
      for (const group of tieGroups) {
        console.log(`  Tied players: ${group.map(p => p.name).join(', ')}`);
        
        // Mark these players as tied
        for (const player of group) {
          player.isTied = true;
        }

        // Sort tied players alphabetically (already done in main sort)
        group.sort((a, b) => a.name.localeCompare(b.name));
      }
    } else {
      console.log('✅ No unresolved ties');
    }
  }

  /**
   * Print leaderboard to console
   */
  printLeaderboard(players: Player[]): void {
    console.log('\n' + '='.repeat(80));
    console.log('🏆 FINAL LEADERBOARD');
    console.log('='.repeat(80));
    console.log(
      'Rank'.padEnd(6) + 
      'Player'.padEnd(25) + 
      'Points'.padEnd(10) + 
      'Spending'.padEnd(12) + 
      'Status'
    );
    console.log('-'.repeat(80));

    for (const player of players) {
      const rank = player.rank?.toString() || '?';
      const name = player.name.substring(0, 24);
      const points = player.totalPoints.toString();
      const spending = `$${player.totalSpending.toFixed(2)}`;
      const status = player.isTied ? '🔴 TIED' : '';

      console.log(
        rank.padEnd(6) +
        name.padEnd(25) +
        points.padEnd(10) +
        spending.padEnd(12) +
        status
      );
    }

    console.log('='.repeat(80) + '\n');
  }

  /**
   * Get statistics about the leaderboard
   */
  getStats(players: Player[]): {
    totalPlayers: number;
    highestScore: number;
    lowestScore: number;
    averageScore: number;
    tiedCount: number;
  } {
    const totalPlayers = players.length;
    const scores = players.map(p => p.totalPoints);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / totalPlayers;
    const tiedCount = players.filter(p => p.isTied).length;

    return {
      totalPlayers,
      highestScore,
      lowestScore,
      averageScore,
      tiedCount
    };
  }
}