import { LibSQLStore } from '@mastra/core/storage/libsql';
import { openai } from '@ai-sdk/openai';
import { Memory } from "@mastra/memory";
/**
 * 创建并配置股票分析Agent的Memory系统
 * - 使用LibSQL作为存储引擎
 * - 使用OpenAI的text-embedding-3-small模型进行向量嵌入
 * - 配置了语义搜索和工作记忆
 */
export const stockAnalysisMemory = new Memory({
  // 使用LibSQL作为存储引擎
  storage: new LibSQLStore({
    config: {
      url: 'file:stock-analysis.db',
    },
  }),
  
  // 使用OpenAI的嵌入模型
  embedder: openai.embedding('text-embedding-3-small'),
  
  // 内存选项配置
  options: {
    // 保留最近50条消息
    lastMessages: 50,
    
    // 配置语义搜索
    semanticRecall: {
      topK: 5, // 返回最相关的5条历史记录
      messageRange: 2, // 每个结果前后各2条消息
    },
    
    // 启用工作记忆
    workingMemory: {
      enabled: true,
      // 定义工作记忆的模板，用于存储股票分析相关信息
      template:
          `<stock_analysis>
            <stocks>
              <!-- 股票分析历史记录 -->
              <recent_stocks>
                <!-- 格式: <stock symbol="股票代码" analyzed_at="分析时间" /> -->
              </recent_stocks>
            </stocks>
            <user_preferences>
              <!-- 用户偏好 -->
              <preferred_indicators></preferred_indicators>
              <risk_tolerance></risk_tolerance>
              <investment_horizon></investment_horizon>
              <sectors_of_interest></sectors_of_interest>
            </user_preferences>
            <analysis_summary>
              <!-- 重要分析发现 -->
              <key_observations></key_observations>
              <market_trends></market_trends>
            </analysis_summary>
          </stock_analysis>`
    },
  },
});
