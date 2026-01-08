/**
 * Base32 编解码器单元测试
 */

import { describe, it, expect } from 'vitest';
import { base32Decode, base32Encode } from './base32';

describe('Base32 Codec', () => {
  describe('base32Decode', () => {
    it('should decode valid Base32 string', () => {
      const input = 'JBSWY3DPEHPK3PXP';
      const result = base32Decode(input);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle lowercase input', () => {
      const upper = base32Decode('JBSWY3DPEHPK3PXP');
      const lower = base32Decode('jbswy3dpehpk3pxp');
      expect(upper).toEqual(lower);
    });

    it('should handle spaces in input', () => {
      const withSpaces = base32Decode('JBSW Y3DP EHPK 3PXP');
      const withoutSpaces = base32Decode('JBSWY3DPEHPK3PXP');
      expect(withSpaces).toEqual(withoutSpaces);
    });

    it('should handle padding', () => {
      const withPadding = base32Decode('JBSWY3DPEHPK3PXP====');
      const withoutPadding = base32Decode('JBSWY3DPEHPK3PXP');
      expect(withPadding).toEqual(withoutPadding);
    });

    it('should throw on invalid characters', () => {
      expect(() => base32Decode('INVALID!')).toThrow('Invalid Base32 character');
      expect(() => base32Decode('ABCD1')).toThrow('Invalid Base32 character');
    });

    it('should handle empty string', () => {
      const result = base32Decode('');
      expect(result.length).toBe(0);
    });

    it('should decode known test vector', () => {
      // "Hello" in Base32 is "JBSWY3DP"
      const result = base32Decode('JBSWY3DP');
      const expected = new TextEncoder().encode('Hello');
      // Compare arrays element by element
      expect(Array.from(result)).toEqual(Array.from(expected));
    });
  });

  describe('base32Encode', () => {
    it('should encode byte array to Base32', () => {
      const input = new TextEncoder().encode('Hello');
      const result = base32Encode(input);
      // Verify it's valid Base32 and can be decoded back
      expect(result).toMatch(/^[A-Z2-7]+=*$/);
      const decoded = base32Decode(result);
      expect(Array.from(decoded)).toEqual(Array.from(input));
    });

    it('should handle empty array', () => {
      const result = base32Encode(new Uint8Array(0));
      expect(result).toBe('');
    });

    it('should add proper padding', () => {
      const input = new Uint8Array([1, 2, 3]);
      const result = base32Encode(input);
      expect(result.length % 8).toBe(0);
      expect(result).toMatch(/=*$/);
    });
  });

  describe('Round-trip encoding', () => {
    it('should maintain data integrity through encode-decode cycle', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const encoded = base32Encode(original);
      const decoded = base32Decode(encoded);
      expect(decoded).toEqual(original);
    });

    it('should work with text data', () => {
      const text = 'Hello, World!';
      const original = new TextEncoder().encode(text);
      const encoded = base32Encode(original);
      const decoded = base32Decode(encoded);
      const result = new TextDecoder().decode(decoded);
      expect(result).toBe(text);
    });
  });
});
