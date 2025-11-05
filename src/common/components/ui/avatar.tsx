import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/common/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, loading, fetchPriority, onLoadingStatusChange, ...props }, ref) => {
  const [loaded, setLoaded] = React.useState(false);

  // Keep types strict: Radix Avatar emits one of these statuses
  type LoadingStatus = "idle" | "loading" | "loaded" | "error";

  const handleLoadingStatusChange = (status: LoadingStatus) => {
    if (status === "loaded") setLoaded(true);
    onLoadingStatusChange?.(status as unknown as never);
  };

  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn(
        "aspect-square h-full w-full transition-opacity duration-200",
        loaded ? "opacity-100" : "opacity-0",
        className
      )}
      // 优化切会话头像体验：尽量提前加载，并在加载完成后淡入
      loading={loading ?? "eager"}
      fetchPriority={fetchPriority ?? "auto"}
      onLoadingStatusChange={handleLoadingStatusChange}
      {...props}
    />
  );
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, delayMs, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    // 立即显示占位，避免出现空白头像；图片加载完成后会淡入覆盖
    delayMs={delayMs ?? 0}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
