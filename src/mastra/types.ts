/**
 * 公司基本面请求参数
 */
export interface CompanyFundamentalsArgs {
  symbol: string;
  metrics?: Array<'overview' | 'income' | 'balance' | 'cash' | 'earnings'>;
}

export enum EconomicIndicator {
  GDP = 'GDP',
  Inflation = 'Inflation',
  Unemployment = 'Unemployment',
  FedFundsRate = 'FedFundsRate',
  CPI = 'CPI',
  RetailSales = 'RetailSales',
}
