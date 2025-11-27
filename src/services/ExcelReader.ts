import * as XLSX from 'xlsx';
import { RawPlayerData, Player } from '../types';

/**
 * ExcelReader handles reading and parsing the leaderboard Excel file
 */
export class ExcelReader {
  private workbook: XLSX.WorkBook | null = null;

  /**
   * Read Excel file from path
   */
  readFile(filePath: string): void {
    try {
      this.workbook = XLSX.readFile(filePath);
      console.log('✅ Excel file loaded successfully');
    } catch (error) {
      console.error('❌ Error reading Excel file:', error);
      throw error;
    }
  }

  /**
   * Parse the leaderboard data from the first sheet
   * Structure: Row 0-1 = headers, Row 2-26 = points, Rows 28-30 = empty, Row 31 = header, Rows 32-56 = spending
   */
  parseLeaderboard(): Player[] {
    if (!this.workbook) {
      throw new Error('Workbook not loaded. Call readFile() first.');
    }

    const sheetName = this.workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('Workbook contains no sheets.');
    }
    const sheet = this.workbook.Sheets[sheetName];
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found in workbook.`);
    }
    const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`📊 Processing sheet: ${sheetName}`);
    console.log(`📏 Total rows: ${data.length}`);

    // Points table: rows 2-26 (skip row 0-1 headers, skip row 27 totals)
    const pointsStartRow = 2;
    const pointsEndRow = 27; // Exclusive, so processes up to row 26
    
    // Spending table: rows 32-56 (skip row 31 header, skip row 57 totals)
    const spendingStartRow = 32;
    const spendingEndRow = 57; // Exclusive, so processes up to row 56
    
    console.log(`✂️ Points table: rows ${pointsStartRow} to ${pointsEndRow - 1}`);
    console.log(`✂️ Spending table: rows ${spendingStartRow} to ${spendingEndRow - 1}`);

    // Parse points table
    const pointsPlayers = this.parseTableRows(data, pointsStartRow, pointsEndRow, 'points');
    
    // Parse spending table
    const spendingPlayers = this.parseTableRows(data, spendingStartRow, spendingEndRow, 'spending');

    // Merge points and spending data
    const players = this.mergeTables(pointsPlayers, spendingPlayers);

    console.log(`👥 Parsed ${players.length} players`);
    
    return players;
  }

  /**
   * Parse table rows between startRow and endRow
   */
  private parseTableRows(data: any[][], startRow: number, endRow: number, type: 'points' | 'spending'): RawPlayerData[] {
    const players: RawPlayerData[] = [];

    for (let i = startRow; i < Math.min(endRow, data.length); i++) {
      const row = data[i];
      if (!row || row.length < 2) continue; // Skip empty or short rows

      // Column 0 = Position (skip it)
      // Column 1 = Player Name
      const playerName = row[1] ? String(row[1]).trim() : '';
      
      // Skip if player name is empty or looks like a total row
      if (!playerName || 
          playerName.toLowerCase().includes('total') ||
          playerName.toLowerCase() === 'player') {
        continue;
      }

      const values: string[] = [];
      
      // Columns 2-23 = Event data (22 events)
      // Skip the last few columns (totals, spending summary)
      const eventColumns = type === 'points' ? 24 : 24; // Same structure for both tables
      
      for (let j = 2; j < Math.min(eventColumns, row.length); j++) {
        const cell = row[j];
        values.push(cell != null ? String(cell).trim() : '0');
      }

      if (type === 'points') {
        players.push({
          name: playerName,
          scores: values,
          spending: []
        });
      } else {
        players.push({
          name: playerName,
          scores: [],
          spending: values
        });
      }
    }

    return players;
  }

  /**
   * Merge points and spending tables
   */
  private mergeTables(pointsPlayers: RawPlayerData[], spendingPlayers: RawPlayerData[]): Player[] {
    const players: Player[] = [];

    for (const pointsPlayer of pointsPlayers) {
      // Find matching spending data
      const spendingPlayer = spendingPlayers.find(
        sp => sp.name.toLowerCase() === pointsPlayer.name.toLowerCase()
      );

      if (!spendingPlayer) {
        console.warn(`⚠️ No spending data found for player: ${pointsPlayer.name}`);
        continue;
      }

      // Convert scores and spending to numbers
      const eventScores = pointsPlayer.scores.map(s => this.parseScore(s));
      const eventSpending = spendingPlayer.spending.map(s => this.parseSpending(s));

      // Calculate totals
      const totalPoints = eventScores.reduce((sum, score) => sum + score, 0);
      const totalSpending = eventSpending.reduce((sum, spending) => sum + spending, 0);

      players.push({
        name: pointsPlayer.name,
        eventScores,
        eventSpending,
        totalPoints,
        totalSpending
      });
    }

    return players;
  }

  /**
   * Parse score value (handle "D$Q", "-", empty cells)
   */
  private parseScore(value: string): number {
    if (!value || value === '-' || value.includes('D$Q') || value.includes('DSQ')) {
      return 0;
    }
    const num = parseFloat(value);
    // Round to 2 decimal places to avoid floating point issues
    return isNaN(num) ? 0 : Math.round(num * 100) / 100;
  }

  /**
   * Parse spending value (remove $ sign, handle empty)
   */
  private parseSpending(value: string): number {
    if (!value || value === '-') {
      return 0;
    }
    // Remove $, commas, and other non-numeric characters except decimal point
    const cleaned = value.replace(/[$,]/g, '');
    const num = parseFloat(cleaned);
    // Round to 2 decimal places
    return isNaN(num) ? 0 : Math.round(num * 100) / 100;
  }

  /**
   * Get workbook for writing
   */
  getWorkbook(): XLSX.WorkBook | null {
    return this.workbook;
  }
}