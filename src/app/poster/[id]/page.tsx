import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PosterDetailClient from "@/components/PosterDetailClient";

// Revalidate every hour - use on-demand revalidation for instant updates
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function PosterDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;

  const poster = await prisma.poster.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      imageOriginalUrl: true,
    },
  });

  if (!poster) {
    notFound();
  }

  const posterData = {
    id: poster.id,
    name: poster.name,
    description: poster.description,
    imageUrl: poster.imageUrl,
    imageOriginalUrl: poster.imageOriginalUrl,
    hasOriginal: poster.imageOriginalUrl !== null,
  };

  return <PosterDetailClient poster={posterData} />;
}
