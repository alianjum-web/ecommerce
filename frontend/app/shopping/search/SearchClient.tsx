"use client";

import { Input } from "@/components/ui/input";
import SearchResults from "./components/SearchResults";
import useSearchProducts from "./hooks/useSearchProducts";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { useEffect } from "react";
import { ProductSearchResult } from "@/store/shop/search-slice";

export default function SearchClient({
  initialResults = [],
  searchTitle = "Search"
}: {
  initialResults?: ProductSearchResult[];
  searchTitle?: string;
}) {
  const {
    keyword,
    setKeyword,
    searchResults,
    handleAddToCart,
    handleGetProductDetails,
    openDetailsDialog,
    setOpenDetailsDialog,
    productDetails
  } = useSearchProducts(initialResults);

  useEffect(() => {
    document.title = searchTitle;
  }, [searchTitle]);

  return (
    <>
      <div className="flex justify-center mb-8">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search products..."
          className="py-6 text-lg w-full max-w-2xl"
        />
      </div>

      <SearchResults 
        results={searchResults}
        keyword={keyword}
        onAddToCart={handleAddToCart}
        onViewDetails={handleGetProductDetails}
      />
      
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </>
  );
}