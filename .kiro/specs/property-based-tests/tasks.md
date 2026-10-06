# Implementation Plan: Property-Based Validation Test Suite

## Overview

Add a property-based test suite to `examples/demo-bug-repo` using `fast-check`, covering six correctness properties for `validateEmail`, `validatePassword`, and `validateLoginForm`. Two properties (P1, P2) will initially be red due to the known null/undefined crash bug in `src/validation.js` line 18; the final task fixes that bug and turns all six green.

## Tasks

- [ ] 1. Add fast-check dependency and update package.json scripts
  - Add `"fast-check": "^3.0.0"` to `devDependencies` in `examples/demo-bug-repo/package.json`
  - Update the `test` script in `examples/demo-bug-repo/package.json` to: `node --test tests/validation.test.js tests/validation.property.test.js`
  - Add a `test:property` script to `examples/demo-bug-repo/package.json`: `node --test tests/validation.property.test.js`
  - Add a `test:property` script to the root `package.json`: `npm --prefix examples/demo-bug-repo run test:property`
  - Run `npm install` inside `examples/demo-bug-repo` to resolve the new dependency
  - _Requirements: 1.1, 1.2, 1.3, 7.4, 7.5_

- [ ] 2. Create the property test file scaffold and shared arbitrary
  - [ ] 2.1 Create `examples/demo-bug-repo/tests/validation.property.test.js` with ESM imports
    - Import `test` and `describe` from `node:test`
    - Import `assert` from `node:assert/strict`
    - Import `* as fc` from `fast-check`
    - Import `validateEmail`, `validatePassword`, `validateLoginForm` from `../src/validation.js`
    - Define the shared `nonStringArbitrary` constant using `fc.oneof(fc.constant(undefined), fc.constant(null), fc.integer(), fc.boolean(), fc.object(), fc.array(fc.anything()))`
    - Open a top-level `describe('Property-Based Validation Tests', ...)` block (empty stubs for now)
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 3. Implement Properties 1 and 2 — validateEmail non-string input
  - [ ] 3.1 Implement Property 1: validateEmail does not throw for any non-string input
    - Inside the `describe` block, add a `test()` with name `'validateEmail does not throw for any non-string input'`
    - Use `fc.assert(fc.property(nonStringArbitrary, (input) => { assert.doesNotThrow(() => validateEmail(input)); }), { numRuns: 100 })`
    - Add comment: `// Feature: property-based-tests, Property 1: validateEmail does not throw for any non-string input`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 3.2 Implement Property 2: validateEmail returns `{ valid: false }` for non-string input
    - Add a `test()` with name `'validateEmail returns { valid: false } for non-string input'`
    - Use `fc.assert(fc.property(nonStringArbitrary, (input) => { const result = validateEmail(input); assert.equal(result.valid, false); }), { numRuns: 100 })`
    - Add comment: `// Feature: property-based-tests, Property 2: validateEmail returns { valid: false } for non-string input`
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 3.3 Verify Properties 1 and 2 are red (pre-fix baseline)
    - Run `node --test tests/validation.property.test.js` inside `examples/demo-bug-repo`
    - Confirm P1 and P2 fail with `TypeError: Cannot read properties of undefined (reading 'trim')`
    - _Requirements: 2.3_

- [ ] 4. Implement Properties 3, 4, 5, and 6
  - [ ] 4.1 Implement Property 3: validateEmail accepts any valid email string
    - Add a `test()` with name `'validateEmail accepts any valid email string'`
    - Use `fc.assert(fc.property(fc.emailAddress(), (email) => { const result = validateEmail(email); assert.equal(result.valid, true); }), { numRuns: 100 })`
    - Add comment: `// Feature: property-based-tests, Property 3: validateEmail accepts any valid email string`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 4.2 Implement Property 4: validatePassword rejects any string shorter than 8 characters
    - Add a `test()` with name `'validatePassword rejects any string shorter than 8 characters'`
    - Use `fc.assert(fc.property(fc.string({ maxLength: 7 }), (password) => { const result = validatePassword(password); assert.equal(result.valid, false); assert.equal(result.error, 'Password must be at least 8 characters'); }), { numRuns: 100 })`
    - Add comment: `// Feature: property-based-tests, Property 4: validatePassword rejects any string shorter than 8 characters`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 4.3 Implement Property 5: validateLoginForm is consistent with component validators
    - Add a `test()` with name `'validateLoginForm is consistent with validateEmail and validatePassword'`
    - Generate with `fc.record({ email: fc.string(), password: fc.string() })`
    - Compute `emailResult`, `passwordResult`, and `formResult` independently, then assert the three-branch consistency rule
    - Add comment: `// Feature: property-based-tests, Property 5: validateLoginForm is consistent with component validators`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ] 4.4 Implement Property 6: ValidationResult is JSON round-trip safe
    - Add a `test()` with name `'ValidationResult is JSON round-trip safe'`
    - Run three separate `fc.assert` calls: one for `validateEmail` inputs (with try/catch guard to skip pre-fix crashes), one for `validatePassword` inputs, one for `validateLoginForm` form records (with try/catch guard)
    - Use `assert.deepEqual(JSON.parse(JSON.stringify(result)), result)` for each
    - Add comment: `// Feature: property-based-tests, Property 6: ValidationResult is JSON round-trip safe`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 4.5 Write unit tests for Property 3 edge cases
    - Confirm `fc.emailAddress()` samples satisfy `^[^\s@]+@[^\s@]+\.[^\s@]+$` for a representative set
    - _Requirements: 4.2_

- [ ] 5. Checkpoint — verify Properties 3, 4, 5, 6 pass; 1 and 2 remain red
  - Ensure all tests pass, ask the user if questions arise.
  - Run `node --test tests/validation.property.test.js` inside `examples/demo-bug-repo`
  - P3, P4, P5, P6 should be green; P1 and P2 should still be red

- [ ] 6. Fix the null/non-string guard bug in `src/validation.js`
  - [ ] 6.1 Add null/non-string guard to `validateEmail` before calling `.trim()`
    - In `examples/demo-bug-repo/src/validation.js` line 18, add a guard before `email.trim()`:
      ```js
      if (!email || typeof email !== 'string') {
        return { valid: false, error: 'Email is required' };
      }
      ```
    - Place the guard at the top of `validateEmail`, before `const normalized = email.trim().toLowerCase()`
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

  - [ ]* 6.2 Write unit tests confirming the guard fix
    - Verify `validateEmail(null)`, `validateEmail(undefined)`, `validateEmail(42)` each return `{ valid: false, error: 'Email is required' }`
    - _Requirements: 2.4, 3.2_

- [ ] 7. Final checkpoint — all 6 properties green
  - Ensure all tests pass, ask the user if questions arise.
  - Run `npm test` inside `examples/demo-bug-repo` (runs both `validation.test.js` and `validation.property.test.js`)
  - All 6 properties must pass; the previously-failing `handles undefined or null email without crashing` unit test in `validation.test.js` must also now pass

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Properties 1 and 2 are intentionally red before Task 6 — this is the designed regression gate, not a bug in the test suite
- The try/catch guard in Property 6 is a deliberate design choice: it skips crashing inputs so P6 can be evaluated independently of the P1/P2 bug
- Each task references specific requirements for traceability
- The root `test:demo` script (`npm --prefix examples/demo-bug-repo test`) requires no changes — it already runs the `test` script in `demo-bug-repo/package.json`, which will pick up both files after Task 1

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["3.1", "3.2"] },
    { "id": 2, "tasks": ["3.3", "4.1", "4.2", "4.3", "4.4"] },
    { "id": 3, "tasks": ["4.5", "6.1"] },
    { "id": 4, "tasks": ["6.2"] }
  ]
}
```
