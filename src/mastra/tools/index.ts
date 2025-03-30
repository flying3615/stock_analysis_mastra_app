import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { executeIntegratedAnalysis, fetchChartData } from '@gabriel3615/ta_analysis';
import { AlphaVantageQuery } from '../services/AlphaVantageQuery.js';
import { CompanyFundamentalsArgs, EconomicIndicator } from '../types.js';

/**
 * 处理并格式化错误信息
 * @param symbol 股票代码
 * @param error 错误对象
 * @param analysisType 分析类型描述
 * @returns 格式化的错误信息
 */
function formatErrorMessage(symbol: string, error: unknown, analysisType: string): string {
  return `无法分析${symbol}的${analysisType}: ${error instanceof Error ? error.message : '未知错误'}`;
}

/**
 * 创建获取公司基本面数据的工具
 */
const companyFundamentalsTool = createTool({
  id: 'company-fundamentals',
  description: '获取公司基本面数据，包括公司概览、收入报表、资产负债表、现金流量表和盈利情况',
  inputSchema: z.object({
    symbol: z.string().describe('公司股票代码，例如：AAPL, MSFT, GOOGL'),
    metrics: z
      .array(z.enum(['overview', 'income', 'balance', 'cash', 'earnings']))
      .describe(
        '要获取的公司指标列表，可包含：overview（公司概览）, income（收入报表）, balance（资产负债表）, cash（现金流量表）, earnings（盈利情况）',
      )
      .optional(),
  }),
  outputSchema: z.any(),
  execute: async ({ context }) => {
    try {
      const { symbol, metrics } = context;

      // 构建请求参数
      const args: CompanyFundamentalsArgs = {
        symbol,
        metrics: metrics || ['overview'],
      };

      // 从环境变量获取API密钥
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

      if (!apiKey) {
        throw new Error('未设置ALPHA_VANTAGE_API_KEY环境变量');
      }

      // 初始化查询类实例
      const query = new AlphaVantageQuery();

      // 获取公司基本面数据
      const result = await query.companyFundamentals(apiKey, args);

      if (!result) {
        throw new Error('获取公司基本面数据失败');
      }

      return result;
    } catch (error) {
      throw new Error(
        `获取公司基本面数据出错: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  },
});

/**
 * 创建获取经济指标数据的工具
 */
const economicIndicatorsTool = createTool({
  id: 'economic-indicators',
  description: '获取宏观经济指标数据，如GDP、通胀率、失业率、联邦基金利率、CPI和零售销售',
  inputSchema: z.object({
    indicators: z
      .array(z.enum(['GDP', 'Inflation', 'Unemployment', 'FedFundsRate', 'CPI', 'RetailSales']))
      .describe(
        '要获取的经济指标列表，可包含：GDP, Inflation, Unemployment, FedFundsRate, CPI, RetailSales',
      ),
  }),
  outputSchema: z.any(),
  execute: async ({ context }) => {
    try {
      const { indicators } = context;

      // 将字符串数组转换为EconomicIndicator枚举数组
      const indicatorEnums = indicators.map(indicatorStr => {
        if (indicatorStr === 'GDP') {
          return EconomicIndicator.GDP;
        } else if (indicatorStr === 'Inflation') {
          return EconomicIndicator.Inflation;
        } else if (indicatorStr === 'Unemployment') {
          return EconomicIndicator.Unemployment;
        } else if (indicatorStr === 'FedFundsRate') {
          return EconomicIndicator.FedFundsRate;
        } else if (indicatorStr === 'CPI') {
          return EconomicIndicator.CPI;
        } else if (indicatorStr === 'RetailSales') {
          return EconomicIndicator.RetailSales;
        } else {
          throw new Error(`未知的经济指标: ${indicatorStr}`);
        }
      });

      // 从环境变量获取API密钥
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

      if (!apiKey) {
        throw new Error('未设置ALPHA_VANTAGE_API_KEY环境变量');
      }

      // 初始化查询类实例
      const query = new AlphaVantageQuery();

      // 获取经济指标数据
      const result = await query.getEconomicIndicators(apiKey, indicatorEnums);

      if (!result) {
        throw new Error('获取经济指标数据失败');
      }

      return result;
    } catch (error) {
      throw new Error(
        `获取经济指标数据出错: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    }
  },
});

/**
 * 创建技术分析工具
 */
const technicalAnalysisTool = createTool({
  id: 'analyze-technical',
  description: '分析股票综合技术走势',
  inputSchema: z.object({
    symbol: z.string().describe('股票代码，例如 AAPL 或 MSFT'),
  }),
  outputSchema: z.any(), // 使用z.any()替代复杂的自定义类型
  execute: async ({ context }) => {
    try {
      const { symbol } = context;

      const weights = {
        chip: 0.3,
        pattern: 0.2,
        volume: 0.5,
      };

      // NASDAQ指数的综合分析
      const indexAnalysis = await executeIntegratedAnalysis('^IXIC', weights);
      // 调用多时间周期牛熊分析函数
      const stockAnalysis = await executeIntegratedAnalysis(symbol, weights);

      // TODO call chartimage
      // const marketQuery = new MarketQuery();
      // const chartImages = await fetchChartData(stockCode, timeFrameConfigs);

      return {
        indexAnalysis,
        stockAnalysis,
      };
    } catch (error) {
      throw new Error(formatErrorMessage(context.symbol, error, 'BBSR信号'));
    }
  },
});

// 导出新工具
export { economicIndicatorsTool, companyFundamentalsTool, technicalAnalysisTool };
