import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminDashboard from "@/components/AdminDashboard";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const [items, categories, posters] = await Promise.all([
    prisma.item.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        details: true,
        price: true,
        link: true,
        imageUrl: true,
        categoryId: true,
        archivedAt: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      where: {
        slug: {
          not: 'all',
        },
      },
      orderBy: {
        name: 'asc',
      },
    }),
    siteConfig.features.posters
      ? prisma.poster.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            imageUrl: true,
            archivedAt: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      : Promise.resolve([]),
  ]);

  return <AdminDashboard items={items} categories={categories} posters={posters} user={session.user} />;
}
