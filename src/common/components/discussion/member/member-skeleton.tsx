import { Card } from "@/common/components/ui/card";
import { Skeleton } from "@/common/components/ui/skeleton";

export function MemberSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 