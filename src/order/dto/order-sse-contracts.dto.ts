export class OrderSseContracts {
  constructor(
    public type:
      | 'ORDER_PENDING'
      | 'ORDER_CANCELLED'
      | 'ORDER_TIMEOUT'
      | 'ORDER_FULFILLED',
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

export class OrderFulfilledContract extends OrderSseContracts {
  constructor() {
    super('ORDER_FULFILLED');
  }
}
