export interface SearchQuery {
  query: string;
  translationId?: string;
}

export interface SearchResult {
  translationId: string;
  bookCode: string;
  chapter: number;
  verse: number;
  text: string;
}
