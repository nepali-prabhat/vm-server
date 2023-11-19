import { Test } from '@nestjs/testing';
import { PurchaseModule } from 'src/purchase/purchase.module';
import { PurchaseService } from 'src/purchase/purchase.service';

describe('Purchase service', () => {
  let purchaseService: PurchaseService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PurchaseModule],
    }).compile();
    purchaseService = moduleRef.get(PurchaseService);
  });
  describe('calculateChangeToReturn()', () => {
    it('should return no change when input money == item price', () => {
      const change = purchaseService.calculateChangeToReturn(
        0,
        {
          Cash: 200,
          Coin: 100,
        },
        10,
      );
      expect(change.cash).toBe(0);
      expect(change.coin).toBe(0);
    });
    it('should return all cash if possible', () => {
      const amount = 20;
      const change = purchaseService.calculateChangeToReturn(
        amount,
        {
          Cash: 200,
          Coin: 100,
        },
        10,
      );
      expect(change.cash).toBe(amount);
      expect(change.coin).toBe(0);
    });
    it('should return only coin if money is below cash unit', () => {
      const amount = 9;
      const change = purchaseService.calculateChangeToReturn(
        amount,
        {
          Cash: 200,
          Coin: 100,
        },
        10,
      );
      expect(change.cash).toBe(0);
      expect(change.coin).toBe(amount);
    });
    it('should return as much cash as possible and remaining coins', () => {
      const coinAmount = 8;
      const cashAmount = 20;
      const amount = cashAmount + coinAmount;
      const change = purchaseService.calculateChangeToReturn(
        amount,
        {
          Cash: 200,
          Coin: 100,
        },
        10,
      );
      expect(change.cash).toBe(cashAmount);
      expect(change.coin).toBe(coinAmount);
    });

    it('should return full fund cash remaining coins if possible', () => {
      const coinAmount = 9;
      const cashAmount = 30;
      const fund = {
        Cash: 20,
        Coin: 100,
      };
      const amount = cashAmount + coinAmount;
      const change = purchaseService.calculateChangeToReturn(amount, fund, 10);
      expect(change.cash).toBe(fund.Cash);
      expect(change.coin).toBe(cashAmount + coinAmount - fund.Cash);
    });

    it('should return as much cash as possible and remaining coins if fund is not enough', () => {
      const coinAmount = 9;
      const cashAmount = 15;
      const fund = {
        Cash: 20,
        Coin: 1,
      };
      const amount = cashAmount + coinAmount;
      const change = purchaseService.calculateChangeToReturn(amount, fund, 10);
      expect(change.cash).toBe(20);
      expect(change.coin).toBe(4);
    });
  });
  describe('calculateChange()', () => {
    it('should call calculateChangeToReturn with correct amount', () => {
      const calculateChangeToReturnSpy = jest.spyOn(
        purchaseService,
        'calculateChangeToReturn',
      );
      const fundStock = { Cash: 200, Coin: 100 };
      purchaseService.calculateChange(100, 20, fundStock);
      expect(calculateChangeToReturnSpy).toHaveBeenCalledWith(80, fundStock);
    });
  });
  describe('calculateRefund()', () => {
    it('should call calculateChangeToReturn', () => {
      const calculateChangeToReturnSpy = jest.spyOn(
        purchaseService,
        'calculateChangeToReturn',
      );
      const fundStock = { Cash: 200, Coin: 100 };
      purchaseService.calculateRefund(20, fundStock);
      expect(calculateChangeToReturnSpy).toHaveBeenCalledWith(20, fundStock);
    });
  });
});
