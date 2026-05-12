import { Skeleton } from "@/components/ui/skeleton";

export default function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
      <Skeleton className="aspect-[3/4] rounded-3xl" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className={`aspect-[3/4] rounded-2xl ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
