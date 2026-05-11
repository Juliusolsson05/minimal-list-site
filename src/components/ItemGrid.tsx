import { Item } from "@/data/items";
import ItemCard from "./ItemCard";

interface ItemGridProps {
  items: Item[];
}

const ItemGrid = ({ items }: ItemGridProps) => {
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-24">
        <p className="text-center text-muted-foreground">
          No items found. Try a different search or category.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default ItemGrid;
