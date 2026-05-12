import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { RecommendResponse } from "@/lib/api";

interface Props {
  uploadedPreview: string;
  data: RecommendResponse;
}

export default function RecommendationResults({ uploadedPreview, data }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
      {/* Uploaded item */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:sticky lg:top-24 self-start"
      >
        <div className="glass-card rounded-3xl overflow-hidden">
          <img
            src={uploadedPreview}
            alt="Your uploaded item"
            className="w-full aspect-[3/4] object-cover"
          />
          <div className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Detected</p>
            <p className="font-display text-2xl capitalize text-foreground mt-1">
              {data.detected_item}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-accent font-medium">
              <span className="capitalize">Matching {data.target_category}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results grid */}
      <div>
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-display text-2xl sm:text-3xl text-foreground">
            Top 5 matches
          </h2>
          <span className="text-sm text-muted-foreground capitalize">
            {data.target_category} suggestions
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {data.results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`group relative rounded-2xl overflow-hidden glass-card cursor-pointer ${
                i === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <motion.img
                src={r.image_url}
                alt={r.title ?? `Match ${i + 1}`}
                className="w-full h-full aspect-[3/4] object-cover"
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full bg-background/85 backdrop-blur text-xs font-medium text-foreground">
                  {(r.similarity_score * 100).toFixed(0)}% match
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-primary-foreground font-display text-lg">
                  {r.title ?? `Match #${i + 1}`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
