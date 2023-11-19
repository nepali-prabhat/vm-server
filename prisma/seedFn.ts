import { PrismaClient, FundStockType } from '@prisma/client';

const inventories = [
  { name: 'Coke', price: 20, stock: 10, imageName: 'coke.png' },
  { name: 'Pepsi', price: 25, stock: 10, imageName: 'pepsi.png' },
  { name: 'Dew', price: 30, stock: 10, imageName: 'dew.png' },
];
const fundStocks = [
  { fundType: FundStockType.Coin, stock: 100 },
  { fundType: FundStockType.Cash, stock: 200 },
  { fundType: FundStockType.CustomerCoin, stock: 0 },
  { fundType: FundStockType.CustomerCash, stock: 0 },
];

export async function seed(prisma: PrismaClient) {
  const inventoriesResponse = {};
  for (let i = 0; i < inventories.length; i++) {
    const inventory = inventories[i];
    inventoriesResponse[inventory.name] = await prisma.inventory.upsert({
      where: { name: inventory.name },
      update: {},
      create: inventory,
    });
  }

  const fundStockResponse = {};
  for (let i = 0; i < fundStocks.length; i++) {
    const fundStock = fundStocks[i];
    fundStockResponse[fundStock.fundType] = await prisma.fundStock.upsert({
      where: { fundType: fundStock.fundType },
      update: {},
      create: fundStock,
    });
  }
}
