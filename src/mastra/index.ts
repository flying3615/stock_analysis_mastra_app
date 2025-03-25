import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import url from 'node:url';

import { stockAnalysisWorkflow } from './workflows/index.js';
import {
  companyFundamentalsAgent,
  economicIndicatorsAgent,
  newsScraperAgent,
  technicalAnalysisAgent,
  integratorAgent,
  htmlGeneratorAgent,
} from './agents/index.js';

// 初始化并注册基本agents
const initBasicAgents = () => {
  // 创建基本agents对象
  return {
    newsScraperAgent,
    companyFundamentalsAgent,
    economicIndicatorsAgent,
    technicalAnalysisAgent,
    integratorAgent,
    htmlGeneratorAgent,
  };
};

// 创建Mastra实例
export const mastra: Mastra = new Mastra({
  workflows: {
    stockAnalysisWorkflow, // 添加股票分析工作流
  },
  agents: initBasicAgents(),
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});

// 如果直接运行这个文件
if (
  typeof process !== 'undefined' &&
  import.meta.url === url.pathToFileURL(process.argv[1])?.href
) {
  console.log('Mastra初始化完成');
}
