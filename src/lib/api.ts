// Shared types for legacy UI components

export interface RecommendResult {
  image_url: string;
  similarity_score: number;
  title?: string;
}

export interface RecommendResponse {
  detected_item: string;
  target_category: string;
  results: RecommendResult[];
}
