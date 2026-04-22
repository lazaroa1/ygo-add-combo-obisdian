const { generateUniqueId } = require("../utils/idGenerator");
const { NODE_DIMENSIONS } = require("../config");

/**
 * Factory para criar nós do canvas
 * Responsabilidade: encapsular estrutura de nó
 */

/**
 * Cria um novo nó
 * @param {string} name - Nome da carta
 * @param {string} action - Ação/efeito
 * @param {number} x - Posição X
 * @param {number} y - Posição Y
 * @returns {Object} Objeto do nó
 */
function criarNo(name, action, x, y) {
  return {
    id: generateUniqueId(),
    name: name || "",
    label: action || "",
    x,
    y,
    width: NODE_DIMENSIONS.width,
    height: NODE_DIMENSIONS.height,
  };
}

/**
 * Converte um nó interno para nó do canvas com imagem
 * @param {Object} no - Nó interno
 * @param {string} caminhoImagem - Path relativo da imagem
 * @returns {Object} Nó do canvas tipo "file"
 */
function converterParaNoComImagem(no, caminhoImagem) {
  return {
    id: no.id,
    type: "file",
    file: caminhoImagem,
    x: no.x,
    y: no.y,
    width: NODE_DIMENSIONS.width,
    height: NODE_DIMENSIONS.height,
  };
}

/**
 * Converte um nó interno para nó do canvas com texto
 * @param {Object} no - Nó interno
 * @returns {Object} Nó do canvas tipo "text"
 */
function converterParaNoComTexto(no) {
  return {
    id: no.id,
    type: "text",
    text: no.name,
    x: no.x,
    y: no.y,
    width: NODE_DIMENSIONS.textWidth,
    height: NODE_DIMENSIONS.textHeight,
  };
}

module.exports = {
  criarNo,
  converterParaNoComImagem,
  converterParaNoComTexto,
};
