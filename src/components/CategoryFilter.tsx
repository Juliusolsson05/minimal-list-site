interface Category {
  id: string;
  name: string;
  slug?: string;
}

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: Category[];
}

const CategoryFilter = ({ selectedCategory, onCategoryChange, categories }: CategoryFilterProps) => {
  return (
    <nav className="border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {categories.map((category) => {
            const categoryValue = category.slug || category.id;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(categoryValue)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  selectedCategory === categoryValue
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {category.name}
                {selectedCategory === categoryValue && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default CategoryFilter;
