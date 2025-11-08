import { SettingCategory } from "@/common/types/settings";
import { cn } from "@/common/lib/utils";

interface CategoryListProps {
  categories: SettingCategory[];
  activeCategory?: string;
  onSelect: (category: string) => void;
}

export function CategoryList({
  categories,
  activeCategory,
  onSelect,
}: CategoryListProps) {
  return (
    <div className="py-2 h-full px-2 overflow-y-auto">
      {categories.map((category) => (
        <button
          key={category.key}
          onClick={() => onSelect(category.key)}
          className={cn(
            "w-full px-4 py-2 text-left text-sm transition-colors",
            "hover:bg-muted/50",
            activeCategory === category.key && "bg-muted"
          )}
        >
          <div className="flex items-center justify-between">
            <span>{category.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
