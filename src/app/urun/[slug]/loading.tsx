import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 pt-4 pb-[calc(96px+env(safe-area-inset-bottom))] xl:pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sol: Galeri alanı */}
        <div className="min-w-0">
          <Skeleton className="aspect-[4/5] w-full rounded-lg" />
        </div>
        {/* Sağ: Breadcrumb, başlık, fiyat, özellikler */}
        <div className="space-y-6 min-w-0">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-8 w-28" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="hidden xl:block">
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      </div>
      {/* Sticky bar alanı placeholder */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background p-4 xl:hidden">
        <Skeleton className="mx-auto h-12 w-full max-w-md rounded-md" />
      </div>
    </div>
  );
}
