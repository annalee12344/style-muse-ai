import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ImageSearch from "@/components/ImageSearch";
import StyleFilter from "@/components/StyleFilter";
import OutfitCard from "@/components/OutfitCard";

import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";
import outfit4 from "@/assets/outfit-4.jpg";
import outfit5 from "@/assets/outfit-5.jpg";
import outfit6 from "@/assets/outfit-6.jpg";

const outfits = [
  {
    image: outfit1,
    title: "Smart Casual Cuối Tuần",
    style: "Casual",
    tags: ["Navy", "Beige", "Sneakers", "Thu Đông"],
  },
  {
    image: outfit2,
    title: "Summer Getaway",
    style: "Casual",
    tags: ["Linen", "Neutral", "Sandals", "Hè"],
  },
  {
    image: outfit3,
    title: "Elegant Night Out",
    style: "Dạ tiệc",
    tags: ["Đen", "Vàng gold", "Heels", "Sang trọng"],
  },
  {
    image: outfit4,
    title: "Urban Streetwear",
    style: "Streetwear",
    tags: ["Hoodie", "Cargo", "Sneakers", "Đường phố"],
  },
  {
    image: outfit5,
    title: "Business Casual",
    style: "Công sở",
    tags: ["Blazer", "Loafers", "Chuyên nghiệp"],
  },
  {
    image: outfit6,
    title: "Bohemian Spirit",
    style: "Boho",
    tags: ["Maxi", "Tự nhiên", "Phụ kiện mây"],
  },
];

const Index = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const handleSearch = (query: string) => {
    console.log("Search:", query);
  };

  const handleImageUpload = (file: File) => {
    console.log("Uploaded:", file.name);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-accent font-medium text-sm tracking-widest uppercase mb-4"
          >
            Phối đồ thông minh với AI
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold text-foreground leading-[1.1] tracking-tight"
          >
            Tìm phong cách
            <br />
            <span className="text-gradient">hoàn hảo cho bạn</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Tải ảnh lên hoặc mô tả phong cách bạn muốn — AI sẽ gợi ý những bộ outfit phù hợp nhất
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10"
        >
          <ImageSearch onSearch={handleSearch} onImageUpload={handleImageUpload} />
        </motion.div>
      </section>

      {/* Suggestions */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                Gợi ý cho bạn
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Outfit xu hướng được chọn lọc bởi AI
              </p>
            </div>
            <StyleFilter active={activeFilter} onChange={setActiveFilter} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {outfits.map((outfit, i) => (
              <OutfitCard key={i} {...outfit} index={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
