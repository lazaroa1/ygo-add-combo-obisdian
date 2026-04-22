const { generateUniqueId } = require("../utils/idGenerator");

/**
 * Factory para criar conexões/arestas entre nós
 * Responsabilidade: encapsular estrutura de edge
 */

/**
 * Cria uma conexão entre dois nós
 * @param {Object} nodeOrigem - Nó de origem { id, ... }
 * @param {Object} nodeDestino - Nó de destino { id, label, ... }
 * @param {string} sideDe - Lado de saída do nó origem (top/bottom/left/right)
 * @param {string} sidePara - Lado de entrada do nó destino
 * @returns {Object} Objeto da aresta/conexão
 */
function criarConexao(nodeOrigem, nodeDestino, sideDe, sidePara) {
  const conexao = {
    id: generateUniqueId(),
    fromNode: nodeOrigem.id,
    fromSide: sideDe,
    toNode: nodeDestino.id,
    toSide: sidePara,
  };

  // Adiciona label apenas se houver
  if (nodeDestino.label) {
    conexao.label = nodeDestino.label;
  }

  return conexao;
}

/**
 * Cria múltiplas conexões entre dois grupos de nós
 * @param {Array<Object>} nodosOrigem - Array de nós de origem
 * @param {Array<Object>} nodosDestino - Array de nós de destino
 * @param {Object} sides - { fromSide, toSide }
 * @returns {Array<Object>} Array de arestas criadas
 */
function criarConexoesEntreListas(nodosOrigem, nodosDestino, sides) {
  const conexoes = [];

  for (const origem of nodosOrigem) {
    for (const destino of nodosDestino) {
      conexoes.push(
        criarConexao(origem, destino, sides.fromSide, sides.toSide),
      );
    }
  }

  return conexoes;
}

module.exports = {
  criarConexao,
  criarConexoesEntreListas,
};
