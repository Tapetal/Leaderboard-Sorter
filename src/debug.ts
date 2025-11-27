import * as XLSX from 'xlsx';
import * as path from 'path';

/**
 * Debug script to inspect Excel structure
 */
function inspectExcel() {
  const inputFile = path.join(process.cwd(), 'input', 'leaderboard.xlsx');
  
  console.log('🔍 Inspecting Excel file...\n');
  console.log(`File: ${inputFile}\n`);

  const workbook = XLSX.readFile(inputFile);
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error(`No sheets found in workbook: ${inputFile}`);
  }
  const sheetName = workbook.SheetNames[0]!;
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found in workbook: ${inputFile}`);
  }
  const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log(`Sheet Name: ${sheetName}`);
  console.log(`Total Rows: ${data.length}\n`);

  // Show first 10 rows
  console.log('=== FIRST 10 ROWS ===');
  for (let i = 0; i < Math.min(10, data.length); i++) {
    console.log(`Row ${i}:`, data[i]);
  }

  console.log('\n=== LOOKING FOR TABLE SPLIT ===');
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const firstCell = row && row[0] ? String(row[0]).toLowerCase() : '';
    
    if (!row || row.length === 0 || row.every(cell => !cell)) {
      console.log(`Row ${i}: EMPTY ROW (potential split)`);
    } else if (firstCell.includes('spending') || firstCell.includes('spend')) {
      console.log(`Row ${i}: Contains "spending" - ${row[0]}`);
    } else if (firstCell === 'pos' || firstCell === 'position') {
      console.log(`Row ${i}: Header row - ${row[0]}`);
    }
  }

  // Show middle section (around row 25-35)
  console.log('\n=== ROWS 25-35 (around split) ===');
  for (let i = 25; i < Math.min(35, data.length); i++) {
    console.log(`Row ${i}:`, data[i]?.slice(0, 5) ?? 'empty');
  }

  // Count columns
  const maxCols = Math.max(...data.map(row => row ? row.length : 0));
  console.log(`\nMax columns: ${maxCols}`);

  // Show last 5 rows
  console.log('\n=== LAST 5 ROWS ===');
  for (let i = Math.max(0, data.length - 5); i < data.length; i++) {
    console.log(`Row ${i}:`, data[i]);
  }
}

inspectExcel();