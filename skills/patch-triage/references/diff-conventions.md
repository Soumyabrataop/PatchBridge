# Diff Formatting Conventions

## Unified Diff Format Standard

All proposed fixes must be valid unified diffs:

```diff
--- a/path/to/file.ext
+++ b/path/to/file.ext
@@ -10,4 +10,6 @@
 unchanged context line
-deleted or modified line
+added replacement line
+additional guard clause
 unchanged context line
```

### Guidelines:
- Include 2–3 lines of unchanged surrounding context.
- Keep modifications minimal and localized to the defect site.
- Do not add extraneous whitespace changes or reformatting.
