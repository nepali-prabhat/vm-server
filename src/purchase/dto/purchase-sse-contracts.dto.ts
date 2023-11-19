import { InventoryDto } from 'src/inventory/dto/inventory.dto';
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
    public message: string,
    public inventory?: InventoryDto,
  ) {}
}

export class PurchaseStartContract extends PurchaseSseContracts {
  constructor(change: Change) {
    super('PURCHASE_START', change, 'Processing payment');
  }
}

export class NoPendingOrderContract extends PurchaseSseContracts {
  constructor(change: Change) {
    super(
      'NO_PENDING_ORDER',
      change,
      'There is no any pending order to process your payment',
    );
  }
}

export class OutOfStockContract extends PurchaseSseContracts {
  constructor(change: Change) {
    super('OUT_OF_STOCK', change, `Item is out of stock`);
  }
}

export class InsufficientFundContract extends PurchaseSseContracts {
  constructor(change: Change) {
    super('INSUFFICIENT_FUND', change, `Insufficient fund entered`);
  }
}

export class OutOfCashContract extends PurchaseSseContracts {
  constructor(change: Change) {
    super(
      'OUT_OF_CASH',
      change,
      'Vending machine is out of cash to return your change',
    );
  }
}

export class OutOfCoinsContract extends PurchaseSseContracts {
  constructor(change: Change) {
    super(
      'OUT_OF_COINS',
      change,
      'Vending machine is our of coins to return your change',
    );
  }
}

export class PurchaseSuccessContract extends PurchaseSseContracts {
  constructor(change: Change, inventory: InventoryDto) {
    super(
      'PURCHASE_SUCCESS',
      change,
      'Your purchase successful. Collect your items from the dispenser',
      inventory,
    );
  }
}

export class PurchaseFailedContract extends PurchaseSseContracts {
  constructor(change: Change) {
    super(
      'PURCHASE_UNEXPECTEDLY_FAILED',
      change,
      'Your purchase failed due to unknown reasons.',
    );
  }
}
