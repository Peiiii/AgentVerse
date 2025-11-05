import { Card } from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";

export function MemberSkeleton() {
  return (
    <Card className="p-4 rounded-xl border-border/60">
      <div className="flex gap-3.5">
        <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
        <div className="flex-1">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <div className="flex justify-between gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 