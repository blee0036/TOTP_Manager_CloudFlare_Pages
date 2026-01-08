/**
 * OTPAuth URI 解析器单元测试
 */

import { describe, it, expect } from 'vitest';
import { parseOtpAuthUri } from './otpauth';

describe('parseOtpAuthUri', () => {
  it('should parse valid otpauth URI with issuer and account', () => {
    const uri = 'otpauth://totp/Google:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Google';
    const result = parseOtpAuthUri(uri);
    
    expect(result).not.toBeNull();
    expect(result?.secret).toBe('JBSWY3DPEHPK3PXP');
    expect(result?.issuer).toBe('Google');
    expect(result?.account).toBe('user@example.com');
    expect(result?.remark).toBe('Google (user@example.com)');
    expect(result?.algorithm).toBe('SHA1');
    expect(result?.digits).toBe(6);
    expect(result?.period).toBe(30);
  });

  it('should parse URI with only account (no issuer)', () => {
    const uri = 'otpauth://totp/user@example.com?secret=JBSWY3DPEHPK3PXP';
    const result = parseOtpAuthUri(uri);
    
    expect(result).not.toBeNull();
    expect(result?.secret).toBe('JBSWY3DPEHPK3PXP');
    expect(result?.account).toBe('user@example.com');
    expect(result?.remark).toBe('user@example.com');
    expect(result?.issuer).toBeUndefined();
  });

  it('should parse URI with issuer in path only', () => {
    const uri = 'otpauth://totp/GitHub:username?secret=JBSWY3DPEHPK3PXP';
    const result = parseOtpAuthUri(uri);
    
    expect(result).not.toBeNull();
    expect(result?.secret).toBe('JBSWY3DPEHPK3PXP');
    expect(result?.issuer).toBe('GitHub');
    expect(result?.account).toBe('username');
    expect(result?.remark).toBe('GitHub (username)');
  });

  it('should prioritize issuer parameter over path issuer', () => {
    const uri = 'otpauth://totp/PathIssuer:account?secret=JBSWY3DPEHPK3PXP&issuer=ParamIssuer';
    const result = parseOtpAuthUri(uri);
    
    expect(result).not.toBeNull();
    expect(result?.issuer).toBe('ParamIssuer');
    expect(result?.remark).toBe('ParamIssuer (account)');
  });

  it('should handle URI with custom parameters', () => {
    const uri = 'otpauth://totp/Test?secret=JBSWY3DPEHPK3PXP&algorithm=SHA256&digits=8&period=60';
    const result = parseOtpAuthUri(uri);
    
    expect(result).not.toBeNull();
    expect(result?.secret).toBe('JBSWY3DPEHPK3PXP');
    expect(result?.algorithm).toBe('SHA256');
    expect(result?.digits).toBe(8);
    expect(result?.period).toBe(60);
  });

  it('should normalize secret to uppercase', () => {
    const uri = 'otpauth://totp/Test?secret=jbswy3dpehpk3pxp';
    const result = parseOtpAuthUri(uri);
    
    expect(result).not.toBeNull();
    expect(result?.secret).toBe('JBSWY3DPEHPK3PXP');
  });

  it('should handle secret with spaces', () => {
    const uri = 'otpauth://totp/Test?secret=JBSW%20Y3DP%20EHPK%203PXP';
    const result = parseOtpAuthUri(uri);
    
    expect(result).not.toBeNull();
    expect(result?.secret).toBe('JBSWY3DPEHPK3PXP');
  });

  it('should handle URL-encoded characters in account', () => {
    const uri = 'otpauth://totp/Google:user%2Btest%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=Google';
    const result = parseOtpAuthUri(uri);
    
    expect(result).not.toBeNull();
    expect(result?.account).toBe('user+test@example.com');
  });

  it('should reject invalid protocol', () => {
    const uri = 'https://example.com/totp?secret=JBSWY3DPEHPK3PXP';
    const result = parseOtpAuthUri(uri);
    
    expect(result).toBeNull();
  });

  it('should reject non-totp type', () => {
    const uri = 'otpauth://hotp/Test?secret=JBSWY3DPEHPK3PXP';
    const result = parseOtpAuthUri(uri);
    
    expect(result).toBeNull();
  });

  it('should reject URI without secret', () => {
    const uri = 'otpauth://totp/Test?issuer=Test';
    const result = parseOtpAuthUri(uri);
    
    expect(result).toBeNull();
  });

  it('should reject URI with invalid Base32 secret', () => {
    const uri = 'otpauth://totp/Test?secret=INVALID!@#';
    const result = parseOtpAuthUri(uri);
    
    expect(result).toBeNull();
  });

  it('should reject URI with too short secret', () => {
    const uri = 'otpauth://totp/Test?secret=ABC';
    const result = parseOtpAuthUri(uri);
    
    expect(result).toBeNull();
  });

  it('should handle same issuer and account', () => {
    const uri = 'otpauth://totp/GitHub:GitHub?secret=JBSWY3DPEHPK3PXP&issuer=GitHub';
    const result = parseOtpAuthUri(uri);
    
    expect(result).not.toBeNull();
    expect(result?.remark).toBe('GitHub');
  });

  it('should handle empty account name', () => {
    const uri = 'otpauth://totp/?secret=JBSWY3DPEHPK3PXP&issuer=Test';
    const result = parseOtpAuthUri(uri);
    
    expect(result).not.toBeNull();
    expect(result?.remark).toBe('Test');
  });

  it('should handle URI with no issuer or account', () => {
    const uri = 'otpauth://totp/?secret=JBSWY3DPEHPK3PXP';
    const result = parseOtpAuthUri(uri);
    
    expect(result).not.toBeNull();
    expect(result?.remark).toBe('Unnamed Key');
  });
});
