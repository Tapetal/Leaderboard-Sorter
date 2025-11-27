import * as ExcelJS from 'exceljs';
import { Player } from '../types';

/**
 * ExcelWriter handles writing the sorted leaderboard to Excel with formatting
 */
export class ExcelWriter {
  
  /**
   * Write sorted leaderboard to new Excel file
   */
  async writeLeaderboard(players: Player[], outputPath: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sorted Leaderboard');

    // Set column widths
    worksheet.columns = [
      { width: 8 },   // Rank
      { width: 25 },  // Player Name
      { width: 12 },  // Total Points
      { width: 15 },  // Total Spending
      { width: 12 },  // Status
    ];

    // Add header row
    const headerRow = worksheet.addRow(['Rank', 'Player Name', 'Total Points', 'Total Spending', 'Status']);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add player rows
    for (const player of players) {
      const row = worksheet.addRow([
        player.rank,
        player.name,
        player.totalPoints,
        `$${player.totalSpending.toFixed(2)}`,
        player.isTied ? 'TIED' : ''
      ]);

      // Highlight tied players in red
      if (player.isTied) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF0000' }
          };
          cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        });
      }

      // Alternate row colors for better readability
      if (!player.isTied && (player.rank || 0) % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' }
          };
        });
      }
    }

    // Add borders to all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Save file
    await workbook.xlsx.writeFile(outputPath);
    console.log(`✅ Sorted leaderboard written to: ${outputPath}`);
  }

  /**
   * Write detailed leaderboard with all event scores
   */
  async writeDetailedLeaderboard(players: Player[], outputPath: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Detailed Leaderboard');

    // Determine number of events
    const eventCount = players[0]?.eventScores.length || 0;

    // Build headers
    const headers = ['Rank', 'Player Name'];
    for (let i = 1; i <= eventCount; i++) {
      headers.push(`Event ${i}`);
    }
    headers.push('Total Points', 'Total Spending', 'Status');

    // Add header row
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add player rows
    for (const player of players) {
      const rowData = [
        player.rank,
        player.name,
        ...player.eventScores,
        player.totalPoints,
        `$${player.totalSpending.toFixed(2)}`,
        player.isTied ? 'TIED' : ''
      ];

      const row = worksheet.addRow(rowData);

      // Highlight tied players
      if (player.isTied) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF0000' }
          };
          cell.font = { color: { argb: 'FFFFFFFF' } };
        });
      }
    }

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 12;
    });
    worksheet.getColumn(2).width = 25; // Player name column

    // Save file
    await workbook.xlsx.writeFile(outputPath);
    console.log(`✅ Detailed leaderboard written to: ${outputPath}`);
  }

  /**
   * Create a summary sheet with statistics
   */
  async writeSummary(players: Player[], outputPath: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Summary');

    // Statistics
    const stats = {
      totalPlayers: players.length,
      highestScore: Math.max(...players.map(p => p.totalPoints)),
      lowestScore: Math.min(...players.map(p => p.totalPoints)),
      averageScore: players.reduce((sum, p) => sum + p.totalPoints, 0) / players.length,
      tiedPlayers: players.filter(p => p.isTied).length
    };

    worksheet.addRow(['LEADERBOARD SUMMARY']);
    worksheet.addRow([]);
    worksheet.addRow(['Total Players:', stats.totalPlayers]);
    worksheet.addRow(['Highest Score:', stats.highestScore]);
    worksheet.addRow(['Lowest Score:', stats.lowestScore]);
    worksheet.addRow(['Average Score:', stats.averageScore.toFixed(2)]);
    worksheet.addRow(['Tied Players:', stats.tiedPlayers]);

    // Save file
    await workbook.xlsx.writeFile(outputPath);
    console.log(`✅ Summary written to: ${outputPath}`);
  }
}