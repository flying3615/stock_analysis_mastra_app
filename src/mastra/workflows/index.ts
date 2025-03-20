import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { stockAnalysisMemory } from '../config/memory-config.js';
import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';

// 创建生成HTML报告并保存的步骤
const generateHtmlReport = new Step({
  id: 'generate-html-report',
  description: '将综合分析结果转换为HTML格式并保存到本地',
  inputSchema: z.object({
    integratedAnalysis: z.string(),
    symbol: z.string(),
  }),
  execute: async ({ context }) => {
    const integrationResult = context.getStepResult<{ integratedAnalysis: string, symbol: string }>('integrate-analysis');
    
    if (!integrationResult) {
      throw new Error('无法获取分析结果');
    }
    
    const { integratedAnalysis, symbol } = integrationResult;
    
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
        - 添加日期和时间戳
        - 将数据点和数字突出显示
        - 可以添加仿色影、前景区域等设计元素
        - 生成一个完整的HTML文件，包含所有必要的标签（html, head, body等）
        
        输出应是一个完整的HTML文件，包含内联CSS样式。不需要包含任何说明或HTML以外的其他内容。
      `,
      model: openai('gpt-4o-mini'),
    });
    
    // 构建提示词
    const prompt = `
      请将以下关于${symbol}股票的分析报告转换为漂亮的HTML网页：
      
      ${integratedAnalysis}
    `;
    
    // 获取HTML生成结果
    const response = await htmlGeneratorAgent.generate(prompt);
    
    // 生成文件名与路径
    const currentDate = new Date();
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    const fileName = `${symbol}_analysis_${formattedDate}.html`;
    
    // 创建路径
    const reportDir = path.join(process.cwd(), 'reports');
    const filePath = path.join(reportDir, fileName);
    
    try {
      // 确保目录存在
      await fs.mkdir(reportDir, { recursive: true });
      
      // 写入HTML文件
      await fs.writeFile(filePath, response.text, 'utf-8');
      
      console.log(`HTML报告已保存至: ${filePath}`);
      
      return {
        reportPath: filePath,
        symbol,
        generatedAt: currentDate.toISOString(),
        reportUrl: `file://${filePath}` // 本地文件URL
      };
    } catch (error) {
      console.error('写入HTML报告时出错:', error);
      throw new Error(`无法保存HTML报告: ${error instanceof Error ? error.message : '未知错误'}`);
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
  inputSchema: z.object({
    bbsrAnalysis: z.string(),
    chipAnalysis: z.string(),
    patternAnalysis: z.string(),
    newsAnalysis: z.string(),
  }),
  execute: async ({ context }) => {
    // 获取前面步骤的结果
    const bbsrResult = context.getStepResult<{ analysis: string }>('bbsr-analysis');
    const chipResult = context.getStepResult<{ analysis: string }>('chip-analysis');
    const patternResult = context.getStepResult<{ analysis: string }>('pattern-analysis');
    const newsResult = context.getStepResult<{ analysis: string }>('news-analysis');
    const triggerData = context.getStepResult<{ symbol: string }>('trigger');

    if (!bbsrResult || !chipResult || !patternResult || !newsResult || !triggerData) {
      throw new Error('无法获取必要的分析结果');
    }

    // 创建一个整合分析的Agent
    const integratorAgent = new Agent({
      name: 'Stock Analysis Integrator',
      instructions: `
        你是一位专业的股票分析整合师，能够将不同角度的股票分析结果综合成一份全面而精确的报告。
        
        你将获得以下四种分析报告：
        1. BBSR分析（支撑/阻力位的牛熊信号）
        2. 筹码分析（筹码分布、持仓结构）
        3. 形态分析（技术形态、趋势特征）
        4. 新闻分析（市场新闻和事件）
        
        你的任务是：
        - 识别并突出共同的关键发现
        - 找出不同分析方法之间的互补或矛盾之处
        - 将技术分析（前三项）与基本面/新闻分析相结合
        - 提供一个整体的市场情绪评估
        - 总结可能的支撑位和阻力位（寻找多方法确认的水平）
        - 识别关键的短期和中期催化剂（来自新闻）
        - 对股票的综合状况提供清晰的评估
        
        输出格式：
        1. 报告标题（包含股票代码和日期）
        2. 执行摘要（3-5句关键发现）
        3. 技术分析整合（BBSR + 筹码 + 形态）
        4. 新闻影响分析
        5. 综合评估
           - 市场情绪
           - 关键价位
           - 风险因素
           - 潜在催化剂
        6. 建议观察点
        
        请使用专业但易于理解的语言，避免过度技术性术语。提供具体的数据点和百分比来支持你的结论。
      `,
      model: openai('gpt-4o'),
      memory: stockAnalysisMemory,
    });

    // 构建提示词
    const prompt = `
      请对股票 ${triggerData.symbol} 进行综合分析，整合以下四个方面的分析结果：
      
      === BBSR分析（支撑/阻力位的牛熊信号）===
      ${bbsrResult.analysis}
      
      === 筹码分析 ===
      ${chipResult.analysis}
      
      === 形态分析 ===
      ${patternResult.analysis}
      
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

// 创建BBSR分析步骤
const bbsrAnalysisStep = new Step({
  id: 'bbsr-analysis',
  description: '分析股票在支撑/阻力位的牛熊信号',
  inputSchema: stockInputSchema,
  execute: async ({ context, mastra }) => {
    const triggerData = context.getStepResult<{ symbol: string }>('trigger');

    if (!triggerData) {
      throw new Error('无法获取股票代码');
    }

    // 获取BBSR分析Agent
    const agent = mastra.getAgent('bbsrAnalysisAgent');

    if (!agent) {
      throw new Error('未找到BBSR分析Agent');
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
const chipAnalysisStep = new Step({
  id: 'chip-analysis',
  description: '分析股票的筹码分布情况',
  inputSchema: stockInputSchema,
  execute: async ({ context, mastra }) => {
    const triggerData = context.getStepResult<{ symbol: string }>('trigger');

    if (!triggerData) {
      throw new Error('无法获取股票代码');
    }

    // 获取筹码分析Agent
    const agent = mastra.getAgent('chipAnalysisAgent');

    if (!agent) {
      throw new Error('未找到筹码分析Agent');
    }

    // 执行分析
    const response = await agent.generate(`分析股票${triggerData.symbol}`);

    return {
      analysis: response.text,
      symbol: triggerData.symbol,
    };
  },
});

// 创建形态分析步骤
const patternAnalysisStep = new Step({
  id: 'pattern-analysis',
  description: '分析股票的技术形态',
  inputSchema: stockInputSchema,
  execute: async ({ context, mastra }) => {
    const triggerData = context.getStepResult<{ symbol: string }>('trigger');

    if (!triggerData) {
      throw new Error('无法获取股票代码');
    }

    // 获取形态分析Agent
    const agent = mastra.getAgent('patternAnalysisAgent');

    if (!agent) {
      throw new Error('未找到形态分析Agent');
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
    const response = await agent.generate(`查找${triggerData.symbol}最近的重要新闻和事件，并分析其对股价的可能影响`);

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
  .step(bbsrAnalysisStep)
  .step(chipAnalysisStep)
  .step(patternAnalysisStep)
  .step(newsAnalysisStep)
  .after([bbsrAnalysisStep, chipAnalysisStep, patternAnalysisStep, newsAnalysisStep])
  .step(integrateAnalysis)
  .then(generateHtmlReport);

// 提交工作流
stockAnalysisWorkflow.commit();

export { stockAnalysisWorkflow };
