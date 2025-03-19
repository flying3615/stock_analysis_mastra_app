import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { weatherWorkflow } from './workflows';
import {
  chipAnalysisAgent,
  patternAnalysisAgent,
  bbsrAnalysisAgent,
} from './agents';
import { stockAnalysisAgent } from './agents/stock-analysis-agent';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: {
    chipAnalysisAgent,
    patternAnalysisAgent,
    bbsrAnalysisAgent,
    stockAnalysisAgent,
  },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
