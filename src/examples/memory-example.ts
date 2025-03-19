import { mastra } from '../mastra';
import {
  processMemoryStream,
  prepareMemoryContext,
  createStockThreadId,
} from '../mastra/utils/memory-utils';

/**
 * 演示使用带有Memory功能的股票分析Agent
 * 这个示例展示了如何：
 * 1. 使用线程和资源ID来维护对话上下文
 * 2. 处理工作记忆更新
 * 3. 在多次交互中保持分析连续性
 */
async function memoryExample() {
  // 获取整合分析Agent
  const agent = mastra.getAgent('stockAnalysisAgent');

  // 模拟用户ID
  const userId = 'user_123';

  // 分析特定股票
  const stockSymbol = '600000';

  // 为这个股票创建专用线程ID
  const threadId = createStockThreadId(stockSymbol, userId);

  // 准备内存上下文
  const memoryContext = {
    resourceId: userId,
    threadId: threadId,
  };

  console.log(`\n===== 开始分析股票 ${stockSymbol} =====\n`);

  // 第一次查询 - 基本分析
  console.log('用户: 请分析一下这只股票');

  const firstResponse = await agent.stream(
    `请分析一下股票${stockSymbol}`,
    memoryContext
  );

  console.log('股票分析师: ');

  // 处理流式响应，移除工作记忆标签
  for await (const chunk of processMemoryStream(firstResponse.textStream, {
    onStart: () => console.log('[开始处理工作记忆...]'),
    onEnd: () => console.log('[工作记忆处理完成]'),
  })) {
    process.stdout.write(chunk);
  }

  console.log('\n\n===== 第二次查询 - 引用先前分析 =====\n');

  // 第二次查询 - 应该能够引用之前的分析
  console.log('用户: 基于你刚才的分析，这只股票是否值得投资？');

  const secondResponse = await agent.stream(
    '基于你刚才的分析，这只股票是否值得投资？',
    memoryContext
  );

  console.log('股票分析师: ');

  // 处理流式响应
  for await (const chunk of processMemoryStream(secondResponse.textStream)) {
    process.stdout.write(chunk);
  }

  console.log('\n\n===== 完成示例 =====');
}

// 运行示例
memoryExample().catch(console.error);
