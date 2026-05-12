// API service layer for fashion AI recommendations
// Replace API_BASE with your FastAPI endpoint when backend is ready.

import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";
import outfit4 from "@/assets/outfit-4.jpg";
import outfit5 from "@/assets/outfit-5.jpg";
import outfit6 from "@/assets/outfit-6.jpg";

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

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

export interface FeedbackPayload {
  uploaded_item: string;
  recommended_results: RecommendResult[];
  rating: number;
  liked: boolean | null;
  comment: string;
}

const MOCK_IMAGES = [outfit1, outfit2, outfit3, outfit4, outfit5, outfit6];

const inferCategories = (prompt: string): { detected: string; target: string } => {
  const p = prompt.toLowerCase();
  // Try to parse "find me X that match with this Y"
  const matchTarget = p.match(/find me (?:a |an |some )?(\w+)/);
  const matchSource = p.match(/(?:with |for )(?:this |my )?(\w+)/);
  const target = matchTarget?.[1] ?? "pants";
  const detected = matchSource?.[1] ?? "shirt";
  return { detected, target };
};

export async function recommend(
  image: File,
  prompt: string
): Promise<RecommendResponse> {
  if (API_BASE) {
    const fd = new FormData();
    fd.append("image", image);
    fd.append("prompt", prompt);
    const res = await fetch(`${API_BASE}/recommend`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(`Recommend failed (${res.status})`);
    return res.json();
  }

  // Mock: simulate latency + parse prompt
  await new Promise((r) => setTimeout(r, 1800));
  const { detected, target } = inferCategories(prompt);
  return {
    detected_item: detected,
    target_category: target,
    results: MOCK_IMAGES.slice(0, 5).map((img, i) => ({
      image_url: img,
      similarity_score: +(0.97 - i * 0.04).toFixed(2),
      title: `Match #${i + 1}`,
    })),
  };
}

export async function sendFeedback(payload: FeedbackPayload): Promise<{ ok: true }> {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Feedback failed (${res.status})`);
    return res.json();
  }
  await new Promise((r) => setTimeout(r, 700));
  console.log("[mock feedback]", payload);
  return { ok: true };
}
