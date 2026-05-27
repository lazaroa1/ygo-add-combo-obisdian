## Overview

This folder defines the core graph entities used to build the canvas output for combo visualization. It provides factories for nodes and edges, plus a layout engine that computes positions and connector directions.

## Key Components

- `node.js`: Creates internal node objects (`criarNo`) and converts them into canvas-compatible file/text nodes (`converterParaNoComImagem`, `converterParaNoComTexto`).
- `edge.js`: Creates directed connections between nodes (`criarConexao`) and supports many-to-many step links (`criarConexoesEntreListas`).
- `layoutEngine.js`: Encapsulates layout rules for linear progression, branch positioning (`search`, `material`), opening hand spacing, and edge side selection.
- Integration flow: `canvasBuilder` consumes these entities to transform parsed combo steps into positioned nodes and linked edges, then persists the final canvas JSON.

## Architectural Rules

- Naming convention is strictly `camelCase` across new identifiers, functions, and variables.
- All documentation and code comments must be written in English.
- Any referenced code sample must include inline explanatory comments.
- Keep this layer focused on structure and positioning logic; avoid I/O responsibilities here.
