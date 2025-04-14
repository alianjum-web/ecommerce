import { Suspense } from "react";
import SearchClient from "./SearchClient";
import { getInitialSearchResults } from "@/lib/search";
import ErrorBoundary from "./hooks/errorDeboundry";

export const metadata = {
  title: "Search",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { keyword?: string };
}) {
  const keyword = searchParams.keyword || "";
  const initialResults = keyword ? await getInitialSearchResults(keyword) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorBoundary
        fallback={
          <div className="text-center py-12 text-red-500">
            Search failed. Please try again.
          </div>
        }
      >
        <Suspense fallback={<SearchLoading />}>
          <SearchClient 
            initialResults={initialResults} 
            searchTitle={keyword ? `Search: ${keyword}` : "Search"}
          />
        </Suspense>
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