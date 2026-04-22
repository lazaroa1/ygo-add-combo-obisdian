const { generateUniqueId } = require("../utils/idGenerator");

/**
 * Factory for creating connections/edges between nodes
 * Responsibility: encapsulate edge structure
 */

/**
 * Create a connection between two nodes
 * @param {Object} nodeOrigem - Source node { id, ... }
 * @param {Object} nodeDestino - Destination node { id, label, ... }
 * @param {string} sideDe - Output side of source node (top/bottom/left/right)
 * @param {string} sidePara - Input side of destination node
 * @returns {Object} Edge/connection object
 */
function criarConexao(nodeOrigem, nodeDestino, sideDe, sidePara) {
  const conexao = {
    id: generateUniqueId(),
    fromNode: nodeOrigem.id,
    fromSide: sideDe,
    toNode: nodeDestino.id,
    toSide: sidePara,
  };

  // Add label only when present
  if (nodeDestino.label) {
    conexao.label = nodeDestino.label;
  }

  return conexao;
}

/**
 * Create multiple connections between two node groups
 * @param {Array<Object>} nodosOrigem - Source node array
 * @param {Array<Object>} nodosDestino - Destination node array
 * @param {Object} sides - { fromSide, toSide }
 * @returns {Array<Object>} Array of created edges
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
