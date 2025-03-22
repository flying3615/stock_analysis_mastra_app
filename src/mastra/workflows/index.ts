import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';
import { integratorAgent } from '../agents/index.js';
import { reloadIndex } from '../../utils/generate_index.js';

// 创建生成HTML报告并保存的步骤
const generateHtmlReport = new Step({
  id: 'generate-html-report',
  description: '将综合分析结果转换为HTML格式并保存到本地',
  inputSchema: z.object({
    integratedAnalysis: z.string(),
    symbol: z.string(),
  }),
  execute: async ({ context }) => {
    const integrationResult = context.getStepResult<{
      integratedAnalysis: string;
      symbol: string;
    }>('integrate-analysis');

    if (!integrationResult) {
      throw new Error('无法获取分析结果');
    }

    const { integratedAnalysis, symbol } = integrationResult;

    const currentDate = new Date();
    const formattedDate = format(currentDate, 'yyyy-MM-dd');

    // 使用Agent来生成HTML
    const htmlGeneratorAgent = new Agent({
      name: 'HTML Report Generator',
      instructions: `
        你是一名专业的HTML报告生成器，可以将Markdown格式的分析报告转换为漂亮的HTML网页。

        你的任务是：
        - 将提供的股票分析报告转换为带有样式的HTML
        - 创建一个响应式、美观的设计
        - 使用现代的CSS框架（比如Bootstrap或类似的）
        - 确保格式良好，有标题、分节和分隔线
        - 添加颜色编码或图标以便于识别市场情绪（看涨/看跌/中性）
        - 添加日期(今天的日期是：${formattedDate})
        - 将数据点和数字突出显示
        - 可以添加仿色影、前景区域等设计元素
        - 生成一个完整的HTML文件，包含所有必要的标签（html, head, body等）

        输出应是一个完整的HTML文件，包含内联CSS样式。不需要包含任何说明或HTML以外的其他内容。
      `,
      model: openai('gpt-4o'),
    });

    // 构建提示词
    const prompt = `
      请将以下关于${symbol}股票的分析报告转换为漂亮的HTML网页：

      ${integratedAnalysis}
    `;

    // 获取HTML生成结果
    const response = await htmlGeneratorAgent.generate(prompt);

    // 生成文件名与路径
    const fileName = `${symbol}_analysis_${formattedDate}.html`;

    // 创建路径
    const reportDir = path.join(`${process.cwd()}/../..`, 'reports');
    const filePath = path.join(reportDir, fileName);

    try {
      // 确保目录存在
      await fs.mkdir(reportDir, { recursive: true });

      // 移除可能的markdown代码块标记
      const cleanHtml = response.text
        .replace(/^```html\s*/i, '')
        .replace(/```\s*$/i, '');

      await fs.writeFile(filePath, cleanHtml, 'utf-8');

      console.log(`HTML报告已保存至: ${filePath}`);

      reloadIndex();

      console.log('索引页面已成功生成: index.html');
    } catch (error) {
      console.error('写入HTML报告时出错:', error);
      throw new Error(
        `无法保存HTML报告: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  },
});

// 定义输入模式
const stockInputSchema = z.object({
  symbol: z.string().describe('需要分析的股票代码，例如：AAPL、MSFT、GOOG等'),
});

// 创建集成分析步骤
const integrateAnalysis = new Step({
  id: 'integrate-analysis',
  description: '整合所有分析结果，生成综合报告',
  execute: async ({ context }) => {
    // 获取前面步骤的结果
    const taResult = context.getStepResult<{ analysis: string }>(
      'technical-analysis'
    );
    const newsResult = context.getStepResult<{ analysis: string }>(
      'news-analysis'
    );
    const fundamentalResult = context.getStepResult<{ analysis: string }>(
      'fundamental-analysis'
    );
    const triggerData = context.getStepResult<{ symbol: string }>('trigger');

    if (!taResult || !fundamentalResult || !newsResult || !triggerData) {
      throw new Error('无法获取必要的分析结果');
    }

    // 构建提示词
    const prompt = `
      请对股票 ${triggerData.symbol} 进行综合分析，整合以下四个方面的分析结果：
      
      === 技术分析===
      ${taResult.analysis}
      
      === 公司基本面信息 === 
      ${fundamentalResult.analysis}
      
      === 新闻分析 ===
      ${newsResult.analysis}
    `;

    // 获取整合分析结果
    const response = await integratorAgent.generate(prompt);

    return {
      integratedAnalysis: response.text,
      symbol: triggerData.symbol,
    };
  },
});

// 创建技术分析分析步骤
const technicalAnalysisStep = new Step({
  id: 'technical-analysis',
  description: '股票技术分析',
  execute: async ({ context, mastra }) => {
    const triggerData = context.getStepResult<{ symbol: string }>('trigger');

    if (!triggerData) {
      throw new Error('无法获取股票代码');
    }

    // 获取技术分析Agent
    const agent = mastra.getAgent('technicalAnalysisAgent');

    if (!agent) {
      throw new Error('未找到股票技术分析Agent');
    }

    // 执行分析
    const response = await agent.generate(`分析股票${triggerData.symbol}`);

    return {
      analysis: response.text,
      symbol: triggerData.symbol,
    };
  },
});

// 创建筹码分析步骤
const fundamentalAnalysisStep = new Step({
  id: 'fundamental-analysis',
  description: '分析公司基本面情况',
  execute: async ({ context, mastra }) => {
    const triggerData = context.getStepResult<{ symbol: string }>('trigger');

    if (!triggerData) {
      throw new Error('无法获取股票代码');
    }

    // 获取筹码分析Agent
    const agent = mastra.getAgent('companyFundamentalsAgent');

    if (!agent) {
      throw new Error('未找到基本面分析Agent');
    }

    // 执行分析
    const response = await agent.generate(`分析股票${triggerData.symbol}`);

    return {
      analysis: response.text,
      symbol: triggerData.symbol,
    };
  },
});

// 创建新闻分析步骤
const newsAnalysisStep = new Step({
  id: 'news-analysis',
  description: '获取并分析与股票相关的新闻',
  inputSchema: stockInputSchema,
  execute: async ({ context, mastra }) => {
    const triggerData = context.getStepResult<{ symbol: string }>('trigger');

    if (!triggerData) {
      throw new Error('无法获取股票代码');
    }

    // 获取新闻分析Agent
    const agent = mastra.getAgent('newsScraperAgent');

    if (!agent) {
      throw new Error('未找到新闻分析Agent');
    }

    // 执行分析
    const response = await agent.generate(
      `查找${triggerData.symbol}最近的重要新闻和事件，并分析其对股价的可能影响`
    );

    return {
      analysis: response.text,
      symbol: triggerData.symbol,
    };
  },
});

// 创建工作流并并发执行多个分析步骤
const stockAnalysisWorkflow = new Workflow({
  name: 'comprehensive-stock-analysis',
  triggerSchema: stockInputSchema,
})
  .step(technicalAnalysisStep)
  .step(fundamentalAnalysisStep)
  .step(newsAnalysisStep)
  .after([technicalAnalysisStep, fundamentalAnalysisStep, newsAnalysisStep])
  .step(integrateAnalysis)
  .then(generateHtmlReport);

// 提交工作流
stockAnalysisWorkflow.commit();

export { stockAnalysisWorkflow };
