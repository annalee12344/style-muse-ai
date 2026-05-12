import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import UploadPrompt from "@/components/UploadPrompt";
import RecommendationResults from "@/components/RecommendationResults";
import ResultsSkeleton from "@/components/ResultsSkeleton";
import FeedbackCard from "@/components/FeedbackCard";
import OutfitCard from "@/components/OutfitCard";
import { recommend, type RecommendResponse } from "@/lib/api";

import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";
import outfit4 from "@/assets/outfit-4.jpg";

const examples = [
  { image: outfit1, title: "Smart Casual", style: "Casual", tags: ["Navy", "Beige"] },
  { image: outfit3, title: "Elegant Night", style: "Evening", tags: ["Black", "Gold"] },
  { image: outfit4, title: "Urban Streetwear", style: "Street", tags: ["Hoodie", "Cargo"] },
  { image: outfit2, title: "Summer Linen", style: "Casual", tags: ["Linen", "Sandals"] },
];

type Phase = "idle" | "loading" | "results" | "error";

const Index = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [data, setData] = useState<RecommendResponse | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [lastPrompt, setLastPrompt] = useState("");

  const handleSubmit = async (file: File, prompt: string) => {
    setPreview(URL.createObjectURL(file));
    setLastFile(file);
    setLastPrompt(prompt);
    setPhase("loading");
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    try {
      const res = await recommend(file, prompt);
      setData(res);
      setPhase("results");
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
      setPhase("error");
    }
  };

  const retry = () => {
    if (lastFile) handleSubmit(lastFile, lastPrompt);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden animated-gradient">
        <div className="absolute inset-0 grain-overlay" />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/70 backdrop-blur border border-border text-xs font-medium text-foreground"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            AI-powered outfit matching
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground mt-6 leading-[1.05]"
          >
            Upload an item.
            <br />
            <span className="text-gradient italic">Discover the perfect match.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Drop a photo of any garment and our vision model retrieves the top 5
            visually compatible pieces from a curated fashion dataset.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative mt-12"
        >
          <UploadPrompt onSubmit={handleSubmit} loading={phase === "loading"} />
        </motion.div>
      </section>

      {/* Results */}
      <section id="results" className="px-6 pb-20 -mt-4">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {phase === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-center text-sm text-muted-foreground mb-8 animate-pulse">
                  Analyzing fashion style…
                </p>
                <ResultsSkeleton />
              </motion.div>
            )}

            {phase === "results" && data && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <RecommendationResults uploadedPreview={preview} data={data} />
                <div className="max-w-2xl mx-auto pt-8">
                  <FeedbackCard data={data} />
                </div>
              </motion.div>
            )}

            {phase === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-3xl p-10 text-center max-w-md mx-auto"
              >
                <h3 className="font-display text-2xl">Something went wrong</h3>
                <p className="text-muted-foreground mt-2">
                  We couldn't analyze that image. Try again?
                </p>
                <button
                  onClick={retry}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium"
                >
                  <RefreshCw className="w-4 h-4" /> Retry
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Examples */}
      {phase === "idle" && (
        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-accent font-medium">
                  Inspiration
                </p>
                <h2 className="font-display text-3xl sm:text-4xl text-foreground mt-2">
                  Curated outfits to start with
                </h2>
              </div>
              <a
                href="#"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent"
              >
                Browse all <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {examples.map((o, i) => (
                <OutfitCard key={i} {...o} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        <p>StyleAI — Crafted for the next generation of fashion discovery.</p>
      </footer>
    </div>
  );
};

export default Index;
