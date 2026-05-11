import Link from "next/link";
import Image from "next/image";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/site-config";

// Revalidate every hour - use on-demand revalidation for instant updates
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function ItemDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;

  const item = await prisma.item.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      description: true,
      details: true,
      price: true,
      link: true,
      imageUrl: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!item) {
    notFound();
  }

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

      <div className="flex-1">
        <div className="container mx-auto px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 animate-fade-in">
            <div className="aspect-square overflow-hidden bg-muted relative">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>

            <div className="flex flex-col justify-center space-y-8">
              <div>
                <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {item.category.name}
                </div>
                <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-6">
                  {item.name}
                </h1>
                <p className="text-xl text-muted-foreground mb-4">
                  {item.description}
                </p>
                <div className="text-3xl font-medium text-foreground">
                  {item.price}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-medium uppercase tracking-wider text-foreground">
                  Details
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {item.details}
                </p>
              </div>

              {item.link && item.link !== 'N/A' && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto group bg-foreground text-background hover:bg-foreground/90 transition-all"
                  >
                    View Product
                    <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
