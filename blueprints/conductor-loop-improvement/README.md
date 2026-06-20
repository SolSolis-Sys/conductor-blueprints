# Conductor Loop Improvement Blueprint

Audits and improves the loop configuration of an existing conductor blueprint. This meta-blueprint analyzes risks like infinite loops, unclear exit conditions, and inadequate max_rounds, then proposes improvements through a three-agent workflow.

## Inputs

| Input | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `loop_config` | string | Yes | — | JSON string of the loop config to audit |
| `blueprint_name` | string | No | `"unknown"` | Blueprint name for context |

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| `verdict` | string | Final verdict: `IMPROVED` or `KEEP` |
| `improved_config` | object | Improved loop configuration |
| `diff_summary` | string | Summary of changes made |
| `audit_report` | object | Detailed audit findings from loop-auditor |

## Agent Flow

```
┌─────────────────────────────────────────────────────────┐
│ INPUT: loop_config, blueprint_name                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 1. LOOP-AUDITOR (Parallel)                              │
│    • Verify exit_condition testability                  │
│    • Check max_rounds adequacy                          │
│    • Validate trigger/on_success/on_failure presence    │
│    • Identify infinite loop & timeout risks             │
│    Output: audit_findings                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. LOOP-IMPROVER (Sequential)                           │
│    • Generate hardened configuration                    │
│    • Add safety guards & fallbacks                      │
│    • Optimize trigger conditions                        │
│    • Enhance exit_condition clarity                     │
│    Output: improved_config, changes                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. SYNTHESIZER (Sequential)                             │
│    • Produce final verdict: IMPROVED or KEEP            │
│    • Compare original vs improved                       │
│    • Rate risk reduction                                │
│    • Output structured results                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ OUTPUT: verdict, improved_config, diff_summary,         │
│         audit_report                                    │
└─────────────────────────────────────────────────────────┘
```

## Agent Responsibilities

### Loop Auditor
Analyzes the provided loop configuration for structural and operational risks:
- **Exit Condition Analysis**: Ensures the exit_condition is testable, deterministic, and unambiguous
- **Max Rounds Validation**: Checks that max_rounds is appropriate for the blueprint's complexity and agent count
- **Field Presence Check**: Verifies trigger, on_success, and on_failure are defined
- **Risk Detection**: Identifies infinite loop patterns, timeout vulnerabilities, and concurrency issues
- **Report**: Detailed audit_findings object with severity levels and recommendations

### Loop Improver
Generates an improved configuration addressing the auditor's findings:
- **Safety Hardening**: Adds defensive patterns like timeout guards and fallback handlers
- **Clarity Enhancement**: Refines exit_condition wording and trigger logic for clarity
- **Optimization**: Adjusts max_rounds based on agent responsibilities and estimated execution time
- **Change Tracking**: Documents all modifications in a structured changes object
- **Output**: Both improved_config and a list of specific changes made

### Synthesizer
Produces the final verdict and structured output:
- **Verdict Decision**: Determines if configuration warrants the IMPROVED or KEEP status
- **Risk Reduction Rating**: Quantifies improvement (e.g., "50% reduction in infinite loop risk")
- **Diff Generation**: Creates human-readable summary of changes between original and improved
- **Report Compilation**: Assembles audit_report object with all findings
- **Structured Output**: Ensures all outputs match the blueprint's output schema

## Configuration Details

**Loop Settings:**
- `max_rounds`: 1 (meta-analysis completes in single pass)
- `exit_condition`: Deterministic exit when synthesizer produces verdict
- `on_success`: Output improved configuration with diff summary
- `on_failure`: Return original configuration with audit findings for manual review

**Cost Profile:**
- Tier: `low`
- Estimated tokens: ~15,000
- Estimated cost: ~$0.05
- Breakdown: audit (~4k) + improvement (~6k) + synthesis (~5k)

## Use Cases

1. **Pre-Deployment Loop Review**: Audit loop configs before deploying blueprints to production
2. **Risk Reduction**: Identify and eliminate infinite loop patterns early
3. **Exit Condition Hardening**: Ensure exit conditions are testable and non-ambiguous
4. **Max Rounds Optimization**: Adjust round limits based on actual agent workloads
5. **Meta-Quality Assurance**: Use as part of blueprint validation pipelines

## Quality Gates

All of the following must pass for approved output:
- [ ] exit_condition is testable and deterministic
- [ ] max_rounds is sufficient for agent analysis
- [ ] all required fields present in improved config
- [ ] diff_summary accurately describes changes
- [ ] no infinite loop risks in resulting configuration

## Example Usage

```json
{
  "blueprint": "conductor-loop-improvement",
  "inputs": {
    "loop_config": "{\"max_rounds\": 5, \"exit_condition\": \"agent finishes\", \"on_success\": \"continue\"}",
    "blueprint_name": "my-blueprint"
  }
}
```

## Author & License

- **Author**: SolSolis-Sys
- **License**: MIT
- **Tags**: conductor, loop, self-improvement, meta, quality
- **Conductor Version**: ≥1.0.0
- **Schema Version**: 1.0.0

## Troubleshooting

**Q: Exit condition is always true?**
A: Loop-Improver will refine with explicit state checks (e.g., `synthesizer.verdict === 'IMPROVED'`)

**Q: Max rounds too low for complex audits?**
A: Designed for single-pass analysis; for iterative improvement, use loop_config with higher rounds in production blueprint

**Q: No changes suggested?**
A: Verdict will be `KEEP`; original configuration is likely sound

## See Also

- [Conductor Blueprint Schema](../schemas/blueprint.v1.json)
- [Loop Configuration Guide](../docs/LOOP-CONFIG.md)
- [Meta-Blueprint Patterns](../docs/META-PATTERNS.md)
