import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function main() {
  console.log('Seeding database...');

  await prisma.item.deleteMany();
  await prisma.poster.deleteMany();
  await prisma.song.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminPassword || !adminEmail) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required for seeding');
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
    },
  });

  console.log(`Admin user created: ${admin.email}`);

  const categorySeeds = [
    { name: 'All Items', slug: 'all' },
    { name: 'Furniture', slug: 'furniture' },
    { name: 'Tech', slug: 'tech' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Lifestyle', slug: 'lifestyle' },
    { name: 'Accessories', slug: 'accessories' },
  ];

  const categories = await Promise.all(
    categorySeeds.map((category) => prisma.category.create({ data: category }))
  );

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));

  const items = [
    {
      name: 'Herman Miller Aeron Chair',
      description: 'Legendary ergonomic office chair',
      price: '$1,495',
      imageUrl: '/aeron-chair.jpg',
      link: 'https://www.hermanmiller.com/products/seating/office-chairs/aeron-chairs/',
      details:
        'The iconic Aeron chair combines ergonomic support with timeless design, adjustable arms, and breathable mesh.',
      categorySlug: 'furniture',
    },
    {
      name: "Arc'teryx Veilance Monitor Coat",
      description: 'Minimalist waterproof coat',
      price: '$1,150',
      imageUrl: '/veilance-coat.jpg',
      link: 'https://veilance.com/',
      details:
        'Clean technical outerwear with weather protection, quiet branding, and urban utility.',
      categorySlug: 'fashion',
    },
    {
      name: 'Aesop Resurrection Hand Balm',
      description: 'Premium hydrating hand balm',
      price: '$29',
      imageUrl: '/aesop-balm.jpg',
      link: 'https://www.aesop.com/',
      details:
        'A daily hand balm with a rich texture and a citrus, woody scent.',
      categorySlug: 'lifestyle',
    },
    {
      name: 'Bellroy Slim Sleeve Wallet',
      description: 'Minimalist leather wallet',
      price: '$89',
      imageUrl: '/bellroy-wallet.jpg',
      link: 'https://bellroy.com/',
      details:
        'A slim leather wallet with quick-access card storage and a clean profile.',
      categorySlug: 'accessories',
    },
  ];

  await Promise.all(
    items.map((item) => {
      const category = categoryBySlug.get(item.categorySlug);
      if (!category) {
        throw new Error(`Missing category: ${item.categorySlug}`);
      }

      return prisma.item.create({
        data: {
          name: item.name,
          slug: generateSlug(item.name),
          description: item.description,
          details: item.details,
          price: item.price,
          imageUrl: item.imageUrl,
          link: item.link,
          categoryId: category.id,
        },
      });
    })
  );

  await prisma.song.createMany({
    data: [
      {
        name: 'Sample Track',
        slug: 'sample-track',
        artist: 'Sample Artist',
        album: 'Sample Album',
        imageUrl: '/sample-album-1.svg',
        link: null,
        addedAt: new Date('2024-06-03'),
      },
      {
        name: 'Reference Song',
        slug: 'reference-song',
        artist: 'Template Artist',
        album: 'Reference Collection',
        imageUrl: '/sample-album-2.svg',
        link: null,
        addedAt: new Date('2023-07-01'),
      },
      {
        name: 'Rotation Note',
        slug: 'rotation-note',
        artist: 'Demo Artist',
        album: 'Demo Rotation',
        imageUrl: '/sample-album-3.svg',
        link: null,
        addedAt: new Date('2024-06-30'),
      },
    ],
  });

  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
