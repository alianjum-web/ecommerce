"use client";

import ShoppingProductTile from "@/components/shopping-view/product-tile";
import type { ProductSearchResult } from "@/store/shop/search-slice";

interface SearchResultsProps {
  results: ProductSearchResult[];
  keyword: string;
  onAddToCart: (id: string, stock: number) => void;
  onViewDetails: (id: string) => void;
}

export default function SearchResults({
  results,
  keyword,
  onAddToCart,
  onViewDetails
}: SearchResultsProps) {
  if (!keyword.trim()) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Enter a search term to find products
        </p>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">No results found</h3>
        <p className="text-muted-foreground mt-2">
          Try different keywords
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {results.map((product) => (
        <ShoppingProductTile
          key={product._id}
          product={product}
          onAddToCart={(id, stock) => Promise.resolve(onAddToCart(id, stock))}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}