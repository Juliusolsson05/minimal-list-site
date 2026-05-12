"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface Song {
  id: string;
  slug: string;
  name: string;
  artist: string;
  album?: string | null;
  image: string;
  link?: string | null;
  addedAt: string;
}

interface MusicCardProps {
  song: Song;
}

const MusicCard = ({ song }: MusicCardProps) => {
  const content = (
    <div className="premium-shadow overflow-hidden bg-card transition-all duration-300 group-hover:premium-shadow-lg">
      <div className="aspect-square overflow-hidden bg-muted relative">
        <Image
          src={song.image}
          alt={`${song.name} cover art`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {song.artist}
        </div>
        <h3 className="mb-1 text-base font-medium text-foreground">
          {song.name}
        </h3>
        {song.album && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {song.album}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{song.addedAt}</span>
          {song.link && <ExternalLink className="h-3.5 w-3.5" />}
        </div>
      </div>
    </div>
  );

  if (!song.link) {
    return <div className="group block animate-fade-in">{content}</div>;
  }

  return (
    <Link
      href={song.link}
      target="_blank"
      rel="noreferrer"
      className="group block animate-fade-in hover-lift"
    >
      {content}
    </Link>
  );
};

export default MusicCard;
