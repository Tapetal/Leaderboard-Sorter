# Leaderboard Points Ranking System

A sophisticated leaderboard ranking system that sorts players based on points scored, with multiple tiebreaker rules including spending analysis and countback system.

## 📋 Problem Statement

Sort a leaderboard table according to these criteria (in priority order):

1. **Total Points** (highest first)
2. **Total Spending** (lowest first, among tied players)
3. **Countback System** (among tied players):
   - Highest single event score
   - Most occurrences of that highest score
   - If still tied, compare 2nd highest score
   - Continue down the list until tie is broken
4. **Alphabetical Order** (if all tiebreakers fail) - highlighted in RED

## 🛠 Tech Stack

- **Node.js + TypeScript**
- **xlsx**: For reading Excel files
- **exceljs**: For writing formatted Excel files with styling

## 🚀 Setup Instructions

### 1. Create Project Structure

```bash
mkdir leaderboard-sorter
cd leaderboard-sorter

# Create folders
mkdir -p src/types src/services src/utils input output
```

### 2. Install Dependencies

```bash
npm init -y
npm install xlsx exceljs
npm install -D typescript @types/node ts-node
```

### 3. Copy Files

Copy all the TypeScript files from the artifacts:
- `package.json`
- `tsconfig.json`
- `src/types/index.ts`
- `src/services/ExcelReader.ts`
- `src/services/LeaderboardSorter.ts`
- `src/services/ExcelWriter.ts`
- `src/utils/tiebreakers.ts`
- `src/index.ts`

### 4. Add Input File

Place your `leaderboard.xlsx` file in the `input/` folder:
```bash
# Copy your Excel file
cp /path/to/leaderboard.xlsx input/
```

### 5. Run the Application

```bash
# Development mode (with TypeScript)
npm run dev

# Or build and run
npm run build
npm start
```

## 📊 How It Works

### Data Structure

The Excel file should have two tables:

**Top Table (Points):**
- First column: Player names
- Subsequent columns: Points for each event
- Values can be numbers, "D$Q", or "-" (both treated as 0)

**Bottom Table (Spending):**
- First column: Player names
- Subsequent columns: Spending for each event (e.g., "$500")

### Algorithm Flow

```
1. Read Excel → Parse both tables
2. For each player:
   - Calculate total points (D$Q and - = 0)
   - Calculate total spending
   - Store all event scores for countback

3. Sort players:
   a. By total points (descending)
   b. If tied: by total spending (ascending)
   c. If tied: apply countback system
   d. If still tied: alphabetical + mark red

4. Write output with formatting
```

### Countback System Explained

For players with same points and spending:

```
Player A scores: [10, 15, 8, 20, 12]
Player B scores: [15, 10, 20, 8, 12]

Step 1: Sort scores descending
A: [20, 15, 12, 10, 8]
B: [20, 15, 12, 10, 8]

Step 2: Compare highest (20)
Both have 20 → Check occurrences
A has 1 occurrence, B has 1 occurrence → Still tied

Step 3: Compare 2nd highest (15)
Both have 15 → Check occurrences
A has 1 occurrence, B has 1 occurrence → Still tied

... Continue until tie breaks or all scores compared
```

## 📁 Output Files

The program generates two files in the `output/` folder:

1. **sorted_leaderboard.xlsx**
   - Rank, Player Name, Total Points, Total Spending, Status
   - Tied players highlighted in RED
   - Clean, formatted layout

2. **detailed_leaderboard.xlsx**
   - All event scores included
   - Complete breakdown of each player's performance

## 🧪 Testing

The program will display:

```
🏆 FINAL LEADERBOARD
================================================================================
Rank  Player                   Points    Spending    Status
--------------------------------------------------------------------------------
1     Alice Johnson            250       $1200.00    
2     Bob Smith                250       $1500.00    
3     Charlie Brown            240       $1000.00    
4     David Lee                240       $1000.00    🔴 TIED
4     Emma Wilson              240       $1000.00    🔴 TIED
================================================================================
```

## 🎯 Design Decisions

### 1. **Two-Table Parsing**
- **Decision**: Automatically detect table split in Excel
- **Rationale**: Flexible to different Excel layouts
- **Implementation**: Look for empty rows or "spending" keyword

### 2. **Score Normalization**
- **Decision**: Convert "D$Q", "-", empty cells to 0
- **Rationale**: Consistent numeric comparison
- **Trade-off**: Loses distinction between DNF and DNS

### 3. **Countback Algorithm**
- **Decision**: Compare sorted scores with occurrence counts
- **Rationale**: Matches motorsport/competition countback rules
- **Complexity**: O(n log n) per comparison due to sorting

### 4. **Tie Highlighting**
- **Decision**: Red background with white text
- **Rationale**: Visually distinct, indicates action needed
- **Alternative**: Could use comments or separate sheet

### 5. **Alphabetical Final Sort**
- **Decision**: Case-insensitive, locale-aware
- **Rationale**: Fair and predictable for all names
- **Implementation**: JavaScript's `localeCompare()`

## 🔮 Future Improvements

### Short-term

1. **Configuration File**
   - Allow custom tiebreaker weights
   - Configurable highlight colors
   - Custom score aliases (DSQ, DNF, DNS)

2. **Validation**
   - Check for duplicate player names
   - Validate score ranges
   - Detect corrupted Excel files

3. **Better Table Detection**
   - Machine learning for table boundary detection
   - Support for multiple sheets
   - Handle merged cells

### Long-term

4. **Web Interface**
   - Upload Excel via web UI
   - Live preview of sorted results
   - Download formatted output

5. **Advanced Analytics**
   - Consistency scores (standard deviation)
   - Performance trends over events
   - Predictive rankings

6. **Alternative Formats**
   - CSV support
   - JSON API output
   - PDF report generation

7. **Historical Tracking**
   - Compare across multiple series
   - Season-long statistics
   - Player progression charts

## 💡 Additional Tiebreaker Rationale

**Suggested Additional Criterion:**

If all current tiebreakers fail, consider:

**"Most Recent Performance"** (recency-weighted scoring)

**Rationale:**
- In motorsports and competitions, recent form often matters
- A player performing well in the last 5 events might deserve higher rank than someone who peaked early
- This adds a "momentum" factor to the ranking

**Implementation:**
```typescript
function calculateRecentPerformance(player: Player, recentCount: number = 5): number {
  const recentScores = player.eventScores.slice(-recentCount);
  return recentScores.reduce((sum, score) => sum + score, 0) / recentCount;
}
```

**Alternative Criteria:**
1. **Consistency Score**: Standard deviation (lower is better) - rewards steady performers
2. **Peak Performance**: Highest single event score
3. **Win Count**: Number of times player finished in top 3
4. **Improvement Rate**: Linear regression of scores over time

## 📝 Assumptions

1. Excel file has two distinct tables (points and spending)
2. Player names match exactly between tables
3. All events are equally weighted
4. "D$Q" and "-" represent zero points
5. Spending values are in USD (currency symbol removed)
6. No mid-series player name changes
7. Event count is consistent for all players

## 🤝 Contributing

This is a test submission, but feedback is welcome!

## 📄 License

MIT

---

**Built with 💪 for complex leaderboard ranking challenges**