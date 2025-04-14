import { useMemo } from 'react';
import ShoppingProductTile from './product-tile';
import type { Product } from '@/utils/productInterface';

interface ProductListProps {
  products: Product[];
  onViewDetails: (productId: string) => void;
  onAddToCart: (productId: string, totalStock: number) => Promise<void>;
}

export default function ProductList({ 
  products, 
  onViewDetails, 
  onAddToCart 
}: ProductListProps) {
  const renderedProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return (
        <div className="col-span-full py-12 text-center">
          <h3 className="text-lg font-medium text-gray-500">
            No products found
          </h3>
          <p className="text-sm text-gray-400 mt-2">
            Try adjusting your filters or search criteria
          </p>
        </div>
      );
    }

    return products.map((product: Product) => (
      <ShoppingProductTile
        key={`product-${product._id}`}
        product={product}
        onViewDetails={onViewDetails}
        onAddToCart={(id, stock) => Promise.resolve(onAddToCart(id, stock))}
      />
    ));
  }, [products, onViewDetails, onAddToCart]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {renderedProducts}
    </div>
  );
}