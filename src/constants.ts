export const ORDER_STATUS = {
  pending: 'PENDING',
  success: 'SUCCESS',
  cancelled: 'CANCELLED',
  timeout: 'TIMEOUT',
  outOfCoins: 'OUT_OF_COINS',
  outOfCash: 'OUT_OF_CASH',
  outOfStock: 'OUT_OF_STOCK',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const FUND_TYPE = {
  coin: 'Coin',
  cash: 'Cash',
};
export type FundType = keyof typeof FUND_TYPE;

export const CASH_UNIT = 10; // We assume that our vending machine only accepts cash of Rs 10;
