import { z } from 'zod';

export class CreatePurchaseDto {
  coin: number;
  cash: number;
}

export const createPurchaseDtoSchema = z.object({
  coin: z.number(),
  cash: z.number(),
});
