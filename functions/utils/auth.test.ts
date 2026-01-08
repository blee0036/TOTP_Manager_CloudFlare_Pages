import { describe, it, expect } from 'vitest';
import {
  generateSessionToken,
  createSessionCookie,
  clearSessionCookie,
  parseCookies,
  getSessionToken
} from './auth';

describe('Auth Utils', () => {
  describe('generateSessionToken', () => {
    it('should generate a valid UUID', () => {
      const token = generateSessionToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique tokens', () => {
      const token1 = generateSessionToken();
      const token2 = generateSessionToken();
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('createSessionCookie', () => {
    it('should create a valid cookie string', () => {
      const token = 'test-token-123';
      const cookie = createSessionCookie(token);
      
      expect(cookie).toContain('__totp_session=test-token-123');
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).toContain('Secure');
      expect(cookie).toContain('Max-Age=86400');
    });

    it('should use custom maxAge', () => {
      const token = 'test-token-123';
      const cookie = createSessionCookie(token, 3600);
      
      expect(cookie).toContain('Max-Age=3600');
    });
  });

  describe('clearSessionCookie', () => {
    it('should create a cookie that expires immediately', () => {
      const cookie = clearSessionCookie();
      
      expect(cookie).toContain('__totp_session=');
      expect(cookie).toContain('Max-Age=0');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('Secure');
    });
  });

  describe('parseCookies', () => {
    it('should parse a single cookie', () => {
      const cookieHeader = '__totp_session=abc123';
      const cookies = parseCookies(cookieHeader);
      
      expect(cookies).toEqual({ __totp_session: 'abc123' });
    });

    it('should parse multiple cookies', () => {
      const cookieHeader = '__totp_session=abc123; other=value; third=test';
      const cookies = parseCookies(cookieHeader);
      
      expect(cookies).toEqual({
        __totp_session: 'abc123',
        other: 'value',
        third: 'test'
      });
    });

    it('should handle cookies with = in value', () => {
      const cookieHeader = 'token=abc=def=ghi';
      const cookies = parseCookies(cookieHeader);
      
      expect(cookies).toEqual({ token: 'abc=def=ghi' });
    });

    it('should handle empty cookie header', () => {
      const cookies = parseCookies('');
      
      expect(cookies).toEqual({});
    });
  });

  describe('getSessionToken', () => {
    it('should extract session token from request', () => {
      const request = new Request('https://example.com', {
        headers: {
          'Cookie': '__totp_session=test-token-123'
        }
      });
      
      const token = getSessionToken(request);
      
      expect(token).toBe('test-token-123');
    });

    it('should return null when no cookie header', () => {
      const request = new Request('https://example.com');
      
      const token = getSessionToken(request);
      
      expect(token).toBeNull();
    });

    it('should return null when session cookie not present', () => {
      const request = new Request('https://example.com', {
        headers: {
          'Cookie': 'other=value'
        }
      });
      
      const token = getSessionToken(request);
      
      expect(token).toBeNull();
    });
  });
});
