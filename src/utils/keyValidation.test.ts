/**
 * 密钥验证和规范化单元测试
 */

import { describe, it, expect } from 'vitest';
import { normalizeSecret, validateAndNormalizeSecret } from './keyValidation';

describe('normalizeSecret', () => {
  it('should remove spaces and convert to uppercase', () => {
    expect(normalizeSecret('jbsw y3dp ehpk 3pxp')).toBe('JBSWY3DPEHPK3PXP');
  });

  it('should handle already normalized input', () => {
    expect(normalizeSecret('JBSWY3DPEHPK3PXP')).toBe('JBSWY3DPEHPK3PXP');
  });

  it('should handle lowercase input', () => {
    expect(normalizeSecret('jbswy3dpehpk3pxp')).toBe('JBSWY3DPEHPK3PXP');
  });

  it('should trim whitespace', () => {
    expect(normalizeSecret('  JBSWY3DPEHPK3PXP  ')).toBe('JBSWY3DPEHPK3PXP');
  });
});

describe('validateAndNormalizeSecret', () => {
  it('should validate and normalize valid Base32 secret', () => {
    const result = validateAndNormalizeSecret('JBSWY3DPEHPK3PXP');
    expect(result.isValid).toBe(true);
    expect(result.normalizedSecret).toBe('JBSWY3DPEHPK3PXP');
    expect(result.error).toBeUndefined();
  });

  it('should handle lowercase Base32 secret', () => {
    const result = validateAndNormalizeSecret('jbswy3dpehpk3pxp');
    expect(result.isValid).toBe(true);
    expect(result.normalizedSecret).toBe('JBSWY3DPEHPK3PXP');
  });

  it('should handle Base32 secret with spaces', () => {
    const result = validateAndNormalizeSecret('JBSW Y3DP EHPK 3PXP');
    expect(result.isValid).toBe(true);
    expect(result.normalizedSecret).toBe('JBSWY3DPEHPK3PXP');
  });

  it('should handle Base32 secret with padding', () => {
    const result = validateAndNormalizeSecret('JBSWY3DPEHPK3PXP====');
    expect(result.isValid).toBe(true);
    expect(result.normalizedSecret).toBe('JBSWY3DPEHPK3PXP====');
  });

  it('should reject invalid characters', () => {
    const result = validateAndNormalizeSecret('INVALID!@#$');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid Base32 format');
  });

  it('should reject too short secrets', () => {
    const result = validateAndNormalizeSecret('ABC');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at least 8 characters');
  });

  it('should reject secrets with invalid Base32 characters (0, 1, 8, 9)', () => {
    const result = validateAndNormalizeSecret('JBSWY3DP01EHPK89');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid Base32 format');
  });

  it('should parse otpauth:// URI', () => {
    const uri = 'otpauth://totp/Google:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Google';
    const result = validateAndNormalizeSecret(uri);
    expect(result.isValid).toBe(true);
    expect(result.normalizedSecret).toBe('JBSWY3DPEHPK3PXP');
  });

  it('should reject invalid otpauth:// URI', () => {
    const uri = 'otpauth://totp/Test?secret=INVALID';
    const result = validateAndNormalizeSecret(uri);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid OTPAuth URI format');
  });

  it('should handle empty input', () => {
    const result = validateAndNormalizeSecret('');
    expect(result.isValid).toBe(false);
  });

  it('should handle whitespace-only input', () => {
    const result = validateAndNormalizeSecret('   ');
    expect(result.isValid).toBe(false);
  });
});
