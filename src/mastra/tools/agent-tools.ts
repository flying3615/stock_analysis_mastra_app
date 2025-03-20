import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Agent } from '@mastra/core/agent';

// 存储agent的引用
let mastraAgentRegistry: Record<string, Agent> = {};

/**
 * 设置Mastra Agent注册表
 * 这个函数将在mastra/index.ts中被调用，打破循环依赖
 */
export function setAgentRegistry(registry: Record<string, Agent>) {
  mastraAgentRegistry = registry;
}

/**
 * 创建用于调用股票分析Agent的工具
 * @param agentName Agent名称
 * @param description 工具描述
 * @returns 工具对象
 */
function createAgentTool(
  agentName:
    | 'chipAnalysisAgent'
    | 'patternAnalysisAgent'
    | 'bbsrAnalysisAgent'
    | 'stockAnalysisAgent'
    | 'newsScraperAgent',
  description: string
) {
  return createTool({
    id: `call-${agentName}`,
    description,
    inputSchema: z.object({
      symbol: z.string().describe('股票代码，例如：TSLA，AAPL，GOOGL'),
    }),
    execute: async ({ context }) => {
      const { symbol } = context;
      console.log(`正在调用${agentName}分析${symbol}...`);

      try {
        const agent = mastraAgentRegistry[agentName];
        if (!agent) {
          throw new Error(`未找到名为${agentName}的Agent`);
        }

        const response = await agent.generate(`分析股票${symbol}`);
        return response.text;
      } catch (error) {
        throw new Error(
          `调用${agentName}失败: ${error instanceof Error ? error.message : '未知错误'}`
        );
      }
    },
  });
}

// 调用筹码分析Agent的工具
export const chipAnalysisAgentTool = createAgentTool(
  'chipAnalysisAgent',
  '使用筹码分析Agent分析股票的筹码分布情况，包括筹码集中度、成本分布、筹码松散度等'
);

// 调用形态分析Agent的工具
export const patternAnalysisAgentTool = createAgentTool(
  'patternAnalysisAgent',
  '使用形态分析Agent分析股票的技术形态，包括K线形态、趋势线、支撑阻力位等'
);

// 调用BBSR分析Agent的工具
export const bbsrAnalysisAgentTool = createAgentTool(
  'bbsrAnalysisAgent',
  '使用BBSR分析Agent检测股票在支撑位和阻力位的牛熊信号'
);
