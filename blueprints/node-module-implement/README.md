# Node.js Module Implementation

Implements a Node.js module from a structured ticket spec using a goldenflux hybrid approach: repo analysis → code generation → test verification → quality review.

## Inputs

| Name | Type | Required | Description |
|------|------|----------|-------------|
| ticket_spec | string | Yes | Full ticket content (title + description + DONE-WHEN criteria) |
| target_dir | string | Yes | Absolute path to the repository |
| module_name | string | Yes | Name of the module to implement (e.g., 'scoring') |
| test_command | string | Yes | Command to run tests (e.g., 'npm test') |

## Cost

Tier: medium · ~$0.09/run

## Tags

`node` `implement` `module` `goldenflux` `tdd` `code-generation`
