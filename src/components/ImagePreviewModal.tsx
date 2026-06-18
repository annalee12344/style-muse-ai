import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LazyImage from "@/components/LazyImage";
import AIScoreRing from "@/components/AIScoreRing";
import type { OutfitResult } from "@/api";
import { submitRating } from "@/api";
import { toast } from "sonner";

interface ImagePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  items: OutfitResult[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onCompare?: (item: OutfitResult) => void;
  userQuery: string;
}

export default function ImagePreviewModal({
  open,
  onOpenChange,
  title,
  items,
  currentIndex,
  onNavigate,
  onCompare,
  userQuery,
}: ImagePreviewModalProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (value: number) => {
    console.log("Star clicked");
    if (!current) {
      console.warn("No current item available to rate");
      return;
    }

    const payload = {
      query_text: userQuery,
      recommendation_id: current.outfit_id,
      recommendation_title: current.target_class || "Unknown Item",
      rank: currentIndex + 1,
      rating: value,
    };
    console.log("Sending rating", payload);

    if (ratings[current.outfit_id]) {
      toast.info("You have already rated this recommendation.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await submitRating(payload);
      console.log("Backend response:", result);
      setRatings(prev => ({ ...prev, [current.outfit_id]: value }));
      toast.success("Rating submitted successfully!");
    } catch (error) {
      console.error("Submit rating error:", error);
      toast.error("Failed to submit rating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const current = items[currentIndex];
  const image = current
    ? `http://localhost:8000/image?path=${encodeURIComponent(current.image_url.replace("/image?path=", ""))}`
    : "";
  const score = current ? Math.min(1, Math.max(0.1, current.final_score)) : 0;
  const percent = Math.round(score * 100);
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
  const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : currentIndex;

  const attrChips = useMemo(() => {
    const attrs = current?.target_attrs;
    if (!attrs) return [] as string[];
    const chips: string[] = [];
    if (attrs.subcategory) chips.push(attrs.subcategory);
    if (attrs.colors?.length) chips.push(...attrs.colors.slice(0, 2).map((c) => `color:${c}`));
    if (attrs.pattern) chips.push(`pattern:${attrs.pattern}`);
    if (attrs.material) chips.push(`material:${attrs.material}`);
    if (attrs.styles?.length) chips.push(...attrs.styles.slice(0, 2).map((s) => `style:${s}`));
    if (attrs.aesthetic) chips.push(`aesthetic:${attrs.aesthetic}`);
    return chips;
  }, [current]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl rounded-3xl border-border bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Preview recommended outfit and related looks.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-6">
          <div className="space-y-4">
            <div className="relative rounded-3xl border border-border bg-card/70 p-4">
              <LazyImage
                src={image}
                alt={title}
                className="h-[520px] w-full rounded-2xl object-contain bg-background transition-transform duration-500"
              />
              <button
                className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2"
                onClick={() => onNavigate(prevIndex)}
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2"
                onClick={() => onNavigate(nextIndex)}
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-3xl border border-border bg-card/70 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Related looks</p>
                  <h3 className="mt-2 font-display text-xl">Visual relatives</h3>
                </div>
                <button className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                  View all
                </button>
              </div>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {items.slice(0, 8).map((item, idx) => (
                  <button
                    key={`${item.outfit_id}-${idx}`}
                    className={`min-w-[120px] rounded-2xl overflow-hidden border ${
                      idx === currentIndex ? "border-foreground" : "border-border"
                    }`}
                    onClick={() => onNavigate(idx)}
                  >
                    <LazyImage
                      src={`http://localhost:8000/image?path=${encodeURIComponent(item.image_url.replace("/image?path=", ""))}`}
                      alt="Related"
                      className="h-24 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-card/70 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">AI match</p>
                  <h3 className="mt-2 font-display text-xl">Similarity score</h3>
                </div>
                <AIScoreRing value={score} size={52} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{percent}%</span>
                <span>match strength</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {current?.query_class && (
                  <span className="rounded-full border border-border px-3 py-1 text-xs">
                    Match: {current.query_class}
                  </span>
                )}
                {current?.target_class && (
                  <span className="rounded-full border border-border px-3 py-1 text-xs">
                    Target: {current.target_class}
                  </span>
                )}
              </div>
              {attrChips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attrChips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
              <div className="rounded-2xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                Why this match? AI aligned silhouette geometry, tone balance, and material rhythm
                with your detected focus item.
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-full border border-border px-4 py-2 text-xs">Save to wardrobe</button>
                <button
                  className="rounded-full border border-border px-4 py-2 text-xs"
                  onClick={() => current && onCompare?.(current)}
                >
                  Quick compare
                </button>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Feedback</p>
                  <h3 className="mt-2 font-display text-xl">Rate this recommendation</h3>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {[1, 2, 3, 4, 5].map((value) => {
                  const currentRating = ratings[current?.outfit_id ?? ""];
                  const isSelected = currentRating === value;
                  const hasRated = currentRating !== undefined;
                  
                  return (
                    <button
                      key={value}
                      onClick={() => handleRate(value)}
                      disabled={hasRated || isSubmitting}
                      className={`h-10 w-10 rounded-full border text-sm font-medium transition-colors ${
                        isSelected
                          ? "border-foreground bg-foreground text-background"
                          : hasRated 
                            ? "border-border text-muted-foreground opacity-50 cursor-not-allowed"
                            : "border-border text-foreground hover:border-foreground/50"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
                <span className="ml-2 text-xs text-muted-foreground">
                  {ratings[current?.outfit_id ?? ""] ? "Rating submitted" : "1 = Poor, 5 = Excellent"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
