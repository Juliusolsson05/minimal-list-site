import MusicCard from "./MusicCard";

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

interface MusicGridProps {
  songs: Song[];
}

const MusicGrid = ({ songs }: MusicGridProps) => {
  if (songs.length === 0) {
    return (
      <div className="container mx-auto px-6 py-24">
        <p className="text-center text-muted-foreground">
          No music yet. Check back soon for new additions.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-light tracking-tight text-foreground mb-2">
          Music
        </h2>
        <p className="text-sm text-muted-foreground">
          Songs and albums worth keeping around
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {songs.map((song) => (
          <MusicCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
};

export default MusicGrid;
