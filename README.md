# YGO Canvas Combo Generator

Node.js script designed to convert structured text (DSL) into visual Yu-Gi-Oh! combo diagrams directly in Obsidian's `.canvas` format. The system performs automatic node routing, fetches images via a public API, and saves attachments in the local Vault.

## Features

- **Direct Syntax Parser:** Converts plain text into directed graphs.
- **Dynamic Routing (Auto-Layout):** Calculates X and Y coordinates automatically based on combo actions (e.g., searches go up, materials go down).
- **YGOPRODeck API Integration:** Automatically fetches and downloads card images based on the input name.
- **Native Obsidian Format:** Generates JSON files compatible with Obsidian Canvas (`type: "file"`), ensuring offline functionality after the initial download.

## Prerequisites and Installation

1. Requires **Node.js** (v18+ recommended due to native `fetch` API usage).
2. Clone the repository.
3. There are no external dependencies (NPM) in this script; it uses only native Node modules (`fs`, `path`, `crypto`).
   - **Dependency Note:** If you have a `node_modules` folder or `package.json` files from previous iterations (which included the `dagre` library), you can delete them. The layout engine is now 100% native and independent.

## Setup and Configuration

Before running, edit the configuration block at the top of the `index.js` file to point to your system's directories. Additionally, you can adjust the spacing constants to change how far apart the cards are placed on the Canvas.

```javascript
// --- VAULT CONFIGURATIONS ---
const VAULT_ROOT = "C:/Path/To/Your/Vault"; // Replace with your Obsidian vault root
const DIRETORIO_CANVAS = path.join(VAULT_ROOT, "Yugioh/Decks/Combos"); // Where the .canvas will be saved
const NOME_ARQUIVO = "Combo_Trickstar.canvas"; // Final file name

const PASTA_ANEXOS_RELATIVA = "Arquivos/Yugioh"; // Folder to save downloaded images
const DIRETORIO_IMAGENS_ABSOLUTO = path.join(VAULT_ROOT, PASTA_ANEXOS_RELATIVA);

// --- SPACING (Adjust here) ---
const STEP_X_BASE = 400; // Standard horizontal space between normal cards
const STEP_X_LARGE = 600; // Extended horizontal space to accommodate arrows with long texts (e.g., ACT EFF)
const STEP_Y_BRANCH = 900; // Vertical space used to separate branches (search upwards, material downwards)
```

## Syntax Guide (DSL)

The script reads the input text (`inputText`) line by line. Correct formatting is strictly necessary for the two-dimensional layout calculation. **Attention:** Card names must be written with the correct spelling (preferably in English) so the API can locate them and download the images.

### 1. `Start hand` (Initial Hand)

The first line of the combo must obligatorily start with `Start hand ->`.

- **Syntax:** `Start hand -> Card 1 | Card 2 | Card 3`
- **Behavior:** The script understands these are the cards in hand and renders them side-by-side (attached, without arrows between them), adding a larger gap only at the end of the block to visually separate the initial hand from the first combo play.

### 2. The `->` Operator (Directional Connection)

Represents the logical and temporal flow of the combo.

- The left node is the origin; the right node is the destination.
- **Action:** Creates an edge (line/arrow) connecting the two nodes on the Canvas, dictating the play's direction.

### 3. The `|` or `+` Operators (Grouping/Parallelism)

Used when multiple cards are part of the same simultaneous step (e.g., using multiple monsters as material for a single Link or Fusion Summon).

- **Syntax:** `Destination Monster -> Material A[material] + Material B[material]`
- **Behavior:** Processes the grouped nodes in the same temporal step. The algorithm distributes these cards symmetrically around the origin card's central axis, connecting them all correctly without visual overlap.

### 4. The Brackets `[ ]` (Actions and Layout Engine)

The content inside the brackets serves a dual purpose:

1. Defines the **line label** (the text appearing above the arrow).
2. Controls the **positioning algorithm** (X and Y coordinates) of that card on the Obsidian Canvas.

The layout engine identifies specific keywords inside the brackets to dictate routing:

- **`[search]`, `[busca]`, `[add]`**
  - **Routing:** Negative Y-Axis. The card is pushed **upwards** relative to the main line, applying the distance defined in `STEP_Y_BRANCH`. Indicates branches where cards are added to the hand or field outside the main flow.
- **`[material]`**
  - **Routing:** Positive Y-Axis. The card is pushed **downwards** relative to the main line (using `STEP_Y_BRANCH`). Ideal for cards sent to the graveyard as a cost or used as extra deck summon material. If multiple materials are grouped with `+`, they are aligned horizontally side-by-side on the lower level.
- **`[act eff]`, `[gy eff]`**
  - **Routing:** Extended X-Axis. Keeps the card on the main horizontal line, but replaces the standard step (`STEP_X_BASE`) with the extended step (`STEP_X_LARGE`). This increases the arrow length to prevent long labels from overlapping and covering the card images.
- **`[sp]`, `[ns]`, or labels without keywords**
  - **Routing:** Standard X-Axis. Continues the normal flow of the main line, from left to right, advancing by the base distance (`STEP_X_BASE`).

---

## Practical Example

### Input Text (`inputText`)

```text
Start hand -> Trickstar Festival | Trickstar Light Stage | Trickstar Aqua Angel
Trickstar Festival[ACT EFF]
Trickstar Holly Angel[SP]
Trickstar Light Stage[ACT EFF] -> Trickstar Candina[search]
Trickstar Candina[NS] -> trickstar hoody[search]
trickstar hoody[SP]
Trickstar Bloom[SP] -> trickstar hoody[material]
trickstar hoody[GY EFF] -> Trickstar Fusion[search]
Trickstar Colchica[SP] -> Trickstar Candina[material]
Trickstar Fusion[ACT EFF]
Trickstar Band Drumatis[SP] -> Trickstar Colchica[material] + trickstar hoody[material] -> Trickstar Lilybell[search]
```

### Understanding the Layout Logic

Based on the input text above, the algorithm processes the layout as follows (generally from left to right):

1. **The Hand:** "Trickstar Festival", "Light Stage" and "Aqua Angel" are drawn attached at the beginning.
2. **The Main Flow:** Main events (`SP`, `NS`, `ACT EFF`) progress in a straight line. When the action is `ACT EFF` or `GY EFF`, the horizontal space expands.
3. **Upper Branches:** Any card marked with `[search]` (e.g., "Candina", "Hoody", "Fusion", "Lilybell") is drawn above the timeline.
4. **Lower Branches:** Cards marked as `[material]` (e.g., "Candina", and the duo "Colchica + Hoody") are drawn on the bottom, with groupings perfectly centered.

_(Add the result image here in the repository)_
![Output Example](path_to_your_image/image_637c60.png)

## Execution

After configuring the directory variables in the script and defining your combo in the `inputText` variable (or importing from an external `.txt` file), open the terminal in the project folder and run:

```bash
node index.js
```

The console will display the status of image downloads (if the image already exists in the local folder, the download is skipped) and the confirmation message of the `.canvas` file generation. Open your Obsidian to view the result.
