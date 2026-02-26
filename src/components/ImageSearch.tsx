import { useState, useRef } from "react";
import { Upload, Search, Camera } from "lucide-react";
import { motion } from "framer-motion";

interface ImageSearchProps {
  onSearch: (query: string) => void;
  onImageUpload: (file: File) => void;
}

const ImageSearch = ({ onSearch, onImageUpload }: ImageSearchProps) => {
  const [query, setQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageUpload(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Text search */}
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm phong cách, màu sắc, dịp đặc biệt..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-sans text-base"
        />
      </form>

      {/* Image upload area */}
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${
          dragActive
            ? "border-accent bg-accent/5 scale-[1.02]"
            : "border-border hover:border-accent/50 hover:bg-card/50"
        } ${previewUrl ? "p-0" : "p-8"}`}
        whileHover={{ scale: previewUrl ? 1 : 1.01 }}
      >
        {previewUrl ? (
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Ảnh đã tải lên"
              className="w-full h-48 object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
              <p className="text-primary-foreground font-medium">Đổi ảnh khác</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Tải ảnh lên để tìm outfit</p>
              <p className="text-sm mt-1">Kéo thả hoặc nhấn để chọn ảnh</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>JPG, PNG, WEBP</span>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />
      </motion.div>
    </div>
  );
};

export default ImageSearch;
