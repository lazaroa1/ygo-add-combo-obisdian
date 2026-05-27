## Overview

This document describes the role of `src/config.js`, which centralizes runtime constants and parsing/layout parameters used throughout the project.

## Key Components

- Vault paths: defines root and subdirectory constants used for canvas output and image storage.
- Node dimensions: standardizes canvas node width/height and text fallback sizing.
- Layout spacing: controls horizontal progression, branch offsets, opening hand spacing, and append offset for existing files.
- Parsing patterns: stores regex patterns and action lists used by `comboParser` and `layoutEngine`.
- Integration flow: services and entities import these constants to stay synchronized in parsing behavior, positioning logic, and file destination conventions.

## Architectural Rules

- Naming convention is strictly `camelCase` for all newly introduced identifiers.
- All comments and documentation must be in English.
- Any referenced code sample must include inline explanatory comments.
- Keep configuration declarative; avoid embedding orchestration logic in config modules.
