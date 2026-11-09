import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SiteMedia } from '@/components/site-media';

describe('public media fallback', () => {
  it('falls back to the configured image when a video cannot be loaded', () => {
    const { container } = render(<SiteMedia alt="Studio banner" src="/uploads/banner.jpg" video="/uploads/missing.mp4" />);

    fireEvent.error(container.querySelector('video')!);

    expect(screen.getByRole('img', { name: 'Studio banner' })).toHaveAttribute('src', '/uploads/banner.jpg');
  });
});
