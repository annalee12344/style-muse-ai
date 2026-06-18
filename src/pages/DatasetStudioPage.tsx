import { useEffect, useRef, useState, useCallback } from "react";
import {
  Tag,
  SkipForward,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  fetchRandomUnlabeled,
  submitAnnotation,
  fetchUserHistory,
  detectDatasetImage,
} from "@/api";
import type {
  DatasetImage,
  Annotation,
  AnnotationLabels,
  AnnotatedItem,
} from "@/types/annotation";

// ── User ID (persisted in localStorage) ────────────────────────
function getOrCreateUserId(): string {
  let id = localStorage.getItem("ds_user_id");
  if (!id) {
    id = "user_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("ds_user_id", id);
  }
  return id;
}

// ── Taxonomy types ──────────────────────────────────────────────
interface TaxonomyFull {
  classes: string[];
  subcategories: Record<string, string[]>;
  colors: string[];
  patterns: string[];
  materials: string[];
  styles: string[];
  aesthetics: string[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// ── Multi-select chip component ─────────────────────────────────
function MultiChip({
  options,
  selected,
  onChange,
  disabled,
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  disabled?: boolean;
}) {
  const toggle = (v: string) =>
    onChange(
      selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]
    );
  return (
    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => toggle(opt)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-all capitalize",
            selected.includes(opt)
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background/40 text-muted-foreground hover:border-foreground/50 hover:text-foreground",
            disabled && "opacity-40 cursor-not-allowed"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Single-select dropdown ──────────────────────────────────────
function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium flex justify-between">
        {label}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-2xl border border-border bg-background/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent capitalize",
          disabled && "opacity-40 cursor-not-allowed"
        )}
      >
        <option value="">{placeholder ?? "— Select —"}</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="capitalize">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── History card ────────────────────────────────────────────────
function HistoryCard({ ann }: { ann: Annotation }) {
  const date = new Date(ann.timestamp).toLocaleString();
  const itemCount = ann.items?.length || 0;
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-muted-foreground font-mono truncate">{ann.image_id}</span>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{date}</span>
      </div>
      <div className="space-y-2">
         {ann.items?.slice(0, 3).map(item => (
            <div key={item.item_id} className="flex flex-col gap-1 text-xs">
               <span className="font-medium capitalize text-foreground/80">
                 Item {item.item_id}: {item.labels.category} {item.labels.subcategory ? `· ${item.labels.subcategory}` : ""}
               </span>
               <div className="flex flex-wrap gap-1">
                 {item.labels.colors?.slice(0,2).map(c => <span key={c} className="text-[9px] border px-1.5 rounded-sm capitalize">{c}</span>)}
                 {item.labels.styles?.slice(0,2).map(s => <span key={s} className="text-[9px] border px-1.5 rounded-sm capitalize">{s}</span>)}
               </div>
            </div>
         ))}
         {itemCount > 3 && <div className="text-[10px] text-muted-foreground italic">+{itemCount - 3} more items...</div>}
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────
export default function DatasetStudioPage() {
  const userId = useRef(getOrCreateUserId()).current;
  const [taxonomy, setTaxonomy] = useState<TaxonomyFull | null>(null);
  const [currentImage, setCurrentImage] = useState<DatasetImage | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });
  
  const [imageLoading, setImageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<Annotation[]>([]);
  const [allDone, setAllDone] = useState(false);

  // Workflow states
  const [detectedItems, setDetectedItems] = useState<{item_id: number, bbox: number[], class_name: string}[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [itemAnnotations, setItemAnnotations] = useState<Record<number, AnnotationLabels>>({});

  const emptyLabels = (): AnnotationLabels => ({
    category: "",
    subcategory: undefined,
    colors: [],
    styles: [],
    material: undefined,
    pattern: undefined,
    aesthetic: undefined,
  });

  // ── Load taxonomy ───────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/taxonomy`)
      .then((r) => r.json())
      .then((data) =>
        setTaxonomy({
          classes: data.classes ?? [],
          subcategories: data.subcategories ?? {},
          colors: data.colors ?? [],
          patterns: data.patterns ?? [],
          materials: data.materials ?? [],
          styles: data.styles ?? [],
          aesthetics: data.aesthetics ?? [],
        })
      )
      .catch(() => toast.error("Could not load taxonomy"));
  }, []);

  // ── Load an image ────────────────────────────────────────────
  const loadNextImage = useCallback(async () => {
    setImageLoading(true);
    setDetectedItems([]);
    setSelectedItemId(null);
    setItemAnnotations({});
    try {
      const img = await fetchRandomUnlabeled(userId);
      if (img.done) {
        setAllDone(true);
        setCurrentImage(null);
      } else {
        setAllDone(false);
        setCurrentImage(img);
        
        // Run YOLO detection
        try {
          const detection = await detectDatasetImage(img.image_id);
          if (detection.items && detection.items.length > 0) {
            setDetectedItems(detection.items);
            setSelectedItemId(detection.items[0].item_id);
            
            // Initialize empty annotations for each detected item
            const initialAnns: Record<number, AnnotationLabels> = {};
            detection.items.forEach(item => {
               initialAnns[item.item_id] = emptyLabels();
            });
            setItemAnnotations(initialAnns);
          } else {
            toast.warning("No items detected in this image. You can skip it.");
          }
        } catch (err) {
          toast.error("Failed to run detection on image.");
        }
      }
    } catch {
      toast.error("Failed to load image from dataset");
    } finally {
      setImageLoading(false);
    }
  }, [userId]);

  // ── Load history ─────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    try {
      const res = await fetchUserHistory(userId);
      setHistory(res.history);
    } catch {
      // silently fail
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    loadNextImage();
    loadHistory();
  }, [loadNextImage, loadHistory]);

  // ── Save annotation ──────────────────────────────────────────
  const isImageComplete = detectedItems.length > 0 && detectedItems.every(item => itemAnnotations[item.item_id]?.category);

  const handleCompleteImage = async () => {
    if (!currentImage || !isImageComplete) return;
    setSubmitting(true);
    try {
      const payload: AnnotatedItem[] = detectedItems.map(item => ({
         item_id: item.item_id,
         bbox: item.bbox,
         labels: itemAnnotations[item.item_id]
      }));
      await submitAnnotation(currentImage.image_id, userId, payload);
      toast.success("Image completed! Loading next image…");
      await loadHistory();
      await loadNextImage();
    } catch {
      toast.error("Failed to save annotations. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Skip ─────────────────────────────────────────────────────
  const handleSkip = async () => {
    toast.info("Skipped. Loading next image…");
    await loadNextImage();
  };

  // Form bindings
  const labels = selectedItemId !== null ? itemAnnotations[selectedItemId] || emptyLabels() : emptyLabels();
  const setLabels = (updater: React.SetStateAction<AnnotationLabels>) => {
    if (selectedItemId === null) return;
    setItemAnnotations(prev => {
       const current = prev[selectedItemId] || emptyLabels();
       const nextLabels = typeof updater === 'function' ? updater(current) : updater;
       return { ...prev, [selectedItemId]: nextLabels };
    });
  };

  const activeItem = detectedItems.find(i => i.item_id === selectedItemId);

  const subcategoryOptions =
    labels.category && taxonomy?.subcategories[labels.category]
      ? taxonomy.subcategories[labels.category]
      : [];

  const imageUrl = currentImage?.image_url
    ? `${API_BASE}${currentImage.image_url}`
    : null;

  // Zoom Math
  const scale = activeItem ? Math.min(imageDimensions.width / (activeItem.bbox[2] - activeItem.bbox[0]) * 0.7, 3) : 1;
  const origin = activeItem ? `${((activeItem.bbox[0] + activeItem.bbox[2])/2 / imageDimensions.width)*100}% ${((activeItem.bbox[1] + activeItem.bbox[3])/2 / imageDimensions.height)*100}%` : "50% 50%";

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <section className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center">
            <Tag className="h-4 w-4 text-muted-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display">Dataset Studio</h1>
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          Select items in the image and annotate them. The image is complete when all items are labeled.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          <span>Session: <code className="font-mono">{userId}</code></span>
          <span className="mx-2 opacity-40">|</span>
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          <span>{history.length} completed</span>
        </div>
      </section>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Items List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-3xl border border-border bg-card/70 p-5 flex flex-col h-[calc(100vh-250px)] min-h-[500px]">
            <div className="flex items-center justify-between mb-4">
               <div>
                 <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Queue</p>
                 <h2 className="mt-1 font-display text-lg">Detected Items</h2>
               </div>
               <button onClick={loadNextImage} disabled={imageLoading} className="icon-button" title="Load another image">
                 <RefreshCw className={cn("h-4 w-4", imageLoading && "animate-spin")} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
               {imageLoading ? (
                 <div className="space-y-2">
                   {[...Array(3)].map((_,i) => <div key={i} className="h-12 bg-secondary/50 rounded-2xl animate-pulse" />)}
                 </div>
               ) : (
                 <>
                   {detectedItems.map(item => {
                      const isDone = !!itemAnnotations[item.item_id]?.category;
                      const isSelected = selectedItemId === item.item_id;
                      return (
                        <button 
                          key={item.item_id}
                          onClick={() => setSelectedItemId(item.item_id)}
                          className={cn("w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm transition-all text-left", isSelected ? "border-foreground bg-foreground text-background shadow-md" : "border-border hover:border-foreground/30 bg-background/50", isDone && !isSelected && "opacity-60")}
                        >
                          <div className="flex items-center gap-3">
                            {isDone ? <CheckCircle2 className={cn("h-4 w-4 shrink-0", isSelected ? "text-background" : "text-green-500")} /> : <div className={cn("h-4 w-4 rounded-sm border shrink-0", isSelected ? "border-background/50" : "border-muted-foreground/50")} />}
                            <span className="font-medium truncate">Item {item.item_id}</span>
                          </div>
                          {item.class_name && <span className={cn("text-[10px] uppercase truncate ml-2", isSelected ? "text-background/70" : "text-muted-foreground")}>{item.class_name}</span>}
                        </button>
                      )
                   })}
                   {detectedItems.length === 0 && !imageLoading && !allDone && <p className="text-xs text-muted-foreground text-center py-4">No items detected</p>}
                 </>
               )}
            </div>

            <div className="pt-4 mt-4 grid grid-cols-2 gap-2 border-t border-border">
               <button onClick={handleSkip} disabled={imageLoading || allDone} className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background/50 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/40 transition disabled:opacity-50">
                 <SkipForward className="h-3.5 w-3.5" /> Skip
               </button>
               <button onClick={handleCompleteImage} disabled={!isImageComplete || imageLoading} className={cn("flex items-center justify-center gap-1.5 rounded-xl bg-foreground text-background px-3 py-2 text-sm font-medium transition", (!isImageComplete || imageLoading) ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-95 shadow-lg")}>
                 <CheckCircle2 className="h-3.5 w-3.5" /> Complete
               </button>
            </div>
          </div>
        </div>

        {/* Center: Image Viewport */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-border bg-card/70 p-5 h-[calc(100vh-250px)] min-h-[500px] flex flex-col relative overflow-hidden">
             <div className="flex items-center justify-between mb-4 z-20 relative">
               <div>
                 <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Viewport</p>
                 <h2 className="mt-1 font-display text-lg">Image</h2>
               </div>
             </div>

             <div className="flex-1 w-full relative overflow-hidden rounded-2xl bg-black/5 flex items-center justify-center cursor-crosshair">
                <AnimatePresence mode="wait">
                  {imageLoading ? (
                    <motion.div key="loading" exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center animate-pulse">
                       <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                    </motion.div>
                  ) : allDone ? (
                    <motion.div key="done" className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
                      <p className="font-display text-lg">All Done!</p>
                    </motion.div>
                  ) : currentImage ? (
                    <motion.div 
                      key={currentImage.image_id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center overflow-hidden"
                    >
                       <div 
                         className="relative shadow-xl transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                         style={{
                            aspectRatio: `${imageDimensions.width}/${imageDimensions.height}`,
                            maxHeight: '100%',
                            maxWidth: '100%',
                            transform: `scale(${scale})`,
                            transformOrigin: origin
                         }}
                       >
                          <img 
                            src={imageUrl!} 
                            alt="Fashion item" 
                            className="block w-full h-full object-contain" 
                            onLoad={(e) => setImageDimensions({width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight})}
                          />
                          
                          {/* Bounding Boxes Overlay */}
                          {detectedItems.map(item => {
                            const isSelected = item.item_id === selectedItemId;
                            const [x1, y1, x2, y2] = item.bbox;
                            const left = (x1 / imageDimensions.width) * 100;
                            const top = (y1 / imageDimensions.height) * 100;
                            const width = ((x2 - x1) / imageDimensions.width) * 100;
                            const height = ((y2 - y1) / imageDimensions.height) * 100;
                            
                            return (
                               <div 
                                 key={item.item_id}
                                 onClick={(e) => { e.stopPropagation(); setSelectedItemId(item.item_id); }}
                                 className={cn(
                                   "absolute border-[1.5px] transition-all cursor-pointer rounded-[2px]", 
                                   isSelected ? "border-accent z-10 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]" : "border-white/70 hover:border-white bg-white/10 hover:bg-white/20"
                                 )}
                                 style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
                               >
                                 {isSelected && (
                                   <div className="absolute -top-5 left-[-1.5px] bg-accent text-accent-foreground text-[9px] px-1.5 py-0.5 rounded-t-sm font-bold whitespace-nowrap shadow-sm">
                                     Item {item.item_id}
                                   </div>
                                 )}
                               </div>
                            );
                          })}
                       </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
             </div>
             {currentImage && (
               <div className="absolute bottom-5 left-5 right-5 z-20 flex justify-center pointer-events-none">
                 <div className="bg-background/80 backdrop-blur-md border border-border text-[10px] px-3 py-1.5 rounded-full text-muted-foreground font-mono shadow-sm">
                   {currentImage.image_id}
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Right: Annotation Form & History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Form */}
          <div className="rounded-3xl border border-border bg-card/70 p-5 flex flex-col h-[calc(100vh-250px)] min-h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Labels</p>
                <h2 className="mt-1 font-display text-lg">Form</h2>
              </div>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </div>

            {!taxonomy ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 rounded-2xl bg-secondary/60 animate-pulse" />
                ))}
              </div>
            ) : selectedItemId === null ? (
               <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-sm border border-dashed border-border/50 rounded-2xl p-6 text-center">
                 Select an item from the queue to start labeling.
               </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar pb-10">
                {activeItem?.class_name && (
                  <div className="rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs flex items-start gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                    <p>
                      <span className="text-muted-foreground">AI Suggests:</span> <span className="font-semibold capitalize text-accent">{activeItem.class_name}</span>. Please manually select the exact category.
                    </p>
                  </div>
                )}

                {/* Category */}
                <SelectField
                  label="Category"
                  options={taxonomy.classes}
                  value={labels.category}
                  onChange={(v) =>
                    setLabels((l) => ({ ...l, category: v, subcategory: undefined }))
                  }
                  placeholder="Select category"
                  disabled={allDone}
                />

                {/* Subcategory */}
                {subcategoryOptions.length > 0 && (
                  <SelectField
                    label="Subcategory"
                    options={subcategoryOptions}
                    value={labels.subcategory ?? ""}
                    onChange={(v) =>
                      setLabels((l) => ({ ...l, subcategory: v || undefined }))
                    }
                    placeholder="Select subcategory"
                    disabled={allDone}
                  />
                )}

                {/* Colors */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                    Colors <span className="normal-case ml-1 opacity-60">(multi)</span>
                  </label>
                  <MultiChip
                    options={taxonomy.colors}
                    selected={labels.colors}
                    onChange={(v) => setLabels((l) => ({ ...l, colors: v }))}
                    disabled={allDone}
                  />
                </div>

                {/* Styles */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                    Styles <span className="normal-case ml-1 opacity-60">(multi)</span>
                  </label>
                  <MultiChip
                    options={taxonomy.styles}
                    selected={labels.styles}
                    onChange={(v) => setLabels((l) => ({ ...l, styles: v }))}
                    disabled={allDone}
                  />
                </div>

                {/* Material */}
                <SelectField
                  label="Material"
                  options={taxonomy.materials}
                  value={labels.material ?? ""}
                  onChange={(v) =>
                    setLabels((l) => ({ ...l, material: v || undefined }))
                  }
                  disabled={allDone}
                />

                {/* Pattern */}
                <SelectField
                  label="Pattern"
                  options={taxonomy.patterns}
                  value={labels.pattern ?? ""}
                  onChange={(v) =>
                    setLabels((l) => ({ ...l, pattern: v || undefined }))
                  }
                  disabled={allDone}
                />

                {/* Aesthetic */}
                <SelectField
                  label="Aesthetic"
                  options={taxonomy.aesthetics}
                  value={labels.aesthetic ?? ""}
                  onChange={(v) =>
                    setLabels((l) => ({ ...l, aesthetic: v || undefined }))
                  }
                  disabled={allDone}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* History section below */}
      <section className="rounded-3xl border border-border bg-card/70 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-display text-lg">Your History</h2>
            </div>
            <button onClick={loadHistory} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Refresh
            </button>
          </div>

          {history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No completed images yet. Start labeling above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {history.slice(0, 4).map((ann, idx) => (
                  <motion.div
                    key={`${ann.image_id}-${ann.timestamp}`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <HistoryCard ann={ann} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
      </section>
    </div>
  );
}
