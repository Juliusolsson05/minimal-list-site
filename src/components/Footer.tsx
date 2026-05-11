import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-light tracking-tight text-foreground mb-2">
              {siteConfig.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>
          
          <nav className="flex gap-8">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="/archive"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Archive
            </Link>
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </nav>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
