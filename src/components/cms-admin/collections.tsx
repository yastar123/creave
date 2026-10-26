import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Database, Plus, Save, Trash2 } from "lucide-react";

import { useAdminSiteContent, useSaveSiteCollection } from "@/lib/cms-client";
import {
  collectionItemIdentity,
  type SiteContentCollection,
} from "@/lib/site-content-shared";

import "./collections.css";

const collectionOptions: { key: SiteContentCollection; label: string; description: string }[] = [
  { key: "services", label: "Services", description: "Service cards, service page links, and the services menu." },
  { key: "projects", label: "Projects", description: "Portfolio entries and project detail pages." },
  { key: "articles", label: "Articles", description: "Journal articles, categories, and related service links." },
  { key: "gallery", label: "Gallery", description: "Studio visuals shown in the gallery and portfolio." },
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
    },
    projects: {
      slug: "",
      name: "",
      client: "",
      year: "",
      category: "",
      services: [],
      image: "",
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
    },
    gallery: { title: "", category: "", image: "", alt: "" },
    trustedBy: { name: "" },
    socials: { name: "", url: "" },
    legalLinks: { title: "", to: "" },
  };
  return records[key];
}

function toEditorFields(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      Array.isArray(value) && value.every((item) => typeof item === "string")
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
    if ((field === "image" || field === "imageAlt" || field === "logo" || field === "url") && !value.trim()) {
      continue;
    }
    if (["tags", "services", "body"].includes(field)) {
      record[field] = value.split("\n").map((item) => item.trim()).filter(Boolean);
      continue;
    }
    if ((key === "projects" && field === "gallery") || (key === "articles" && field === "related")) {
      record[field] = JSON.parse(value);
      continue;
    }
    record[field] = value;
  }
  return record;
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
    setFields(toEditorFields(record as Record<string, unknown>));
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
                const complex = (activeKey === "projects" && field === "gallery") || (activeKey === "articles" && field === "related");
                const isLineList = ["tags", "services", "body"].includes(field);
                const isLongText = ["description", "detail", "challenge", "approach", "result", "excerpt"].includes(field);
                return (
                  <label className={`ca-record-field ${complex || isLineList || isLongText ? "is-wide" : ""}`} key={field}>
                    <span>{prettyFieldName(field)}{complex && <em>JSON</em>}{isLineList && <em>One item per line</em>}</span>
                    {complex || isLineList || isLongText ? (
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
