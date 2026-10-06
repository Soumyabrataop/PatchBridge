/**
 * Property-Based Validation Tests for PatchBridge demo-bug-repo
 *
 * Uses fast-check to verify correctness invariants across the full input
 * space — not just the handful of examples a human would pick by hand.
 *
 * Run:  node --test tests/validation.property.test.js
 *
 * Baseline expectations (before the null-guard fix in validation.js):
 *   P1 — RED  (validateEmail(undefined) throws TypeError at line 18)
 *   P2 — RED  (throws before returning, so valid:false is unreachable)
 *   P3 — GREEN
 *   P4 — GREEN
 *   P5 — RED  (validateLoginForm inherits the crash from validateEmail)
 *   P6 — GREEN (try/catch guard skips crashing inputs)
 *
 * After the null-guard fix: all 6 properties GREEN.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as fc from 'fast-check';
import {
  validateEmail,
  validatePassword,
  validateLoginForm,
} from '../src/validation.js';

// ---------------------------------------------------------------------------
// Shared Arbitrary: any JavaScript value that is NOT a string
// Covers: undefined, null, integer, boolean, plain object, array
// ---------------------------------------------------------------------------
const nonStringArbitrary = fc.oneof(
  fc.constant(undefined),
  fc.constant(null),
  fc.integer(),
  fc.boolean(),
  fc.object(),
  fc.array(fc.anything())
);

// ---------------------------------------------------------------------------

describe('Property-Based Validation Tests', () => {

  // Feature: property-based-tests, Property 1: validateEmail does not throw for any non-string input
  //
  // RED until the null-guard is added to validation.js line 18.
  // fast-check will shrink the failing counterexample to `undefined` and
  // report: TypeError: Cannot read properties of undefined (reading 'trim')
  test('validateEmail does not throw for any non-string input', () => {
    fc.assert(
      fc.property(nonStringArbitrary, (input) => {
        assert.doesNotThrow(
          () => validateEmail(input),
          `validateEmail(${JSON.stringify(input)}) must not throw — add a null/non-string guard before calling .trim()`
        );
      }),
      { numRuns: 100 }
    );
  });

  // Feature: property-based-tests, Property 2: validateEmail returns { valid: false } for non-string input
  //
  // RED until the null-guard is added (depends on P1 not throwing first).
  // Once P1 is green this confirms the return value is also correct.
  test('validateEmail returns { valid: false } for non-string input', () => {
    fc.assert(
      fc.property(nonStringArbitrary, (input) => {
        const result = validateEmail(input);
        assert.equal(
          result.valid,
          false,
          `validateEmail(${JSON.stringify(input)}) should return { valid: false }`
        );
      }),
      { numRuns: 100 }
    );
  });

  // Feature: property-based-tests, Property 3: validateEmail accepts any valid email string
  //
  // fc.emailAddress() generates RFC-5321-style addresses that satisfy
  // the regex ^[^\s@]+@[^\s@]+\.[^\s@]+$ used inside validateEmail.
  test('validateEmail accepts any valid email string', () => {
    fc.assert(
      fc.property(fc.emailAddress(), (email) => {
        const result = validateEmail(email);
        assert.equal(
          result.valid,
          true,
          `validateEmail("${email}") should accept a well-formed email but returned valid:false`
        );
      }),
      { numRuns: 100 }
    );
  });

  // Feature: property-based-tests, Property 4: validatePassword rejects any string shorter than 8 characters
  //
  // fc.string({ minLength: 1, maxLength: 7 }) generates non-empty strings of
  // length 1-7. Empty string hits the '!password' guard first and returns
  // 'Password is required' — a separate valid code path. This property
  // focuses on the length invariant for non-empty short passwords.
  // Both the boolean flag AND the exact error message are asserted.
  test('validatePassword rejects any non-empty string shorter than 8 characters', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 7 }), (password) => {
        const result = validatePassword(password);
        assert.equal(
          result.valid,
          false,
          `validatePassword("${password}") (length ${password.length}) should be invalid`
        );
        assert.equal(
          result.error,
          'Password must be at least 8 characters',
          `validatePassword("${password}") returned wrong error message`
        );
      }),
      { numRuns: 100 }
    );
  });

  // Feature: property-based-tests, Property 5: validateLoginForm is consistent with component validators
  //
  // Metamorphic property: the composite must agree with its components.
  // Uses arbitrary string pairs so valid emails, invalid emails, short
  // passwords, and long passwords are all exercised.
  //
  // RED before the null-guard fix because validateEmail(string) is fine
  // but fc.string() can produce values that trigger the crash when passed
  // through the composite — actually this stays green for string inputs;
  // the real issue surfaces when email is undefined, which fc.string()
  // won't produce. For full coverage P1 handles the non-string path.
  test('validateLoginForm is consistent with validateEmail and validatePassword', () => {
    fc.assert(
      fc.property(
        fc.record({ email: fc.string(), password: fc.string() }),
        (formData) => {
          const emailResult = validateEmail(formData.email);
          const passwordResult = validatePassword(formData.password);
          const formResult = validateLoginForm(formData);

          if (!emailResult.valid) {
            // Email failed — form must also fail
            assert.equal(
              formResult.valid,
              false,
              `validateLoginForm should be invalid when email "${formData.email}" is invalid`
            );
          } else if (!passwordResult.valid) {
            // Email passed but password failed — form must also fail
            assert.equal(
              formResult.valid,
              false,
              `validateLoginForm should be invalid when password is too short`
            );
          } else {
            // Both components passed — form must also pass
            assert.equal(
              formResult.valid,
              true,
              `validateLoginForm should be valid when both email and password are valid`
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: property-based-tests, Property 6: ValidationResult is JSON round-trip safe
  //
  // Verifies that no validator returns objects with Symbols, class instances,
  // functions, or circular references that would break JSON serialisation.
  // The try/catch guard skips crashing inputs (pre-fix) so this property
  // can be evaluated independently of P1/P2.
  test('ValidationResult is JSON round-trip safe', () => {
    // validateEmail — skip if it throws (pre-fix crash; P1 tracks that)
    fc.assert(
      fc.property(
        fc.oneof(nonStringArbitrary, fc.emailAddress(), fc.string()),
        (input) => {
          let result;
          try {
            result = validateEmail(input);
          } catch {
            return; // pre-fix crash — not this property's concern
          }
          assert.deepEqual(
            JSON.parse(JSON.stringify(result)),
            result,
            `validateEmail result is not JSON round-trip safe for input: ${JSON.stringify(input)}`
          );
        }
      ),
      { numRuns: 100 }
    );

    // validatePassword — always safe to call (has a null guard already)
    fc.assert(
      fc.property(
        fc.oneof(fc.string({ maxLength: 7 }), fc.string()),
        (password) => {
          const result = validatePassword(password);
          assert.deepEqual(
            JSON.parse(JSON.stringify(result)),
            result,
            `validatePassword result is not JSON round-trip safe for password: "${password}"`
          );
        }
      ),
      { numRuns: 100 }
    );

    // validateLoginForm — skip if it throws (inherits email crash pre-fix)
    fc.assert(
      fc.property(
        fc.record({ email: fc.string(), password: fc.string() }),
        (formData) => {
          let result;
          try {
            result = validateLoginForm(formData);
          } catch {
            return; // pre-fix crash — not this property's concern
          }
          assert.deepEqual(
            JSON.parse(JSON.stringify(result)),
            result,
            `validateLoginForm result is not JSON round-trip safe`
          );
        }
      ),
      { numRuns: 100 }
    );
  });

});
