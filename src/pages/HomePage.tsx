import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Sparkles,
  Upload,
  Info,
  Search,
  SlidersHorizontal,
  Flame,
} from "lucide-react";
import AIScoreRing from "@/components/AIScoreRing";
import LazyImage from "@/components/LazyImage";
import CompareModal from "@/components/CompareModal";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import type { DetectedItem, OutfitResult } from "@/api";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TaxonomyData {
  classes: string[];
  colors: string[];
  patterns: string[];
  materials: string[];
  styles: string[];
  aesthetics: string[];
}

interface HomePageProps {
  preview: string;
  items: DetectedItem[];
  selectedIdx: number;
  setSelectedIdx: (value: number) => void;
  userQuery: string;
  setUserQuery: (value: string) => void;
  lastSearchedQuery: string;
  taxonomy: TaxonomyData;
  loading: boolean;
  results: OutfitResult[];
  onUploadFile: (file: File) => Promise<void> | void;
  onSearch: () => Promise<void> | void;
  uploadTrigger: number;
}

export default function HomePage({
  preview,
  items,
  selectedIdx,
  setSelectedIdx,
  userQuery,
  setUserQuery,
  lastSearchedQuery,
  taxonomy,
  loading,
  results,
  onUploadFile,
  onSearch,
  uploadTrigger,
}: HomePageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [compareIndex, setCompareIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const hasQuery = userQuery.trim().length > 0;

  const visibleResults = results.slice(0, visibleCount);

  useEffect(() => {
    if (uploadTrigger > 0) fileInputRef.current?.click();
  }, [uploadTrigger]);

  const handleCompare = (index: number) => {
    setCompareIndex(index);
    setCompareOpen(true);
  };

  const handlePreview = (index: number) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  const buildAttrChips = (attrs: OutfitResult["target_attrs"]) => {
    const chips: string[] = [];
    if (attrs?.subcategory) chips.push(attrs.subcategory);
    if (attrs?.colors?.length) chips.push(...attrs.colors.slice(0, 2).map((c) => `color:${c}`));
    if (attrs?.pattern) chips.push(`pattern:${attrs.pattern}`);
    if (attrs?.material) chips.push(`material:${attrs.material}`);
    if (attrs?.styles?.length) chips.push(...attrs.styles.slice(0, 2).map((s) => `style:${s}`));
    if (attrs?.aesthetic) chips.push(`aesthetic:${attrs.aesthetic}`);
    return chips;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      void onUploadFile(e.dataTransfer.files[0]);
    }
  };

  const buildImageUrl = (rawUrl: string) => {
    if (!rawUrl) return "";
    if (rawUrl.startsWith("http")) return rawUrl;
    const base = "http://localhost:8000";
    const path = rawUrl.startsWith("/image?path=")
      ? rawUrl.replace("/image?path=", "")
      : rawUrl;
    return `${base}/image?path=${encodeURIComponent(path)}`;
  };

  return (
    <div className="space-y-12">
      <section className="space-y-4 text-center">
        <h1 className="text-5xl md:text-6xl font-display">Style Muse AI</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover your next favorite outfit. Upload an image to start the visual search and get AI-powered recommendations.
        </p>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Source Item Selection */}
        <div className="lg:col-span-4 space-y-8">
          {/* Uploader */}
          <div
            className={cn(
              "group relative rounded-[32px] border-dashed border-border bg-card/60 p-6 text-center overflow-hidden transition-all",
              dragActive ? "border-accent scale-[1.02]" : "border-2"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="relative">
                <LazyImage
                  src={preview}
                  alt="Uploaded"
                  className="mx-auto h-80 w-full rounded-3xl object-contain bg-background/70"
                />
                <div className="absolute inset-0 rounded-3xl bg-black/10 opacity-0 transition group-hover:opacity-100" />
                {loading && !results.length && (
                  <div className="scan-overlay">
                    <div className="scan-line" />
                    <span className="scan-label">Analyzing...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground h-80 justify-center">
                <div className="h-16 w-16 rounded-full border border-border flex items-center justify-center">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display text-2xl text-foreground">Drop an image</p>
                  <p className="text-sm">or click to browse</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onUploadFile(e.target.files[0])}
            />
          </div>

          {/* Source Item Selection */}
          <div className="rounded-3xl border border-border bg-card/70 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Source Item</p>
                <h2 className="mt-2 font-display text-2xl">Select Focus</h2>
              </div>
              <Flame className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {items.length === 0 && !loading && (
                <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground text-center">
                  Upload an image to see detected items.
                </div>
              )}
              {loading && items.length === 0 && (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl bg-secondary/50 p-4 animate-pulse">
                    <div className="h-12 w-12 rounded-2xl bg-secondary" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 rounded-full bg-secondary" />
                      <div className="h-3 w-20 rounded-full bg-secondary" />
                    </div>
                  </div>
                ))
              )}
              {items.map((item) => (
                <button
                  key={item.index}
                  onClick={() => setSelectedIdx(item.index)}
                  className={cn(
                    "w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors",
                    selectedIdx === item.index
                      ? "border-foreground bg-background/80"
                      : "border-border bg-background/40 hover:border-foreground/40"
                  )}
                >
                  <div className="h-12 w-12 rounded-2xl bg-secondary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium capitalize">{item.class_name}</p>
                    <p className="text-xs text-muted-foreground">Confidence {(item.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <AIScoreRing value={item.confidence} size={36} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Target Config & Results */}
        <div className="lg:col-span-8 space-y-8">
          {/* Target Item Configuration */}
          <div className="rounded-3xl border border-border bg-card/70 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Target Item</p>
                <h2 className="mt-2 font-display text-2xl">Configure Recommendation</h2>
              </div>
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 items-end">
              <div className="relative">
                 <label className="text-sm font-medium ml-1">Find compatible items...</label>
                <Search className="absolute left-4 top-10 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder={`e.g., "yellow bag", "black sneakers", "quiet luxury heels"`}
                  className="mt-2 w-full pl-10 pr-4 py-3 rounded-full bg-background border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  disabled={items.length === 0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      void onSearch();
                    }
                  }}
                />
                {!hasQuery && items.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Vui lòng nhập loại item muốn tìm, ví dụ "yellow bag".
                    {taxonomy.classes.length > 0 && (
                      <span className="ml-1">
                        Classes: {taxonomy.classes.join(", ")}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
             <button
                onClick={() => void onSearch()}
                disabled={loading || items.length === 0 || !hasQuery}
                className="w-full cta-button mt-2"
              >
                {loading ? "Searching..." : "Find Recommendations"}
              </button>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="sticky top-24 z-10 glass-panel rounded-3xl p-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Recommendations</span>
              <button className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                <SlidersHorizontal className="h-3 w-3" />
                Refine
              </button>
            </div>

            {results.length === 0 && !loading && (
              <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
                Configure your target and run search to see recommendations.
              </div>
            )}

            {loading && results.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-3xl bg-card/70 border border-border p-4 space-y-3 animate-pulse">
                    <div className="h-48 rounded-2xl bg-secondary" />
                    <div className="h-3 w-32 rounded-full bg-secondary" />
                    <div className="h-3 w-24 rounded-full bg-secondary" />
                  </div>
                ))}
              </div>
            )}

            {visibleResults.length > 0 && (
              <div className="masonry columns-1 sm:columns-2 lg:columns-3">
                {visibleResults.map((result, idx) => {
                  const imageUrl = buildImageUrl(result.image_url);
                  const attrChips = buildAttrChips(result.target_attrs);
                  return (
                    <motion.div
                      key={`${result.outfit_id}-${idx}`}
                      className="break-inside-avoid mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                    >
                      <div className="group relative rounded-3xl border border-border bg-card/70 p-4 transition-all hover:shadow-xl hover:-translate-y-1">
                        <LazyImage
                          src={imageUrl}
                          alt={`Outfit ${result.outfit_id}`}
                          className="h-auto w-full rounded-2xl"
                          onClick={() => handlePreview(idx)}
                        />
                        <div className="mt-4 flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium capitalize">{result.target_class}</p>
                            <p className="text-xs text-muted-foreground">Outfit {result.outfit_id.slice(0, 6)}</p>
                          </div>
                          <AIScoreRing value={result.final_score} size={36} />
                        </div>
                        {attrChips.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {attrChips.map((chip) => (
                              <span
                                key={`${result.outfit_id}-${chip}`}
                                className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground"
                              >
                                {chip}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleCompare(idx)} className="mini-icon-button">
                            <Bookmark className="h-4 w-4" />
                          </button>
                          <button onClick={() => handlePreview(idx)} className="mini-icon-button">
                            <Info className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
            {results.length > visibleCount && (
              <div className="text-center">
                <button onClick={() => setVisibleCount(v => v + 12)} className="cta-button">
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {results[compareIndex] && (
        <CompareModal
          open={compareOpen}
          onOpenChange={setCompareOpen}
          uploadedImage={preview}
          image={buildImageUrl(results[compareIndex].image_url)}
          title={results[compareIndex].target_class}
          score={results[compareIndex].final_score}
        />
      )}
      {results[previewIndex] && (
        <ImagePreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          title={`Outfit ${results[previewIndex].outfit_id.slice(0, 6)}`}
          items={results}
          currentIndex={previewIndex}
          onNavigate={setPreviewIndex}
          onCompare={(item) => {
            const idx = results.findIndex((r) => r.outfit_id === item.outfit_id);
            if (idx >= 0) setCompareIndex(idx);
            setCompareOpen(true);
          }}
          userQuery={lastSearchedQuery}
        />
      )}
    </div>
  );
}