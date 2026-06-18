import type {
  DatasetImage,
  Annotation,
  AnnotationLabels,
  SubmitAnnotationResponse,
  UserHistoryResponse,
  AnnotatedItem,
} from "./types/annotation"

export type { DatasetImage, Annotation, AnnotationLabels, SubmitAnnotationResponse, UserHistoryResponse, AnnotatedItem }

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"

export interface DetectedItem {
  index: number
  class_name: string
  confidence: number
  bbox: number[]
  subcategory?: string
  colors?: string[]
  pattern?: string
  material?: string
  styles?: string[]
  aesthetic?: string
}

export interface OutfitResult {
  outfit_id: string
  image_url: string
  visual_score: number
  semantic_score: number
  final_score: number
  query_class: string
  target_class: string
  target_attrs: {
    subcategory?: string
    colors?: string[]
    pattern?: string
    material?: string
    styles?: string[]
    aesthetic?: string
  }
}

export interface SearchResponse {
  parsed?: {
    raw_input?: string
    class_name?: string
    subcategory?: string
    colors?: string[]
    pattern?: string
    material?: string
    styles?: string[]
    aesthetic?: string
    intent_type?: string
  }
  query_class?: string
  target_class?: string
  total?: number
  results: OutfitResult[]
}

export async function detectItems(file: File): Promise<{
  image_id: string
  items: DetectedItem[]
}> {
  const form = new FormData()
  form.append("file", file)
  const res = await fetch(`${API_BASE}/detect`, { method: "POST", body: form })
  if (!res.ok) throw new Error(`Detect failed (${res.status})`)
  return res.json()
}

export async function searchOutfit(
  image_id: string,
  selected_idx: number,
  user_query: string
): Promise<SearchResponse> {
  const form = new FormData()
  form.append("image_id", image_id)
  form.append("selected_idx", String(selected_idx))

  const targetInput = user_query.trim()
  form.append("target_input", targetInput)
  
  const res = await fetch(`${API_BASE}/search`, { method: "POST", body: form })
  if (!res.ok) throw new Error(`Search failed (${res.status})`)
  return res.json()
}

// ── Rating API ───────────────────────────────────────────────

export interface RatingPayload {
  query_text: string;
  recommendation_id: string;
  recommendation_title: string;
  rank: number;
  rating: number;
}

export async function submitRating(payload: RatingPayload): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/api/ratings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Submit rating failed (${res.status})`)
  return res.json()
}

// ── Dataset Studio API ─────────────────────────────────────────

export async function fetchRandomUnlabeled(userId: string): Promise<DatasetImage> {
  const res = await fetch(`${API_BASE}/api/dataset/random-unlabeled?user_id=${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error(`Fetch image failed (${res.status})`)
  return res.json()
}

export interface DatasetImageDetection {
  image_id: string;
  items: {
    item_id: number;
    bbox: number[];
    class_name: string;
  }[];
}

export async function detectDatasetImage(imageId: string): Promise<DatasetImageDetection> {
  const res = await fetch(`${API_BASE}/api/dataset/detect-image?image_id=${encodeURIComponent(imageId)}`)
  if (!res.ok) throw new Error(`Detect failed (${res.status})`)
  return res.json()
}

export async function submitAnnotation(
  imageId: string,
  userId: string,
  items: AnnotatedItem[]
): Promise<SubmitAnnotationResponse> {
  const res = await fetch(`${API_BASE}/api/annotations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_id: imageId, user_id: userId, items }),
  })
  if (!res.ok) throw new Error(`Submit failed (${res.status})`)
  return res.json()
}

export async function fetchUserHistory(userId: string): Promise<UserHistoryResponse> {
  const res = await fetch(`${API_BASE}/api/annotations/user-history?user_id=${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error(`Fetch history failed (${res.status})`)
  return res.json()
}