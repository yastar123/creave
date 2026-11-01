import { useState } from "react";

import { SiteImage } from "./site-image";

export function SiteMedia({
  src,
  video,
  alt,
  className,
  loading = "lazy",
}: {
  src?: string | undefined;
  video?: string | undefined;
  alt: string;
  className?: string | undefined;
  loading?: "eager" | "lazy" | undefined;
}) {
  const [videoFailed, setVideoFailed] = useState(false);

  if (video && !videoFailed) {
    return (
      <video
        aria-hidden={!alt}
        aria-label={alt || undefined}
        autoPlay
        className={className}
        loop
        muted
        onError={() => setVideoFailed(true)}
        playsInline
        preload={loading === "eager" ? "auto" : "metadata"}
        src={video}
      />
    );
  }

  if (src) {
    return <SiteImage alt={alt} className={className} loading={loading} src={src} />;
  }

  return null;
}
