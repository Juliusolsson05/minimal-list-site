import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Footer from "@/components/Footer";
import ItemCard from "@/components/ItemCard";
import PosterCard from "@/components/PosterCard";
import MusicCard from "@/components/MusicCard";
import { siteConfig } from "@/lib/site-config";

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

type ArchivedItem = {
  kind: "item";
  archivedAt: Date;
  data: {
    id: string;
    slug: string;
    name: string;
    category: string;
    description: string;
    price: string;
    image: string;
    link: string;
    details: string;
  };
};

type ArchivedPoster = {
  kind: "poster";
  archivedAt: Date;
  data: {
    id: string;
    slug: string;
    name: string;
    description: string;
    image: string;
  };
};

type ArchivedSong = {
  kind: "song";
  archivedAt: Date;
  data: {
    id: string;
    slug: string;
    name: string;
    artist: string;
    album: string | null;
    image: string;
    link: string | null;
    addedAt: string;
  };
};

type ArchivedEntry = ArchivedItem | ArchivedPoster | ArchivedSong;

export default async function ArchivePage() {
  const [items, posters, songs] = await Promise.all([
    prisma.item.findMany({
      where: { archivedAt: { not: null } },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        price: true,
        link: true,
        details: true,
        imageUrl: true,
        archivedAt: true,
        category: { select: { slug: true } },
      },
      orderBy: { archivedAt: "desc" },
    }),
    siteConfig.features.posters
      ? prisma.poster.findMany({
          where: { archivedAt: { not: null } },
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            imageUrl: true,
            archivedAt: true,
          },
          orderBy: { archivedAt: "desc" },
        })
      : Promise.resolve([]),
    siteConfig.features.music
      ? prisma.song.findMany({
          where: { archivedAt: { not: null } },
          select: {
            id: true,
            slug: true,
            name: true,
            artist: true,
            album: true,
            imageUrl: true,
            link: true,
            addedAt: true,
            archivedAt: true,
          },
          orderBy: { archivedAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const entries: ArchivedEntry[] = [
    ...items.map<ArchivedItem>((i) => ({
      kind: "item",
      archivedAt: i.archivedAt!,
      data: {
        id: i.id,
        slug: i.slug,
        name: i.name,
        category: i.category.slug,
        description: i.description,
        price: i.price ?? "",
        image: i.imageUrl,
        link: i.link ?? "",
        details: i.details,
      },
    })),
    ...posters.map<ArchivedPoster>((p) => ({
      kind: "poster",
      archivedAt: p.archivedAt!,
      data: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        image: p.imageUrl,
      },
    })),
    ...songs.map<ArchivedSong>((song) => ({
      kind: "song",
      archivedAt: song.archivedAt!,
      data: {
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
      },
    })),
  ].sort((a, b) => b.archivedAt.getTime() - a.archivedAt.getTime());

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-6">
          <Link href="/" className="group">
            <h1 className="text-2xl font-light tracking-tight text-foreground transition-opacity hover:opacity-70">
              {siteConfig.name}
            </h1>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="animate-fade-in mb-12 max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-6">
              Archive
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Archived stuff I lost interest in.
            </p>
          </div>

          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-24">
              Nothing archived yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) =>
                entry.kind === "item" ? (
                  <ItemCard key={`item-${entry.data.id}`} item={entry.data} />
                ) : entry.kind === "poster" ? (
                  <PosterCard key={`poster-${entry.data.id}`} poster={entry.data} />
                ) : (
                  <MusicCard key={`song-${entry.data.id}`} song={entry.data} />
                )
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
