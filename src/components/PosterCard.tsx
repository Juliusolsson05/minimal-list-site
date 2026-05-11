"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Poster {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
}

interface PosterCardProps {
  poster: Poster;
}

const PosterCard = ({ poster }: PosterCardProps) => {
  const router = useRouter();
  const posterUrl = `/poster/${poster.slug}`;

  const handleMouseEnter = () => {
    router.prefetch(posterUrl);
  };

  return (
    <Link
      href={posterUrl}
      onMouseEnter={handleMouseEnter}
      prefetch={true}
      className="group block animate-fade-in hover-lift"
    >
      <div className="premium-shadow overflow-hidden bg-card transition-all duration-300 group-hover:premium-shadow-lg">
        <div className="aspect-square overflow-hidden bg-muted relative">
          <Image
            src={poster.image}
            alt={poster.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-6">
          <h3 className="mb-2 text-lg font-medium text-foreground">
            {poster.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {poster.description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default PosterCard;
