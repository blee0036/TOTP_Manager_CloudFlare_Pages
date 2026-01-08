/**
 * 集成测试：验证密钥验证、解析和 TOTP 生成的完整流程
 */

import { describe, it, expect } from 'vitest';
import { validateAndNormalizeSecret } from './keyValidation';
import { parseOtpAuthUri } from './otpauth';
import { generateTOTP } from './totp';

describe('Key Validation and TOTP Generation Integration', () => {
  it('should validate, normalize and generate TOTP from plain Base32 secret', async () => {
    const input = 'jbsw y3dp ehpk 3pxp'; // lowercase with spaces
    
    // Step 1: Validate and normalize
    const validation = validateAndNormalizeSecret(input);
    expect(validation.isValid).toBe(true);
    expect(validation.normalizedSecret).toBe('JBSWY3DPEHPK3PXP');
    
    // Step 2: Generate TOTP
    const token = await generateTOTP(validation.normalizedSecret);
    expect(token).toMatch(/^\d{6}$/);
  });

  it('should parse OTPAuth URI and generate TOTP', async () => {
    const uri = 'otpauth://totp/Google:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Google';
    
    // Step 1: Parse URI
    const parsed = parseOtpAuthUri(uri);
    expect(parsed).not.toBeNull();
    expect(parsed?.secret).toBe('JBSWY3DPEHPK3PXP');
    expect(parsed?.remark).toBe('Google (user@example.com)');
    
    // Step 2: Generate TOTP
    const token = await generateTOTP(parsed!.secret);
    expect(token).toMatch(/^\d{6}$/);
  });

  it('should validate OTPAuth URI and generate TOTP', async () => {
    const uri = 'otpauth://totp/GitHub:username?secret=JBSWY3DPEHPK3PXP&issuer=GitHub';
    
    // Step 1: Validate (which internally parses the URI)
    const validation = validateAndNormalizeSecret(uri);
    expect(validation.isValid).toBe(true);
    expect(validation.normalizedSecret).toBe('JBSWY3DPEHPK3PXP');
    
    // Step 2: Generate TOTP
    const token = await generateTOTP(validation.normalizedSecret);
    expect(token).toMatch(/^\d{6}$/);
  });

  it('should handle various input formats and generate consistent TOTP', async () => {
    const inputs = [
      'JBSWY3DPEHPK3PXP',
      'jbswy3dpehpk3pxp',
      'JBSW Y3DP EHPK 3PXP',
      'jbsw y3dp ehpk 3pxp',
      'otpauth://totp/Test?secret=JBSWY3DPEHPK3PXP'
    ];
    
    const tokens: string[] = [];
    
    for (const input of inputs) {
      const validation = validateAndNormalizeSecret(input);
      expect(validation.isValid).toBe(true);
      
      const token = await generateTOTP(validation.normalizedSecret);
      expect(token).toMatch(/^\d{6}$/);
      tokens.push(token);
    }
    
    // All tokens should be the same (generated in the same time window)
    const firstToken = tokens[0];
    tokens.forEach(token => {
      expect(token).toBe(firstToken);
    });
  });

  it('should reject invalid inputs before TOTP generation', async () => {
    const invalidInputs = [
      'INVALID!@#',
      'ABC', // too short
      'JBSWY3DP01EHPK89', // contains 0, 1, 8, 9
      'otpauth://totp/Test?secret=INVALID'
    ];
    
    for (const input of invalidInputs) {
      const validation = validateAndNormalizeSecret(input);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeDefined();
    }
  });
});
