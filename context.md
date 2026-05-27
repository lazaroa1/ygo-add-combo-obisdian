## Overview

This document describes the project entrypoint responsibility requested as `index.ts`. In the current repository state, the active entrypoint is `index.js`, which bootstraps combo text processing and canvas generation.

## Key Components

- Imports `construirCanvas` from `src/services/canvasBuilder` to orchestrate the full pipeline.
- Imports output directory configuration from `src/config`.
- Declares input combo text and calls `construirCanvas` with text, target filename, and destination directory.
- Integration flow: entrypoint input is parsed (`comboParser`), transformed into graph entities (`entities`), enriched with card images (`cardImageService`), and persisted as canvas JSON.

## Architectural Rules

- Naming convention is strictly `camelCase` for variables and any future entrypoint helpers.
- All comments and documentation must be in English.
- Any referenced code sample must include inline explanatory comments.
- Keep the entrypoint thin: it should coordinate inputs and delegate domain behavior to services.
