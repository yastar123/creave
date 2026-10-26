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
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
