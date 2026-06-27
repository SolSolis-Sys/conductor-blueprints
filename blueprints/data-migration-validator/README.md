# Data Migration Validator

Pre-execution validation for data migration scripts: idempotence check, data completeness, rollback viability, and edge case handling.

## Inputs

| Name | Type | Required | Description |
|------|------|----------|-------------|
| migration_script | string | Yes | Path to migration script or description of migration logic |
| source_data_desc | string | Yes | Description of source data format |
| destination_data_desc | string | Yes | Description of destination data format |
| record_count_source | number | No | Expected source record count (0 if unknown). Default: `0` |
| edge_cases | string | No | Known edge cases to test. Default: `empty fields, null values, encoding` |

## Cost

Tier: medium · ~$0.13/run

## Tags

`migration` `data` `validation` `quality` `database`
