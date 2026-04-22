const { PATTERNS } = require("../config");

/**
 * Parser de combos em formato textual
 * Responsabilidade: extrair informações estruturadas do input de combo
 */

/**
 * Extrai nome da carta e ação do texto de uma entidade
 * @param {string} entityStr - String contendo "nome[acao]"
 * @returns {Object} { name, action }
 */
function extrairNomeEAcao(entityStr) {
  const match = PATTERNS.entityExtractor.exec(entityStr);
  PATTERNS.entityExtractor.lastIndex = 0;

  if (!match) {
    return { name: null, action: null };
  }

  const name = match[1].trim();
  const action = (match[2] || "").trim().toLowerCase();

  return { name, action };
}

/**
 * Extrai lista de entidades (cartas) de uma string
 * Suporta separadores: +, |, -
 * @param {string} step - String contendo entidades separadas
 * @returns {Array<string>} Lista de strings de entidades
 */
function extrairEntidades(step) {
  return step
    .split(PATTERNS.actions)
    .map((e) => e.trim())
    .filter((e) => e);
}

/**
 * Extrai e parseia a mão inicial (Start hand)
 * Formato: "Start hand -> Carta1 | Carta2 | Carta3"
 * @param {string} line - Linha contendo a mão inicial
 * @returns {Array<Object>} Array com [ { name, action } ]
 */
function parseaInicialCombo(line) {
  const partes = line.split("->");

  if (partes.length <= 1) {
    return [];
  }

  const entidades = partes[1]
    .split("|")
    .map((e) => e.trim())
    .filter((e) => e);

  return entidades.map((entity) => {
    const { name } = extrairNomeEAcao(entity);
    return { name, action: "" };
  });
}

/**
 * Parseia uma sequência de cartas em um passo
 * Formato: "Carta1[acao1] + Carta2[acao2] -> Carta3[acao3]"
 * @param {string} line - Linha contendo sequência de cartas
 * @returns {Array<Array<Object>>} Array de passos, cada um com array de { name, action }
 */
function parseaSequenciaCombo(line) {
  const etapas = line.split("->").map((s) => s.trim());
  const sequencia = [];

  for (const etapa of etapas) {
    const entidades = extrairEntidades(etapa);
    const cartasNaEtapa = entidades.map((entity) => extrairNomeEAcao(entity));
    sequencia.push(cartasNaEtapa);
  }

  return sequencia;
}

/**
 * Verifica se uma linha contém a definição da mão inicial
 * @param {string} line - Linha a verificar
 * @returns {boolean} True se é início de combo
 */
function ehInicioDoComboo(line) {
  return PATTERNS.handStart.test(line);
}

/**
 * Alias com nome corrigido para manter semântica clara.
 * @param {string} line - Linha a verificar
 * @returns {boolean} True se é início de combo
 */
function ehInicioDoCombo(line) {
  return ehInicioDoComboo(line);
}

/**
 * Parseia o input de combo completo
 * @param {string} inputText - Texto contendo todas as linhas de combo
 * @returns {Object} { inicial: Array, sequencia: Array<Array<Object>> }
 */
function parseaComboCompleto(inputText) {
  const linhas = inputText
    .split("\n")
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
