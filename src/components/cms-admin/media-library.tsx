import { useRef, useState } from "react";
import { Check, Copy, ImagePlus, LoaderCircle, Video } from "lucide-react";

import { useAdminMedia, useUploadCmsMedia } from "@/lib/cms-client";

const accept = "image/avif,image/gif,image/jpeg,image/png,image/webp,video/mp4,video/webm";

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function CmsMediaLibrary() {
  const fileInput = useRef<HTMLInputElement>(null);
  const query = useAdminMedia();
  const upload = useUploadCmsMedia();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const assets = query.data?.assets ?? [];

  async function uploadFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setFeedback("");
    try {
      await upload.mutateAsync(file);
      setFeedback(`${file.name} uploaded. You can now select it in an image or video field.`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The file could not be uploaded.");
    }
  }

  async function copyAssetUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setFeedback(`${url} copied to clipboard.`);
      setError("");
    } catch (copyError) {
      console.error("Could not copy the media URL:", copyError);
      setError("The URL could not be copied. Select it from the asset card and copy it manually.");
      setFeedback("");
    }
  }

  return (
    <section className="ca-media-library">
      <header className="ca-media-library-heading">
        <div>
          <p className="ca-overline">SITE ASSETS</p>
          <h1>Media library</h1>
          <p>Upload and reuse approved images and videos throughout your website.</p>
          <p className="ca-media-library-help">To replace a broken image, logo, or homepage cover, upload it here, then open the related page or Site settings and choose Browse media on that field.</p>
        </div>
        <div className="ca-media-library-upload">
          <input
            accept={accept}
            aria-label="Choose an image or video from your device"
            className="ca-media-file"
            onChange={(event) => {
              void uploadFile(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
            ref={fileInput}
            type="file"
          />
          <button
            className="ca-button ca-button-dark"
            disabled={upload.isPending}
            onClick={() => fileInput.current?.click()}
            type="button"
          >
            {upload.isPending ? <LoaderCircle className="ca-spin" size={15} /> : <ImagePlus size={15} />}
            {upload.isPending ? "Uploading…" : "Upload image or video"}
          </button>
          <span>JPG, PNG, GIF, WebP, AVIF, MP4, or WebM · max 100 MB</span>
        </div>
      </header>

      {error && <p className="ca-media-library-feedback is-error" role="alert">{error}</p>}
      {feedback && <p className="ca-media-library-feedback" role="status">{feedback}</p>}

      {query.isLoading ? <p className="ca-media-library-empty" role="status">Loading your media library…</p> :
        query.isError ? (
          <div className="ca-media-library-feedback is-error" role="alert">
            <span>{query.error.message}</span>
            <button className="ca-button ca-button-light" onClick={() => void query.refetch()} type="button">Retry</button>
          </div>
        ) : assets.length === 0 ? (
          <div className="ca-media-library-empty">
            <ImagePlus size={24} />
            <strong>Your media library is empty.</strong>
            <span>Upload your first image or video from your device to use it on the site.</span>
          </div>
        ) : (
          <div className="ca-media-library-grid">
            {assets.map((asset) => {
              const isVideo = asset.mimeType.startsWith("video/");
              return (
                <article className="ca-media-asset" key={asset.name}>
                  <div className="ca-media-asset-preview">
                    {isVideo
                      ? <video controls preload="metadata" src={asset.url} />
                      : <img alt="" loading="lazy" src={asset.url} />}
                    <span>{isVideo ? <Video size={13} /> : <ImagePlus size={13} />}{isVideo ? "VIDEO" : "IMAGE"}</span>
                  </div>
                  <div className="ca-media-asset-details">
                    <strong title={asset.name}>{asset.name}</strong>
                    <span>{formatSize(asset.size)} · {new Date(asset.uploadedAt).toLocaleDateString()}</span>
                    <div className="ca-media-asset-url">
                      <code>{asset.url}</code>
                      <button
                        aria-label={`Copy URL for ${asset.name}`}
                        className="ca-icon-button"
                        onClick={() => void copyAssetUrl(asset.url)}
                        title="Copy URL"
                        type="button"
                      >
                        {feedback === `${asset.url} copied to clipboard.` ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
    </section>
  );
}
