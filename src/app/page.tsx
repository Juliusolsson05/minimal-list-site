import { prisma } from "@/lib/prisma";
import HomePage from "@/components/HomePage";
import { siteConfig } from "@/lib/site-config";

export const dynamic = 'force-dynamic';
// Revalidate every hour (3600s) - use on-demand revalidation for instant updates
export const revalidate = 3600;

export default async function Home() {
  const [items, categories, posters, songs] = await Promise.all([
    prisma.item.findMany({
      where: { archivedAt: null },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        price: true,
        link: true,
        details: true,
        imageUrl: true,
        category: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 60, // Limit initial load
    }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
    siteConfig.features.posters
      ? prisma.poster.findMany({
          where: { archivedAt: null },
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            imageUrl: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 30, // Limit initial load
        })
      : Promise.resolve([]),
    siteConfig.features.music
      ? prisma.song.findMany({
          where: { archivedAt: null },
          select: {
            id: true,
            slug: true,
            name: true,
            artist: true,
            album: true,
            imageUrl: true,
            link: true,
            addedAt: true,
          },
          orderBy: {
            addedAt: 'desc',
          },
          take: 60,
        })
      : Promise.resolve([]),
  ]);

  // Transform items to use direct Storage URLs
  const transformedItems = items.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: item.category.slug,
    description: item.description,
    price: item.price,
    image: item.imageUrl,
    link: item.link,
    details: item.details,
  }));

  // Transform posters to use direct Storage URLs
  const transformedPosters = posters.map((poster) => ({
    id: poster.id,
    slug: poster.slug,
    name: poster.name,
    description: poster.description,
    image: poster.imageUrl,
  }));

  const transformedSongs = songs.map((song) => ({
    id: song.id,
    slug: song.slug,
    name: song.name,
    artist: song.artist,
    album: song.album,
    image: song.imageUrl,
    link: song.link,
    addedAt: song.addedAt.toLocaleDateString("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));

  // Hardcode category order for better UX
  const categoryOrder = ['all', 'furniture', 'tech', 'fashion', 'lifestyle', 'accessories'];
  const sortedCategories = categoryOrder
    .map(slug => categories.find(c => c.slug === slug))
    .filter((c): c is typeof categories[0] => c !== undefined);

  // Add Posters as a separate view
  const categoriesWithExtras = [
    ...sortedCategories,
    ...(siteConfig.features.posters ? [{ id: 'posters', name: 'Posters', slug: 'posters' }] : []),
    ...(siteConfig.features.music ? [{ id: 'music', name: 'Music', slug: 'music' }] : []),
  ];

  return <HomePage items={transformedItems} categories={categoriesWithExtras} posters={transformedPosters} songs={transformedSongs} />;
}
