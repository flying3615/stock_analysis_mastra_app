import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { AlphaVantageQuery } from '../services/AlphaVantageQuery.js';
import { EconomicIndicator } from '../types.js';

/**
 * 创建获取经济指标数据的工具
 */
export const economicIndicatorsTool = createTool({
  id: 'economic-indicators',
  description:
    '获取宏观经济指标数据，如GDP、通胀率、失业率、联邦基金利率、CPI和零售销售',
  inputSchema: z.object({
    indicators: z
      .array(
        z.enum([
          'GDP',
          'Inflation',
          'Unemployment',
          'FedFundsRate',
          'CPI',
          'RetailSales',
        ])
      )
      .describe(
        '要获取的经济指标列表，可包含：GDP, Inflation, Unemployment, FedFundsRate, CPI, RetailSales'
      ),
  }),
  outputSchema: z.any(),
  execute: async ({ context }) => {
    try {
      const { indicators } = context;

      // 将字符串数组转换为EconomicIndicator枚举数组
      const indicatorEnums = indicators.map(indicatorStr => {
        switch (indicatorStr) {
          case 'GDP':
            return EconomicIndicator.GDP;
          case 'Inflation':
            return EconomicIndicator.Inflation;
          case 'Unemployment':
            return EconomicIndicator.Unemployment;
          case 'FedFundsRate':
            return EconomicIndicator.FedFundsRate;
          case 'CPI':
            return EconomicIndicator.CPI;
          case 'RetailSales':
            return EconomicIndicator.RetailSales;
          default:
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
        `获取经济指标数据出错: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  },
});
