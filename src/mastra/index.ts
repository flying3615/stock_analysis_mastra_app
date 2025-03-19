
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { weatherWorkflow } from './workflows';
import { chipAnalysisAgent, patternAnalysisAgent, bbsrAnalysisAgent } from './agents';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { chipAnalysisAgent, patternAnalysisAgent, bbsrAnalysisAgent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
