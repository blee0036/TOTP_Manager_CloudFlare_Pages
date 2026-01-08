import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, getConfig } from './crypto';

describe('Crypto Utils', () => {
  const testSalt = 'test-salt-value';
  const testIterations = 100000;

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password, testSalt, testIterations);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // 32 bytes = 64 hex characters
    });

    it('should produce consistent hashes for the same input', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password, testSalt, testIterations);
      const hash2 = await hashPassword(password, testSalt, testIterations);
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different passwords', async () => {
      const hash1 = await hashPassword('password1', testSalt, testIterations);
      const hash2 = await hashPassword('password2', testSalt, testIterations);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password, testSalt, testIterations);
      const isValid = await verifyPassword(hash, password, testSalt, testIterations);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password, testSalt, testIterations);
      const isValid = await verifyPassword(hash, 'wrongPassword', testSalt, testIterations);
      
      expect(isValid).toBe(false);
    });

    it('should reject password with different hash', async () => {
      const hash = 'a'.repeat(64);
      const isValid = await verifyPassword(hash, 'anyPassword', testSalt, testIterations);
      
      expect(isValid).toBe(false);
    });
  });

  describe('getConfig', () => {
    it('should return config from environment', () => {
      const env = {
        HASH_SALT: 'custom-salt',
        PW_ITERATIONS: '150000'
      };
      
      const config = getConfig(env);
      
      expect(config.hashSalt).toBe('custom-salt');
      expect(config.pwIterations).toBe(150000);
    });

    it('should use default values when env vars are missing', () => {
      const env = {};
      
      const config = getConfig(env);
      
      expect(config.hashSalt).toBe('default-salt-change-in-production');
      expect(config.pwIterations).toBe(100000);
    });
  });
});
