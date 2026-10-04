# Demo Bug Repository — LoginForm Validation Crash

This is the official test repository for demonstrating **PatchBridge**.

## 🐛 The Bug

When submitting the authentication form with an empty email (or when `formData.email` is undefined), `validateEmail` in `src/validation.js` crashes at line 18:

```text
TypeError: Cannot read properties of undefined (reading 'trim')
    at validateEmail (src/validation.js:18:28)
    at validateLoginForm (src/validation.js:36:23)
```

## 📂 Repository Structure

```text
demo-bug-repo/
├── src/
│   ├── LoginForm.jsx       # React component rendering form
│   └── validation.js       # Validation logic with missing null guard at line 18
├── tests/
│   └── validation.test.js  # Node test suite reproducing the crash
└── assets/
    └── error-screenshot.png # Screenshot of the error console & UI
```

## 🧪 Running the Failing Tests

```bash
npm test
```
