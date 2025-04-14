import { ArrowUpDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { sortOptions } from '@/config';

interface ProductSortProps {
  sort: string;
  onSortChange: (value: string) => void;
  productCount?: number;
}

export default function ProductSort({ 
  sort, 
  onSortChange,
  productCount 
}: ProductSortProps) {
  return (
    <div className="flex items-center gap-3">
      {productCount !== undefined && (
        <span className="text-muted-foreground">
          {productCount} {productCount === 1 ? 'Product' : 'Products'}
        </span>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            aria-label="Sort products"
          >
            <ArrowUpDownIcon className="h-4 w-4" />
            <span>Sort by</span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuRadioGroup value={sort} onValueChange={onSortChange}>
            {sortOptions.map((sortItem) => (
              <DropdownMenuRadioItem
                key={sortItem.id}
                value={sortItem.id}
                className="cursor-pointer"
              >
                {sortItem.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}