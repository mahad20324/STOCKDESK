import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveSession,
  getToken,
  hasActiveSession,
  getUser,
  logout,
  consumeSessionNotice,
  saveSessionNotice,
} from '../auth';

function createToken(expOffsetMs) {
  const payload = { exp: Math.floor((Date.now() + expOffsetMs) / 1000) };
  const body = btoa(JSON.stringify(payload));
  return `header.${body}.sig`;
}

describe('auth utils', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('saveSession stores token and user, getToken retrieves valid token', () => {
    const token = createToken(60_000);
    const user = { id: 1, name: 'Test', role: 'Admin' };

    saveSession(token, user);

    expect(getToken()).toBe(token);
    expect(hasActiveSession()).toBe(true);
    expect(getUser()).toEqual(user);
  });

  it('getToken returns null for expired token', () => {
    const token = createToken(-10_000);
    const user = { id: 1, name: 'Test', role: 'Admin' };

    saveSession(token, user);
    expect(getToken()).toBeNull();
    expect(hasActiveSession()).toBe(false);
  });

  it('logout clears session and stores notice', () => {
    const token = createToken(60_000);
    const user = { id: 1, name: 'Test', role: 'Admin' };
    saveSession(token, user);

    logout({ message: 'Test logout' });

    expect(getToken()).toBeNull();
    expect(getUser()).toBeNull();
    expect(consumeSessionNotice()).toBe('Test logout');
  });

  it('saveSessionNotice and consumeSessionNotice round-trip', () => {
    saveSessionNotice('hello');
    expect(consumeSessionNotice()).toBe('hello');
    expect(consumeSessionNotice()).toBeNull();
  });

  it('getUser returns null when no session', () => {
    expect(getUser()).toBeNull();
    expect(hasActiveSession()).toBe(false);
  });
});
