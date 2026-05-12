import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UploadPromptProps {
  onSubmit: (file: File, prompt: string) => Promise<void> | void;
  loading?: boolean;
}

const SUGGESTIONS = [
  "Find me pants that match with this shirt",
  "Find me a jacket that matches this dress",
  "Find me shoes that match this outfit",
];

export default function UploadPrompt({ onSubmit, loading }: UploadPromptProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(SUGGESTIONS[0]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = (f: File) => {
    if (!/^image\/(jpeg|png|webp|jpg)$/.test(f.type)) {
      toast.error("Only JPG, PNG, or WEBP images are supported");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Please upload an image first");
    if (!prompt.trim()) return toast.error("Please describe what to match");
    await onSubmit(file, prompt.trim());
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4">
      <motion.div
        onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) accept(f);
        }}
        className={`relative rounded-3xl border-2 border-dashed transition-all overflow-hidden ${
          drag ? "border-accent bg-accent/5" : "border-border bg-card/40"
        }`}
        animate={{ scale: drag ? 1.01 : 1 }}
      >
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <img src={preview} alt="Uploaded item" className="w-full h-64 sm:h-80 object-cover" />
              <button
                type="button"
                onClick={reset}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="empty"
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full p-12 sm:p-16 flex flex-col items-center gap-4 text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ y: -2 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                <Upload className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="font-display text-xl text-foreground">Drop a fashion item here</p>
                <p className="text-sm mt-1">or click to upload — JPG, PNG, WEBP up to 8MB</p>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && accept(e.target.files[0])}
        />
      </motion.div>

      <div className="relative">
        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what to match…"
          className="w-full pl-11 pr-32 py-4 rounded-2xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-accent/40 text-foreground placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            "Find matches"
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setPrompt(s)}
            className="px-3 py-1.5 rounded-full text-xs bg-secondary/60 text-secondary-foreground hover:bg-secondary transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </form>
  );
}
