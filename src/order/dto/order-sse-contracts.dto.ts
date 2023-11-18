export class OrderSseContracts {
  constructor(
    public type: 'ORDER_PENDING' | 'ORDER_CANCELLED' | 'ORDER_TIMEOUT',
  ) {}
}

export class OrderPendingContract extends OrderSseContracts {
  constructor() {
    super('ORDER_PENDING');
  }
}

export class OrderCancelledContract extends OrderSseContracts {
  constructor() {
    super('ORDER_CANCELLED');
  }
}

export class OrderTimeoutContract extends OrderSseContracts {
  constructor() {
    super('ORDER_TIMEOUT');
  }
}
