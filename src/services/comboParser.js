const { PATTERNS } = require('../config');

/**
 * Combo parser for text format
 * Responsibility: extract structured information from combo input
 */

/**
 * Normalize action tags to internal canonical format.
 * Example: "Act   Eff" -> "act eff"
 * @param {string} action - Raw action text
 * @returns {string} Normalized action
 */
function normalizarAcao(action) {
  return (action || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Extract card name and action from an entity string
 * @param {string} entityStr - String containing "name[action]"
 * @returns {Object} { name, action }
 */
function extrairNomeEAcao(entityStr) {
  const normalizedEntity = (entityStr || '').trim();
  const match = normalizedEntity.match(PATTERNS.entityExtractor);

  if (!match) {
    return { name: null, action: null };
  }

  let name = match[1].trim();
  let action = normalizarAcao(match[2]);

  // Handle action keywords appended directly to the card name without brackets
  if (!action) {
    const suffixMatch = name.match(PATTERNS.nonBracketActionSuffix);
    if (suffixMatch) {
      action = normalizarAcao(suffixMatch[1]);
      name = name.slice(0, -suffixMatch[0].length).trim();
    }
  }

  return { name, action };
}

/**
 * Extract entity (card) list from a string
 * Supports separators: +, |
 * @param {string} step - String containing separated entities
 * @returns {Array<string>} List of entity strings
 */
function extrairEntidades(step) {
  return step
    .split(PATTERNS.actions)
    .map((e) => e.trim())
    .filter((e) => e);
}

/**
 * Extract and parse opening hand (Start hand)
 * Format: "Start hand -> Card1 | Card2 | Card3"
 * @param {string} line - Line containing the opening hand
 * @returns {Array<Object>} Array with [ { name, action } ]
 */
function parseaInicialCombo(line) {
  const conteudoSemCabecalho = line.replace(/^\s*start\s+hand\s*->\s*/i, '');

  if (!conteudoSemCabecalho) {
    return [];
  }

  const entidades = conteudoSemCabecalho
    .split('|')
    .map((e) => e.trim())
    .filter((e) => e);

  return entidades.map((entity) => {
    const { name } = extrairNomeEAcao(entity);
    return { name, action: '' };
  });
}

/**
 * Parse a card sequence into a step list
 * Format: "Card1[action1] + Card2[action2] -> Card3[action3]"
 * @param {string} line - Line containing card sequence
 * @returns {Array<Array<Object>>} Array of steps, each containing { name, action }
 */
function parseaSequenciaCombo(line) {
  const etapas = line.split('->').map((s) => s.trim());
  const sequencia = [];

  for (const etapa of etapas) {
    const entidades = extrairEntidades(etapa);
    const cartasNaEtapa = entidades.map((entity) => extrairNomeEAcao(entity));
    sequencia.push(cartasNaEtapa);
  }

  return sequencia;
}

/**
 * Check whether a line defines opening hand
 * @param {string} line - Line to check
 * @returns {boolean} True if combo start
 */
function ehInicioDoComboo(line) {
  return PATTERNS.handStart.test(line);
}

/**
 * Alias with corrected name for clearer semantics.
 * @param {string} line - Line to check
 * @returns {boolean} True if combo start
 */
function ehInicioDoCombo(line) {
  return ehInicioDoComboo(line);
}

/**
 * Parse full combo input
 * @param {string} inputText - Text containing all combo lines
 * @returns {Object} { inicial: Array, sequencia: Array<Array<Object>> }
 */
function parseaComboCompleto(inputText) {
  const linhas = inputText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line);

  const inicial = [];
  const sequencia = [];

  for (const linha of linhas) {
    if (ehInicioDoComboo(linha)) {
      inicial.push(...parseaInicialCombo(linha));
    } else {
      sequencia.push(...parseaSequenciaCombo(linha));
    }
  }

  return { inicial, sequencia };
}

module.exports = {
  parseaComboCompleto,
  parseaSequenciaCombo,
  parseaInicialCombo,
  extrairNomeEAcao,
  extrairEntidades,
  ehInicioDoCombo,
  ehInicioDoComboo,
};
