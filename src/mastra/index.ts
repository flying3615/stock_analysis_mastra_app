import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import url from 'node:url';

import { stockAnalysisAgent } from './agents/stock-analysis-agent.js';
import { weatherWorkflow } from './workflows/index.js';
import { bbsrAnalysisAgent, chipAnalysisAgent, patternAnalysisAgent, newsScraperAgent } from './agents/index.js';
import { setAgentRegistry } from './tools/agent-tools.js';

// 初始化并注册基本agents
const initBasicAgents = () => {
  // 创建基本agents对象
  const agents = {
    chipAnalysisAgent,
    patternAnalysisAgent,
    bbsrAnalysisAgent,
    stockAnalysisAgent,
    newsScraperAgent, // 直接包含新闻爬取Agent
  };
  
  // 设置agent注册表，这样agent-tools就可以使用这些代理
  setAgentRegistry(agents);
  
  return agents;
};

// 创建Mastra实例
export const mastra: Mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: initBasicAgents(),
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});

// 如果直接运行这个文件
if (typeof process !== 'undefined' && 
    import.meta.url === url.pathToFileURL(process.argv[1])?.href) {
  console.log('Mastra初始化完成');
}
