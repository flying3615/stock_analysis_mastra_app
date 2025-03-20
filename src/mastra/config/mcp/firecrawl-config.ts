import { MCPConfiguration } from '@mastra/mcp';

// 创建MCP配置，用于连接Firecrawl服务
export const firecrawlMcpConfig = new MCPConfiguration({
  id: 'firecrawl-mcp',
  servers: {
    firecrawl: {
      // 这里使用Docker运行Firecrawl服务
      command: 'npx',
      args: ['-y', 'firecrawl-mcp'],
      env: {
        // 如果你有Firecrawl API密钥，可以在这里添加
        FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY!,

        FIRECRAWL_RETRY_MAX_ATTEMPTS: '5',
        FIRECRAWL_RETRY_INITIAL_DELAY: '2000',
        FIRECRAWL_RETRY_MAX_DELAY: '30000',
        FIRECRAWL_RETRY_BACKOFF_FACTOR: '3',

        FIRECRAWL_CREDIT_WARNING_THRESHOLD: '2000',
        FIRECRAWL_CREDIT_CRITICAL_THRESHOLD: '500',
      },
    },
  },
});

// 异步函数，获取Firecrawl MCP工具
export async function getFirecrawlTools() {
  try {
    // 返回工具集合
    return await firecrawlMcpConfig.getTools();
  } catch (error) {
    console.error('获取Firecrawl工具失败:', error);
    throw error;
  }
}
