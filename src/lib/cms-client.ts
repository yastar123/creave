import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CmsPage, CmsSection } from "./cms-shared";
import type { SiteContent, SiteContentCollection } from "./site-content-shared";

export type CmsPageRecord = CmsPage & {
  isCustom: boolean;
  sections: CmsSection[];
  updatedAt: string | null;
};

export type PublicCmsPage = Pick<CmsPage, "id" | "title" | "route"> & {
  isCustom: boolean;
};

export type CmsGlobals = {
  navbar: Record<string, string>;
  footer: Record<string, string>;
};

export type CmsInquiry = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  interest: string;
  message: string;
  whatsappOk: boolean;
  createdAt: string;
};

export type CmsInquiryPage = {
  inquiries: CmsInquiry[];
  total: number;
  page: number;
  pageSize: number;
};

export type CmsSiteContent = SiteContent;

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status}).`);
  }
  return payload;
}

export function useAdminCmsPages() {
  return useQuery({
    queryKey: ["cms", "admin", "pages"],
    queryFn: () => requestJson<{ pages: CmsPageRecord[] }>("/api/cms/admin/pages"),
    retry: false,
  });
}

export function useAdminCmsGlobals() {
  return useQuery({
    queryKey: ["cms", "admin", "globals"],
    queryFn: () => requestJson<{ globals: CmsGlobals }>("/api/cms/admin/globals"),
    retry: false,
  });
}

export function useAdminSiteContent() {
  return useQuery({
    queryKey: ["cms", "admin", "collections"],
    queryFn: () => requestJson<{ content: CmsSiteContent }>("/api/cms/admin/collections"),
    retry: false,
  });
}

export function useSaveSiteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, items }: { key: SiteContentCollection; items: unknown[] }) =>
      requestJson<{ ok: true; collectionKey: SiteContentCollection; items: unknown[] }>(
        `/api/cms/admin/collections/${encodeURIComponent(key)}`,
        { method: "PUT", body: JSON.stringify({ items }) },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cms", "admin", "collections"] });
    },
  });
}

export function useAdminInquiries({
  page,
  pageSize,
  search,
}: {
  page: number;
  pageSize: number;
  search: string;
}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    search,
  });

  return useQuery({
    queryKey: ["cms", "admin", "inquiries", page, pageSize, search],
    queryFn: () => requestJson<CmsInquiryPage>(`/api/cms/admin/inquiries?${params}`),
    retry: false,
  });
}

export function useSaveCmsPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pageId, sections }: { pageId: string; sections: CmsSection[] }) =>
      requestJson<{ ok: true; sections: CmsSection[]; updatedAt: string }>(
        `/api/cms/admin/pages/${encodeURIComponent(pageId)}`,
        { method: "PUT", body: JSON.stringify({ sections }) },
      ),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cms", "admin", "pages"] }),
        queryClient.invalidateQueries({ queryKey: ["cms", "public", variables.pageId] }),
      ]);
    },
  });
}

export function useCreateCmsPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, slug }: { title: string; slug: string }) =>
      requestJson<{ page: CmsPageRecord }>("/api/cms/admin/pages", {
        method: "POST",
        body: JSON.stringify({ title, slug }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cms", "admin", "pages"] });
    },
  });
}

export function useUpdateCmsPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pageId, title, slug }: { pageId: string; title: string; slug: string }) =>
      requestJson<{ page: PublicCmsPage }>(`/api/cms/admin/pages/${encodeURIComponent(pageId)}`, {
        method: "PATCH",
        body: JSON.stringify({ title, slug }),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cms", "admin", "pages"] }),
        queryClient.invalidateQueries({ queryKey: ["cms", "public"] }),
      ]);
    },
  });
}

export function useDeleteCmsPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: string) =>
      requestJson<{ ok: true; pageId: string }>(
        `/api/cms/admin/pages/${encodeURIComponent(pageId)}`,
        { method: "DELETE" },
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cms", "admin", "pages"] }),
        queryClient.invalidateQueries({ queryKey: ["cms", "public"] }),
      ]);
    },
  });
}

export function useSaveCmsGlobal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, content }: { key: "navbar" | "footer"; content: Record<string, string> }) =>
      requestJson<{ ok: true; content: Record<string, string> }>(
        `/api/cms/admin/globals/${key}`,
        { method: "PUT", body: JSON.stringify({ content }) },
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cms", "admin", "globals"] }),
        queryClient.invalidateQueries({ queryKey: ["cms", "public", "globals"] }),
      ]);
    },
  });
}

export function usePublicCmsPage(pageId: string) {
  return useQuery({
    queryKey: ["cms", "public", pageId],
    queryFn: () => requestJson<{ page: PublicCmsPage; sections: CmsSection[] }>(`/api/cms/public/${encodeURIComponent(pageId)}`),
    enabled: Boolean(pageId),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function usePublicCmsGlobals() {
  return useQuery({
    queryKey: ["cms", "public", "globals"],
    queryFn: () => requestJson<{ globals: CmsGlobals }>("/api/cms/public-globals"),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
