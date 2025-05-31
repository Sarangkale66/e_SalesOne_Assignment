import { productData } from './seedData';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding products...')
  for (const product of productData) {
  const {
    id,
    name,
    description,
    price,
    originalPrice,
    image,
    variants,
    inventory,
    rating,
    reviews,
    category,
    isNew,
    isBestseller
  } = product;

  await prisma.product.upsert({
    where: { id },
    update: {
      name,
      description,
      price,
      originalPrice,
      image,
      color: variants.color,
      size: variants.size,
      inventory,
      rating,
      reviews,
      category,
      isNew,
      isBestseller
    },
    create: {
      id,
      name,
      description,
      price,
      originalPrice,
      image,
      color: variants.color,
      size: variants.size,
      inventory,
      rating,
      reviews,
      category,
      isNew,
      isBestseller
    }
  });
}
console.log('✅ Products seeded successfully');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
