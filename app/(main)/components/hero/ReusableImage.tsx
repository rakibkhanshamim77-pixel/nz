"use client";

import Image, { type ImageProps } from "next/image";
import {
  useEffect,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";

const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

type Status = "loading" | "loaded" | "error";

/** Stable string key for any next/image src shape (string, static import, or require()) */
function srcKey(src: ImageProps["src"]): string {
  if (typeof src === "string") return src;
  if ("src" in src) return src.src;
  return src.default.src;
}

export type ReusableImageProps = Omit<
  ImageProps,
  "src" | "alt" | "onLoad" | "onError"
> & {
  /** Image source. null/undefined/"" shows the fallback right away. */
  src?: ImageProps["src"] | null;
  alt: string;
  /** Tried once if the main src fails to load. */
  fallbackSrc?: ImageProps["src"];
  /** Custom UI shown when both src and fallbackSrc fail. */
  fallback?: ReactNode;
  /** Shimmer placeholder shown while loading (default: true). */
  showSkeleton?: boolean;
  /** Classes for the wrapper. With `fill`, give it a size (e.g. "aspect-square w-full"). */
  wrapperClassName?: string;
  skeletonClassName?: string;
  onLoad?: (e: SyntheticEvent<HTMLImageElement>) => void;
  onError?: (e: SyntheticEvent<HTMLImageElement>) => void;
};

function DefaultFallback({ alt }: { alt: string }) {
  return (
    <div
      role="img"
      aria-label={alt || "Image unavailable"}
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
        <path d="M3 3l18 18" />
      </svg>
      <span className="text-xs font-medium">Image unavailable</span>
    </div>
  );
}

export default function ReusableImage({
  src,
  alt,
  fallbackSrc,
  fallback,
  showSkeleton = true,
  wrapperClassName,
  skeletonClassName,
  className,
  fill,
  width,
  height,
  onLoad,
  onError,
  ...rest
}: ReusableImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc || null);
  const [status, setStatus] = useState<Status>(
    src || fallbackSrc ? "loading" : "error",
  );

  // Reset when the src changes (e.g. slider moves to the next slide)
  useEffect(() => {
    const next = src || fallbackSrc || null;
    setCurrentSrc(next);
    setStatus(next ? "loading" : "error");
  }, [src, fallbackSrc]);

  const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    setStatus("loaded");
    onLoad?.(e);
  };

  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc); // try the fallback once
      setStatus("loading");
    } else {
      setStatus("error");
    }
    onError?.(e);
  };

  return (
    <div
      className={cx(
        "relative overflow-hidden",
        fill ? "h-full w-full" : "inline-block",
        wrapperClassName,
      )}
      style={
        !fill && width && height
          ? {
              width: Number(width),
              maxWidth: "100%",
              aspectRatio: `${width}/${height}`,
            }
          : undefined
      }
      aria-busy={status === "loading"}
    >
      {showSkeleton && status === "loading" && (
        <div
          aria-hidden
          className={cx(
            "absolute inset-0 animate-pulse bg-neutral-200 dark:bg-neutral-700",
            skeletonClassName,
          )}
        />
      )}

      {status === "error" || !currentSrc ? (
        (fallback ?? <DefaultFallback alt={alt} />)
      ) : (
        <Image
          {...rest}
          key={srcKey(currentSrc)}
          src={currentSrc}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          onLoad={handleLoad}
          onError={handleError}
          className={cx(
            "transition-opacity duration-500",
            status === "loaded" ? "opacity-100" : "opacity-0",
            !fill && "h-auto w-full",
            className,
          )}
        />
      )}
    </div>
  );
}
