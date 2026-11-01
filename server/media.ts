import { randomUUID } from "node:crypto";
import { mkdir, readdir, rename, stat, unlink } from "node:fs/promises";
import path from "node:path";
import type { Express, NextFunction, Request, Response } from "express";
import { fileTypeFromFile } from "file-type";
import multer from "multer";

import { getAdminSession } from "./auth";

const maxFileSize = 100 * 1024 * 1024;
const allowedTypes: Record<string, string> = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export function registerCmsMediaRoutes(app: Express, mediaDirectory: string) {
  const upload = multer({
    storage: multer.diskStorage({
      destination: (_request, _file, callback) => {
        void mkdir(mediaDirectory, { recursive: true }).then(
          () => callback(null, mediaDirectory),
          (error: unknown) => callback(
            error instanceof Error ? error : new Error("Could not create the media upload directory."),
            mediaDirectory,
          ),
        );
      },
      filename: (_request, _file, callback) => callback(null, `${randomUUID()}.upload`),
    }),
    limits: { fileSize: maxFileSize, files: 1 },
    fileFilter: (_request, file, callback) => {
      if (Object.prototype.hasOwnProperty.call(allowedTypes, file.mimetype)) {
        callback(null, true);
        return;
      }
      callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "file"));
    },
  });

  app.use("/api/cms/admin/media", (request: Request, response: Response, next: NextFunction) => {
    if (!getAdminSession(request)) {
      response.status(401).json({ error: "Sign in to manage site media." });
      return;
    }
    next();
  });

  app.get("/api/cms/admin/media", async (_request, response) => {
    await mkdir(mediaDirectory, { recursive: true });
    const entries = await readdir(mediaDirectory, { withFileTypes: true });
    const assets = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && /^[0-9a-f-]{36}\.(avif|gif|jpg|png|webp|mp4|webm)$/.test(entry.name))
        .map(async (entry) => {
          const filePath = path.join(mediaDirectory, entry.name);
          const [metadata, fileType] = await Promise.all([stat(filePath), fileTypeFromFile(filePath)]);
          if (!fileType) return null;
          return {
            url: `/uploads/${entry.name}`,
            name: entry.name,
            mimeType: fileType.mime,
            size: metadata.size,
            uploadedAt: metadata.mtime.toISOString(),
          };
        }),
    );

    response.setHeader("Cache-Control", "no-store");
    response.json({
      assets: assets.filter((asset): asset is NonNullable<typeof asset> => asset !== null)
        .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt)),
    });
  });

  app.post("/api/cms/admin/media", (request, response, next) => {
    upload.single("file")(request, response, (error: unknown) => {
      if (error instanceof multer.MulterError) {
        response.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
          error: error.code === "LIMIT_FILE_SIZE"
            ? "Choose an image or video smaller than 100 MB."
            : "Upload one JPG, PNG, GIF, WebP, AVIF, MP4, or WebM file.",
        });
        return;
      }
      if (error) {
        next(error);
        return;
      }
      void finishUpload(request, response, mediaDirectory);
    });
  });
}

async function finishUpload(request: Request, response: Response, mediaDirectory: string) {
  const file = request.file;
  if (!file) {
    response.status(400).json({ error: "Choose an image or video to upload." });
    return;
  }

  try {
    const detectedType = await fileTypeFromFile(file.path);
    const extension = detectedType ? allowedTypes[detectedType.mime] : undefined;
    if (!detectedType || !extension) {
      await unlink(file.path);
      response.status(415).json({
        error: "The file contents are not a supported image or video. Use JPG, PNG, GIF, WebP, AVIF, MP4, or WebM.",
      });
      return;
    }

    const filename = `${randomUUID()}.${extension}`;
    await rename(file.path, path.join(mediaDirectory, filename));
    response.status(201).json({
      asset: {
        url: `/uploads/${filename}`,
        name: filename,
        mimeType: detectedType.mime,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    try {
      await unlink(file.path);
    } catch (cleanupError) {
      console.error("Could not clean up an incomplete CMS media upload:", cleanupError);
    }
    console.error("CMS media upload failed:", error);
    response.status(500).json({ error: "The media file could not be saved." });
  }
}
