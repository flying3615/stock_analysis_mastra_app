import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';

import { stockAnalysisAgent } from './agents/stock-analysis-agent.js';
import { weatherWorkflow } from './workflows/index.js';
import { bbsrAnalysisAgent, chipAnalysisAgent, newsScraperAgent, patternAnalysisAgent } from './agents/index.js';

// 初始化并注册基本agents
const initBasicAgents = () => ({
  chipAnalysisAgent,
  patternAnalysisAgent,
  bbsrAnalysisAgent,
  stockAnalysisAgent,
  newsScraperAgent,
});

// 创建Mastra实例
export const mastra: Mastra  = new Mastra({
  workflows: { weatherWorkflow },
  agents: initBasicAgents(),
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
