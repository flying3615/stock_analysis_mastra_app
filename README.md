# Stock Analysis Mastra App

基于Mastra框架的股票分析应用，集成了多维度股票分析能力和智能对话记忆系统。

## 项目简介

Stock Analysis Mastra App 是一个集成了多种专业股票分析方法的智能平台，通过大语言模型和专业技术指标分析，为用户提供全面、专业的股票分析报告。本项目结合了筹码分析、技术形态分析、支撑阻力位分析、公司基本面分析、宏观经济分析以及新闻情绪分析，并通过整合型Agent提供综合分析视角。

特色功能包括：
- 多维度股票分析（筹码、形态、BBSR信号、基本面、经济指标、新闻情绪）
- 多时间周期分析（周线、日线、小时线）
- 智能对话记忆系统（持续跟踪分析历史和用户偏好）
- 综合分析报告生成（多维度数据整合）

## 技术架构

- **框架**: Mastra + AI SDK
- **模型**: OpenAI GPT-4o/GPT-4o-mini
- **存储引擎**: LibSQL
- **分析工具**: @gabriel3615/ta_analysis
- **内存系统**: @mastra/memory
- **网络抓取**: Firecrawl

## 项目结构

```
src/
├── examples/                   # 示例代码
│   ├── memory-example.ts       # 记忆功能示例
│   ├── news-scraper/           # 新闻抓取示例
│   └── comprehensive-analysis/ # 综合分析示例
├── mastra/                     # Mastra主要代码
│   ├── agents/                 # 各类型Agent定义
│   │   ├── index.ts            # 基础分析Agent（筹码、形态、BBSR等）
│   │   └── stock-analysis-agent.ts # 整合分析Agent
│   ├── config/                 # 配置文件
│   │   ├── memory-config.ts    # 记忆系统配置
│   │   └── mcp/                # MCP相关配置
│   ├── services/               # 服务组件
│   ├── tools/                  # 工具定义
│   │   ├── index.ts            # 主要分析工具（筹码、形态、BBSR等）
│   │   ├── agent-tools.ts      # Agent间调用工具
│   │   ├── company-fundamentals-tool.ts # 公司基本面分析工具
│   │   └── economic-indicators-tool.ts  # 经济指标分析工具
│   ├── utils/                  # 工具函数
│   ├── workflows/              # 工作流定义
│   ├── types.ts                # 类型定义
│   └── index.ts                # Mastra主入口
```

## 主要功能

### 1. 筹码分析 (Chip Analysis)

筹码分析从持仓成本结构的角度分析市场参与者的分布情况，帮助理解：
- 筹码集中度和松散度
- 成本分布和套牢盘情况
- 大资金与散户持仓区域
- 支撑位与阻力位的筹码基础

### 2. 形态分析 (Pattern Analysis)

形态分析专注于价格走势和动量特征，识别：
- K线形态特征（头肩顶底、双重顶底等）
- 技术指标信号（MACD、RSI、KDJ等）
- 趋势线的突破与支撑
- 不同时间周期的形态收敛与发散

### 3. BBSR分析 (Bull/Bear Signal at Support/Resistance)

BBSR分析专注于识别支撑位和阻力位处的交易信号：
- 支撑位的牛市信号（买入机会）
- 阻力位的熊市信号（卖出信号）
- 支撑/阻力突破信号
- 信号强度和可靠性评估

### 4. 公司基本面分析 (Company Fundamentals)

基本面分析提供公司的财务和估值指标：
- 公司概况（市值、行业、高管、股息等）
- 收入报表分析（收入、利润、毛利率等）
- 资产负债表分析（资产结构、负债状况等）
- 现金流量表分析（经营、投资、融资活动）
- 盈利情况与预期（EPS、增长率等）

### 5. 经济指标分析 (Economic Indicators)

宏观经济分析提供市场环境评估：
- GDP增长率分析
- 通货膨胀率趋势
- 失业率动态
- 联邦基金利率变化
- CPI和零售销售数据解读

### 6. 新闻情绪分析 (News Sentiment)

新闻抓取和分析功能：
- 特定公司相关新闻收集
- 行业新闻和趋势分析
- 市场整体动向追踪
- 事件和政策影响评估
- 新闻情绪分析与市场影响预测

### 7. 整合分析 (Integrated Analysis)

整合分析Agent汇总多维度分析结果，提供全面视角：
- 市场情绪综合评估
- 关键价位多维度确认
- 趋势一致性判断
- 多维度风险因素识别
- 具体买卖建议和持仓策略

### 8. 对话记忆系统 (Memory System)

智能记忆系统维护用户交互记录和分析历史：
- 持久化对话历史（支持LibSQL存储）
- 语义化搜索相关信息（使用OpenAI嵌入模型）
- 工作记忆保存重要上下文（股票分析历史、用户偏好等）
- 多时间周期分析记忆

## 安装与使用

### 依赖安装

```bash
npm install
# 或
pnpm install
```

### 环境变量配置

创建`.env.development`文件并添加以下配置：

```
OPENAI_API_KEY=your_openai_api_key
```

### 启动应用

```bash
# 开发服务器
npm run dev

# 运行记忆系统示例
npm run example:memory

# 运行新闻抓取示例
npm run example:news

# 运行综合分析示例
npm run example:comprehensive
```

## 使用示例

### 基本分析

```typescript
import { mastra } from './src/mastra';

async function analyzeStock() {
  const agent = mastra.getAgent('stockAnalysisAgent');
  const response = await agent.generate('分析股票600000');
  console.log(response.text);
}
```

### 特定维度分析

```typescript
import { mastra } from './src/mastra';

async function analyzeSpecificDimension() {
  // 筹码分析
  const chipAgent = mastra.getAgent('chipAnalysisAgent');
  const chipResult = await chipAgent.generate('分析600000的筹码分布');
  
  // 基本面分析
  const fundamentalsAgent = mastra.getAgent('companyFundamentalsAgent');
  const fundamentalsResult = await fundamentalsAgent.generate('分析AAPL的财务状况');
  
  // 宏观经济分析
  const economicAgent = mastra.getAgent('economicIndicatorsAgent');
  const economicResult = await economicAgent.generate('分析最新CPI和GDP数据');
}
```

### 使用记忆系统进行连续对话

```typescript
import { mastra } from './src/mastra';

async function analyzeWithMemory() {
  const agent = mastra.getAgent('stockAnalysisAgent');
  const userId = 'user_123';
  const stockSymbol = '600000';
  
  // 创建记忆上下文
  const memoryContext = {
    resourceId: userId,
    threadId: `stock_${stockSymbol}_${userId}`
  };
  
  // 首次分析
  await agent.generate(`分析股票${stockSymbol}`, { memory: memoryContext });
  
  // 后续跟进分析（会记住之前的上下文）
  const followUp = await agent.generate('与上周相比，走势有何变化？', { memory: memoryContext });
  console.log(followUp.text);
  
  // 询问更具体的问题（系统会从记忆中提取相关信息）
  const specificQuestion = await agent.generate('基本面与技术面是否一致？给出买入建议', { memory: memoryContext });
  console.log(specificQuestion.text);
}
```

## 高级自定义

### 添加新的分析工具

1. 在`tools/`目录下创建新的工具文件
2. 在`tools/index.ts`中导出新工具
3. 在`agents/index.ts`中创建使用新工具的Agent
4. 在`mastra/index.ts`中注册新Agent

### 修改记忆系统配置

编辑`config/memory-config.ts`文件，调整：
- 存储引擎（目前使用LibSQL）
- 语义搜索参数（topK和messageRange）
- 工作记忆模板（股票分析、用户偏好等）

### 调整分析权重

修改各分析工具中的权重参数：
- 时间周期权重（例如：{ weekly: 0.3, daily: 0.5, "1hour": 0.2 }）
- 分析维度权重（筹码、形态、基本面等）

## 许可证

ISC