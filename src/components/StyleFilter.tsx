import { motion } from "framer-motion";

const styleFilters = [
  { label: "Tất cả", value: "all" },
  { label: "Casual", value: "casual" },
  { label: "Công sở", value: "office" },
  { label: "Dạ tiệc", value: "party" },
  { label: "Streetwear", value: "street" },
  { label: "Boho", value: "boho" },
  { label: "Minimalist", value: "minimal" },
];

interface StyleFilterProps {
  active: string;
  onChange: (value: string) => void;
}

const StyleFilter = ({ active, onChange }: StyleFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {styleFilters.map((filter) => (
        <motion.button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={`relative px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            active === filter.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {filter.label}
        </motion.button>
      ))}
    </div>
  );
};

export default StyleFilter;
