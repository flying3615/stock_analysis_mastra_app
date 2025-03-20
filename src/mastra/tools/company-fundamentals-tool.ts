import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { AlphaVantageQuery } from '../services/AlphaVantageQuery.js';
import { CompanyFundamentalsArgs } from '../types.js';

/**
 * 创建获取公司基本面数据的工具
 */
export const companyFundamentalsTool = createTool({
  id: 'company-fundamentals',
  description:
    '获取公司基本面数据，包括公司概览、收入报表、资产负债表、现金流量表和盈利情况',
  inputSchema: z.object({
    symbol: z.string().describe('公司股票代码，例如：AAPL, MSFT, GOOGL'),
    metrics: z
      .array(z.enum(['overview', 'income', 'balance', 'cash', 'earnings']))
      .describe(
        '要获取的公司指标列表，可包含：overview（公司概览）, income（收入报表）, balance（资产负债表）, cash（现金流量表）, earnings（盈利情况）'
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
        `获取公司基本面数据出错: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  },
});
