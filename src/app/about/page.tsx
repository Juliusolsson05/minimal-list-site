import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import { siteConfig } from "@/lib/site-config";

export default function About() {
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
        <div className="container mx-auto px-6 py-12 max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="animate-fade-in space-y-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-6">
                About {siteConfig.name}
              </h1>
            </div>

            <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
              <p>
                {siteConfig.about}
              </p>
              <p>
                Inspired by{" "}
                <a
                  href="https://www.curated.supply/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline hover:opacity-70 transition-opacity"
                >
                  Curated Supply
                </a>
                {" "}as a simple way to list things you like, want to buy, or want to keep track of.
              </p>

              <div className="pt-4 space-y-3">
                <p className="text-foreground font-medium">
                  {siteConfig.owner}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
