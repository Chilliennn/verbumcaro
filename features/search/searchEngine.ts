import type {
  SearchQuery,
  SearchResult
} from "./searchTypes";

export async function searchBible(
  _query: SearchQuery
): Promise<SearchResult[]> {
  // Full build-time search index is Stage 2.
  return [];
}
