## Overview

This folder is reserved to document the node domain boundary in the architecture. In the current codebase, node creation logic is implemented in `src/entities/node.js`, and this context file clarifies that mapping.

## Key Components

- Current implementation location: `src/entities/node.js` is the active node factory module.
- Node responsibility: generate internal node models with stable IDs, card/action metadata, and spatial dimensions.
- Canvas conversion responsibility: map internal nodes into output node formats (image file nodes or fallback text nodes).
- Integration flow: `canvasBuilder` creates nodes through the node factory and then delegates image resolution to `cardImageService` before writing canvas JSON.

## Architectural Rules

- Naming convention is strictly `camelCase` for folder names, files, symbols, and exported APIs.
- All comments and documentation text must be in English.
- Any referenced code sample must include inline explanatory comments.
- If a dedicated `src/node` implementation is introduced later, keep behavior aligned with `src/entities/node.js` to preserve output compatibility.
