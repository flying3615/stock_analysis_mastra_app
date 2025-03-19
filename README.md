# Stock Analysis Mastra App

基于Mastra框架的股票分析应用，集成了多维度股票分析能力和智能对话记忆系统。

## 项目简介

Stock Analysis Mastra App 是一个集成了多种专业股票分析方法的智能平台，通过大语言模型和专业技术指标分析，为用户提供全面、专业的股票分析报告。本项目结合了筹码分析、技术形态分析和支撑阻力位分析，并通过整合型Agent提供综合分析视角。

特色功能包括：
- 多维度股票分析（筹码、形态、BBSR信号）
- 多时间周期分析（周线、日线、小时线）
- 智能对话记忆系统
- 综合分析报告生成

## 技术架构

- **框架**: Mastra + AI SDK
- **模型**: OpenAI GPT-4
- **存储引擎**: LibSQL
- **分析工具**: @gabriel3615/ta_analysis
- **内存系统**: @mastra/memory

## 项目结构

```
src/
├── examples/             # 示例代码
│   └── memory-example.ts # 演示记忆功能的示例
├── mastra/               # Mastra主要代码
│   ├── agents/           # 各类型Agent定义
│   │   ├── index.ts      # 基础分析Agent
│   │   └── stock-analysis-agent.ts # 整合分析Agent
│   ├── config/           # 配置文件
│   │   └── memory-config.ts # 记忆系统配置
│   ├── tools/            # 工具定义
│   │   ├── index.ts      # 主要分析工具
│   │   └── agent-tools.ts # Agent间调用工具
│   ├── utils/            # 工具函数
│   │   └── memory-utils.ts # 记忆系统工具函数
│   ├── workflows/        # 工作流定义
│   └── index.ts          # Mastra主入口
└── index.ts              # 应用入口
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

### 4. 整合分析 (Integrated Analysis)

整合分析Agent汇总分析结果，提供全面视角：
- 市场情绪综合评估
- 关键价位多维度确认
- 趋势一致性判断
- 多维度风险因素识别

### 5. 对话记忆系统 (Memory System)

智能记忆系统维护用户交互记录和分析历史：
- 持久化对话历史
- 语义化搜索相关信息
- 工作记忆保存重要上下文
- 多时间周期分析记忆

## 安装与使用

### 依赖安装

```bash
npm install
# 或
pnpm install
```

### 环境变量配置

创建`.env`文件并添加以下配置：

```
OPENAI_API_KEY=your_openai_api_key
```

### 启动应用

```bash
# 开发服务器
npm run dev

# 运行记忆系统示例
npm run example:memory
```

## 使用示例

### 基本分析

```typescript
import { mastra } from './mastra';

async function analyzeStock() {
  const agent = mastra.getAgent('stockAnalysisAgent');
  const response = await agent.generate('分析股票600000');
  console.log(response.text);
}
```

### 使用记忆系统进行连续对话

```typescript
import { mastra } from './mastra';
import { prepareMemoryContext, createStockThreadId } from './mastra/utils/memory-utils';

async function analyzeWithMemory() {
  const agent = mastra.getAgent('stockAnalysisAgent');
  const userId = 'user_123';
  const stockSymbol = '600000';
  
  // 创建记忆上下文
  const memoryContext = {
    resourceId: userId,
    threadId: createStockThreadId(stockSymbol, userId)
  };
  
  // 首次分析
  await agent.generate(`分析股票${stockSymbol}`, memoryContext);
  
  // 后续跟进分析（会记住之前的上下文）
  const followUp = await agent.generate('与上周相比，走势有何变化？', memoryContext);
  console.log(followUp.text);
}
```

## 自定义与扩展

### 添加新的分析工具

1. 在`tools/index.ts`中添加新的分析工具
2. 创建对应的Agent在`agents/`目录下
3. 在`mastra/index.ts`中注册新Agent

### 修改记忆系统配置

编辑`config/memory-config.ts`文件，调整：
- 存储引擎
- 语义搜索参数
- 工作记忆模板

## 许可证

ISC
