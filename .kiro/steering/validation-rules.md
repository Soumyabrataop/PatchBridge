---
inclusion: fileMatch
fileMatch:
  - "examples/demo-bug-repo/src/validation.js"
  - "examples/demo-bug-repo/src/LoginForm.jsx"
  - "examples/demo-bug-repo/tests/*.test.js"
  - "examples/demo-bug-repo/tests/*.property.test.js"
---

# PatchBridge Demo Repo — Validation Rules

This steering file activates when `validation.js`, `LoginForm.jsx`, or any test file inside `examples/demo-bug-repo/` is in context. It encodes the exact guard-clause patterns, test expectations, and fix constraints for the demo repository.

---

## The Known Bug

**File**: `examples/demo-bug-repo/src/validation.js`  
**Line**: 18  
**Symptom**: Calling `validateEmail(undefined)` or `validateEmail(null)` throws:

```
TypeError: Cannot read properties of undefined (reading 'trim')
```

**Root cause**: `validateEmail` calls `email.trim().toLowerCase()` directly without first checking that `email` is a non-null string.

```js
// CURRENT (buggy) — line 18:
const normalized = email.trim().toLowerCase();
```

---

## The Correct Fix

Add a null/non-string guard **at the top of `validateEmail`**, before any method calls on `email`:

```js
export function validateEmail(email) {
  // Guard against null, undefined, or non-string inputs
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const normalized = email.trim().toLowerCase();
  // ... rest of function unchanged
}
```

**Constraints on the fix:**
- The guard must return `{ valid: false, error: 'Email is required' }` — exact string match, no variation.
- The guard must be placed **before** `email.trim()` is ever called.
- `validatePassword` already has an equivalent guard and can serve as a reference.
- Do not change `validateLoginForm` — once `validateEmail` is fixed, it inherits the guard automatically.
- Do not alter the email regex or the existing valid/invalid email test cases.

---

## Expected `ValidationResult` Shape

All three exported functions return an object of this shape:

```ts
// Success
{ valid: true }

// Failure
{ valid: false, error: string }
```

Key constraints:
- `valid` is always a boolean — never a truthy/falsy string.
- `error` is always a non-empty string when `valid` is `false`.
- No additional fields. No class instances. No Symbols. JSON-serialisable.

---

## Guard-Clause Patterns

When adding input guards to validator functions, follow the pattern already established in `validatePassword`:

```js
// Pattern: guard at the top, return early
if (!input || typeof input !== 'string') {
  return { valid: false, error: '<field> is required' };
}
```

Do **not** use:
- `input == null` (use `!input || typeof input !== 'string'` instead — catches both null and undefined plus non-strings in one check)
- `try/catch` around `.trim()` (masks the real issue; guard clauses are the correct fix)
- Optional chaining `input?.trim()` without the early return (silently converts `undefined.trim()` to `undefined`, then `undefined.toLowerCase()` still throws)

---

## Test Expectations

### Existing tests (`tests/validation.test.js`)

After the fix, all tests in the existing suite must pass, including the **currently failing** test:

```js
// Currently throws — must pass after fix:
test('handles undefined or null email without crashing', () => {
  assert.doesNotThrow(() => {
    const result = validateEmail(undefined);
    assert.equal(result.valid, false);
    assert.equal(result.error, 'Email is required');
  });
});
```

The following tests must **continue to pass** unchanged:

| Test | Expected |
|---|---|
| `validates correct email format` | `{ valid: true }` for `'test@example.com'` |
| `rejects malformed email format` | `{ valid: false, error: 'Invalid email address format' }` |
| `rejects empty email string` | `{ valid: false, error: 'Email is required' }` |
| `validates password with sufficient length` | `{ valid: true }` for `'securePassword123'` |
| `rejects short passwords` | `{ valid: false, error: 'Password must be at least 8 characters' }` |
| `rejects missing email in form data without runtime crash` | `{ valid: false }` |

### Property tests (`tests/validation.property.test.js`)

After the fix, all 6 properties must pass. The two properties that are intentionally red before the fix:

| Property | Status before fix | Status after fix |
|---|---|---|
| P1 — validateEmail does not throw for any non-string input | RED | GREEN |
| P2 — validateEmail returns `{ valid: false }` for non-string input | RED | GREEN |
| P3 — validateEmail accepts any valid email string | GREEN | GREEN |
| P4 — validatePassword rejects any string shorter than 8 chars | GREEN | GREEN |
| P5 — validateLoginForm is consistent with component validators | RED (inherits crash) | GREEN |
| P6 — ValidationResult is JSON round-trip safe | GREEN (guarded) | GREEN |

---

## Running Tests

From repo root:

```powershell
# Run the full demo-bug-repo test suite
npm run test:demo

# Run only property-based tests (once validation.property.test.js exists)
npm --prefix examples/demo-bug-repo run test:property

# Run from inside demo-bug-repo directly
node --test tests/validation.test.js tests/validation.property.test.js
```

A clean run (after the fix) looks like:

```
▶ Authentication Validation
  ✔ validates correct email format
  ✔ rejects malformed email format
  ✔ rejects empty email string
  ✔ handles undefined or null email without crashing
  ✔ validates password with sufficient length
  ✔ rejects short passwords
  ✔ rejects missing email in form data without runtime crash

▶ Property-Based Validation Tests
  ✔ validateEmail does not throw for any non-string input
  ✔ validateEmail returns { valid: false } for non-string input
  ✔ validateEmail accepts any valid email string
  ✔ validatePassword rejects any string shorter than 8 characters
  ✔ validateLoginForm is consistent with validateEmail and validatePassword
  ✔ ValidationResult is JSON round-trip safe
```

---

## Ignored Directories

The `localTools.js` file-walker skips these directories automatically. Do not add source files to them:

```
.git  node_modules  dist  build  coverage  .cache  .next  venv  __pycache__  .agents
```
