import {createTool} from '@mastra/core/tools';
import {z} from 'zod';
import {getStockDataForTimeframe, multiTimeFrameChipDistAnalysis} from '@gabriel3615/ta_analysis';


export const chipAnalysisTool = createTool({
  id: 'analyze-chip',
  description: '分析股票的筹码分布数据（多时间周期）',
  inputSchema: z.object({
    symbol: z.string().describe('股票代码，例如：600000，000001，300001'),
    primaryTimeframe: z.enum(['weekly', 'daily', '1hour']).default('daily').describe('主要分析时间周期'),
    timeframes: z.array(z.enum(['weekly', 'daily', '1hour'])).default(['weekly', 'daily', '1hour']).describe('包含的所有时间周期'),
    weights: z.record(z.string(), z.number()).optional().describe('各时间周期权重，例如: { weekly: 0.3, daily: 0.5, "1hour": 0.2 }')
  }),
  outputSchema: z.any(), // 使用z.any()替代z.custom<MultiTimeframeAnalysisResult>()来避免类型错误
  execute: async ({ context }) => {
    try {
      const { symbol, primaryTimeframe, timeframes, weights } = context;
      
      // 设置默认权重（如果未提供）
      const timeframeWeights = weights || {
        'weekly': 0.3,
        'daily': 0.5,
        '1hour': 0.2
      };
      
      // 获取不同时间周期的数据
      const today = new Date();
      console.log(`正在获取${symbol}的数据与分析筹码分布...`);
      
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
      
      // 尝试调用多时间周期筹码分布分析函数，如果函数签名变化可能需要调整
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
      throw new Error(`无法分析${context.symbol}的多时间周期筹码数据: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  },
});



