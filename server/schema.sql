CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  company VARCHAR(120),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  interest VARCHAR(120) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  whatsapp_ok BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_consent_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_inquiries_created_at_idx
  ON public.contact_inquiries (created_at DESC);

CREATE TABLE IF NOT EXISTS public.cms_admins (
  email VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cms_pages (
  page_id VARCHAR(100) PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  route TEXT NOT NULL DEFAULT '',
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  sections_seeded BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cms_pages
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS route TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sections_seeded BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS cms_pages_route_unique_idx
  ON public.cms_pages (route)
  WHERE route <> '';

CREATE TABLE IF NOT EXISTS public.cms_globals (
  content_key VARCHAR(40) PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cms_content_collections (
  collection_key VARCHAR(40) PRIMARY KEY,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
