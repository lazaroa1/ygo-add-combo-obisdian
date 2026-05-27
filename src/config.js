const path = require('path');

/**
 * Centralized application configuration
 * Groups all constants and paths in one file
 */

// Obsidian Vault paths
const VAULT_ROOT = 'G:/Meu Drive/MyMind';
const VAULT_SUBDIRS = {
  combos: 'Yugioh/Decks/Combos',
  images: 'Arquivos/Yugioh',
};

const DIRETORIO_CANVAS = path.join(VAULT_ROOT, VAULT_SUBDIRS.combos);
const DIRETORIO_IMAGENS_ABSOLUTO = path.join(VAULT_ROOT, VAULT_SUBDIRS.images);
const PASTA_ANEXOS_RELATIVA = VAULT_SUBDIRS.images;

// Canvas node dimensions
const NODE_DIMENSIONS = {
  width: 274,
  height: 400,
  textWidth: 250,
  textHeight: 60,
};

// Layout spacing (X and Y axes)
const LAYOUT_SPACING = {
  baseHorizontal: 440, // Default horizontal spacing between nodes (NS/SP slightly looser)
  largeHorizontal: 600, // Extra spacing for actions that need more room (ACT EFF, GY EFF)
  verticalBranch: 700, // Vertical spacing for branches (search, material)
  handNodeSpacing: 274, // Spacing between opening hand nodes
  handNodePadding: 150, // Extra spacing after opening hand
  fileBottomOffset: 800, // Y offset for appending a new combo to an existing file
};

// Actions that change horizontal layout spacing
const LARGE_HORIZONTAL_ACTIONS = ['act eff', 'gy eff', 'sp gy', 'hand eff'];

// Actions that create branches (do not follow linear flow)
const BRANCH_ACTION_PATTERNS = {
  search: ['search', 'add', 'busca'],
  material: ['material', 'send gy', 'banish'],
};

// Parsing patterns
const PATTERNS = {
  handStart: /^\s*start\s+hand\s*->/i,
  entityExtractor: /([^\[\-\>\|]+)(?:\[([^\]]+)\])?/g,
  actions: /[\+\|\-]/,
};

module.exports = {
  VAULT_ROOT,
  VAULT_SUBDIRS,
  DIRETORIO_CANVAS,
  DIRETORIO_IMAGENS_ABSOLUTO,
  PASTA_ANEXOS_RELATIVA,
  NODE_DIMENSIONS,
  LAYOUT_SPACING,
  LARGE_HORIZONTAL_ACTIONS,
  BRANCH_ACTION_PATTERNS,
  PATTERNS,
};
