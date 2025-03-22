#!/usr/bin/env node

/**
 * 交易计划索引生成器
 * 此脚本扫描reports目录中的所有交易计划文件并生成索引页面
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 文件信息接口
interface FileInfo {
  filename: string;
  stockCode: string;
  date: string;
}

// 按股票代码分组的接口
interface StockGroups {
  [stockCode: string]: FileInfo[];
}

// 获取脚本运行的目录（在 ES 模块中处理 __dirname）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 项目根目录
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
// reports 目录路径
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports');

/**
 * 读取目录中的所有交易计划文件
 * @returns 文件名数组
 */
function scanDirectory(): string[] {
  try {
    // 读取目录内容
    const files = fs.readdirSync(REPORTS_DIR);

    // 过滤出所有交易计划 HTML 文件
    const analysisFiles = files.filter(file => {
      return file.match(/([A-Z]+)_analysis_(\d{4}-\d{2}-\d{2})\.html/);
    });

    return analysisFiles;
  } catch (error) {
    console.error('读取目录时出错:', error);
    return [];
  }
}

/**
 * 解析文件名以提取股票代码和日期
 * @param files 文件名数组
 * @returns 文件信息对象数组
 */
function parseFileInfo(files: string[]): FileInfo[] {
  return files
    .map(file => {
      const match = file.match(/([A-Z]+)_analysis_(\d{4}-\d{2}-\d{2})\.html/);
      if (match) {
        return {
          filename: file,
          stockCode: match[1],
          date: match[2],
        };
      }
      return null;
    })
    .filter(Boolean) as FileInfo[];
}

/**
 * 按股票代码对文件进行分组
 * @param fileData 文件信息对象数组
 * @returns 按股票代码分组的对象
 */
function groupByStock(fileData: FileInfo[]): StockGroups {
  const stockGroups: StockGroups = {};

  fileData.forEach(data => {
    if (!stockGroups[data.stockCode]) {
      stockGroups[data.stockCode] = [];
    }
    stockGroups[data.stockCode].push(data);
  });

  // 对每个股票内的项目按日期排序（最新的在前）
  Object.keys(stockGroups).forEach(stockCode => {
    stockGroups[stockCode].sort((a, b) => b.date.localeCompare(a.date));
  });

  return stockGroups;
}

/**
 * 生成 HTML 内容
 * @param stockGroups 按股票代码分组的对象
 * @returns HTML 字符串
 */
function generateHTML(stockGroups: StockGroups): string {
  const now = new Date();
  const updateTime = now.toLocaleDateString('zh-CN');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>交易计划索引</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        h2 {
            color: #3498db;
            margin-top: 30px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
        }
        ul {
            list-style: none;
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        a {
            color: #2980b9;
            text-decoration: none;
            transition: color 0.3s;
        }
        a:hover {
            color: #1abc9c;
            text-decoration: underline;
        }
        .date {
            color: #7f8c8d;
            font-size: 0.9em;
            margin-right: 10px;
        }
        .stock-code {
            font-weight: bold;
            margin-right: 10px;
        }
        .last-updated {
            text-align: center;
            margin-top: 40px;
            font-size: 0.8em;
            color: #95a5a6;
        }
        .no-files {
            text-align: center;
            padding: 20px;
            color: #e74c3c;
            font-style: italic;
        }
        .command {
            background-color: #f9f9f9;
            padding: 10px;
            border-radius: 4px;
            border-left: 3px solid #3498db;
            margin: 20px 0;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>交易计划索引</h1>
        
        ${
          Object.keys(stockGroups).length === 0
            ? '<div class="no-files">没有找到交易计划文件</div>'
            : Object.keys(stockGroups)
                .sort()
                .map(
                  stockCode => `
            <h2>${stockCode} 交易计划</h2>
            <ul>
                ${stockGroups[stockCode]
                  .map(
                    data => `
                <li>
                    <span class="date">${data.date}</span>
                    <a href="./${data.filename}">${stockCode} 交易分析</a>
                </li>
                `
                  )
                  .join('')}
            </ul>
          `
                )
                .join('')
        }
        
        <p class="last-updated">最后更新: ${updateTime}</p>
        
        <div class="command">
            每次添加新的交易计划文件后，运行以下命令更新索引：<br>
            <code>npm run generate-index</code>
        </div>
    </div>
</body>
</html>`;
}

/**
 * 主函数
 */
export function reloadIndex(): void {
  // 扫描目录
  const files = scanDirectory();

  // 解析文件信息
  const fileData = parseFileInfo(files);

  // 按股票代码分组
  const stockGroups = groupByStock(fileData);

  // 生成 HTML
  const html = generateHTML(stockGroups);

  // 写入 index.html 文件
  try {
    fs.writeFileSync(path.join(REPORTS_DIR, 'index.html'), html);
    console.log('索引页面已成功生成: index.html');
  } catch (error) {
    console.error('写入索引文件时出错:', error);
  }
}
