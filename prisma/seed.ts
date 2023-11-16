import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// PENDING, SUCCESS,
// CANCELLED, TIMEOUT,
// INSUFFICIENT_COIN, INSUFFICIENT_CASH
async function main() {
  const orderStatusEnums = [
    'PENDING',
    'SUCCESS',
    'CANCELLED',
    'TIMEOUT',
    'INSUFFICIENT_COIN',
    'INSUFFICIENT_CASH',
  ];
  const orderStatusResponse = {};
  for (let i = 0; i < orderStatusEnums.length; i++) {
    const status = orderStatusEnums[i];
    orderStatusResponse[status] = await prisma.orderStatus.upsert({
      where: { status },
      update: {},
      create: { status },
    });
  }

  const drinksResponse = {};
  const drinks = [
    { name: 'Coke', price: 20, stock: 10 },
    { name: 'Pepsi', price: 25, stock: 10 },
    { name: 'Dew', price: 30, stock: 10 },
  ];
  for (let i = 0; i < drinks.length; i++) {
    const drink = drinks[i];
    drinksResponse[drink.name] = await prisma.drink.upsert({
      where: { name: drink.name },
      update: {},
      create: drink,
    });
  }

  console.log('seed: ', { orderStatusResponse, drinksResponse });
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
