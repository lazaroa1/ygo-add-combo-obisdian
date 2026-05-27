## Overview

This folder defines the core graph entities used to build the canvas output for combo visualization. It provides factories for nodes and edges, plus a layout engine that computes positions and connector directions.

It also documents the extended card data mapping consumed by decklist parsing mode, which standardizes attribute fields before formatting clipboard output.

## Key Components

- `node.js`: Creates internal node objects (`criarNo`) and converts them into canvas-compatible file/text nodes (`converterParaNoComImagem`, `converterParaNoComTexto`).
- `edge.js`: Creates directed connections between nodes (`criarConexao`) and supports many-to-many step links (`criarConexoesEntreListas`).
- `layoutEngine.js`: Encapsulates layout rules for linear progression, branch positioning (`search`, `material`), opening hand spacing, and edge side selection.
- Integration flow: `canvasBuilder` consumes these entities to transform parsed combo steps into positioned nodes and linked edges, then persists the final canvas JSON.

## Extended Decklist Card Data Mapping

Decklist mode consumes a normalized card data shape that contains both shared card fields and optional combat/stat fields.

Reference shape:

```javascript
const extendedCardData = {
  id: 73544866, // Numeric card identifier from API
  name: 'Witch of the Black Rose', // Canonical card name
  typeline: ['Spellcaster', 'Tuner', 'Effect'], // Type segments used for display
  type: 'Effect Monster', // High-level card type
  desc: 'Card effect text...', // Full effect/description text
  race: 'Spellcaster', // Race or spell/trap subtype
  atk: 1700, // Empty when card does not provide atk
  def: 800, // Empty when card does not provide def
  level: 4, // Empty for card families without level
  attribute: 'DARK', // Empty when attribute is not available
};
```

Normalization rules:

- `typeline` can be an array and is later joined as a slash-separated string.
- Missing properties are converted to empty values by the formatter.
- The mapping remains stable regardless of whether data comes from API payloads or fallback objects.

## Architectural Rules

- Naming convention is strictly `camelCase` across new identifiers, functions, and variables.
- All documentation and code comments must be written in English.
- Any referenced code sample must include inline explanatory comments.
- Keep this layer focused on structure and positioning logic; avoid I/O responsibilities here.
