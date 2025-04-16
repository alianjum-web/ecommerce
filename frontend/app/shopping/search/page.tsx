// app/shopping/search/page.tsx
'use client' // Add this directive since you're using client-side hooks

import { ProductSearchResult } from "@/store/shop/search-slice";
import SearchClient from "./SearchClient";
import { getInitialSearchResults } from "@/lib/search";
import ErrorBoundary from "./hooks/errorDeboundry";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";


export default function SearchPage() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const [initialResults, setInitialResults] = useState<ProductSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (keyword) {
        setIsLoading(true);
        try {
          const results = await getInitialSearchResults(keyword);
          setInitialResults(results);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setInitialResults([]);
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [keyword]);

  if (isLoading) {
    return <SearchLoading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorBoundary
        fallback={
          <div className="text-center py-12 text-red-500">
            Search failed. Please try again.
          </div>
        }
      >
        <SearchClient 
          initialResults={initialResults} 
          searchTitle={keyword ? `Search: ${keyword}` : "Search"}
        />
      </ErrorBoundary>
    </div>
  );
}

function SearchLoading() {
  return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
    </div>
  );
}

export const dynamic = 'force-dynamic';