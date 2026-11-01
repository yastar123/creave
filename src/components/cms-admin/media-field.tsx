import { useEffect, useRef, useState } from "react";
import { ImagePlus, Library, LoaderCircle, Video } from "lucide-react";

import { useAdminMedia, useUploadCmsMedia, type CmsMediaAsset } from "@/lib/cms-client";

export type CmsMediaKind = "image" | "video" | "any";

const imageTypes = "image/avif,image/gif,image/jpeg,image/png,image/webp";
const videoTypes = "video/mp4,video/webm";

function acceptsAsset(asset: CmsMediaAsset, kind: CmsMediaKind) {
  return kind === "any" || asset.mimeType.startsWith(`${kind}/`);
}

function MediaPreview({ asset }: { asset: CmsMediaAsset }) {
  return asset.mimeType.startsWith("video/")
    ? <video src={asset.url} muted preload="metadata" />
    : <img src={asset.url} alt="" loading="lazy" />;
}

export function CmsMediaField({
  value,
  onChange,
  label,
  kind = "image",
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  kind?: CmsMediaKind;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [browsing, setBrowsing] = useState(false);
  const [error, setError] = useState("");
  const media = useAdminMedia(browsing);
  const upload = useUploadCmsMedia();
  const assets = (media.data?.assets ?? []).filter((asset) => acceptsAsset(asset, kind));

  useEffect(() => {
    if (!browsing) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setBrowsing(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [browsing]);

  async function uploadFile(file: File | undefined) {
    if (!file) return;
    if (kind !== "any" && !file.type.startsWith(`${kind}/`)) {
      setError(`Choose a ${kind} file for this field.`);
      return;
    }

    setError("");
    try {
      const result = await upload.mutateAsync(file);
      onChange(result.asset.url);
      setBrowsing(false);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The file could not be uploaded.");
    }
  }

  return (
    <div className="ca-media-field">
      <input
        aria-label={label}
        className="ca-media-url"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste an asset URL or upload a file"
        value={value}
      />
      <div className="ca-media-actions">
        <input
          accept={kind === "image" ? imageTypes : kind === "video" ? videoTypes : `${imageTypes},${videoTypes}`}
          aria-label={`Choose ${label} from your device`}
          className="ca-media-file"
          onChange={(event) => {
            void uploadFile(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
          ref={fileInput}
          type="file"
        />
        <button
          className="ca-button ca-button-light"
          disabled={upload.isPending}
          onClick={() => fileInput.current?.click()}
          type="button"
        >
          {upload.isPending ? <LoaderCircle className="ca-spin" size={14} /> :
            kind === "video" ? <Video size={14} /> : <ImagePlus size={14} />}
          {upload.isPending ? "Uploading…" : "Upload"}
        </button>
        <button
          className="ca-button ca-button-light"
          onClick={() => {
            setBrowsing((current) => !current);
            setError("");
          }}
          type="button"
        >
          <Library size={14} /> Browse media
        </button>
      </div>
      {value && (
        <div className="ca-media-current">
          {value.toLowerCase().match(/\.(mp4|webm)(?:$|\?)/)
            ? <video src={value} muted preload="metadata" />
            : <img src={value} alt="" loading="lazy" />}
          <span>{value}</span>
        </div>
      )}
      {browsing && (
        <div className="ca-media-browser" role="dialog" aria-label={`Choose ${label}`}>
          <div className="ca-media-browser-head">
            <strong>Choose from media library</strong>
            <button aria-label="Close media library" onClick={() => setBrowsing(false)} type="button">×</button>
          </div>
          {media.isLoading ? <p role="status">Loading media…</p> :
            media.isError ? <p className="ca-media-error" role="alert">{media.error.message}</p> :
              assets.length === 0 ? <p>No matching uploads yet. Upload one from your device.</p> :
                <div className="ca-media-grid">{assets.map((asset) => (
                  <button
                    className="ca-media-choice"
                    key={asset.name}
                    onClick={() => {
                      onChange(asset.url);
                      setBrowsing(false);
                    }}
                    title={asset.name}
                    type="button"
                  >
                    <MediaPreview asset={asset} />
                    <span>{asset.name}</span>
                  </button>
                ))}</div>}
        </div>
      )}
      {error && <span className="ca-media-error" role="alert">{error}</span>}
    </div>
  );
}
