import { useState, type ImgHTMLAttributes } from "react";
import { ImageOff } from "lucide-react";
import { resolveSiteImageSource } from "@/lib/site-image-source";

type SiteImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
};

export function SiteImage({ src, alt, className, onError, style, ...props }: SiteImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const resolvedSrc = resolveSiteImageSource(src);

  if (!src.trim() || failedSource === resolvedSrc) {
    return (
      <span
        aria-hidden={!alt}
        aria-label={alt || undefined}
        className={`site-image-fallback${className ? ` ${className}` : ""}`}
        role={alt ? "img" : undefined}
        style={style}
      >
        <ImageOff size={20} aria-hidden="true" />
        {alt && <span>{alt}</span>}
      </span>
    );
  }

  return (
    <img
      {...props}
      alt={alt}
      className={className}
      onError={(event) => {
        setFailedSource(resolvedSrc);
        onError?.(event);
      }}
      src={resolvedSrc}
      style={style}
    />
  );
}
