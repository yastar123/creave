import { ArrowUpRight, Inbox, Layers3, RotateCcw, SquarePen } from "lucide-react";

import type { CmsInquiryPage, CmsPageRecord } from "@/lib/cms-client";

type CmsOverviewProps = {
  pages: CmsPageRecord[];
  inquiries?: CmsInquiryPage;
  inquiriesLoading: boolean;
  inquiriesError: boolean;
  onRetryInquiries: () => void;
  onOpenPages: () => void;
  onOpenInbox: () => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CmsOverview({
  pages,
  inquiries,
  inquiriesLoading,
  inquiriesError,
  onRetryInquiries,
  onOpenPages,
  onOpenInbox,
}: CmsOverviewProps) {
  const savedSections = pages.reduce((total, page) => total + page.sections.length, 0);
  const updatedPages = pages.filter((page) => page.updatedAt).length;

  return (
    <div className="ca-module-layout">
      <header className="ca-module-heading">
        <div>
          <p className="ca-overline">STUDIO OVERVIEW</p>
          <h1>Your site, at a glance.</h1>
          <p>Manage website content and keep up with incoming project requests.</p>
        </div>
        <span className="ca-overview-live"><span className="ca-live-indicator" /> Connected to live site</span>
      </header>

      <section className="ca-stat-grid" aria-label="Site summary">
        <article className="ca-stat-card">
          <span>Editable pages</span>
          <strong>{pages.length}</strong>
          <small>Available in the content editor</small>
        </article>
        <article className="ca-stat-card">
          <span>Saved sections</span>
          <strong>{savedSections}</strong>
          <small>{updatedPages} {updatedPages === 1 ? "page has" : "pages have"} saved CMS content</small>
        </article>
        <article className="ca-stat-card">
          <span>Contact requests</span>
          <strong>{inquiriesLoading ? "…" : inquiriesError ? "—" : inquiries?.total ?? 0}</strong>
          <small>{inquiriesError ? "Inbox is temporarily unavailable" : "Submitted through the website form"}</small>
        </article>
      </section>

      <div className="ca-overview-grid">
        <section className="ca-overview-panel">
          <div className="ca-panel-heading">
            <div>
              <p className="ca-overline">LATEST ACTIVITY</p>
              <h2>Contact requests</h2>
            </div>
            <button className="ca-text-action" onClick={onOpenInbox} type="button">
              Open inbox <ArrowUpRight size={15} />
            </button>
          </div>

          {inquiriesLoading && (
            <div className="ca-module-message" role="status">Loading recent requests…</div>
          )}
          {inquiriesError && (
            <div className="ca-module-message ca-module-error" role="alert">
              <span>Recent requests could not be loaded.</span>
              <button className="ca-button ca-button-light" onClick={onRetryInquiries} type="button">
                <RotateCcw size={14} /> Retry
              </button>
            </div>
          )}
          {!inquiriesLoading && !inquiriesError && inquiries?.inquiries.length === 0 && (
            <div className="ca-module-empty">
              <Inbox size={19} />
              <span>No contact requests yet.</span>
            </div>
          )}
          {!inquiriesLoading && !inquiriesError && (inquiries?.inquiries.length ?? 0) > 0 && (
            <div className="ca-recent-list">
              {inquiries?.inquiries.slice(0, 5).map((inquiry) => (
                <button className="ca-recent-row" key={inquiry.id} onClick={onOpenInbox} type="button">
                  <span className="ca-recent-avatar" aria-hidden="true">
                    {inquiry.name.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                  <span className="ca-recent-info">
                    <strong>{inquiry.name}</strong>
                    <span>{inquiry.interest}</span>
                  </span>
                  <time dateTime={inquiry.createdAt}>{formatDate(inquiry.createdAt)}</time>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="ca-overview-panel ca-quick-panel">
          <p className="ca-overline">QUICK ACCESS</p>
          <h2>What would you like to update?</h2>
          <button className="ca-quick-action" onClick={onOpenPages} type="button">
            <span className="ca-quick-icon"><SquarePen size={17} /></span>
            <span><strong>Edit site content</strong><small>Pages, navigation, and footer</small></span>
            <ArrowUpRight size={16} />
          </button>
          <button className="ca-quick-action" onClick={onOpenInbox} type="button">
            <span className="ca-quick-icon"><Layers3 size={17} /></span>
            <span><strong>Review contact requests</strong><small>Search messages from your website</small></span>
            <ArrowUpRight size={16} />
          </button>
        </section>
      </div>
    </div>
  );
}
