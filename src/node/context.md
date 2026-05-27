## Overview

This folder documents the parser entry architecture that feeds the node and canvas pipeline. The system now uses a Strategy pattern to support two input families through one entrypoint:

- `comboGraphParserStrategy`: parses combo flow syntax and returns graph-ready data.
- `decklistParserStrategy`: parses decklist sections and returns structured card attributes for clipboard output.

## Parsing Strategy Design Pattern

The parsing flow is organized around `ParserFactory`, which receives a prioritized list of strategy objects. Each strategy must implement two methods:

- `canHandle(inputText)`: checks whether the strategy supports the input format.
- `parse(inputText)`: returns normalized output for the selected mode.

This pattern keeps parsing rules isolated, avoids conditional sprawl in the main service, and allows new modes to be added with minimal changes.

## Entrypoint Selection Flow

`parsearEntradaPrincipal` delegates to `parserFactory.parse(inputText)`. The factory resolves the first strategy where `canHandle` returns `true`.

Resolution behavior:

- If the input contains combo markers such as `Start hand ->` or `->`, `comboGraphParserStrategy` is selected.
- If the input contains deck sections (`monster`, `spell`, `trap`, `extra`, `side`) followed by quantity rows, `decklistParserStrategy` is selected.

The selected result is then consumed by `canvasBuilder`:

- `comboGraph` output continues through node creation, layout, and canvas persistence.
- `decklist` output bypasses canvas generation and is copied to clipboard.

## Example

```javascript
const parseResult = await parsearEntradaPrincipal(inputText); // Resolve strategy using content

if (parseResult.parserType === 'comboGraph') {
  // Continue node and edge creation for canvas mode
  await construirFluxoCanvas(parseResult.lines);
}

if (parseResult.parserType === 'decklist') {
  // Forward structured text to clipboard mode
  await copiarTextoParaClipboard(parseResult.output);
}
```

## Architectural Rules

- Naming convention is strictly `camelCase` for folder names, files, symbols, and exported APIs.
- All comments and documentation text must be in English.
- Any referenced code sample must include inline explanatory comments.
- If a dedicated `src/node` implementation is introduced later, keep behavior aligned with `src/entities/node.js` to preserve output compatibility.
