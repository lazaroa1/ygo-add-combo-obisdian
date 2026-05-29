# YGO Canvas Combo Generator

Node.js script that converts structured text (DSL) into Yu-Gi-Oh! combo diagrams in Obsidian `.canvas` format. The system calculates layout automatically, downloads card images from a public API, and stores attachments in your local Vault.

## Features

- Direct text syntax parser into a directed graph.
- Automatic mode selection between Combo Canvas generation and Decklist data extraction.
- Auto-layout with action-based routing (search goes up, material goes down, etc.).
- YGOPRODeck API integration for card image downloads.
- Native Obsidian Canvas output (`type: "file"` nodes), usable offline after initial downloads.
- Decklist structured output copied directly to clipboard (no `.txt` artifact).

## New Feature: Decklist Data Extractor

The script now automatically detects when the input is a decklist block (for example: `Monster`, `Spell`, `Trap`, `Extra`, `Side`) with numbered card lines.

When decklist mode is selected, the parser:

- Preserves category separators in the output text.
- Extracts `qtd_card` from each row (example: `2 Crossrose Dragon` -> `qtd_card: 2`).
- Fetches card attributes from YGOPRODeck API and applies local fallback values when fields are missing.
- Builds a structured block with:
  - `id`
  - `name`
  - `typeline`
  - `type`
  - `desc`
  - `race`
  - `atk`
  - `def`
  - `level`
  - `attribute`

Important behavior:

- Decklist mode does **not** generate a file.
- The formatted result is automatically copied to the system clipboard, ready for `Ctrl + V`.

## Installation

### Prerequisites

1. Node.js 18+.
2. Git (to clone the repository).

### Steps

1. Clone the repository.
2. Enter the project folder.
3. (Optional) Run `npm install` to keep lockfile and local environment aligned.

> Note: the core engine does not rely on external libraries (it uses native Node modules for parsing, IO, and layout).

## Configuration

Main configuration is no longer in `index.js`. It is now centralized in `src/config.js`.

### 1) Set Vault paths

Edit:

- `VAULT_ROOT`
- `VAULT_SUBDIRS.combos`
- `VAULT_SUBDIRS.images`

These values define where the final `.canvas` file and downloaded images are saved.

### 2) Tune layout spacing (optional)

In `LAYOUT_SPACING` inside `src/config.js`, you can adjust:

- `baseHorizontal`
- `largeHorizontal`
- `verticalBranch`
- `handNodeSpacing`
- `handNodePadding`
- `fileBottomOffset`

## .env Usage

Currently, the project uses environment variables for debug logging:

- `DEBUG`: when set, enables debug logs.

Example `.env` file:

```env
DEBUG=1
```

### Important

- The project **does not auto-load `.env`** (no `dotenv` usage in code).
- On Node 18+, you can set the variable directly in terminal.

Examples:

```bat
:: CMD (Windows)
set DEBUG=1 && node index.js
```

```powershell
# PowerShell (Windows)
$env:DEBUG="1"; node index.js
```

```bash
# Linux/macOS
DEBUG=1 node index.js
```

If you are on Node 20+ and want to load `.env` directly:

```bash
node --env-file=.env index.js
```

## Start Command

Current command to run the generator:

```bash
node index.js
```

In `index.js`, the input combo text is defined in the `comboInputText` string and generation is triggered by:

```javascript
construirCanvas(comboInputText, 'Combo_Trickstar.canvas', DIRETORIO_CANVAS);
```

## DSL Guide

The script reads input line by line. Keep syntax consistent for correct 2D layout behavior. To maximize image match quality, use correct card names (preferably in English).

### 1. `Start hand` (opening hand)

The first line must start with `Start hand ->`.

- Syntax: `Start hand -> Card 1 | Card 2 | Card 3`
- Behavior: opening hand cards are rendered side by side, with specific spacing to separate them from the rest of the combo flow.

### 2. `->` operator (directional connection)

Represents logical/temporal combo flow.

- Left node = source.
- Right node = destination.
- Action: creates an edge (arrow) between nodes.

### 3. `|` and `+` operators (grouping/parallelism)

Used when multiple cards participate in the same step.

- Syntax: `Destination Monster -> Material A[material] + Material B[material]`
- Behavior: step nodes are positioned with horizontal distribution to avoid overlap.

### 4. Brackets `[ ]` (action and routing)

Bracket content:

1. Defines the edge label/action.
2. Controls layout behavior.

Current routing patterns:

- `[search]`, `[busca]`, `[add]`
  - Card acquisition actions (for example, adding a card from Deck/GY to hand or to your available plays).
- `[deck top]`
  - Moves or places a card on the top of the Deck (for setup or stack manipulation).
- `[material]`
  - Indicates cards being used as summoning material (Fusion, Link, Synchro, etc.).
- `[act eff]`, `[gy eff]`
  - Effect activations: `ACT EFF` for activated effects in play, `GY EFF` for effects that trigger/activate in the Graveyard.
- `[enemy turn]`
  - Marks an action that happens during the opponent's turn (for example, interruption, negation, or reactive summons).
- `[next turno]`
  - Marks combo continuation planned for the next turn instead of the current turn sequence.
- `[send gy]`
  - sends the card (from hand or deck) to the Graveyard
- `[sp gy]`
  - the card performs a Special Summon from the Graveyard to the field
- `[hand eff]`
  - activates the card effect in hand
- `[banish]`
  - banishes the card
- `[sp]`, `[ns]`, and labels without keywords
  - Summon/state progression actions: `SP` = Special Summon, `NS` = Normal Summon; unlabeled actions are treated as generic combo progression steps.

---

## Practical Example

### Input

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

### Layout Reading

1. The opening hand is placed at the start of the flow.
2. The main line advances horizontally (`SP`, `NS`, `ACT EFF`, etc.).
3. `search`/`add` actions create upper branches.
4. `material` actions create lower branches.

<img width="1826" height="609" alt="image" src="https://github.com/user-attachments/assets/1d9b7d44-74eb-417c-be0f-f42e074574e8" />

## Decklist Usage (Input -> Clipboard Output)

### Decklist Input Example

```text
Monster
1 Witch of the Black Rose
Spell
1 Terraforming
```

### Pasted Output Example (Clipboard)

```text
[Monster]
qtd_card: 1
id: 73544866
name: Witch of the Black Rose
typeline: Spellcaster / Tuner / Effect
type: Effect Monster
desc: If this card is Normal or Special Summoned: You can send 1 "Black Rose Dragon" from your Extra Deck to the GY. You can banish this card from your GY, then target 1 "Black Rose Dragon" in your GY; Special Summon it.
race: Spellcaster
atk: 1700
def: 800
level: 4
attribute: DARK

[Spell]
qtd_card: 1
id: 73628505
name: Terraforming
typeline:
type: Spell Card
desc: Add 1 Field Spell from your Deck to your hand.
race: Normal
atk:
def:
level:
attribute:
```

> Note: category lines are preserved as visual separators in the final output. For cards without certain attributes (for example Spell/Trap cards), missing fields are returned as empty values.

## Architecture: Script Modes

The parser uses a strategy factory with automatic mode detection:

- If input contains `Start hand ->` or flow chains with `->`: activates **Combo mode** (Canvas generation).
- If input contains decklist categories (`Monster`, `Spell`, `Trap`, `Extra`, `Side`) with numbered rows: activates **Decklist mode** (attribute extraction + clipboard copy).

This allows a single entrypoint to process both workflows without manual mode switching.

## Expected Output

When you run the script, the console shows:

- image download status (if an image already exists, download is skipped);
- `.canvas` generation/update confirmation.

Then open Obsidian and load the file from your configured output folder.
