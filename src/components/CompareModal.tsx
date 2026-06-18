import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AIScoreRing from "@/components/AIScoreRing";
import LazyImage from "@/components/LazyImage";

interface CompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploadedImage?: string;
  image: string;
  title: string;
  score: number;
}

export default function CompareModal({
  open,
  onOpenChange,
  uploadedImage,
  image,
  title,
  score,
}: CompareModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-3xl border-border bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Quick compare</DialogTitle>
          <DialogDescription className="sr-only">
            Compare the uploaded item with the recommended match.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card/70 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Uploaded</p>
            {uploadedImage ? (
              <LazyImage
                src={uploadedImage}
                alt="Uploaded"
                className="mt-4 h-56 w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="mt-4 h-56 rounded-2xl bg-secondary/60" />
            )}
          </div>
          <div className="rounded-2xl border border-border bg-card/70 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Match</p>
              <AIScoreRing value={Math.min(1, Math.max(0, score))} size={46} />
            </div>
            <LazyImage
              src={image}
              alt={title}
              className="mt-4 h-56 w-full rounded-2xl object-cover"
            />
            <p className="mt-3 text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
