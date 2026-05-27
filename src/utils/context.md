## Overview

This folder contains shared utility helpers used across services and entities. It centralizes cross-cutting support concerns such as ID generation and structured logging.

## Key Components

- `idGenerator.js`: Exposes `generateUniqueId` to create random hexadecimal IDs used by nodes and edges.
- `logger.js`: Provides a simple logging facade (`info`, `warn`, `error`, `fatal`, `debug`) with consistent prefixes.
- Integration flow: entity factories depend on `generateUniqueId` for deterministic object identity, and services use `logger` to report generation, API, and persistence events.

## Architectural Rules

- Naming convention is strictly `camelCase` in utility APIs and call sites.
- All comments and docs must be written in English.
- Any referenced code sample must include inline explanatory comments.
- Utilities should remain small, reusable, and free of domain-specific orchestration.
