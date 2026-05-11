"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import Footer from "@/components/Footer";

interface PosterDetailClientProps {
  poster: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    imageOriginalUrl: string | null;
    hasOriginal: boolean;
  };
}

export default function PosterDetailClient({ poster }: PosterDetailClientProps) {
  const [activeImage, setActiveImage] = useState<'processed' | 'original'>('processed');
  const hasOriginal = poster.hasOriginal;

  const mainImageUrl = activeImage === 'processed'
    ? poster.imageUrl
    : (poster.imageOriginalUrl || poster.imageUrl);

  const thumbnailUrl = activeImage === 'processed'
    ? (poster.imageOriginalUrl || poster.imageUrl)
    : poster.imageUrl;

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
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square overflow-hidden bg-muted relative">
                <Image
                  src={mainImageUrl}
                  alt={poster.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-contain"
                />
              </div>

              {/* Thumbnail - Only show when we have an original */}
              {hasOriginal && (
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveImage(activeImage === 'processed' ? 'original' : 'processed')}
                    className="w-[100px] h-[100px] overflow-hidden bg-muted cursor-pointer relative"
                  >
                    <Image
                      src={thumbnailUrl}
                      alt=""
                      fill
                      sizes="100px"
                      className="object-contain"
                    />
                  </button>
                  <div className="flex-1"></div>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center space-y-8">
              <div>
                <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Poster
                </div>
                <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-6">
                  {poster.name}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {poster.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
