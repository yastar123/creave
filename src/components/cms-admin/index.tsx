import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  CircleAlert,
  Database,
  Eye,
  FileText,
  GripVertical,
  Inbox,
  Layers3,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";

import {
  useAdminCmsGlobals,
  useAdminCmsPages,
  useAdminInquiries,
  useAdminSiteContent,
  useCreateCmsPage,
  useDeleteCmsPage,
  useSaveCmsGlobal,
  useSaveCmsPage,
  useUpdateCmsPage,
} from "@/lib/cms-client";
import { cmsPages, cmsSectionTypes } from "@/lib/cms-shared";
import type { CmsSection, CmsSectionType } from "@/lib/cms-shared";
import { CMS_PREVIEW_MESSAGE, CMS_PREVIEW_PARAM, CMS_PREVIEW_READY } from "@/lib/cms-preview";
import { CmsInbox } from "./inbox";
import { CmsOverview } from "./overview";
import { CmsCollections } from "./collections";

import "./cms-admin.css";

type GlobalKey = "navbar" | "footer";
type Selection = { kind: "page"; id: string } | { kind: "global"; id: GlobalKey };
type AdminView = "overview" | "pages" | "inquiries" | "collections";
type SaveState = "saved" | "saving" | "error" | "idle";

const sectionLabels: Record<CmsSectionType, string> = {
  hero: "Hero",
  text: "Text",
  "image-text": "Image and text",
  cards: "Cards",
  gallery: "Gallery",
  faq: "FAQ",
  stats: "Stats",
  cta: "Call to action",
  contact: "Contact",
};

const prettyKey = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const cloneSections = (sections: CmsSection[]) =>
  sections.map((section) => ({ ...section, fields: { ...section.fields } }));

const serialize = (value: unknown) => JSON.stringify(value);

const slugify = (value: string) =>
  value.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const sanitizeSlugInput = (value: string) =>
  value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").slice(0, 60);

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function FieldRows({
  entries,
  onRename,
  onChange,
  onDelete,
  onAdd,
  noun = "field",
  allowStructure = true,
}: {
  entries: Record<string, string>;
  onRename: (oldKey: string, newKey: string) => void;
  onChange: (key: string, value: string) => void;
  onDelete: (key: string) => void;
  onAdd: (key: string, value: string) => void;
  noun?: string;
  allowStructure?: boolean;
}) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [addError, setAddError] = useState("");
  const keys = Object.keys(entries);

  function addField() {
    const key = newKey.trim();
    if (!key) {
      setAddError("Add a name before creating this field.");
      return;
    }
    if (Object.prototype.hasOwnProperty.call(entries, key)) {
      setAddError("That field name already exists.");
      return;
    }
    onAdd(key, newValue);
    setNewKey("");
    setNewValue("");
    setAddError("");
  }

  return (
    <div className="ca-fields">
      {keys.length === 0 && (
        <div className="ca-fields-empty">No fields yet. Add the first one below.</div>
      )}
      {keys.map((key) => (
        <div className="ca-field-row" key={key}>
          <label className="ca-field-key">
            {allowStructure ? (
              <>
                <span>Field name</span>
                <input
                  aria-label={`${noun} name`}
                  value={key}
                  onChange={(event) => {
                    const next = event.target.value;
                    if (!next.trim() || (next !== key && Object.prototype.hasOwnProperty.call(entries, next))) return;
                    onRename(key, next);
                  }}
                />
              </>
            ) : <span className="ca-field-key-label">{prettyKey(key)}</span>}
          </label>
          <label className="ca-field-value">
            <span>Value <em>Use a new line for each link or item</em></span>
            <textarea
              aria-label={`${key} value`}
              rows={Math.min(5, Math.max(2, (entries[key] ?? "").split("\n").length))}
              value={entries[key] ?? ""}
              onChange={(event) => onChange(key, event.target.value)}
            />
          </label>
          {allowStructure && <button
            aria-label={`Delete ${key}`}
            className="ca-icon-button ca-remove-field"
            onClick={() => onDelete(key)}
            title={`Delete ${key}`}
            type="button"
          >
            <Trash2 size={15} />
          </button>}
        </div>
      ))}
      {allowStructure && <div className="ca-add-field">
        <label>
          <span>New field name</span>
          <input
            aria-label="New field name"
            onChange={(event) => setNewKey(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addField();
              }
            }}
            placeholder="e.g. buttonLabel"
            value={newKey}
          />
        </label>
        <label className="ca-new-value">
          <span>Starting value</span>
          <input
            aria-label="Starting value"
            onChange={(event) => setNewValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addField();
              }
            }}
            placeholder="Optional"
            value={newValue}
          />
        </label>
        <button className="ca-button ca-button-light" onClick={addField} type="button">
          <Plus size={15} /> Add field
        </button>
        {addError && <span className="ca-inline-error">{addError}</span>}
      </div>}
    </div>
  );
}

function PageLoading() {
  return (
    <div className="ca-loading-state" aria-live="polite">
      <div className="ca-skeleton ca-skeleton-title" />
      <div className="ca-skeleton ca-skeleton-line" />
      <div className="ca-skeleton ca-skeleton-panel" />
      <span>Loading your studio content</span>
    </div>
  );
}

export function CmsDashboard({ onLogout }: { onLogout: () => void }) {
  const pagesQuery = useAdminCmsPages();
  const globalsQuery = useAdminCmsGlobals();
  const inquirySummaryQuery = useAdminInquiries({ page: 1, pageSize: 5, search: "" });
  const savePage = useSaveCmsPage();
  const createPage = useCreateCmsPage();
  const updatePage = useUpdateCmsPage();
  const deletePage = useDeleteCmsPage();
  const saveGlobal = useSaveCmsGlobal();

  const [activeView, setActiveView] = useState<AdminView>("overview");
  const [selection, setSelection] = useState<Selection>({ kind: "page", id: "home" });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem("crevora-cms-sidebar-collapsed") === "1";
    } catch {
      return false;
    }
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [previewFrameReady, setPreviewFrameReady] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [globalContent, setGlobalContent] = useState<Record<string, string>>({});
  const [pageStatus, setPageStatus] = useState<SaveState>("idle");
  const [globalStatus, setGlobalStatus] = useState<SaveState>("idle");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [newSectionType, setNewSectionType] = useState<CmsSectionType>("text");
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [pageTitleDraft, setPageTitleDraft] = useState("");
  const [pageSlugDraft, setPageSlugDraft] = useState("");
  const [pageManagementError, setPageManagementError] = useState("");
  const [sectionError, setSectionError] = useState("");
  const [mutationError, setMutationError] = useState("");
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const dynamicCollectionsQuery = useAdminSiteContent(
    selection.kind === "page" && (selection.id === "case-studies" || selection.id === "journal-articles"),
  );
  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  const pageSaved = useRef<Record<string, string>>({});
  const globalSaved = useRef<Record<GlobalKey, string | undefined>>({ navbar: undefined, footer: undefined });
  const initializedPage = useRef<string | null>(null);
  const initializedGlobal = useRef<GlobalKey | null>(null);
  const pageSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const globalSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSections = useRef(sections);
  latestSections.current = sections;
  const latestGlobal = useRef(globalContent);
  latestGlobal.current = globalContent;

  const pageRecords = pagesQuery.data?.pages ?? [];
  const currentPage = selection.kind === "page"
    ? pageRecords.find((page) => page.id === selection.id)
    : undefined;
  const pageMeta = selection.kind === "page"
    ? currentPage
    : undefined;
  const globalKey = selection.kind === "global" ? selection.id : null;
  const globalTitle = globalKey === "navbar" ? "Navigation" : "Footer";
  const projectPreviewSlug = dynamicCollectionsQuery.data?.content.projects[0]?.slug;
  const articlePreviewSlug = dynamicCollectionsQuery.data?.content.articles[0]?.slug;
  const previewPageId = selection.kind === "global"
    ? "home"
    : selection.id === "case-studies"
      ? (projectPreviewSlug ? "case-studies" : "work")
      : selection.id === "journal-articles"
        ? (articlePreviewSlug ? "journal-articles" : "journal")
        : selection.id;
  const previewRoute = useMemo(() => {
    if (selection.kind === "global") return "/";
    if (selection.id === "case-studies") {
      return projectPreviewSlug ? `/work/${encodeURIComponent(projectPreviewSlug)}` : "/work";
    }
    if (selection.id === "journal-articles") {
      return articlePreviewSlug ? `/journal/${encodeURIComponent(articlePreviewSlug)}` : "/journal";
    }
    const route = pageMeta?.route ?? "/";
    return route.startsWith("/") && !route.startsWith("//") ? route : "/";
  }, [selection, pageMeta?.route, projectPreviewSlug, articlePreviewSlug]);
  const previewSrc = `${previewRoute}${previewRoute.includes("?") ? "&" : "?"}${CMS_PREVIEW_PARAM}=1`;
  const previewGlobals = useMemo(() => {
    const current = globalsQuery.data?.globals ?? { navbar: {}, footer: {} };
    return selection.kind === "global" ? { ...current, [selection.id]: globalContent } : current;
  }, [globalsQuery.data?.globals, selection, globalContent]);
  const previewSections = selection.kind === "page" && selection.id === previewPageId ? sections : undefined;
  const collectionDrivenPage = currentPage?.id === "case-studies" || currentPage?.id === "journal-articles";
  const mobileLayout = typeof window !== "undefined" && window.matchMedia("(max-width: 850px)").matches;
  const sidebarToggleExpanded = mobileLayout ? mobileSidebarOpen : !sidebarCollapsed;
  const sidebarToggleLabel = mobileLayout
    ? (mobileSidebarOpen ? "Close sidebar menu" : "Open sidebar menu")
    : (sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar");

  useEffect(() => {
    try {
      window.localStorage.setItem("crevora-cms-sidebar-collapsed", sidebarCollapsed ? "1" : "0");
    } catch {
      // The sidebar remains usable when browser storage is unavailable.
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    setPreviewFrameReady(false);
  }, [previewSrc]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<unknown>) => {
      if (event.origin !== window.location.origin || event.source !== previewFrameRef.current?.contentWindow) return;
      if (!event.data || typeof event.data !== "object" || !("type" in event.data) || !("pageId" in event.data)) return;
      if (event.data.type === CMS_PREVIEW_READY && event.data.pageId === previewPageId) setPreviewFrameReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [previewPageId]);

  useEffect(() => {
    if (!previewFrameReady) return;
    previewFrameRef.current?.contentWindow?.postMessage({
      type: CMS_PREVIEW_MESSAGE,
      pageId: previewPageId,
      sections: previewSections,
      globals: previewGlobals,
    }, window.location.origin);
  }, [previewFrameReady, previewPageId, previewSections, previewGlobals]);

  const pageGroups = useMemo(() => [
    { title: "Core", ids: ["home", "about", "services", "contact"] },
    { title: "Services", ids: ["social-media-management", "brand-identity", "creative-visuals", "web-solutions"] },
    { title: "Work & journal", ids: ["social-media-portfolio", "work", "case-studies", "journal", "journal-articles"] },
    { title: "Legal & system", ids: ["privacy-policy", "terms", "maintenance"] },
  ], []);

  useEffect(() => {
    if (selection.kind !== "page" || !currentPage) return;
    setPageTitleDraft(currentPage.title);
    setPageSlugDraft(currentPage.route.startsWith("/pages/")
      ? currentPage.route.slice("/pages/".length)
      : "");
    if (initializedPage.current === selection.id) return;
    initializedPage.current = selection.id;
    const nextSections = cloneSections(currentPage.sections ?? []);
    setSections(nextSections);
    pageSaved.current[selection.id] = serialize(nextSections);
    setActiveSectionId(nextSections[0]?.id ?? null);
    setPageStatus("saved");
    setMutationError("");
  }, [selection, currentPage]);

  useEffect(() => {
    if (!globalKey) return;
    const incoming = globalsQuery.data?.globals?.[globalKey];
    if (!incoming || initializedGlobal.current === globalKey) return;
    initializedGlobal.current = globalKey;
    const next = { ...incoming };
    setGlobalContent(next);
    globalSaved.current[globalKey] = serialize(next);
    setGlobalStatus("saved");
    setMutationError("");
  }, [globalKey, globalsQuery.data]);

  function savePageSnapshot(pageId: string, nextSections: CmsSection[]) {
    const signature = serialize(nextSections);
    if (pageSaved.current[pageId] === signature) return;
    setPageStatus("saving");
    setMutationError("");
    savePage.mutate({ pageId, sections: cloneSections(nextSections) }, {
      onSuccess: () => {
        pageSaved.current[pageId] = signature;
        if (selectionRef.current.kind === "page" && selectionRef.current.id === pageId) {
          setPageStatus(serialize(latestSections.current) === signature ? "saved" : "saving");
        }
      },
      onError: (error) => {
        if (selectionRef.current.kind === "page" && selectionRef.current.id === pageId) {
          setPageStatus("error");
          setMutationError(error instanceof Error ? error.message : "Could not save this page.");
        }
      },
    });
  }

  function saveGlobalSnapshot(key: GlobalKey, content: Record<string, string>) {
    const signature = serialize(content);
    if (globalSaved.current[key] === signature) return;
    setGlobalStatus("saving");
    setMutationError("");
    saveGlobal.mutate({ key, content: { ...content } }, {
      onSuccess: () => {
        globalSaved.current[key] = signature;
        if (selectionRef.current.kind === "global" && selectionRef.current.id === key) {
          setGlobalStatus(serialize(latestGlobal.current) === signature ? "saved" : "saving");
        }
      },
      onError: (error) => {
        if (selectionRef.current.kind === "global" && selectionRef.current.id === key) {
          setGlobalStatus("error");
          setMutationError(error instanceof Error ? error.message : `Could not save the ${key}.`);
        }
      },
    });
  }

  useEffect(() => {
    if (selection.kind !== "page" || initializedPage.current !== selection.id) return;
    if (pageSaved.current[selection.id] === serialize(sections)) return;
    setPageStatus("saving");
    if (pageSaveTimer.current) clearTimeout(pageSaveTimer.current);
    const pageId = selection.id;
    const snapshot = cloneSections(sections);
    pageSaveTimer.current = setTimeout(() => savePageSnapshot(pageId, snapshot), 550);
    return () => {
      if (pageSaveTimer.current) clearTimeout(pageSaveTimer.current);
    };
  }, [sections, selection]);

  useEffect(() => {
    if (!globalKey || initializedGlobal.current !== globalKey) return;
    if (globalSaved.current[globalKey] === serialize(globalContent)) return;
    setGlobalStatus("saving");
    if (globalSaveTimer.current) clearTimeout(globalSaveTimer.current);
    const key = globalKey;
    const snapshot = { ...globalContent };
    globalSaveTimer.current = setTimeout(() => saveGlobalSnapshot(key, snapshot), 550);
    return () => {
      if (globalSaveTimer.current) clearTimeout(globalSaveTimer.current);
    };
  }, [globalContent, globalKey]);

  useEffect(() => () => {
    if (pageSaveTimer.current) clearTimeout(pageSaveTimer.current);
    if (globalSaveTimer.current) clearTimeout(globalSaveTimer.current);
  }, []);

  function flushCurrentSelection() {
    if (pageSaveTimer.current) {
      clearTimeout(pageSaveTimer.current);
      pageSaveTimer.current = null;
    }
    if (globalSaveTimer.current) {
      clearTimeout(globalSaveTimer.current);
      globalSaveTimer.current = null;
    }
    if (selection.kind === "page" && initializedPage.current === selection.id) {
      savePageSnapshot(selection.id, latestSections.current);
    } else if (selection.kind === "global" && initializedGlobal.current === selection.id) {
      saveGlobalSnapshot(selection.id, latestGlobal.current);
    }
  }

  function openView(view: AdminView) {
    if (activeView === "pages" && view !== "pages") flushCurrentSelection();
    setActiveView(view);
  }

  async function submitNewPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPageManagementError("");
    try {
      const result = await createPage.mutateAsync({ title: newPageTitle, slug: newPageSlug });
      const page = result.page;
      setIsCreatingPage(false);
      setNewPageTitle("");
      setNewPageSlug("");
      setActiveView("pages");
      setSelection({ kind: "page", id: page.id });
      setSectionError("");
    } catch (error) {
      setPageManagementError(error instanceof Error ? error.message : "Could not create this page.");
    }
  }

  async function savePageDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selection.kind !== "page" || !currentPage?.isCustom) return;
    setPageManagementError("");
    try {
      await updatePage.mutateAsync({
        pageId: currentPage.id,
        title: pageTitleDraft,
        slug: pageSlugDraft,
      });
    } catch (error) {
      setPageManagementError(error instanceof Error ? error.message : "Could not update this page.");
    }
  }

  async function removeCurrentPage() {
    if (selection.kind !== "page" || !currentPage?.isCustom) return;
    if (!window.confirm(`Delete “${currentPage.title}” and all of its saved sections? This cannot be undone.`)) return;
    if (pageSaveTimer.current) {
      clearTimeout(pageSaveTimer.current);
      pageSaveTimer.current = null;
    }
    setPageManagementError("");
    try {
      await deletePage.mutateAsync(currentPage.id);
      initializedPage.current = null;
      setSections([]);
      setSelection({ kind: "page", id: "home" });
      setActiveView("pages");
    } catch (error) {
      setPageManagementError(error instanceof Error ? error.message : "Could not delete this page.");
    }
  }

  function choose(next: Selection) {
    flushCurrentSelection();
    setSelection(next);
    setSectionError("");
  }

  function updateSection(sectionId: string, update: (section: CmsSection) => CmsSection) {
    setSections((current) => current.map((section) => section.id === sectionId ? update(section) : section));
  }

  function addSection() {
    const type = newSectionType;
    const section: CmsSection = {
      id: makeId(),
      type,
      title: sectionLabels[type],
      enabled: true,
      fields: { heading: "", body: "" },
    };
    setSections((current) => [...current, section]);
    setActiveSectionId(section.id);
    setSectionError("");
  }

  function deleteSection(sectionId: string) {
    const section = sections.find((item) => item.id === sectionId);
    if (!section || !window.confirm(`Delete “${section.title || sectionLabels[section.type]}” from this page?`)) return;
    const nextSections = sections.filter((item) => item.id !== sectionId);
    setSections(nextSections);
    setActiveSectionId(nextSections[0]?.id ?? null);
  }

  function moveSection(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= sections.length) return;
    setSections((current) => {
      const reordered = [...current];
      const selected = reordered[index];
      const target = reordered[destination];
      if (!selected || !target) return reordered;
      reordered[index] = target;
      reordered[destination] = selected;
      return reordered;
    });
  }

  function updateGlobal(next: Record<string, string>) {
    setGlobalContent(next);
    setGlobalStatus("saving");
  }

  function statusLabel(status: SaveState) {
    if (status === "saving") return "Saving changes";
    if (status === "error") return "Could not save";
    return "All changes saved";
  }

  const currentStatus = selection.kind === "page" ? pageStatus : globalStatus;

  if (pagesQuery.isLoading || globalsQuery.isLoading) {
    return <div className="ca-shell"><PageLoading /></div>;
  }

  if (pagesQuery.isError || globalsQuery.isError) {
    const error = pagesQuery.error ?? globalsQuery.error;
    return (
      <div className="ca-shell">
        <div className="ca-fetch-error" role="alert">
          <div className="ca-error-icon"><CircleAlert size={20} /></div>
          <p className="ca-overline">CMS CONNECTION</p>
          <h1>Content could not be loaded.</h1>
          <p>{error instanceof Error ? error.message : "Check your connection and try again."}</p>
          <button className="ca-button ca-button-dark" onClick={() => {
            void pagesQuery.refetch();
            void globalsQuery.refetch();
          }} type="button"><RotateCcw size={15} /> Retry</button>
        </div>
      </div>
    );
  }

  if (selection.kind === "page" && !currentPage) {
    return (
      <div className="ca-shell">
        <div className="ca-fetch-error" role="alert">
          <div className="ca-error-icon"><FileText size={20} /></div>
          <p className="ca-overline">PAGE NOT FOUND</p>
          <h1>This page is not available in the CMS.</h1>
          <button className="ca-button ca-button-dark" onClick={() => choose({ kind: "page", id: pageRecords[0]?.id ?? "home" })} type="button">
            <RotateCcw size={15} /> Return to pages
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className={`ca-shell ${sidebarCollapsed ? "is-sidebar-collapsed" : ""} ${mobileSidebarOpen ? "is-mobile-sidebar-open" : ""}`}>
      <aside className="ca-sidebar">
        <div className="ca-brand">
          <div className="ca-brand-identity">
            <img className="ca-brand-logo" src="/crevora-logo.png" alt="CREVORA" />
            <span>STUDIO CMS</span>
          </div>
        </div>
        <div className="ca-workspace-nav">
          <div className="ca-sidebar-label">WORKSPACE</div>
          <button
            aria-current={activeView === "overview" ? "page" : undefined}
            className={`ca-nav-item ${activeView === "overview" ? "is-active" : ""}`}
            onClick={() => openView("overview")}
            title="Overview"
            type="button"
          >
            <LayoutDashboard size={15} className="ca-nav-icon" />
            <span>Overview</span>
          </button>
          <button
            aria-current={activeView === "inquiries" ? "page" : undefined}
            className={`ca-nav-item ${activeView === "inquiries" ? "is-active" : ""}`}
            onClick={() => openView("inquiries")}
            title="Inbox"
            type="button"
          >
            <Inbox size={15} className="ca-nav-icon" />
            <span>Inbox</span>
            {inquirySummaryQuery.data && <span className="ca-nav-count">{inquirySummaryQuery.data.total}</span>}
          </button>
          <button
            aria-current={activeView === "collections" ? "page" : undefined}
            className={`ca-nav-item ${activeView === "collections" ? "is-active" : ""}`}
            onClick={() => openView("collections")}
            title="Data collections"
            type="button"
          >
            <Database size={15} className="ca-nav-icon" />
            <span>Data collections</span>
          </button>
        </div>
        <div className="ca-sidebar-label">
          SITE CONTENT
          <button
            aria-label="Create page"
            className="ca-sidebar-add"
            onClick={() => {
              setIsCreatingPage((open) => !open);
              setPageManagementError("");
            }}
            title="Create page"
            type="button"
          ><Plus size={14} /></button>
          <span>{pageRecords.length} PAGES</span>
        </div>
        <nav aria-label="CMS content">
          {pageGroups.map((group) => (
            <div className="ca-nav-group" key={group.title}>
              <p>{group.title}</p>
              {group.ids.map((id) => {
                const page = cmsPages.find((entry) => entry.id === id);
                if (!page) return null;
                const exists = pageRecords.some((record) => record.id === id);
                return (
                  <button
                    aria-current={activeView === "pages" && selection.kind === "page" && selection.id === id ? "page" : undefined}
                    aria-label={page.title}
                    className={`ca-nav-item ${activeView === "pages" && selection.kind === "page" && selection.id === id ? "is-active" : ""}`}
                    disabled={!exists}
                    key={id}
                    onClick={() => {
                      setActiveView("pages");
                      choose({ kind: "page", id });
                    }}
                    title={page.title}
                    type="button"
                  >
                    <FileText size={14} className="ca-nav-icon" />
                    <span>{page.title}</span>
                    <span className="ca-nav-route">{page.route}</span>
                  </button>
                );
              })}
            </div>
          ))}
          {pageRecords.some((page) => page.isCustom) && (
            <div className="ca-nav-group">
              <p>Custom pages</p>
              {pageRecords.filter((page) => page.isCustom).map((page) => (
                <button
                  aria-current={activeView === "pages" && selection.kind === "page" && selection.id === page.id ? "page" : undefined}
                  aria-label={page.title}
                  className={`ca-nav-item ${activeView === "pages" && selection.kind === "page" && selection.id === page.id ? "is-active" : ""}`}
                  key={page.id}
                  onClick={() => {
                    setActiveView("pages");
                    choose({ kind: "page", id: page.id });
                  }}
                  title={page.title}
                  type="button"
                >
                  <FileText size={14} className="ca-nav-icon" />
                  <span>{page.title}</span>
                  <span className="ca-nav-route">{page.route}</span>
                </button>
              ))}
            </div>
          )}
          {isCreatingPage && (
            <form className="ca-create-page-form" onSubmit={(event) => void submitNewPage(event)}>
              <label>
                <span>Page title</span>
                <input
                  autoFocus
                  maxLength={120}
                  onChange={(event) => {
                    const title = event.target.value;
                    setNewPageTitle(title);
                    setNewPageSlug(slugify(title));
                  }}
                  placeholder="e.g. Our approach"
                  required
                  value={newPageTitle}
                />
              </label>
              <label>
                <span>URL slug</span>
                <input
                  maxLength={60}
                  onChange={(event) => setNewPageSlug(sanitizeSlugInput(event.target.value))}
                  placeholder="our-approach"
                  required
                  value={newPageSlug}
                />
              </label>
              <small>Creates a page at /pages/{newPageSlug || "your-slug"}.</small>
              <div>
                <button className="ca-create-page-submit" disabled={createPage.isPending} type="submit">
                  {createPage.isPending ? "Creating…" : "Create page"}
                </button>
                <button className="ca-create-page-cancel" onClick={() => setIsCreatingPage(false)} type="button">Cancel</button>
              </div>
            </form>
          )}
        </nav>
        <div className="ca-sidebar-shared">
          <div className="ca-sidebar-label">SHARED CONTENT</div>
          {(["navbar", "footer"] as const).map((key) => (
            <button
              aria-current={activeView === "pages" && selection.kind === "global" && selection.id === key ? "page" : undefined}
              className={`ca-nav-item ${activeView === "pages" && selection.kind === "global" && selection.id === key ? "is-active" : ""}`}
              key={key}
              onClick={() => {
                setActiveView("pages");
                choose({ kind: "global", id: key });
              }}
              title={key === "navbar" ? "Navigation" : "Footer"}
              type="button"
            >
              <Layers3 size={14} className="ca-nav-icon" />
              <span>{key === "navbar" ? "Navigation" : "Footer"}</span>
              <span className="ca-nav-shared-mark">GLOBAL</span>
            </button>
          ))}
        </div>
        <div className="ca-sidebar-foot">
          <span className="ca-live-indicator" /> Connected to live site
        </div>
      </aside>

      <section className="ca-workspace">
        <header className="ca-topbar">
          <div className="ca-topbar-left">
            <div className="ca-breadcrumb">
              <span>{activeView === "overview" ? "WORKSPACE" : activeView === "inquiries" ? "INBOX" : activeView === "collections" ? "DATA" : "CONTENT"}</span>
              <i>/</i>
              <strong>{activeView === "overview" ? "Overview" : activeView === "inquiries" ? "Contact requests" : activeView === "collections" ? "Content collections" : selection.kind === "page" ? pageMeta?.title : globalTitle}</strong>
            </div>
            <button
              aria-label={sidebarToggleLabel}
              aria-expanded={sidebarToggleExpanded}
              className="ca-sidebar-toggle"
              onClick={() => {
                if (window.matchMedia("(max-width: 850px)").matches) {
                  setMobileSidebarOpen((open) => !open);
                } else {
                  setSidebarCollapsed((collapsed) => !collapsed);
                }
              }}
              title={sidebarToggleLabel}
              type="button"
            >
              {sidebarToggleExpanded ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
          </div>
          {activeView === "pages" && (
            <>
              <label className="ca-mobile-select-wrap">
                <span className="ca-visually-hidden">Choose content</span>
                <select
                  aria-label="Choose page or shared content"
                  className="ca-mobile-selector"
                  onChange={(event) => {
                    const [kind, id = ""] = event.target.value.split(":");
                    if (kind === "global" && (id === "navbar" || id === "footer")) choose({ kind: "global", id });
                    if (kind === "page" && id) choose({ kind: "page", id });
                  }}
                  value={`${selection.kind}:${selection.id}`}
                >
                  <optgroup label="Pages">
                    {pageRecords.map((page) => (
                      <option key={page.id} value={`page:${page.id}`}>{page.title}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Shared content">
                    <option value="global:navbar">Navigation</option>
                    <option value="global:footer">Footer</option>
                  </optgroup>
                </select>
              </label>
              <div className={`ca-save-status status-${currentStatus}`} aria-live="polite">
                {currentStatus === "saving" ? <LoaderCircle size={15} className="ca-spin" /> :
                  currentStatus === "error" ? <CircleAlert size={15} /> : <Check size={15} />}
                <span>{statusLabel(currentStatus)}</span>
              </div>
            </>
          )}
          <button className="ca-logout-button" onClick={onLogout} type="button">
            <LogOut size={14} /> Sign out
          </button>
        </header>

        {activeView === "pages" && mutationError && (
          <div className="ca-save-error" role="alert">
            <CircleAlert size={16} /><span>{mutationError}</span>
            <button onClick={() => setMutationError("")} aria-label="Dismiss error" type="button"><X size={15} /></button>
          </div>
        )}
        {activeView === "pages" && pageManagementError && (
          <div className="ca-save-error" role="alert">
            <CircleAlert size={16} /><span>{pageManagementError}</span>
            <button onClick={() => setPageManagementError("")} aria-label="Dismiss page error" type="button"><X size={15} /></button>
          </div>
        )}

        {activeView === "overview" ? (
          <CmsOverview
            pages={pageRecords}
            {...(inquirySummaryQuery.data ? { inquiries: inquirySummaryQuery.data } : {})}
            inquiriesLoading={inquirySummaryQuery.isLoading}
            inquiriesError={inquirySummaryQuery.isError}
            onRetryInquiries={() => void inquirySummaryQuery.refetch()}
            onOpenPages={() => openView("pages")}
            onOpenInbox={() => openView("inquiries")}
          />
        ) : activeView === "inquiries" ? (
          <CmsInbox />
        ) : activeView === "collections" ? (
          <CmsCollections />
        ) : (
        <div className={`ca-content-layout ${previewExpanded ? "is-preview-expanded" : ""}`}>
          <div className="ca-editor-column">
            <div className="ca-page-heading">
              <div>
                <p className="ca-overline">{selection.kind === "page" ? "PAGE EDITOR" : "SHARED SITE CONTENT"}</p>
                <h1>{selection.kind === "page" ? pageMeta?.title : globalTitle}</h1>
                <p className="ca-page-description">
                  {selection.kind === "page"
                    ? <>Editing <code>{pageMeta?.route}</code><span className="ca-heading-divider">·</span>{sections.length} {sections.length === 1 ? "section" : "sections"}</>
                    : `Changes appear across the entire site.`}
                </p>
              </div>
              <div className="ca-page-glyph">{selection.kind === "page" ? <FileText size={22} /> : <Layers3 size={22} />}</div>
            </div>

            {selection.kind === "page" ? (
              <>
                {currentPage?.isCustom && (
                  <form className="ca-custom-page-settings" onSubmit={(event) => void savePageDetails(event)}>
                    <label>
                      <span>Page title</span>
                      <input
                        maxLength={120}
                        onChange={(event) => setPageTitleDraft(event.target.value)}
                        required
                        value={pageTitleDraft}
                      />
                    </label>
                    <label>
                      <span>URL slug</span>
                      <div className="ca-page-slug-input"><span>/pages/</span><input
                        maxLength={60}
                        onChange={(event) => setPageSlugDraft(sanitizeSlugInput(event.target.value))}
                        required
                        value={pageSlugDraft}
                      /></div>
                    </label>
                    <button className="ca-button ca-button-light" disabled={updatePage.isPending} type="submit">
                      {updatePage.isPending ? "Saving…" : "Save page details"}
                    </button>
                    <button className="ca-button ca-button-danger" disabled={deletePage.isPending} onClick={() => void removeCurrentPage()} type="button">
                      <Trash2 size={14} /> Delete page
                    </button>
                  </form>
                )}
                {collectionDrivenPage ? (
                  <div className="ca-collection-editor-note">
                    <div><Database size={19} /></div>
                    <span className="ca-overline">CONTENT RECORDS</span>
                    <h2>Keep the public page layout intact.</h2>
                    <p>Project and article pages use their live collection records, including their text and images. Edit those records in Data collections.</p>
                    <button className="ca-button ca-button-dark" onClick={() => openView("collections")} type="button">
                      <Database size={14} /> Open data collections
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="ca-section-toolbar">
                      <div><span className="ca-overline">{currentPage?.isCustom ? "PAGE STRUCTURE" : "PAGE CONTENT"}</span><span className="ca-count">{sections.length.toString().padStart(2, "0")}</span></div>
                      {currentPage?.isCustom && <div className="ca-add-section-control">
                        <label className="ca-visually-hidden" htmlFor="ca-section-type">Section type</label>
                        <select id="ca-section-type" onChange={(event) => setNewSectionType(event.target.value as CmsSectionType)} value={newSectionType}>
                          {cmsSectionTypes.map((type) => <option key={type} value={type}>{sectionLabels[type]}</option>)}
                        </select>
                        <button className="ca-button ca-button-dark" onClick={addSection} type="button"><Plus size={16} /> Add section</button>
                      </div>}
                    </div>

                    {sectionError && <div className="ca-inline-error">{sectionError}</div>}

                    {sections.length === 0 ? (
                      <div className="ca-empty-sections">
                        <div><Layers3 size={22} /></div>
                        <h2>{currentPage?.isCustom ? "A clean start." : "No page content found."}</h2>
                        <p>{currentPage?.isCustom ? "This page has no sections yet. Add one to begin building its content." : "The page content could not be loaded."}</p>
                        {currentPage?.isCustom && <button className="ca-button ca-button-dark" onClick={addSection} type="button"><Plus size={15} /> Add first section</button>}
                      </div>
                    ) : (
                      <div className="ca-section-list">
                        {sections.map((section, index) => {
                          const expanded = activeSectionId === section.id;
                          return (
                            <article className={`ca-section-card ${expanded ? "is-expanded" : ""} ${!section.enabled ? "is-disabled" : ""}`} key={section.id}>
                              <div className="ca-section-head">
                                {currentPage?.isCustom && <div className="ca-order-grip" aria-label={`Section ${index + 1}`}><GripVertical size={16} /><span>{String(index + 1).padStart(2, "0")}</span></div>}
                                <button className="ca-section-toggle" onClick={() => setActiveSectionId(expanded ? null : section.id)} type="button" aria-expanded={expanded}>
                                  <div className="ca-section-title-wrap">
                                    <strong>{section.title || sectionLabels[section.type]}</strong>
                                    <span>{sectionLabels[section.type]} <i>·</i> {Object.keys(section.fields).length} {Object.keys(section.fields).length === 1 ? "field" : "fields"}</span>
                                  </div>
                                  <ChevronDown size={17} className="ca-chevron" />
                                </button>
                                {currentPage?.isCustom && <div className="ca-section-actions">
                                  <button className="ca-icon-button" disabled={index === 0} onClick={() => moveSection(index, -1)} title="Move section up" type="button"><ArrowUp size={15} /></button>
                                  <button className="ca-icon-button" disabled={index === sections.length - 1} onClick={() => moveSection(index, 1)} title="Move section down" type="button"><ArrowDown size={15} /></button>
                                  <button
                                    className={`ca-switch ${section.enabled ? "is-on" : ""}`}
                                    aria-label={section.enabled ? "Disable section" : "Enable section"}
                                    aria-pressed={section.enabled}
                                    onClick={() => updateSection(section.id, (item) => ({ ...item, enabled: !item.enabled }))}
                                    title={section.enabled ? "Section is enabled" : "Section is disabled"}
                                    type="button"
                                  ><span /></button>
                                  <button className="ca-icon-button ca-delete-button" onClick={() => deleteSection(section.id)} title="Delete section" type="button"><Trash2 size={15} /></button>
                                </div>}
                              </div>
                              {expanded && (
                                <div className="ca-section-body">
                                  {currentPage?.isCustom && <div className="ca-section-settings">
                                    <label className="ca-title-control">
                                      <span>Section title</span>
                                      <input value={section.title} onChange={(event) => updateSection(section.id, (item) => ({ ...item, title: event.target.value }))} />
                                    </label>
                                    <label className="ca-title-control ca-type-control">
                                      <span>Layout</span>
                                      <select value={section.type} onChange={(event) => updateSection(section.id, (item) => ({ ...item, type: event.target.value as CmsSectionType }))}>
                                        {cmsSectionTypes.map((type) => <option key={type} value={type}>{sectionLabels[type]}</option>)}
                                      </select>
                                    </label>
                                  </div>}
                                  <div className="ca-fields-heading"><span>CONTENT FIELDS</span><span>Visible on the public page</span></div>
                                  <FieldRows
                                    entries={section.fields}
                                    onRename={(oldKey, newKey) => updateSection(section.id, (item) => {
                                      const fields = { ...item.fields };
                                      const value = fields[oldKey] ?? "";
                                      delete fields[oldKey];
                                      fields[newKey] = value;
                                      return { ...item, fields };
                                    })}
                                    onChange={(key, value) => updateSection(section.id, (item) => ({ ...item, fields: { ...item.fields, [key]: value } }))}
                                    onDelete={(key) => updateSection(section.id, (item) => {
                                      const fields = { ...item.fields };
                                      delete fields[key];
                                      return { ...item, fields };
                                    })}
                                    onAdd={(key, value) => updateSection(section.id, (item) => ({ ...item, fields: { ...item.fields, [key]: value } }))}
                                    noun="section field"
                                    allowStructure={Boolean(currentPage?.isCustom)}
                                  />
                                </div>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="ca-global-editor">
                <div className="ca-global-intro">
                  <span className="ca-global-chip">{globalKey === "navbar" ? "SHARED NAVIGATION" : "SHARED FOOTER"}</span>
                  <h2>{globalKey === "navbar" ? "One header, every page." : "The close to every story."}</h2>
                  <p>These values are shared across the live site. Add any field names your site uses; use separate lines for lists of links.</p>
                </div>
                <FieldRows
                  entries={globalContent}
                  onRename={(oldKey, newKey) => {
                    const next = { ...globalContent };
                    const value = next[oldKey] ?? "";
                    delete next[oldKey];
                    next[newKey] = value;
                    updateGlobal(next);
                  }}
                  onChange={(key, value) => updateGlobal({ ...globalContent, [key]: value })}
                  onDelete={(key) => {
                    const next = { ...globalContent };
                    delete next[key];
                    updateGlobal(next);
                  }}
                  onAdd={(key, value) => updateGlobal({ ...globalContent, [key]: value })}
                  noun="global field"
                />
              </div>
            )}
            <div className="ca-editor-bottom">
              <span><span className="ca-live-indicator" /> Edits save automatically</span>
              {currentStatus === "error" && (
                <button className="ca-button ca-button-light" onClick={() => selection.kind === "page" ? savePageSnapshot(selection.id, sections) : saveGlobalSnapshot(selection.id, globalContent)} type="button">
                  <Save size={14} /> Try again
                </button>
              )}
            </div>
          </div>

          <aside className="ca-preview-column">
            <div className="ca-preview-heading">
              <div><Eye size={16} /><span>LIVE PREVIEW</span></div>
              <div className="ca-preview-heading-actions">
                <span className="ca-preview-label">{previewFrameReady ? "DRAFT CONNECTED" : "LOADING PUBLIC PAGE"}</span>
                <button
                  aria-label={previewExpanded ? "Return to editor" : "Expand public preview"}
                  className="ca-preview-expand"
                  onClick={() => setPreviewExpanded((expanded) => !expanded)}
                  title={previewExpanded ? "Return to editor" : "Expand public preview"}
                  type="button"
                >
                  {previewExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
              </div>
            </div>
            <div className="ca-preview-frame">
              <div className="ca-preview-device">
                <div className="ca-preview-browser"><span /><span /><span /><i>{previewRoute}</i></div>
                <iframe
                  key={previewSrc}
                  ref={previewFrameRef}
                  className="ca-public-preview-frame"
                  src={previewSrc}
                  title={`Public site preview for ${selection.kind === "page" ? pageMeta?.title ?? "this page" : globalTitle}`}
                  loading="eager"
                />
              </div>
            </div>
            <div className="ca-preview-note">
              <div className="ca-note-mark"><Eye size={15} /></div>
              <p><strong>This is the public page.</strong> It uses the same layout, typography, and image assets as the live site, with your current draft content applied.</p>
            </div>
            {selection.kind === "page" && currentPage?.updatedAt && (
              <div className="ca-last-updated">
                <span>LAST PUBLISHED UPDATE</span>
                <time dateTime={currentPage.updatedAt}>{new Date(currentPage.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time>
              </div>
            )}
          </aside>
        </div>
        )}
      </section>
    </main>
  );
}

export default CmsDashboard;
