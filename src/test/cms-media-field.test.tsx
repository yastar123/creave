import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CmsMediaField } from '@/components/cms-admin/media-field';

const assets = [
  {
    url: '/uploads/brand.png',
    name: 'brand.png',
    mimeType: 'image/png',
    size: 1024,
    uploadedAt: '2026-10-26T00:00:00.000Z',
  },
  {
    url: '/uploads/showreel.mp4',
    name: 'showreel.mp4',
    mimeType: 'video/mp4',
    size: 2048,
    uploadedAt: '2026-10-26T00:00:00.000Z',
  },
];

function response(payload: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => payload,
  } as Response);
}

function setupField(kind: 'image' | 'video', onChange = vi.fn(), value = '') {
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => (init?.method === 'POST' ? response({ asset: assets[kind === 'image' ? 0 : 1] }) : response({ assets })));
  vi.stubGlobal('fetch', fetchMock);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const { container } = render(
    <QueryClientProvider client={queryClient}>
      <CmsMediaField kind={kind} label={`${kind} value`} onChange={onChange} value={value} />
    </QueryClientProvider>,
  );
  return { container, fetchMock, onChange };
}

describe('CMS media fields', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('filters the media library by field type and selects a video', async () => {
    const { onChange } = setupField('video');
    fireEvent.click(screen.getByRole('button', { name: 'Browse media' }));

    const dialog = await screen.findByRole('dialog', { name: 'Choose video value' });
    expect(await screen.findByRole('button', { name: /showreel\.mp4/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /brand\.png/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /showreel\.mp4/ }));

    expect(onChange).toHaveBeenCalledWith('/uploads/showreel.mp4');
    expect(dialog).not.toBeInTheDocument();
  });

  it('closes the media library with Escape', async () => {
    setupField('image');
    fireEvent.click(screen.getByRole('button', { name: 'Browse media' }));

    expect(await screen.findByRole('dialog', { name: 'Choose image value' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('uploads a device file and returns its reusable URL', async () => {
    const { fetchMock, onChange } = setupField('image');
    const file = new File(['image bytes'], 'brand.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('Choose image value from your device'), {
      target: { files: [file] },
    });

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('/uploads/brand.png'));
    expect(fetchMock).toHaveBeenCalledWith('/api/cms/admin/media', expect.objectContaining({ method: 'POST', credentials: 'include' }));
  });

  it('reports a broken saved image URL in the CMS editor', () => {
    const { container } = setupField('image', vi.fn(), '/uploads/missing-logo.png');

    fireEvent.error(container.querySelector('.ca-media-current img')!);

    expect(screen.getByRole('alert')).toHaveTextContent('This image could not be loaded. Choose a valid upload or URL.');
  });
});
