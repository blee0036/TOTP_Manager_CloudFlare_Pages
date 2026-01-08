/**
 * TOTP 算法单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateTOTP, getTimeRemaining, getProgress } from './totp';

describe('TOTP Algorithm', () => {
  describe('generateTOTP', () => {
    it('should generate 6-digit TOTP token', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const token = await generateTOTP(secret);
      expect(token).toMatch(/^\d{6}$/);
    });

    it('should generate consistent token within same time window', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const token1 = await generateTOTP(secret);
      const token2 = await generateTOTP(secret);
      expect(token1).toBe(token2);
    });

    it('should handle different secret keys', async () => {
      const secret1 = 'JBSWY3DPEHPK3PXP';
      const secret2 = 'GEZDGNBVGY3TQOJQ';
      const token1 = await generateTOTP(secret1);
      const token2 = await generateTOTP(secret2);
      expect(token1).not.toBe(token2);
    });

    it('should pad token with leading zeros', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const token = await generateTOTP(secret);
      expect(token.length).toBe(6);
      expect(token).toMatch(/^\d{6}$/);
    });

    it('should throw on invalid secret', async () => {
      await expect(generateTOTP('INVALID!')).rejects.toThrow();
    });

    it('should support custom step size', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const token30 = await generateTOTP(secret, 30);
      const token60 = await generateTOTP(secret, 60);
      // Tokens may be different depending on time window
      expect(token30).toMatch(/^\d{6}$/);
      expect(token60).toMatch(/^\d{6}$/);
    });

    it('should support custom digit count', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const token8 = await generateTOTP(secret, 30, 8);
      expect(token8).toMatch(/^\d{8}$/);
      expect(token8.length).toBe(8);
    });
  });

  describe('getTimeRemaining', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return remaining seconds in current window', () => {
      // Set time to 5 seconds into a 30-second window
      vi.setSystemTime(new Date('2024-01-01T00:00:05Z'));
      const remaining = getTimeRemaining(30);
      expect(remaining).toBe(25);
    });

    it('should return step size at start of window', () => {
      // Set time to exact start of window
      vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
      const remaining = getTimeRemaining(30);
      expect(remaining).toBe(30);
    });

    it('should return 1 at end of window', () => {
      // Set time to 29 seconds into window
      vi.setSystemTime(new Date('2024-01-01T00:00:29Z'));
      const remaining = getTimeRemaining(30);
      expect(remaining).toBe(1);
    });

    it('should be in valid range', () => {
      const remaining = getTimeRemaining(30);
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(30);
    });

    it('should work with custom step size', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:10Z'));
      const remaining = getTimeRemaining(60);
      expect(remaining).toBe(50);
    });
  });

  describe('getProgress', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return progress percentage', () => {
      // Set time to 15 seconds into a 30-second window (50%)
      vi.setSystemTime(new Date('2024-01-01T00:00:15Z'));
      const progress = getProgress(30);
      expect(progress).toBeCloseTo(50, 1);
    });

    it('should return 0 at start of window', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
      const progress = getProgress(30);
      expect(progress).toBeCloseTo(0, 1);
    });

    it('should return ~100 at end of window', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:29Z'));
      const progress = getProgress(30);
      expect(progress).toBeGreaterThan(95);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it('should be in valid range', () => {
      const progress = getProgress(30);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it('should work with custom step size', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:30Z'));
      const progress = getProgress(60);
      expect(progress).toBeCloseTo(50, 1);
    });
  });

  describe('Time-based behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should generate different tokens in different time windows', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      
      // Generate token at time 0
      vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
      const token1 = await generateTOTP(secret);
      
      // Generate token 30 seconds later (next window)
      vi.setSystemTime(new Date('2024-01-01T00:00:30Z'));
      const token2 = await generateTOTP(secret);
      
      expect(token1).not.toBe(token2);
    });

    it('should generate same token within same window', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      
      // Generate token at 5 seconds
      vi.setSystemTime(new Date('2024-01-01T00:00:05Z'));
      const token1 = await generateTOTP(secret);
      
      // Generate token at 25 seconds (same window)
      vi.setSystemTime(new Date('2024-01-01T00:00:25Z'));
      const token2 = await generateTOTP(secret);
      
      expect(token1).toBe(token2);
    });
  });
});
