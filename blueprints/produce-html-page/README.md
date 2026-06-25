# Produce HTML Page

**Cost tier:** medium (~$0.08/run)  
**Best for:** Generating static HTML pages from specifications. Works for any page type: forms, dashboards, documentation, submit widgets, etc.

## What it does

Runs a 3-step pipeline:
1. **Designer** agent: Defines semantic structure, CSS classes, JS interactions, and a11y requirements
2. **Implementer** agent: Builds the complete self-contained HTML file with embedded CSS and JS
3. **Verifier** agent: Validates file existence, HTML5 compliance, feature presence, and accessibility

If verification fails, the loop retries (max 2 rounds).

## Inputs

| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `PAGE_NAME` | ✅ | — | Identifier/filename for the page (e.g., submit, index, dashboard) |
| `PAGE_DESCRIPTION` | ✅ | — | One-paragraph description of page purpose and audience |
| `TARGET_PATH` | ✅ | — | Absolute path where the HTML file must be written |
| `FEATURES` | — | `nav,footer` | Comma-separated list of features/sections (e.g., form,json-viewer,nav,footer) |

## Agent flow

```
PAGE_NAME + PAGE_DESCRIPTION + FEATURES
       ↓
    [Designer]  → structure outline, CSS classes, JS interactions, a11y
       ↓
  [Implementer] → write self-contained HTML to TARGET_PATH
       ↓
   [Verifier]   → check file, HTML5, features, syntax, a11y
       ↓
    PASS/FAIL (max 2 rounds)
```

## Example

```bash
conductor run produce-html-page \
  --PAGE_NAME "submit" \
  --PAGE_DESCRIPTION "Form page for users to submit blueprint specifications. Includes JSON tree viewer for validating schema." \
  --TARGET_PATH "/home/user/web/submit.html" \
  --FEATURES "form,json-viewer,nav,footer"
```

## Output guarantees

- Single `{{TARGET_PATH}}.html` file created
- All dependencies (CSS, JS) embedded — no external CDN calls
- HTML5 compliant with semantic tags
- WCAG 2.1 AA accessibility standards
- Mobile-responsive, mobile-first design
- All requested features present

## Common issues

- **Implementer writes broken CSS/JS**: Verifier catches this and triggers retry (max 2 rounds)
- **File path issues**: Ensure `TARGET_PATH` exists or can be created (e.g., `/path/to/dir/` — implementer will create it)
- **High token cost**: Each re-run costs ~25k tokens; aim to get Verifier PASS on round 1 by being specific in `PAGE_DESCRIPTION` and `FEATURES`
