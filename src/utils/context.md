## Overview

This folder contains shared utility helpers used across services and entities. It centralizes cross-cutting support concerns such as ID generation, structured logging, and platform interaction helpers.

## Key Components

- `idGenerator.js`: Exposes `generateUniqueId` to create random hexadecimal IDs used by nodes and edges.
- `logger.js`: Provides a simple logging facade (`info`, `warn`, `error`, `fatal`, `debug`) with consistent prefixes.
- `copyToClipboard` helper (implemented as `copiarTextoParaClipboard` in `src/services/clipboardService.js`): receives the final formatted decklist string and writes it to the OS clipboard.
- Integration flow: entity factories depend on `generateUniqueId` for deterministic object identity, and services use `logger` to report generation, API, and persistence events.

## Clipboard Helper Notes

The clipboard helper is responsible for the final handoff to the operating system when decklist mode is active.

Behavior summary:

- Accepts a single finalized string payload.
- Detects platform and dispatches the appropriate clipboard command.
- Resolves when the command exits successfully, or throws on execution failure.

Quick example:

```javascript
async function copyToClipboard(finalText) {
  // Pass the already formatted output string to the clipboard helper
  await copiarTextoParaClipboard(finalText);

  // Log success after the OS command returns code 0
  logger.info('Decklist output copied to clipboard.');
}
```

## Architectural Rules

- Naming convention is strictly `camelCase` in utility APIs and call sites.
- All comments and docs must be written in English.
- Any referenced code sample must include inline explanatory comments.
- Utilities should remain small, reusable, and free of domain-specific orchestration.
