
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { weatherWorkflow } from './workflows';
import {  chipAnalysisAgent } from './agents';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { chipAnalysisAgent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
