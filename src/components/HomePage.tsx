"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import CategoryFilter from "@/components/CategoryFilter";
import ItemGrid from "@/components/ItemGrid";
import PosterGrid from "@/components/PosterGrid";
import Footer from "@/components/Footer";

interface Item {
  id: string;
  slug?: string;
  name: string;
  category: string;
  description: string;
  price: string;
  image: string;
  link: string;
  details: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Poster {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
}

interface HomePageProps {
  items: Item[];
  categories: Category[];
  posters: Poster[];
}

export default function HomePage({ items, categories, posters }: HomePageProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    let filtered = items;

    if (selectedCategory !== "all" && selectedCategory !== "posters") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery) {
      const searchTerms = searchQuery.toLowerCase().split(" ").filter(term => term.length > 0);

      filtered = filtered.filter((item) => {
        const searchableText = `${item.name} ${item.description} ${item.category} ${item.details}`.toLowerCase();

        // Fuzzy search: match if any search term is found in the item
        return searchTerms.some(term => searchableText.includes(term));
      });
    }

    return filtered;
  }, [items, selectedCategory, searchQuery]);

  const filteredPosters = useMemo(() => {
    if (!searchQuery) return posters;

    const searchTerms = searchQuery.toLowerCase().split(" ").filter(term => term.length > 0);

    return posters.filter((poster) => {
      const searchableText = `${poster.name} ${poster.description}`.toLowerCase();
      return searchTerms.some(term => searchableText.includes(term));
    });
  }, [posters, searchQuery]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
      />
      <div className="flex-1">
        {selectedCategory === "posters" ? (
          <PosterGrid posters={filteredPosters} />
        ) : (
          <ItemGrid items={filteredItems} />
        )}
      </div>
      <Footer />
    </div>
  );
}
