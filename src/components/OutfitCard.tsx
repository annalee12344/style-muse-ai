import { motion } from "framer-motion";
import { Heart, Bookmark, ArrowRight } from "lucide-react";
import { useState } from "react";

interface OutfitCardProps {
  image: string;
  title: string;
  style: string;
  tags: string[];
  index: number;
}

const OutfitCard = ({ image, title, style, tags, index }: OutfitCardProps) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative glass-card rounded-2xl overflow-hidden cursor-pointer"
    >
      <div className="relative overflow-hidden">
        <motion.img
          src={image}
          alt={title}
          className="w-full aspect-[3/4] object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Actions overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
              liked ? "bg-accent text-accent-foreground" : "bg-background/70 text-foreground"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
              saved ? "bg-accent text-accent-foreground" : "bg-background/70 text-foreground"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Style badge */}
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <span className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md text-xs font-medium text-foreground">
            {style}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground leading-tight">{title}</h3>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Xem chi tiết</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
};

export default OutfitCard;
