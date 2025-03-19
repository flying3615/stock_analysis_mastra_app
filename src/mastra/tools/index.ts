import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import {
  getStockDataForTimeframe,
  multiTimeFrameChipDistAnalysis,
  multiTimeframePatternAnalysis,
} from '@gabriel3615/ta_analysis';

/**
 * 处理并格式化错误信息
 * @param symbol 股票代码
 * @param error 错误对象
 * @param analysisType 分析类型描述
 * @returns 格式化的错误信息
 */
function formatErrorMessage(
  symbol: string,
  error: unknown,
  analysisType: string
): string {
  return `无法分析${symbol}的${analysisType}: ${error instanceof Error ? error.message : '未知错误'}`;
}

/**
 * 获取多时间周期的股票数据
 * @param symbol 股票代码
 * @param logMessage 日志信息
 * @returns 包含周线、日线和小时线数据的对象
 */
async function fetchMultiTimeframeData(symbol: string, logMessage: string) {
  const today = new Date();
  console.log(logMessage);

  // 设置不同时间周期的起始日期
  const startDateWeekly = new Date();
  startDateWeekly.setDate(today.getDate() - 365); // 获取一年的数据

  const startDateDaily = new Date();
  startDateDaily.setDate(today.getDate() - 90); // 获取三个月的数据

  const startDateHourly = new Date();
  startDateHourly.setDate(today.getDate() - 30); // 获取一个月的数据

  // 获取各个周期的数据
  const weeklyData = await getStockDataForTimeframe(
    symbol,
    startDateWeekly,
    today,
    'weekly'
  );

  const dailyData = await getStockDataForTimeframe(
    symbol,
    startDateDaily,
    today,
    'daily'
  );

  const hourlyData = await getStockDataForTimeframe(
    symbol,
    startDateHourly,
    today,
    '1hour'
  );

  return { weeklyData, dailyData, hourlyData };
}

export const bbsrAnalysisTool = createTool({
  id: 'analyze-bbsr',
  description:
    '分析股票在支撑/阻力位置的牛熊信号(Bull/Bear Signal at Support/Resistance)',
  inputSchema: z.object({
    symbol: z.string().describe('股票代码，例如：600000，000001，300001'),
  }),
  outputSchema: z.any(), // 使用z.any()替代复杂的自定义类型
  execute: async ({ context }) => {
    try {
      const { symbol } = context;

      // 获取多时间周期数据
      const { weeklyData, dailyData, hourlyData } =
        await fetchMultiTimeframeData(
          symbol,
          `正在获取${symbol}的数据与分析BBSR信号...`
        );

      // 调用多时间周期形态分析函数
      return await multiTimeframePatternAnalysis(
        weeklyData,
        dailyData,
        hourlyData
      );
    } catch (error) {
      throw new Error(formatErrorMessage(context.symbol, error, 'BBSR信号'));
    }
  },
});

export const patternAnalysisTool = createTool({
  id: 'analyze-pattern',
  description: '分析股票的多时间周期形态特征',
  inputSchema: z.object({
    symbol: z.string().describe('股票代码，例如：600000，000001，300001'),
  }),
  outputSchema: z.any(), // 使用z.any()替代复杂的自定义类型
  execute: async ({ context }) => {
    try {
      const { symbol } = context;

      // 获取多时间周期数据
      const { weeklyData, dailyData, hourlyData } =
        await fetchMultiTimeframeData(
          symbol,
          `正在获取${symbol}的数据与分析形态特征...`
        );

      // 调用多时间周期形态分析函数
      return await multiTimeframePatternAnalysis(
        weeklyData,
        dailyData,
        hourlyData
      );
    } catch (error) {
      throw new Error(
        formatErrorMessage(context.symbol, error, '多时间周期形态特征')
      );
    }
  },
});

export const chipAnalysisTool = createTool({
  id: 'analyze-chip',
  description: '分析股票的筹码分布数据（多时间周期）',
  inputSchema: z.object({
    symbol: z.string().describe('股票代码，例如：600000，000001，300001'),
    primaryTimeframe: z
      .enum(['weekly', 'daily', '1hour'])
      .default('daily')
      .describe('主要分析时间周期'),
    timeframes: z
      .array(z.enum(['weekly', 'daily', '1hour']))
      .default(['weekly', 'daily', '1hour'])
      .describe('包含的所有时间周期'),
    weights: z
      .record(z.string(), z.number())
      .optional()
      .describe(
        '各时间周期权重，例如: { weekly: 0.3, daily: 0.5, "1hour": 0.2 }'
      ),
  }),
  outputSchema: z.any(), // 使用z.any()替代z.custom<MultiTimeframeAnalysisResult>()来避免类型错误
  execute: async ({ context }) => {
    try {
      const { symbol, primaryTimeframe, timeframes, weights } = context;

      // 设置默认权重（如果未提供）
      const timeframeWeights = weights || {
        weekly: 0.3,
        daily: 0.5,
        '1hour': 0.2,
      };

      // 获取多时间周期数据
      const { weeklyData, dailyData, hourlyData } =
        await fetchMultiTimeframeData(
          symbol,
          `正在获取${symbol}的数据与分析筹码分布...`
        );

      // 调用多时间周期筹码分布分析函数
      return await multiTimeFrameChipDistAnalysis(
        symbol,
        primaryTimeframe,
        timeframes,
        timeframeWeights as Record<string, number>,
        weeklyData,
        dailyData,
        hourlyData
      );
    } catch (error) {
      throw new Error(
        formatErrorMessage(context.symbol, error, '多时间周期筹码数据')
      );
    }
  },
});
