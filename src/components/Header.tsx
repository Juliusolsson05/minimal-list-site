import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const Header = ({ searchQuery, onSearchChange }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="group">
            <h1 className="text-2xl font-light tracking-tight text-foreground transition-opacity hover:opacity-70">
              {siteConfig.name}
            </h1>
          </Link>
          
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-muted/50 border-border focus:bg-background transition-colors"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
