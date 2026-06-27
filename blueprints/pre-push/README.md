# Pre-Push Security Gate

Deterministic data leak detection for OSS repos. Scans files against configurable wordlist (YAML) to catch internal IDs, credentials, and personal data before pushing.

## Inputs

| Name | Type | Required | Description |
|------|------|----------|-------------|
| target_path | string | Yes | File path or directory to scan |
| wordlist_path | string | No | Path to wordlist configuration file (YAML format). Default: `~/.claude/conductor/pre-push-wordlist.yaml` |
| fail_on_match | boolean | No | Exit with failure status if any error-severity matches found. Default: `true` |

## Cost

Tier: low · ~$0.01/run

## Tags

`security` `pre-push` `leak-detection` `oss` `quality`
