import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/common/lib/utils";

// In-memory cache of loaded image URLs to skip flashes on remount
const loadedCache = new Set<string>();

interface SmartAvatarProps {
  src?: string;
  alt?: string;
  className?: string;
  // Optional fallback content (e.g., initials)
  fallback?: React.ReactNode;
}

/**
 * SmartAvatar keeps previous image visible while the next one loads,
 * and fades the new one in. If the target src is already cached, it
 * shows immediately without flashing a fallback.
 */
export function SmartAvatar({ src, alt, className, fallback }: SmartAvatarProps) {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const [nextSrc, setNextSrc] = useState<string | undefined>(undefined);
  const [nextReady, setNextReady] = useState(false);
  // If the target is already cached, start in loaded state to avoid skeleton flash on mount
  const [loaded, setLoaded] = useState<boolean>(() => (src ? loadedCache.has(src) : false));
  const target = src || "";
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // When target changes, either swap immediately (if cached) or preload then crossfade
  useEffect(() => {
    if (!target) {
      setLoaded(false);
      return;
    }

    if (loadedCache.has(target)) {
      setCurrentSrc(target);
      setNextSrc(undefined);
      setNextReady(false);
      setLoaded(true);
      return;
    }

    // Prepare crossfade: keep current, load next offscreen
    setNextSrc(target);
    setNextReady(false);

    const img = new Image();
    img.decoding = "async" as any;
    img.src = target;
    const onLoad = () => {
      loadedCache.add(target);
      if (!mountedRef.current) return;
      setNextReady(true);
      // allow CSS fade then swap state after a tick
      requestAnimationFrame(() => {
        if (!mountedRef.current) return;
        setCurrentSrc(target);
        setNextSrc(undefined);
        setNextReady(false);
        setLoaded(true);
      });
    };
    const onError = () => {
      if (!mountedRef.current) return;
      // Image failed to load, clear src and show fallback
      setCurrentSrc(undefined);
      setNextSrc(undefined);
      setNextReady(false);
      setLoaded(false);
    };
    if (img.decode) {
      img.decode().then(onLoad).catch(onError);
    } else {
      img.onload = onLoad;
      img.onerror = onError;
    }
    // no cleanup necessary for Image element
  }, [target]);

  // If first mount and no cached image, we still render fallback behind
  const showFallback = !target;
  const showInitialOverlay = !!fallback && (!loaded || showFallback);

  return (
    <div className={cn("relative overflow-hidden rounded-full bg-muted", className)}>
      {/* Skeleton shimmer while image not loaded */}
      {!loaded && !showFallback && (
        <div
          className="absolute inset-0 rounded-full animate-pulse bg-muted ring-1 ring-border/40"
          aria-hidden="true"
        />
      )}
      {showInitialOverlay && (
        <div className="absolute inset-0 flex items-center justify-center text-xs">
          {fallback}
        </div>
      )}

      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={cn(
            "block w-full h-full object-cover transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0"
          )}
          loading="eager"
          fetchPriority="high"
          onLoad={() => setLoaded(true)}
        />
      )}

      {/* Preloading layer for next image (fade-in overlay before swap) */}
      {nextSrc && (
        <img
          src={nextSrc}
          alt={alt}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-150",
            nextReady ? "opacity-100" : "opacity-0"
          )}
          aria-hidden
          loading="eager"
          fetchPriority="high"
        />
      )}
    </div>
  );
}
