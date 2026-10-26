import { useDeferredValue, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, CircleAlert, Mail, Phone, RotateCcw, Search } from "lucide-react";

import { useAdminInquiries } from "@/lib/cms-client";

const pageSize = 12;

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CmsInbox() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const search = useDeferredValue(searchText.trim());
  const query = useAdminInquiries({ page, pageSize, search });
  const inquiries = query.data?.inquiries ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="ca-module-layout">
      <header className="ca-module-heading">
        <div>
          <p className="ca-overline">WEBSITE ENQUIRIES</p>
          <h1>Contact inbox</h1>
          <p>Review project requests submitted through your contact form.</p>
        </div>
        <span className="ca-inbox-total">{query.isLoading ? "…" : total} requests</span>
      </header>

      <div className="ca-inbox-toolbar">
        <label className="ca-inbox-search">
          <Search size={16} aria-hidden="true" />
          <span className="ca-visually-hidden">Search contact requests</span>
          <input
            onChange={(event) => {
              setSearchText(event.target.value);
              setPage(1);
              setExpandedId(null);
            }}
            placeholder="Search name, company, email, or message"
            type="search"
            value={searchText}
          />
        </label>
        {query.isFetching && !query.isLoading && <span className="ca-inbox-refresh" role="status">Updating…</span>}
      </div>

      {query.isError && (
        <div className="ca-inbox-error" role="alert">
          <CircleAlert size={18} />
          <div><strong>Inbox could not be loaded.</strong><span>{query.error instanceof Error ? query.error.message : "Check your connection and try again."}</span></div>
          <button className="ca-button ca-button-light" onClick={() => void query.refetch()} type="button">
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      )}

      {query.isLoading && (
        <div className="ca-module-message" role="status">Loading contact requests…</div>
      )}

      {!query.isLoading && !query.isError && inquiries.length === 0 && (
        <div className="ca-inbox-empty">
          <span className="ca-inbox-empty-icon"><Mail size={22} /></span>
          <h2>{search ? "No matching requests." : "Your inbox is clear."}</h2>
          <p>{search ? "Try another name, company, email, or keyword." : "New project requests from your website will appear here."}</p>
        </div>
      )}

      {!query.isLoading && !query.isError && inquiries.length > 0 && (
        <>
          <div className="ca-inquiry-list">
            {inquiries.map((inquiry) => {
              const expanded = expandedId === inquiry.id;
              return (
                <article className={`ca-inquiry-card ${expanded ? "is-expanded" : ""}`} key={inquiry.id}>
                  <button
                    aria-expanded={expanded}
                    className="ca-inquiry-summary"
                    onClick={() => setExpandedId(expanded ? null : inquiry.id)}
                    type="button"
                  >
                    <span className="ca-inquiry-icon"><Mail size={16} /></span>
                    <span className="ca-inquiry-main">
                      <span className="ca-inquiry-topline">
                        <strong>{inquiry.name}</strong>
                        <time dateTime={inquiry.createdAt}>{formatDate(inquiry.createdAt)}</time>
                      </span>
                      <span className="ca-inquiry-meta">
                        <span>{inquiry.interest}</span>
                        {inquiry.company && <><i>·</i><span>{inquiry.company}</span></>}
                      </span>
                      <span className="ca-inquiry-excerpt">{inquiry.message}</span>
                    </span>
                    <span className="ca-inquiry-open">{expanded ? "Close" : "Details"}</span>
                  </button>
                  {expanded && (
                    <div className="ca-inquiry-details">
                      <p>{inquiry.message}</p>
                      <div className="ca-inquiry-contact">
                        {inquiry.company && <span><Building2 size={14} />{inquiry.company}</span>}
                        <a href={`mailto:${inquiry.email}`}><Mail size={14} />{inquiry.email}</a>
                        <a href={`tel:${inquiry.phone.replace(/[^\d+]/g, "")}`}><Phone size={14} />{inquiry.phone}</a>
                        {inquiry.whatsappOk && <span className="ca-consent-badge">WhatsApp contact permitted</span>}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <nav className="ca-pagination" aria-label="Inbox pages">
            <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</span>
            <div>
              <button
                aria-label="Previous page"
                className="ca-icon-button"
                disabled={page <= 1}
                onClick={() => {
                  setPage((current) => Math.max(1, current - 1));
                  setExpandedId(null);
                }}
                type="button"
              ><ArrowLeft size={16} /></button>
              <span>Page {page} of {totalPages}</span>
              <button
                aria-label="Next page"
                className="ca-icon-button"
                disabled={page >= totalPages}
                onClick={() => {
                  setPage((current) => Math.min(totalPages, current + 1));
                  setExpandedId(null);
                }}
                type="button"
              ><ArrowRight size={16} /></button>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
