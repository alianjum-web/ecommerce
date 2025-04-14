// @/lib/search.ts
import axios from "axios";
import type { ProductSearchResult } from "@/store/shop/search-slice";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getInitialSearchResults(keyword: string): Promise<ProductSearchResult[]> {
  try {
    const response = await axios.get<{ data: ProductSearchResult[] }>(
      `${BASE_URL}/api/shop/search/${encodeURIComponent(keyword)}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch initial search results:", error);
    return [];
  }
}