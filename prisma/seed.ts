import { FUND_TYPE } from './../src/constants';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// PENDING, SUCCESS,
// CANCELLED, TIMEOUT,
// INSUFFICIENT_COIN, INSUFFICIENT_CASH
async function main() {
  const inventoriesResponse = {};
  const inventories = [
    { name: 'Coke', price: 20, stock: 10, imageName: 'coke.png' },
    { name: 'Pepsi', price: 25, stock: 10, imageName: 'pepsi.png' },
    { name: 'Dew', price: 30, stock: 10, imageName: 'dew.png' },
  ];
  for (let i = 0; i < inventories.length; i++) {
    const inventory = inventories[i];
    inventoriesResponse[inventory.name] = await prisma.inventory.upsert({
      where: { name: inventory.name },
      update: {},
      create: inventory,
    });
  }

  const fundStockResponse = {};
  const fundStocks = [
    { fundType: FUND_TYPE.Coin, stock: 100 },
    { fundType: FUND_TYPE.Cash, stock: 200 },
    { fundType: FUND_TYPE.CustomerCoin, stock: 0 },
    { fundType: FUND_TYPE.CustomerCash, stock: 0 },
  ];
  for (let i = 0; i < fundStocks.length; i++) {
    const fundStock = fundStocks[i];
    fundStockResponse[fundStock.fundType] = await prisma.fundStock.upsert({
      where: { fundType: fundStock.fundType },
      update: {},
      create: fundStock,
    });
  }

  console.log('seed: ', {
    drinksResponse: inventoriesResponse,
    fundStockResponse,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
