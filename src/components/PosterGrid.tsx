import PosterCard from "./PosterCard";

interface Poster {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
}

interface PosterGridProps {
  posters: Poster[];
}

const PosterGrid = ({ posters }: PosterGridProps) => {
  if (posters.length === 0) {
    return (
      <div className="container mx-auto px-6 py-24">
        <p className="text-center text-muted-foreground">
          No posters yet. Check back soon for new additions.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-light tracking-tight text-foreground mb-2">
          Posters
        </h2>
        <p className="text-sm text-muted-foreground">
          Curated poster collection
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posters.map((poster) => (
          <PosterCard key={poster.id} poster={poster} />
        ))}
      </div>
    </div>
  );
};

export default PosterGrid;
