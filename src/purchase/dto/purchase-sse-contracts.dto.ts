import { Change } from './change.dto';

export class PurchaseSseContracts {
  constructor(
    public type:
      | 'PURCHASE_START'
      | 'NO_PENDING_ORDER'
      | 'OUT_OF_STOCK'
      | 'INSUFFICIENT_FUND'
      | 'OUT_OF_CASH'
      | 'OUT_OF_COINS'
      | 'PURCHASE_SUCCESS'
      | 'PURCHASE_UNEXPECTEDLY_FAILED',
    public change: Change,
  ) {}
}

export class PurchaseStartContract extends PurchaseSseContracts {
  constructor(change: Change) {
    super('PURCHASE_START', change);
  }
}

export class NoPendingOrderContract extends PurchaseSseContracts {
  constructor(change: Change) {
    super('NO_PENDING_ORDER', change);
  }
}

export class OutOfStockContract extends PurchaseSseContracts {
  constructor(change: Change) {
    super('OUT_OF_STOCK', change);
  }
}

export class InsufficientFundContract extends PurchaseSseContracts {
  constructor(change: Change) {
    super('INSUFFICIENT_FUND', change);
  }
}

export class OutOfCashContract extends PurchaseSseContracts {
  constructor(change: Change) {
    super('OUT_OF_CASH', change);
  }
}

export class OutOfCoinsContract extends PurchaseSseContracts {
  constructor(change: Change) {
    super('OUT_OF_COINS', change);
  }
}

export class PurchaseSuccessContract extends PurchaseSseContracts {
  constructor(change: Change) {
    super('PURCHASE_SUCCESS', change);
  }
}

export class PurchaseFailedContract extends PurchaseSseContracts {
  constructor(change: Change) {
    super('PURCHASE_UNEXPECTEDLY_FAILED', change);
  }
}
