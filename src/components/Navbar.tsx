import { Sparkles, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const Navbar = () => {
  const { theme, toggle } = useTheme();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground tracking-tight">
            StyleAI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="/404" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">
            Bộ sưu tập
          </a>
          <a href="/404" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">
            Xu hướng
          </a>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            Sign in
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
