import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateEmail, validatePassword, validateLoginForm } from '../src/validation.js';

describe('Authentication Validation', () => {
  describe('validateEmail', () => {
    test('validates correct email format', () => {
      const result = validateEmail('test@example.com');
      assert.equal(result.valid, true);
    });

    test('rejects malformed email format', () => {
      const result = validateEmail('invalid-email');
      assert.equal(result.valid, false);
      assert.equal(result.error, 'Invalid email address format');
    });

    test('rejects empty email string', () => {
      const result = validateEmail('');
      assert.equal(result.valid, false);
      assert.equal(result.error, 'Email is required');
    });

    // FAILING TEST (Currently crashes due to null/undefined access)
    test('handles undefined or null email without crashing', () => {
      // Currently throws TypeError: Cannot read properties of undefined (reading 'trim')
      assert.doesNotThrow(() => {
        const result = validateEmail(undefined);
        assert.equal(result.valid, false);
        assert.equal(result.error, 'Email is required');
      });
    });
  });

  describe('validatePassword', () => {
    test('validates password with sufficient length', () => {
      const result = validatePassword('securePassword123');
      assert.equal(result.valid, true);
    });

    test('rejects short passwords', () => {
      const result = validatePassword('short');
      assert.equal(result.valid, false);
      assert.equal(result.error, 'Password must be at least 8 characters');
    });
  });

  describe('validateLoginForm', () => {
    test('rejects missing email in form data without runtime crash', () => {
      assert.doesNotThrow(() => {
        const result = validateLoginForm({ password: 'validPassword123' });
        assert.equal(result.valid, false);
      });
    });
  });
});
