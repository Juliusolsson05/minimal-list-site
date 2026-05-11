"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

interface ItemCardProps {
  item: Item;
}

const ItemCard = ({ item }: ItemCardProps) => {
  const router = useRouter();
  const itemUrl = `/item/${item.slug || item.id}`;

  const handleMouseEnter = () => {
    // Aggressively prefetch on hover
    router.prefetch(itemUrl);
  };

  return (
    <Link
      href={itemUrl}
      onMouseEnter={handleMouseEnter}
      prefetch={true}
      className="group block animate-fade-in hover-lift"
    >
      <div className="premium-shadow overflow-hidden bg-card transition-all duration-300 group-hover:premium-shadow-lg">
        <div className="aspect-square overflow-hidden bg-muted relative">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-6">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {item.category}
          </div>
          <h3 className="mb-2 text-lg font-medium text-foreground">
            {item.name}
          </h3>
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
          <div className="text-base font-medium text-foreground">
            {item.price}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
