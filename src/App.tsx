import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Link, useLocation } from "react-router-dom";
import { Upload, Moon, Sun, Tag, Search } from "lucide-react";
import { detectItems, searchOutfit, DetectedItem, OutfitResult } from "./api";
import HomePage from "./pages/HomePage";
import DatasetStudioPage from "./pages/DatasetStudioPage";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import "./App.css";

function NavTabs() {
  const loc = useLocation();
  const isStudio = loc.pathname.startsWith("/dataset-studio");
  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-background/50 p-1">
      <Link
        to="/"
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          !isStudio
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Search className="h-3 w-3" />
        Search
      </Link>
      <Link
        to="/dataset-studio"
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          isStudio
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Tag className="h-3 w-3" />
        Dataset Studio
      </Link>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [imageId, setImageId] = useState("");
  const [items, setItems] = useState<DetectedItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [userQuery, setUserQuery] = useState("");
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");
  const [taxonomy, setTaxonomy] = useState({
    classes: [] as string[],
    colors: [] as string[],
    patterns: [] as string[],
    materials: [] as string[],
    styles: [] as string[],
    aesthetics: [] as string[],
  });
  const [results, setResults] = useState<OutfitResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [uploadTrigger, setUploadTrigger] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetch("http://localhost:8000/taxonomy")
      .then((r) => r.json())
      .then((data) => setTaxonomy({
        classes: data.classes ?? [],
        colors: data.colors ?? [],
        patterns: data.patterns ?? [],
        materials: data.materials ?? [],
        styles: data.styles ?? [],
        aesthetics: data.aesthetics ?? [],
      }))
      .catch(() => setTaxonomy({
        classes: [],
        colors: [],
        patterns: [],
        materials: [],
        styles: [],
        aesthetics: [],
      }));
  }, []);

  async function handleUploadFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setItems([]);
    setResults([]);
    setLastSearchedQuery("");
    toast.info("Analyzing your image...");
    try {
      const data = await detectItems(file);
      setImageId(data.image_id);
      setItems(data.items);
      setSelectedIdx(0);
      toast.success(`Detected ${data.items.length} items.`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to detect items. Please try another image.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!imageId || items.length === 0) {
      toast.warning("Please upload an image and select an item first.");
      return;
    }
    if (!userQuery.trim()) {
      toast.warning('Vui lòng nhập loại item muốn tìm, ví dụ "yellow bag"');
      return;
    }
    setLoading(true);
    setResults([]);
    toast.info("Searching...");
    try {
      const data = await searchOutfit(imageId, selectedIdx, userQuery);
      setLastSearchedQuery(userQuery.trim());
      setResults(data.results);
      toast.success(`Found ${data.results.length} recommendations.`);
    } catch (error) {
      console.error(error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-background text-foreground">
        <header className="floating-nav">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-display text-lg">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border">*</span>
              Atelier.
            </div>
            <NavTabs />
            <div className="flex items-center gap-3">
              <button
                className="icon-button"
                aria-label="Toggle theme"
                onClick={() => setDarkMode((prev) => !prev)}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                className="cta-button"
                onClick={() => setUploadTrigger((v) => v + 1)}
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 pb-16 pt-32">
          <Routes>
            <Route
              path="/"
              element={(
                <HomePage
                  preview={preview}
                  items={items}
                  selectedIdx={selectedIdx}
                  setSelectedIdx={setSelectedIdx}
                  userQuery={userQuery}
                  setUserQuery={setUserQuery}
                  lastSearchedQuery={lastSearchedQuery}
                  taxonomy={taxonomy}
                  loading={loading}
                  results={results}
                  onUploadFile={handleUploadFile}
                  onSearch={handleSearch}
                  uploadTrigger={uploadTrigger}
                />
              )}
            />
            <Route path="/dataset-studio" element={<DatasetStudioPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}
