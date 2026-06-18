import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { type RecommendResponse } from "@/lib/api";

interface FeedbackCardProps {
  data: RecommendResponse;
}

export default function FeedbackCard({ data }: FeedbackCardProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (rating === 0) return toast.error("Please select a rating");
    setLoading(true);
    setSubmitted(true);
    toast.success("Thank you for your feedback!");
    setLoading(false);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-10 text-center"
      >
        <h3 className="font-display text-2xl text-foreground">Feedback received</h3>
        <p className="text-muted-foreground mt-2">
          Your input helps us refine outfit recommendations.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6 sm:p-8 space-y-6"
    >
      <div>
        <h3 className="font-display text-2xl text-foreground">How did we do?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Did the suggested outfit match your style?
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-1 transition-transform hover:scale-110"
            aria-label={`Rate ${n} stars`}
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                n <= (hover || rating)
                  ? "fill-accent text-accent"
                  : "text-muted-foreground/40"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setLiked(liked === true ? null : true)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${
            liked === true
              ? "bg-accent text-accent-foreground border-accent"
              : "border-border hover:bg-secondary"
          }`}
        >
          <ThumbsUp className="w-4 h-4" /> Like
        </button>
        <button
          type="button"
          onClick={() => setLiked(liked === false ? null : false)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${
            liked === false
              ? "bg-foreground text-background border-foreground"
              : "border-border hover:bg-secondary"
          }`}
        >
          <ThumbsDown className="w-4 h-4" /> Dislike
        </button>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Optional — tell us what worked or what didn't…"
        className="w-full p-4 rounded-2xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-accent/40 text-foreground placeholder:text-muted-foreground resize-none"
      />

      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Submit Feedback
      </button>
    </motion.div>
  );
}
