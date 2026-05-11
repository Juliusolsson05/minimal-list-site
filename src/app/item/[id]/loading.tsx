import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

export default function Loading() {
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
            {/* Image Skeleton */}
            <div className="aspect-square overflow-hidden bg-muted animate-pulse" />

            {/* Content Skeleton */}
            <div className="flex flex-col justify-center space-y-8">
              <div>
                <div className="mb-3 h-3 w-24 bg-muted animate-pulse rounded" />
                <div className="h-12 w-3/4 bg-muted animate-pulse rounded mb-6" />
                <div className="h-6 w-full bg-muted animate-pulse rounded mb-4" />
                <div className="h-10 w-32 bg-muted animate-pulse rounded" />
              </div>

              <div className="space-y-4">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                </div>
              </div>

              <div className="h-12 w-40 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
