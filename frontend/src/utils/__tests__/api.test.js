import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { login, fetchProducts } from '../api';
import { saveSession } from '../auth';

function createToken(expOffsetMs = 60_000) {
  const payload = { exp: Math.floor((Date.now() + expOffsetMs) / 1000) };
  return `header.${btoa(JSON.stringify(payload))}.sig`;
}

describe('api utils', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockFetch.mockReset();
  });

  it('login sends POST with body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ token: 'abc', user: { id: 1 } })),
    });

    const result = await login({ username: 'test', password: 'pass' });
    expect(result.token).toBe('abc');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ username: 'test', password: 'pass' });
  });

  it('fetchProducts sends Authorization header when token exists', async () => {
    saveSession(createToken(), { id: 1 });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify([{ id: 1, name: 'Widget' }])),
    });

    const result = await fetchProducts();
    expect(result).toEqual([{ id: 1, name: 'Widget' }]);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Authorization).toMatch(/^Bearer /);
  });

  it('throws on non-ok response', async () => {
    saveSession(createToken(), { id: 1 });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: () => Promise.resolve(JSON.stringify({ message: 'Not found' })),
    });

    await expect(fetchProducts()).rejects.toThrow('Not found');
  });
});
