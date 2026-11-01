import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Database, Plus, Save, Trash2 } from "lucide-react";

import { useAdminSiteContent, useSaveSiteCollection } from "@/lib/cms-client";
import {
  collectionItemIdentity,
  type SiteContentCollection,
} from "@/lib/site-content-shared";
import { defaultWebsitePackages } from "@/lib/studio-content";
import { CmsMediaField } from "./media-field";

import "./collections.css";

const collectionOptions: { key: SiteContentCollection; label: string; description: string }[] = [
  { key: "services", label: "Services", description: "Service copy, homepage video, prices, packages, and service page links." },
  { key: "projects", label: "Projects", description: "Portfolio covers, detail pages, and gallery images or videos." },
  { key: "articles", label: "Articles", description: "Journal articles, cover images or videos, categories, and related services." },
  { key: "gallery", label: "Gallery", description: "Studio images and videos shown throughout the gallery and portfolio." },
  { key: "trustedBy", label: "Trusted by", description: "Client and partner names or approved logos." },
  { key: "socials", label: "Social profiles", description: "Verified social profile links." },
  { key: "legalLinks", label: "Legal links", description: "Privacy and terms links shown in the footer." },
];

function blankRecord(key: SiteContentCollection): Record<string, unknown> {
  const records: Record<SiteContentCollection, Record<string, unknown>> = {
    services: {
      title: "",
      to: "",
      menuNote: "",
      short: "",
      description: "",
      tags: [],
      detail: "",
      image: "",
      video: "",
      price: "",
      packages: [],
    },
    projects: {
      slug: "",
      name: "",
      client: "",
      year: "",
      category: "",
      services: [],
      image: "",
      video: "",
      alt: "",
      title: "",
      description: "",
      challenge: "",
      approach: "",
      result: "",
      gallery: [],
    },
    articles: {
      slug: "",
      category: "",
      title: "",
      excerpt: "",
      date: "",
      author: "",
      body: [],
      related: { label: "", to: "" },
      image: "",
      video: "",
      imageAlt: "",
    },
    gallery: { title: "", category: "", image: "", video: "", alt: "" },
    trustedBy: { name: "", logo: "", url: "" },
    socials: { name: "", url: "" },
    legalLinks: { title: "", to: "" },
  };
  return records[key];
}

function toEditorFields(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      ["tags", "services", "body"].includes(key)
        && Array.isArray(value)
        && value.every((item) => typeof item === "string")
        ? value.join("\n")
        : typeof value === "string"
          ? value
          : JSON.stringify(value, null, 2),
    ]),
  );
}

function prettyFieldName(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function recordLabel(key: SiteContentCollection, record: unknown, index: number) {
  return collectionItemIdentity(key, record) || `Record ${index + 1}`;
}

function parseEditorFields(
  key: SiteContentCollection,
  fields: Record<string, string>,
): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(fields)) {
    if (["image", "imageAlt", "logo", "url", "video", "price"].includes(field) && !value.trim()) {
      continue;
    }
    if (["tags", "services", "body"].includes(field)) {
      record[field] = value.split("\n").map((item) => item.trim()).filter(Boolean);
      continue;
    }
    if (
      (key === "projects" && field === "gallery") ||
      (key === "articles" && field === "related") ||
      (key === "services" && field === "packages")
    ) {
      record[field] = JSON.parse(value);
      continue;
    }
    record[field] = value;
  }
  return record;
}

type ProjectGalleryItem = { image?: string; video?: string; alt: string };
type ServicePackage = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  featured?: boolean;
  badge?: string;
};

function parseProjectGallery(value: string): ProjectGalleryItem[] | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return null;
    if (!parsed.every((item) => item && typeof item === "object" && !Array.isArray(item))) return null;
    return parsed.map((item) => {
      const record = item as Record<string, unknown>;
      return {
        ...(typeof record["image"] === "string" && record["image"] ? { image: record["image"] } : {}),
        ...(typeof record["video"] === "string" && record["video"] ? { video: record["video"] } : {}),
        alt: typeof record["alt"] === "string" ? record["alt"] : "",
      };
    });
  } catch {
    return null;
  }
}

function ProjectGalleryMediaField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const items = parseProjectGallery(value);
  if (!items) {
    return (
      <textarea
        aria-label="Project gallery JSON"
        onChange={(event) => onChange(event.target.value)}
        rows={7}
        value={value}
      />
    );
  }
  const validItems = items;

  function updateItem(index: number, update: (item: ProjectGalleryItem) => ProjectGalleryItem) {
    onChange(JSON.stringify(validItems.map((item, itemIndex) => itemIndex === index ? update(item) : item), null, 2));
  }

  return (
    <div className="ca-nested-gallery">
      {validItems.map((item, index) => (
        <fieldset className="ca-nested-gallery-item" key={index}>
          <legend>Gallery item {index + 1}</legend>
          <label>
            <span>Image</span>
            <CmsMediaField
              label={`Gallery item ${index + 1} image`}
              onChange={(image) => updateItem(index, (current) => {
                const next = { ...current };
                if (image.trim()) next.image = image;
                else delete next.image;
                return next;
              })}
              value={item.image ?? ""}
            />
          </label>
          <label>
            <span>Video</span>
            <CmsMediaField
              label={`Gallery item ${index + 1} video`}
              kind="video"
              onChange={(video) => updateItem(index, (current) => {
                const next = { ...current };
                if (video.trim()) next.video = video;
                else delete next.video;
                return next;
              })}
              value={item.video ?? ""}
            />
          </label>
          <label>
            <span>Alt text</span>
            <input
              aria-label={`Gallery item ${index + 1} alt text`}
              onChange={(event) => updateItem(index, (current) => ({ ...current, alt: event.target.value }))}
              value={item.alt}
            />
          </label>
          <button
            className="ca-button ca-button-danger"
            onClick={() => onChange(JSON.stringify(validItems.filter((_, itemIndex) => itemIndex !== index), null, 2))}
            type="button"
          >
            Remove gallery item
          </button>
        </fieldset>
      ))}
      <button
        className="ca-button ca-button-light"
        onClick={() => onChange(JSON.stringify([...validItems, { alt: "" }], null, 2))}
        type="button"
      >
        Add gallery item
      </button>
      <details>
        <summary>Edit gallery JSON</summary>
        <textarea
          aria-label="Project gallery JSON"
          onChange={(event) => onChange(event.target.value)}
          rows={7}
          value={value}
        />
      </details>
    </div>
  );
}

function parseServicePackages(value: string): ServicePackage[] | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return null;
    if (!parsed.every((item) => item && typeof item === "object" && !Array.isArray(item))) return null;
    return parsed.map((item) => {
      const record = item as Record<string, unknown>;
      const features = record["features"];
      return {
        name: typeof record["name"] === "string" ? record["name"] : "",
        price: typeof record["price"] === "string" ? record["price"] : "",
        ...(typeof record["period"] === "string" ? { period: record["period"] } : {}),
        description: typeof record["description"] === "string" ? record["description"] : "",
        features: Array.isArray(features) && features.every((feature): feature is string => typeof feature === "string")
          ? features
          : [],
        ...(record["featured"] === true ? { featured: true } : {}),
        ...(typeof record["badge"] === "string" ? { badge: record["badge"] } : {}),
      };
    });
  } catch {
    return null;
  }
}

function ServicePackagesField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const packages = parseServicePackages(value);
  if (!packages) {
    return (
      <textarea
        aria-label="Packages JSON"
        onChange={(event) => onChange(event.target.value)}
        rows={7}
        value={value}
      />
    );
  }

  const validPackages = packages;
  function updatePackage(index: number, patch: Partial<ServicePackage>) {
    onChange(JSON.stringify(validPackages.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item,
    ), null, 2));
  }

  return (
    <div className="ca-nested-packages">
      {validPackages.length === 0 && <p>No packages yet. Add the first package below.</p>}
      {validPackages.map((item, index) => (
        <fieldset className="ca-nested-package" key={index}>
          <legend>Package {index + 1}</legend>
          <label>
            <span>Package name</span>
            <input
              aria-label={`Package ${index + 1} name`}
              onChange={(event) => updatePackage(index, { name: event.target.value })}
              value={item.name}
            />
          </label>
          <label>
            <span>Price</span>
            <input
              aria-label={`Package ${index + 1} price`}
              onChange={(event) => updatePackage(index, { price: event.target.value })}
              value={item.price}
            />
          </label>
          <label>
            <span>Price period</span>
            <input
              aria-label={`Package ${index + 1} price period`}
              onChange={(event) => updatePackage(index, { period: event.target.value })}
              value={item.period ?? ""}
            />
          </label>
          <label>
            <span>Badge</span>
            <input
              aria-label={`Package ${index + 1} badge`}
              onChange={(event) => updatePackage(index, { badge: event.target.value })}
              value={item.badge ?? ""}
            />
          </label>
          <label className="ca-package-featured">
            <input
              aria-label={`Package ${index + 1} featured`}
              checked={item.featured ?? false}
              onChange={(event) => updatePackage(index, { featured: event.target.checked })}
              type="checkbox"
            />
            <span>Highlight this package</span>
          </label>
          <label>
            <span>Description</span>
            <textarea
              aria-label={`Package ${index + 1} description`}
              onChange={(event) => updatePackage(index, { description: event.target.value })}
              rows={3}
              value={item.description}
            />
          </label>
          <label>
            <span>Features <em>One item per line</em></span>
            <textarea
              aria-label={`Package ${index + 1} features`}
              onChange={(event) => updatePackage(index, {
                features: event.target.value.split("\n").map((feature) => feature.trim()).filter(Boolean),
              })}
              rows={5}
              value={item.features.join("\n")}
            />
          </label>
          <button
            className="ca-button ca-button-danger"
            onClick={() => onChange(JSON.stringify(validPackages.filter((_, itemIndex) => itemIndex !== index), null, 2))}
            type="button"
          >
            Remove package
          </button>
        </fieldset>
      ))}
      <button
        className="ca-button ca-button-light"
        onClick={() => onChange(JSON.stringify([
          ...validPackages,
          { name: "", price: "", description: "", features: [] },
        ], null, 2))}
        type="button"
      >
        Add package
      </button>
      <details>
        <summary>Edit packages JSON</summary>
        <textarea
          aria-label="Packages JSON"
          onChange={(event) => onChange(event.target.value)}
          rows={7}
          value={value}
        />
      </details>
    </div>
  );
}

export function CmsCollections() {
  const query = useAdminSiteContent();
  const save = useSaveSiteCollection();
  const [activeKey, setActiveKey] = useState<SiteContentCollection>("services");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const [creating, setCreating] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [savedLabel, setSavedLabel] = useState("");

  const items = useMemo(() => query.data?.content[activeKey] ?? [], [activeKey, query.data]);
  const selectedItem = selectedIndex === null ? undefined : items[selectedIndex];
  const itemRecord = selectedItem && typeof selectedItem === "object"
    ? selectedItem as Record<string, unknown>
    : undefined;
  const displayLabel = itemRecord ? recordLabel(activeKey, itemRecord, selectedIndex ?? 0) : "";

  useEffect(() => {
    if (!query.data) return;
    const currentItems = query.data.content[activeKey];
    if (creating) {
      setFields(toEditorFields(blankRecord(activeKey)));
      return;
    }
    const record = selectedIndex === null ? undefined : currentItems[selectedIndex];
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      setSelectedIndex(currentItems.length ? 0 : null);
      setFields({});
      return;
    }
    const recordFields = record as Record<string, unknown>;
    const mergedFields = {
      ...blankRecord(activeKey),
      ...recordFields,
      ...(activeKey === "services"
        && recordFields["to"] === "/web-solutions-namibia"
        && !("packages" in recordFields)
        ? { packages: defaultWebsitePackages }
        : {}),
    };
    setFields(toEditorFields(mergedFields));
  }, [activeKey, creating, query.data, selectedIndex]);

  const itemButtons = useMemo(
    () => items.map((item, index) => ({
      index,
      label: recordLabel(activeKey, item, index),
    })),
    [activeKey, items],
  );

  function confirmDiscard() {
    return !dirty || window.confirm("Discard the unsaved changes to this record?");
  }

  function chooseCollection(value: SiteContentCollection) {
    if (value === activeKey || !confirmDiscard()) return;
    setActiveKey(value);
    setSelectedIndex(0);
    setCreating(false);
    setDirty(false);
    setValidationError("");
    setSavedLabel("");
  }

  function chooseRecord(index: number) {
    if (!confirmDiscard()) return;
    setCreating(false);
    setSelectedIndex(index);
    setDirty(false);
    setValidationError("");
    setSavedLabel("");
  }

  function createRecord() {
    if (!confirmDiscard()) return;
    setCreating(true);
    setSelectedIndex(null);
    setFields(toEditorFields(blankRecord(activeKey)));
    setDirty(false);
    setValidationError("");
    setSavedLabel("");
  }

  async function saveRecord() {
    const currentItems = query.data?.content[activeKey] ?? [];
    let parsed: Record<string, unknown>;
    try {
      parsed = parseEditorFields(activeKey, fields);
    } catch {
      setValidationError("Check the JSON in the nested field. It must be valid JSON.");
      return;
    }

    const nextItems = [...currentItems] as unknown[];
    if (creating) {
      nextItems.push(parsed);
    } else if (selectedIndex !== null && nextItems[selectedIndex] !== undefined) {
      nextItems[selectedIndex] = parsed;
    } else {
      setValidationError("Select an existing record or create a new one.");
      return;
    }

    setValidationError("");
    setSavedLabel("");
    try {
      await save.mutateAsync({ key: activeKey, items: nextItems });
      setCreating(false);
      setSelectedIndex(creating ? nextItems.length - 1 : selectedIndex);
      setDirty(false);
      setSavedLabel("Saved to PostgreSQL");
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "The record could not be saved.");
    }
  }

  async function deleteRecord() {
    if (creating || selectedIndex === null || selectedIndex >= items.length) return;
    if (!window.confirm(`Delete “${displayLabel}” from ${collectionOptions.find((item) => item.key === activeKey)?.label}?`)) return;
    const nextItems = [...items] as unknown[];
    nextItems.splice(selectedIndex, 1);
    setValidationError("");
    setSavedLabel("");
    try {
      await save.mutateAsync({ key: activeKey, items: nextItems });
      setSelectedIndex(nextItems.length ? Math.min(selectedIndex, nextItems.length - 1) : null);
      setDirty(false);
      setSavedLabel("Record deleted");
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "The record could not be deleted.");
    }
  }

  if (query.isLoading) {
    return <div className="ca-collection-loading" role="status">Loading collections from PostgreSQL…</div>;
  }

  if (query.isError) {
    return (
      <section className="ca-collection-error" role="alert">
        <AlertCircle size={19} />
        <div><strong>Collections could not be loaded.</strong><span>{query.error instanceof Error ? query.error.message : "Please check the database connection."}</span></div>
        <button className="ca-button ca-button-light" onClick={() => void query.refetch()} type="button">Retry</button>
      </section>
    );
  }

  const collection = collectionOptions.find((item) => item.key === activeKey);

  return (
    <section className="ca-collections">
      <header className="ca-collections-heading">
        <div>
          <p className="ca-overline">POSTGRESQL CONTENT</p>
          <h1>Content collections</h1>
          <p>Manage the records used by the public site. Changes are saved to PostgreSQL.</p>
        </div>
        <Database size={22} />
      </header>

      <label className="ca-collection-select">
        <span>Collection</span>
        <select
          aria-label="Content collection"
          onChange={(event) => chooseCollection(event.target.value as SiteContentCollection)}
          value={activeKey}
        >
          {collectionOptions.map((option) => (
            <option key={option.key} value={option.key}>{option.label} ({query.data?.content[option.key].length ?? 0})</option>
          ))}
        </select>
      </label>

      <div className="ca-collection-layout">
        <aside className="ca-record-list" aria-label={`${collection?.label ?? "Content"} records`}>
          <div className="ca-record-list-head">
            <span>{collection?.label} <i>{items.length}</i></span>
            <button className="ca-button ca-button-dark" onClick={createRecord} type="button"><Plus size={14} /> New</button>
          </div>
          {itemButtons.length ? itemButtons.map((item) => (
            <button
              aria-current={!creating && selectedIndex === item.index ? "true" : undefined}
              className={`ca-record-button ${!creating && selectedIndex === item.index ? "is-active" : ""}`}
              key={`${item.index}-${item.label}`}
              onClick={() => chooseRecord(item.index)}
              type="button"
            >
              <span>{item.label}</span><small>Record {String(item.index + 1).padStart(2, "0")}</small>
            </button>
          )) : <p className="ca-record-empty">No records yet. Add the first one.</p>}
        </aside>

        <div className="ca-record-editor">
          <div className="ca-record-editor-head">
            <div>
              <p className="ca-overline">{creating ? "NEW RECORD" : "RECORD EDITOR"}</p>
              <h2>{creating ? `New ${collection?.label?.toLowerCase().replace(/s$/, "")}` : displayLabel || "Choose a record"}</h2>
              <p>{collection?.description}</p>
            </div>
            <div className="ca-record-actions">
              {!creating && selectedIndex !== null && (
                <button className="ca-button ca-button-danger" disabled={save.isPending} onClick={() => void deleteRecord()} type="button">
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <button className="ca-button ca-button-dark" disabled={save.isPending || (!creating && selectedIndex === null)} onClick={() => void saveRecord()} type="button">
                <Save size={14} /> {save.isPending ? "Saving…" : "Save record"}
              </button>
            </div>
          </div>

          {items.length === 0 && !creating ? (
            <div className="ca-record-empty-editor"><Database size={22} /><strong>This collection is empty.</strong><span>Create a record to add it back to the live site.</span></div>
          ) : selectedIndex === null && !creating ? (
            <div className="ca-record-empty-editor"><strong>Select a record to edit.</strong></div>
          ) : (
            <div className="ca-record-fields">
              {Object.entries(fields).map(([field, value]) => {
                const complex = (activeKey === "projects" && field === "gallery") ||
                  (activeKey === "articles" && field === "related") ||
                  (activeKey === "services" && field === "packages");
                const isLineList = ["tags", "services", "body"].includes(field);
                const isLongText = ["description", "detail", "challenge", "approach", "result", "excerpt"].includes(field);
                const mediaKind = field === "video" ? "video" : ["image", "logo"].includes(field) ? "image" : null;
                const projectGallery = activeKey === "projects" && field === "gallery";
                const servicePackages = activeKey === "services" && field === "packages";
                return (
                  <label className={`ca-record-field ${complex || isLineList || isLongText ? "is-wide" : ""}`} key={field}>
                    <span>{prettyFieldName(field)}{complex && <em>JSON</em>}{isLineList && <em>One item per line</em>}</span>
                    {projectGallery ? (
                      <ProjectGalleryMediaField
                        onChange={(nextValue) => {
                          setFields((current) => ({ ...current, [field]: nextValue }));
                          setDirty(true);
                          setValidationError("");
                          setSavedLabel("");
                        }}
                        value={value}
                      />
                    ) : servicePackages ? (
                      <ServicePackagesField
                        onChange={(nextValue) => {
                          setFields((current) => ({ ...current, [field]: nextValue }));
                          setDirty(true);
                          setValidationError("");
                          setSavedLabel("");
                        }}
                        value={value}
                      />
                    ) : mediaKind ? (
                      <CmsMediaField
                        label={prettyFieldName(field)}
                        kind={mediaKind}
                        onChange={(nextValue) => {
                          setFields((current) => ({ ...current, [field]: nextValue }));
                          setDirty(true);
                          setValidationError("");
                          setSavedLabel("");
                        }}
                        value={value}
                      />
                    ) : complex || isLineList || isLongText ? (
                      <textarea
                        aria-label={prettyFieldName(field)}
                        rows={complex ? 7 : isLongText ? 4 : 3}
                        value={value}
                        onChange={(event) => {
                          setFields((current) => ({ ...current, [field]: event.target.value }));
                          setDirty(true);
                          setValidationError("");
                          setSavedLabel("");
                        }}
                      />
                    ) : (
                      <input
                        aria-label={prettyFieldName(field)}
                        value={value}
                        onChange={(event) => {
                          setFields((current) => ({ ...current, [field]: event.target.value }));
                          setDirty(true);
                          setValidationError("");
                          setSavedLabel("");
                        }}
                      />
                    )}
                  </label>
                );
              })}
              {validationError && <p className="ca-collection-feedback is-error" role="alert"><AlertCircle size={14} />{validationError}</p>}
              {savedLabel && <p className="ca-collection-feedback" role="status">{savedLabel}</p>}
              {dirty && <p className="ca-collection-unsaved" role="status">Unsaved changes</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
