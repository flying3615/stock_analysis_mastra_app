import { maskStreamTags } from '@mastra/core/utils';

/**
 * 处理Agent流式响应，移除工作记忆标签并提供生命周期回调
 * @param textStream Agent的文本流
 * @param callbacks 可选的回调函数
 * @returns 处理后的文本流
 */
export async function* processMemoryStream(
  textStream: AsyncIterable<string>,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onMask?: (chunk: string) => void;
  }
) {
  // 使用maskStreamTags处理工作记忆标签
  const maskedStream = maskStreamTags(textStream, 'working_memory', {
    onStart: callbacks?.onStart,
    onEnd: callbacks?.onEnd,
    onMask: callbacks?.onMask,
  });

  // 将处理后的流返回给调用者
  for await (const chunk of maskedStream) {
    yield chunk;
  }
}

/**
 * 在调用Agent之前处理threadId和resourceId
 * 如果没有提供，则为用户生成一个唯一ID
 * @param userId 用户标识符
 * @param conversationId 可选的对话标识符
 * @returns 包含threadId和resourceId的对象
 */
export function prepareMemoryContext(userId: string, conversationId?: string) {
  return {
    resourceId: userId,
    threadId: conversationId || `thread_${Date.now()}_${userId}`,
  };
}

/**
 * 为特定股票代码创建对话线程ID
 * @param symbol 股票代码
 * @param userId 用户ID
 * @returns 股票分析专用线程ID
 */
export function createStockThreadId(symbol: string, userId: string) {
  return `stock_${symbol}_${userId}`;
}
