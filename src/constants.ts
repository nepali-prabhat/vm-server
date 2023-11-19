export const ORDER_TIMEOUT_IN_SECONDS = 60;

export const FUND_TYPE = {
  Cash: 'Cash',
  Coin: 'Coin',
  CustomerCash: 'CustomerCash',
  CustomerCoin: 'CustomerCoin',
};
export type FundType = keyof typeof FUND_TYPE;

export const CASH_UNIT = 10; // We assume that our vending machine only accepts cash of Rs 10;
