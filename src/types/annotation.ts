// src/types/annotation.ts
// TypeScript types for Dataset Studio annotation tool

export interface AnnotationLabels {
  category: string;
  subcategory?: string;
  colors: string[];
  styles: string[];
  material?: string;
  pattern?: string;
  aesthetic?: string;
}

export interface AnnotatedItem {
  item_id: number;
  bbox: number[];
  labels: AnnotationLabels;
}

export interface Annotation {
  image_id: string;
  user_id: string;
  timestamp: string;
  items: AnnotatedItem[];
}

export interface DatasetImage {
  image_id: string;
  image_url: string;
  annotation_count: number;
  done?: boolean;
  message?: string;
}

export interface TaxonomyFull {
  classes: string[];
  subcategories: Record<string, string[]>;
  colors: string[];
  patterns: string[];
  materials: string[];
  styles: string[];
  aesthetics: string[];
}

export interface UserHistoryResponse {
  user_id: string;
  total: number;
  history: Annotation[];
}

export interface SubmitAnnotationResponse {
  success: boolean;
  annotation_id: string;
}
