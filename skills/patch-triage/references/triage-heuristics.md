# Triage Heuristics & Evidence Rules

## Evidence Verification Rules

1. **Exact File and Line Citation**:
   Every diagnostic claim must map to an inspected file path and line number.
   - Correct: `src/validation.js:18: Calling .trim() on undefined throws TypeError`
   - Incorrect: `Validation logic somewhere in the auth folder probably has an error`

2. **Classification of Defect Types**:
   - **Type / Null Safety**: Method calls on `undefined` or `null`. Solution: Guard clauses, optional chaining, default values.
   - **Form Submission / Validation**: Unhandled empty inputs or type coercion failures.
   - **Asynchronous / Race Condition**: Missing `await`, unhandled Promise rejections.

3. **Human Review Escalation**:
   Escalate to human maintainers when:
   - Root cause requires architectural or schema refactoring.
   - Error cannot be traced to existing source files.
