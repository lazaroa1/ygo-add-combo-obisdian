const { generateUniqueId } = require("../utils/idGenerator");
const { NODE_DIMENSIONS } = require("../config");

/**
 * Factory for creating canvas nodes
 * Responsibility: encapsulate node structure
 */

/**
 * Create a new node
 * @param {string} name - Card name
 * @param {string} action - Action/effect
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {Object} Node object
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
 * Convert internal node to image canvas node
 * @param {Object} no - Internal node
 * @param {string} caminhoImagem - Relative image path
 * @returns {Object} Canvas node of type "file"
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
 * Convert internal node to text canvas node
 * @param {Object} no - Internal node
 * @returns {Object} Canvas node of type "text"
 */
function converterParaNoComTexto(no) {
  return {
    id: no.id,
    type: "text",
    text: no.name || no.label || "",
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
