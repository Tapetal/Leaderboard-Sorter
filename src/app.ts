import * as path from 'path';
import { ExcelReader } from './services/ExcelReader';
import { LeaderboardSorter } from './services/LeaderboardSorter';
import { ExcelWriter } from './services/ExcelWriter';

/**
 * Main entry point for leaderboard sorting application
 */
async function main() {
  console.log('🏁 Starting Leaderboard Sorter...\n');

  try {
    // Configure paths
    const inputFile = path.join(process.cwd(), 'input', 'leaderboard.xlsx');
    const outputFile = path.join(process.cwd(), 'output', 'sorted_leaderboard.xlsx');
    const detailedOutputFile = path.join(process.cwd(), 'output', 'detailed_leaderboard.xlsx');

    console.log(`📂 Input file: ${inputFile}`);
    console.log(`📂 Output file: ${outputFile}\n`);

    // Step 1: Read Excel file
    console.log('Step 1: Reading Excel file...');
    const reader = new ExcelReader();
    reader.readFile(inputFile);

    // Step 2: Parse data
    console.log('\nStep 2: Parsing leaderboard data...');
    const players = reader.parseLeaderboard();

    if (players.length === 0) {
      throw new Error('No players found in the leaderboard');
    }

    console.log(`\n📊 Parsed ${players.length} players:`);
    players.slice(0, 5).forEach(p => {
      console.log(`  - ${p.name}: ${p.totalPoints} points, $${p.totalSpending.toFixed(2)}`);
    });
    if (players.length > 5) {
      console.log(`  ... and ${players.length - 5} more`);
    }

    // Step 3: Sort players
    console.log('\nStep 3: Sorting players with tiebreakers...');
    const sorter = new LeaderboardSorter();
    const sortedPlayers = sorter.sortPlayers(players);

    // Step 4: Print results
    sorter.printLeaderboard(sortedPlayers);

    // Step 5: Get statistics
    const stats = sorter.getStats(sortedPlayers);
    console.log('📈 Statistics:');
    console.log(`  Total Players: ${stats.totalPlayers}`);
    console.log(`  Highest Score: ${stats.highestScore}`);
    console.log(`  Lowest Score: ${stats.lowestScore}`);
    console.log(`  Average Score: ${stats.averageScore.toFixed(2)}`);
    console.log(`  Tied Players: ${stats.tiedCount}`);

    // Step 6: Write output files
    console.log('\nStep 4: Writing output files...');
    const writer = new ExcelWriter();
    
    await writer.writeLeaderboard(sortedPlayers, outputFile);
    await writer.writeDetailedLeaderboard(sortedPlayers, detailedOutputFile);

    console.log('\n✅ Leaderboard sorting completed successfully!');
    console.log(`\n📁 Output files created:`);
    console.log(`  1. ${outputFile}`);
    console.log(`  2. ${detailedOutputFile}`);

    // Display tied players warning
    if (stats.tiedCount > 0) {
      console.log('\n⚠️  WARNING: Some players are tied even after all tiebreakers!');
      console.log('   These players are highlighted in RED in the output file.');
      console.log('   They are sorted alphabetically as specified.');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the application
main();