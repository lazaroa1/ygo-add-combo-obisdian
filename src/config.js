const path = require("path");

/**
 * Configuração centralizada da aplicação
 * Agrupa todas as constantes e paths em um único arquivo
 */

// Paths do Obsidian Vault
const VAULT_ROOT = "G:/Meu Drive/MyMind";
const VAULT_SUBDIRS = {
  combos: "Yugioh/Decks/Combos",
  images: "Arquivos/Yugioh",
};

const DIRETORIO_CANVAS = path.join(VAULT_ROOT, VAULT_SUBDIRS.combos);
const DIRETORIO_IMAGENS_ABSOLUTO = path.join(VAULT_ROOT, VAULT_SUBDIRS.images);
const PASTA_ANEXOS_RELATIVA = VAULT_SUBDIRS.images;

// Dimensões de nós no canvas
const NODE_DIMENSIONS = {
  width: 274,
  height: 400,
  textWidth: 250,
  textHeight: 60,
};

// Espaçamento no layout (eixos X e Y)
const LAYOUT_SPACING = {
  baseHorizontal: 440, // Espaço horizontal padrão entre nós (NS/SP um pouco mais soltos)
  largeHorizontal: 600, // Espaço para ações que ocupam mais espaço (ACT EFF, GY EFF)
  verticalBranch: 700, // Espaço vertical para ramificações (search, material)
  handNodeSpacing: 274, // Espaço entre nós da mão inicial
  handNodePadding: 150, // Espaçamento após nós da mão
  fileBottomOffset: 800, // Offset de Y para novo arquivo
};

// Ações que modificam o layout horizontal
const LARGE_HORIZONTAL_ACTIONS = ["act eff", "gy eff"];

// Ações que criam ramificações (não seguem a sequência linear)
const BRANCH_ACTION_PATTERNS = {
  search: ["search", "add", "busca"],
  material: ["material"],
};

// Padrões de parsing
const PATTERNS = {
  handStart: /^start hand/i,
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
