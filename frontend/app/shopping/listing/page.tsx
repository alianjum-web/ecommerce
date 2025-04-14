"use client";
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toast } from '@/components/ui/sonner';

import ProductFilter from '@/components/shopping-view/filter';
import ProductDetailsDialog from '@/components/shopping-view/product-details';
import ProductList from '@/components/shopping-view/product-list';
import ProductSort from '@/components/shopping-view/product-sort';
import { DEFAULT_SORT } from '@/config';
import { addToCart, fetchCartItems } from '@/store/shop/cart-slice';
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from '@/store/shop/product-slice';
import type { RootState } from '@/store/store';
import type { Product, ProductDetails } from '@/utils/productInterface';
import { createLogger } from '@/utils/logger';
import { CartItem } from '@/utils/types';
import useProductFilters from '@/components/shopping-view/hooks/ProductFilters';

const logger = createLogger({ context: 'ShoppingListing' });

export default function ShoppingListing() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { filters, handleFilter, isInitialLoad } = useProductFilters();
  const [sort, setSort] = useState<string>(DEFAULT_SORT);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  // Redux state selectors
  const { productList, productDetails, isLoading, error } = useAppSelector(
    (state: RootState) => state.shopProducts
  );
  const { cartItems } = useAppSelector((state: RootState) => state.shopCart);
  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  const handleSort = useCallback((value: string) => {
    setSort(value);
  }, []);

  const handleGetProductDetails = useCallback((productId: string) => {
    dispatch(fetchProductDetails(productId))
      .unwrap()
      .catch((error: unknown) => {
        logger.error('Failed to fetch product details:', error);
        toast.error('Error', {
          description: 'Failed to load product details'
        });
      });
  }, [dispatch]);

  const handleAddToCart = useCallback(
    async (productId: string, totalStock: number): Promise<void> => {
      if (!isAuthenticated || !user?._id) {
        toast.error("Login Required", {
          description: 'You must be logged in to add items to your cart',
          action: {
            label: 'Login',
            onClick: () => router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname))
          }
        });
        return;
      }

      const currentCartItems = cartItems || [];
      const existingItem = currentCartItems.find(
        (item: CartItem) => item.productId === productId
      );

      if (existingItem && existingItem.quantity >= totalStock) {
        toast.error(`Stock Limit Reached`, {
          description: `Only ${totalStock} quantity available for this item`
        });
        return;
      }

      try {
        const actionResult = await dispatch(
          addToCart({
            userId: user._id,
            productId,
            quantity: 1,
          })
        );

        if (addToCart.fulfilled.match(actionResult)) {
          await dispatch(fetchCartItems(user._id));
          toast.success('Added to Cart', {
            description: 'Item has been added to your shopping cart',
          });
        }
      } catch (error) {
        logger.error('Failed to add to cart:', error);
        toast.error('Error', {
          description: 'Failed to add item to cart',
        });
      }
    },
    [dispatch, user, cartItems, isAuthenticated, router]
  );

  // Fetch products when filters or sort change
  useEffect(() => {
    if (isInitialLoad) return;

    const fetchProducts = async () => {
      try {
        await dispatch(
          fetchAllFilteredProducts({ 
            filterParams: Object.fromEntries(
              Object.entries(filters).map(([key, value]) => [key, value.join(',')])
            ),
            sortParams: sort 
          })
        ).unwrap();
      } catch (error) {
        logger.error('Failed to fetch products:', error);
        toast.error('Error', {
          description: 'Failed to load products',
        });
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [dispatch, filters, sort, isInitialLoad]);

  // Open details dialog when product details are loaded
  useEffect(() => {
    if (productDetails) {
      setOpenDetailsDialog(true);
    }
  }, [productDetails]);

  if (isLoading && isInitialLoad) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 p-4 md:p-6">
      <ProductFilter filters={filters} handleFilter={handleFilter} />
      
      <ProductListingContainer
        sort={sort}
        onSortChange={handleSort}
        productList={productList}
        onViewDetails={handleGetProductDetails}
        onAddToCart={handleAddToCart}
      />

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails as ProductDetails}
      />
    </div>
  );
}

// Additional small components for better readability
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
    </div>
  );
}

function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="p-6 text-center text-destructive">
      <h3 className="text-lg font-medium">Error loading products</h3>
      <p className="text-sm mt-2">{error}</p>
    </div>
  );
}

function ProductListingContainer({
  sort,
  onSortChange,
  productList,
  onViewDetails,
  onAddToCart
}: {
  sort: string;
  onSortChange: (value: string) => void;
  productList: Product[];
  onViewDetails: (id: string) => void;
  onAddToCart: (id: string, stock: number) => Promise<void>;
}) {
  return (
    <div className="bg-background w-full rounded-lg shadow-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-extrabold">All Products</h2>
        <ProductSort 
          sort={sort} 
          onSortChange={onSortChange}
          productCount={productList?.length}
        />
      </div>
      <ProductList
        products={productList}
        onViewDetails={onViewDetails}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}