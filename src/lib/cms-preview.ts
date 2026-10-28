import { cmsSectionTypes } from "./cms-shared";
import type { CmsSection } from "./cms-shared";
import type { CmsGlobals } from "./cms-client";

export const CMS_PREVIEW_PARAM = "__cms_preview";
export const CMS_PREVIEW_MESSAGE = "crevora:cms-preview";
export const CMS_PREVIEW_READY = "crevora:cms-preview-ready";

export type CmsPreviewUpdate = {
  type: typeof CMS_PREVIEW_MESSAGE;
  pageId: string;
  sections?: CmsSection[];
  globals?: CmsGlobals;
};

export function isCmsPreviewFrame() {
  return typeof window !== "undefined"
    && window.parent !== window
    && new URLSearchParams(window.location.search).get(CMS_PREVIEW_PARAM) === "1";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isSection(value: unknown): value is CmsSection {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.title !== "string") return false;
  if (typeof value.type !== "string" || !cmsSectionTypes.includes(value.type as CmsSection["type"])) return false;
  if (typeof value.enabled !== "boolean" || !isRecord(value.fields)) return false;
  return Object.values(value.fields).every((field) => typeof field === "string");
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((field) => typeof field === "string");
}

export function isCmsPreviewUpdate(value: unknown): value is CmsPreviewUpdate {
  if (!isRecord(value) || value.type !== CMS_PREVIEW_MESSAGE || typeof value.pageId !== "string") return false;
  if (value.sections !== undefined && (!Array.isArray(value.sections) || !value.sections.every(isSection))) return false;
  if (value.globals !== undefined) {
    if (!isRecord(value.globals)
      || !isStringRecord(value.globals.navbar)
      || !isStringRecord(value.globals.footer)) return false;
  }
  return true;
}
