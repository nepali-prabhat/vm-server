import { OrderStatus } from 'src/constants';

export class UpdatePendingOrderDto {
  // TODO: validate this string
  status: OrderStatus;
}
