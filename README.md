# Stock Analysis Mastra App

A stock analysis application based on the Mastra framework, integrating multi-dimensional stock analysis capabilities and an intelligent conversation memory system.

## Project Overview

Stock Analysis Mastra App is an intelligent platform that integrates various professional stock analysis methods. Through large language models and professional technical indicators, it provides users with comprehensive, professional stock analysis reports. This project combines chip analysis, technical pattern analysis, support/resistance level analysis, company fundamentals analysis, macroeconomic analysis, and news sentiment analysis, offering integrated perspectives through a comprehensive Agent.

Key features include:
- Multi-dimensional stock analysis (chips, patterns, BBSR signals, fundamentals, economic indicators, news sentiment)
- Multi-timeframe analysis (weekly, daily, hourly)
- Intelligent conversation memory system (tracking analysis history and user preferences)
- Comprehensive analysis report generation (integration of multi-dimensional data)

## Technical Architecture

- **Framework**: Mastra + AI SDK
- **Models**: OpenAI GPT-4o/GPT-4o-mini
- **Storage Engine**: LibSQL
- **Analysis Tools**: @gabriel3615/ta_analysis
- **Memory System**: @mastra/memory
- **Web Scraping**: Firecrawl

## Project Structure

```
src/
├── examples/                   # Example code
│   ├── memory-example.ts       # Memory functionality example
│   ├── news-scraper/           # News scraping example
│   └── comprehensive-analysis/ # Comprehensive analysis example
├── mastra/                     # Main Mastra code
│   ├── agents/                 # Various Agent definitions
│   │   ├── index.ts            # Basic analysis Agents (chips, patterns, BBSR, etc.)
│   │   └── stock-analysis-agent.ts # Integrated analysis Agent
│   ├── config/                 # Configuration files
│   │   ├── memory-config.ts    # Memory system configuration
│   │   └── mcp/                # MCP-related configurations
│   ├── services/               # Service components
│   ├── tools/                  # Tool definitions
│   │   ├── index.ts            # Main analysis tools (chips, patterns, BBSR, etc.)
│   │   ├── agent-tools.ts      # Inter-agent calling tools
│   │   ├── company-fundamentals-tool.ts # Company fundamentals analysis tool
│   │   └── economic-indicators-tool.ts  # Economic indicators analysis tool
│   ├── utils/                  # Utility functions
│   ├── workflows/              # Workflow definitions
│   ├── types.ts                # Type definitions
│   └── index.ts                # Mastra main entry point
```

## Main Features

### 1. Chip Analysis

Chip analysis examines market participant distribution from a holding cost structure perspective, helping to understand:
- Chip concentration and dispersal
- Cost distribution and trapped position situations
- Large funds vs. retail investor holding areas
- Chip foundations for support and resistance levels

### 2. Pattern Analysis

Pattern analysis focuses on price movements and momentum characteristics, identifying:
- Candlestick pattern features (head and shoulders, double tops/bottoms, etc.)
- Technical indicator signals (MACD, RSI, KDJ, etc.)
- Trendline breakouts and supports
- Pattern convergence and divergence across different timeframes

### 3. BBSR Analysis (Bull/Bear Signal at Support/Resistance)

BBSR analysis focuses on identifying trading signals at support and resistance levels:
- Bullish signals at support levels (buying opportunities)
- Bearish signals at resistance levels (selling signals)
- Support/resistance breakthrough signals
- Signal strength and reliability assessment

### 4. Company Fundamentals Analysis

Fundamental analysis provides financial and valuation metrics for companies:
- Company overview (market cap, industry, executives, dividends, etc.)
- Income statement analysis (revenue, profit, gross margins, etc.)
- Balance sheet analysis (asset structure, debt status, etc.)
- Cash flow statement analysis (operating, investing, financing activities)
- Profitability and expectations (EPS, growth rates, etc.)

### 5. Economic Indicators Analysis

Macroeconomic analysis provides market environment assessment:
- GDP growth rate analysis
- Inflation rate trends
- Unemployment rate dynamics
- Federal funds rate changes
- CPI and retail sales data interpretation

### 6. News Sentiment Analysis

News scraping and analysis functionality:
- Collection of news relevant to specific companies
- Industry news and trend analysis
- Overall market trend tracking
- Event and policy impact assessment
- News sentiment analysis and market impact prediction

### 7. Integrated Analysis

The integrated analysis Agent summarizes multi-dimensional analysis results, providing a comprehensive perspective:
- Comprehensive market sentiment assessment
- Multi-dimensional confirmation of key price levels
- Trend consistency judgment
- Multi-dimensional risk factor identification
- Specific buy/sell recommendations and position strategies

### 8. Conversation Memory System

The intelligent memory system maintains user interaction records and analysis history:
- Persistent conversation history (LibSQL storage support)
- Semantic search for relevant information (using OpenAI embedding models)
- Working memory for important context (stock analysis history, user preferences, etc.)
- Multi-timeframe analysis memory

## Installation and Usage

### Dependency Installation

```bash
npm install
# or
pnpm install
```

### Environment Variable Configuration

Create a `.env.development` file and add the following configuration:

```
OPENAI_API_KEY=your_openai_api_key
```

### Starting the Application

```bash
# Development server
npm run dev

# Run memory system example
npm run example:memory

# Run news scraping example
npm run example:news

# Run comprehensive analysis example
npm run example:comprehensive
```

## Usage Examples

### Basic Analysis

```typescript
import { mastra } from './src/mastra';

async function analyzeStock() {
  const agent = mastra.getAgent('stockAnalysisAgent');
  const response = await agent.generate('Analyze stock 600000');
  console.log(response.text);
}
```

### Specific Dimension Analysis

```typescript
import { mastra } from './src/mastra';

async function analyzeSpecificDimension() {
  // Chip analysis
  const chipAgent = mastra.getAgent('chipAnalysisAgent');
  const chipResult = await chipAgent.generate('Analyze the chip distribution of 600000');
  
  // Fundamentals analysis
  const fundamentalsAgent = mastra.getAgent('companyFundamentalsAgent');
  const fundamentalsResult = await fundamentalsAgent.generate('Analyze AAPL financial condition');
  
  // Macroeconomic analysis
  const economicAgent = mastra.getAgent('economicIndicatorsAgent');
  const economicResult = await economicAgent.generate('Analyze latest CPI and GDP data');
}
```

### Using the Memory System for Continuous Dialogue

```typescript
import { mastra } from './src/mastra';

async function analyzeWithMemory() {
  const agent = mastra.getAgent('stockAnalysisAgent');
  const userId = 'user_123';
  const stockSymbol = '600000';
  
  // Create memory context
  const memoryContext = {
    resourceId: userId,
    threadId: `stock_${stockSymbol}_${userId}`
  };
  
  // Initial analysis
  await agent.generate(`Analyze stock ${stockSymbol}`, { memory: memoryContext });
  
  // Follow-up analysis (will remember previous context)
  const followUp = await agent.generate('How has the trend changed compared to last week?', { memory: memoryContext });
  console.log(followUp.text);
  
  // Ask more specific questions (system will extract relevant information from memory)
  const specificQuestion = await agent.generate('Are fundamentals and technicals aligned? Give buy recommendation', { memory: memoryContext });
  console.log(specificQuestion.text);
}
```

## Advanced Customization

### Adding New Analysis Tools

1. Create a new tool file in the `tools/` directory
2. Export the new tool in `tools/index.ts`
3. Create an Agent that uses the new tool in `agents/index.ts`
4. Register the new Agent in `mastra/index.ts`

### Modifying Memory System Configuration

Edit the `config/memory-config.ts` file to adjust:
- Storage engine (currently using LibSQL)
- Semantic search parameters (topK and messageRange)
- Working memory templates (stock analysis, user preferences, etc.)

### Adjusting Analysis Weights

Modify the weight parameters in various analysis tools:
- Timeframe weights (e.g., { weekly: 0.3, daily: 0.5, "1hour": 0.2 })
- Analysis dimension weights (chips, patterns, fundamentals, etc.)

## License

ISC
