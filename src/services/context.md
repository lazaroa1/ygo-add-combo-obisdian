## Overview

This folder contains the application service layer that orchestrates combo parsing, node/edge generation, image resolution, and canvas file persistence. It acts as the bridge between raw input text and the final canvas JSON artifact.

## Key Components

- `canvasBuilder.js`: Main orchestration service that coordinates the full workflow: load existing canvas, parse input lines, calculate layout-driven node positions, create connections, convert nodes to canvas format, and save output.
- `comboParser.js`: Parsing service that transforms combo text syntax into structured steps and entities, including opening-hand detection and action extraction.
- `cardImageService.js`: Image service that resolves card image paths by checking local cache first and downloading from the external API when needed.
- Integration flow: entrypoint calls `construirCanvas` -> parser converts text into structured steps -> entities/layout modules create positioned graph objects -> image service enriches nodes with media paths -> builder writes updated canvas content.

## Architectural Rules

- Naming convention is strictly `camelCase` for new files, functions, variables, and exports.
- All comments and documentation must be written in English.
- Any referenced code sample must include inline explanatory comments.
- Keep orchestration logic in services and avoid moving low-level entity structure concerns into this layer.
