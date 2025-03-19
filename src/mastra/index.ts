
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { weatherWorkflow } from './workflows';
import { chipAnalysisAgent, patternAnalysisAgent } from './agents';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { chipAnalysisAgent, patternAnalysisAgent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
