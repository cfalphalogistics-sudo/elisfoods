export default function ProductCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden shadow-card flex flex-col h-full animate-pulse">
      <div className="relative aspect-[4/3] bg-surface-container-high" />
      <div className="p-6 flex flex-col flex-grow space-y-4">
        <div className="flex justify-between items-start">
          <div className="h-5 bg-surface-container-high rounded w-2/3" />
          <div className="h-5 bg-surface-container-high rounded w-16" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-surface-container-high rounded w-full" />
          <div className="h-4 bg-surface-container-high rounded w-3/4" />
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="h-5 bg-surface-container-high rounded w-12" />
          <div className="h-9 bg-surface-container-high rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
}
