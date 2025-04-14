"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "@/components/ui/sonner";
import type { CartItem } from "@/utils/types";

import { 
  getSearchResults, 
  resetSearchResults 
} from "@/store/shop/search-slice";
import { fetchProductDetails } from "@/store/shop/product-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import type { ProductSearchResult } from "@/store/shop/search-slice";

export default function useSearchProducts(initialResults: ProductSearchResult[] = []) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const { searchResults, isLoading } = useAppSelector((state) => state.shopSearch);
  const { productDetails } = useAppSelector((state) => state.shopProducts);
  const { user } = useAppSelector((state) => state.auth);
  const { cartItems } = useAppSelector((state) => state.shopCart);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  useEffect(() => {
    const initialKeyword = searchParams.get('keyword');
    if (initialKeyword) {
      setKeyword(initialKeyword);
    }
  }, [searchParams]);

 // Update the useEffect for search
useEffect(() => {
  const timer = setTimeout(() => {
    if (keyword.trim().length > 2) {
      const newUrl = `/search?keyword=${encodeURIComponent(keyword)}`;
      // Only push if the URL is actually changing
      if (newUrl !== window.location.pathname + window.location.search) {
        router.push(newUrl, { scroll: false });
      }
      dispatch(getSearchResults(keyword));
    } else if (searchParams.get('keyword')) {
      // Only reset if we actually have a keyword in URL
      router.push('/search', { scroll: false });
      dispatch(resetSearchResults());
    }
  }, 500);

  return () => clearTimeout(timer);
}, [keyword, router, dispatch, searchParams]);

async function handleAddToCart(productId: string, totalStock: number) {
  if (!user?._id) {
    toast.error("Please login to add items to cart");
    return;
  }

  const existingItem = cartItems?.find((item: CartItem) => 
    item.productId === productId
  );

  if (existingItem && existingItem.quantity >= totalStock) {
    toast.error(`Only ${totalStock} available (${existingItem.quantity} in cart)`);
    return;
  }

  try {
    await dispatch(addToCart({
      userId: user._id,
      productId,
      quantity: 1
    })).unwrap();
    
    await dispatch(fetchCartItems(user._id));
    toast.success("Added to cart");
  } catch (error: unknown) {
    console.error('Add to cart failed:', error);
    
    let errorMessage = "Failed to add to cart";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    toast.error(errorMessage);
  }
}

  function handleGetProductDetails(productId: string) {
    dispatch(fetchProductDetails(productId));
  }

  useEffect(() => {
    if (productDetails) setOpenDetailsDialog(true);
  }, [productDetails]);

  return {
    keyword,
    setKeyword,
    searchResults: searchResults.length ? searchResults : initialResults,
    isLoading,
    handleAddToCart,
    handleGetProductDetails,
    openDetailsDialog,
    setOpenDetailsDialog,
    productDetails
  };
}