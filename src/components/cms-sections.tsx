import { ArrowUpRight } from "lucide-react";

import { usePublicCmsPage } from "@/lib/cms-client";
import type { CmsSection } from "@/lib/cms-shared";

function lines(value: string | undefined) {
  return (value ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
}

function safeHref(value: string | undefined) {
  const href = value?.trim() ?? "";
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(href)) return href;
  return "";
}

function safeImage(value: string | undefined) {
  const url = value?.trim() ?? "";
  return /^(https?:\/\/|\/)/i.test(url) ? url : "";
}

export function CmsSectionPreview({ section }: { section: CmsSection }) {
  const fields = section.fields;
  const items = lines(fields["items"]);
  const title = fields["heading"] || fields["title"] || section.title;
  const body = fields["body"] || "";
  const image = safeImage(fields["image"]);
  const href = safeHref(fields["link"]);

  if (!section.enabled) return null;

  if (section.type === "hero") {
    return (
      <section className="cms-public-section cms-public-hero">
        <span className="eyebrow">{fields["eyebrow"] || section.title}</span>
        <h2>{title}</h2>
        {body && <p>{body}</p>}
        {fields["buttonLabel"] && href && <a className="cms-public-link" href={href}>{fields["buttonLabel"]}<ArrowUpRight size={16} /></a>}
      </section>
    );
  }

  if (section.type === "image-text") {
    return (
      <section className="cms-public-section cms-public-image-text">
        {image && <img src={image} alt={fields["imageAlt"] || ""} loading="lazy" />}
        <div><span className="eyebrow">{fields["eyebrow"] || section.title}</span><h2>{title}</h2>{body && <p>{body}</p>}</div>
      </section>
    );
  }

  if (section.type === "cards" || section.type === "gallery" || section.type === "stats") {
    return (
      <section className={`cms-public-section cms-public-${section.type}`}>
        <span className="eyebrow">{fields["eyebrow"] || section.title}</span>
        <h2>{title}</h2>
        {body && <p>{body}</p>}
        <div className="cms-public-items">{items.map((item, index) => <article key={`${section.id}-${index}`}><span>0{index + 1}</span><p>{item}</p></article>)}</div>
      </section>
    );
  }

  if (section.type === "faq") {
    return (
      <section className="cms-public-section cms-public-faq">
        <span className="eyebrow">{fields["eyebrow"] || section.title}</span>
        <h2>{title}</h2>
        {items.map((item, index) => {
          const [question, ...answer] = item.split("|");
          return <details key={`${section.id}-${index}`}><summary>{question}</summary><p>{answer.join("|").trim()}</p></details>;
        })}
      </section>
    );
  }

  if (section.type === "contact") {
    return (
      <section className="cms-public-section cms-public-contact">
        <span className="eyebrow">{fields["eyebrow"] || section.title}</span>
        <h2>{title}</h2>
        {body && <p>{body}</p>}
        {fields["email"] && <a href={`mailto:${fields["email"]}`}>{fields["email"]}</a>}
        {fields["phone"] && <a href={`tel:${fields["phone"]}`}>{fields["phone"]}</a>}
      </section>
    );
  }

  return (
    <section className={`cms-public-section cms-public-${section.type}`}>
      <span className="eyebrow">{fields["eyebrow"] || section.title}</span>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
      {fields["buttonLabel"] && href && <a className="cms-public-link" href={href}>{fields["buttonLabel"]}<ArrowUpRight size={16} /></a>}
    </section>
  );
}

export function CmsPageSections({ pageId }: { pageId: string }) {
  const query = usePublicCmsPage(pageId);
  if (!pageId || query.isLoading || query.isError || !query.data?.sections.length) return null;

  return <div className="cms-public-sections">{query.data.sections.map((section) => <CmsSectionPreview key={section.id} section={section} />)}</div>;
}
