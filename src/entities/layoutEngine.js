const {
  LAYOUT_SPACING,
  LARGE_HORIZONTAL_ACTIONS,
  BRANCH_ACTION_PATTERNS,
} = require("../config");

/**
 * Engine de layout para posicionamento de nós no canvas
 * Responsabilidade: calcular coordenadas X/Y para cada nó
 */

/**
 * Verifica se uma ação é classificada como "ramificação"
 * (não segue a sequência linear normal)
 * @param {string} action - Ação a verificar
 * @returns {Object} { isBranch: boolean, branchType: 'search'|'material'|null }
 */
function identificaTipoDeBranch(action) {
  if (
    BRANCH_ACTION_PATTERNS.search.some((a) => action.includes(a))
  ) {
    return { isBranch: true, branchType: "search" };
  }
  if (
    BRANCH_ACTION_PATTERNS.material.some((a) => action.includes(a))
  ) {
    return { isBranch: true, branchType: "material" };
  }
  return { isBranch: false, branchType: null };
}

/**
 * Verifica se uma ação deve ocupar mais espaço horizontal
 * @param {string} action - Ação a verificar
 * @returns {boolean} True se requer espaço grande
 */
function ehAcaoComGrandeEspacoHorizontal(action) {
  return LARGE_HORIZONTAL_ACTIONS.some((a) => action.includes(a));
}

/**
 * Calcula posição para um nó de ramificação "search"
 * Search nodes ficam acima (Y menor) do nó pai
 * @param {Object} parentNode - Nó pai { x, y }
 * @returns {Object} { x, y }
 */
function calcularPosicaoSearchNode(parentNode) {
  return {
    x: parentNode.x,
    y: parentNode.y - LAYOUT_SPACING.verticalBranch,
  };
}

/**
 * Calcula posição para um nó de ramificação "material"
 * Material nodes ficam abaixo (Y maior) do nó pai, espaçados horizontalmente
 * @param {Object} parentNode - Nó pai { x, y }
 * @param {number} materialIndex - Índice deste material na lista
 * @param {number} totalMaterials - Total de materials neste passo
 * @returns {Object} { x, y }
 */
function calcularPosicaoMaterialNode(parentNode, materialIndex, totalMaterials) {
  const offset = materialIndex * 320 - (totalMaterials - 1) * 160;
  return {
    x: parentNode.x + offset,
    y: parentNode.y + LAYOUT_SPACING.verticalBranch,
  };
}

/**
 * Calcula posição para um nó normal (sequência linear)
 * @param {number} currentX - X atual no layout
 * @param {number} currentY - Y atual no layout
 * @param {string} action - Ação do nó
 * @param {boolean} hasPreviousNode - Indica se existe nó anterior na sequência
 * @returns {Object} { x, y, nextX }
 */
function calcularPosicaoNormalNode(currentX, currentY, action, hasPreviousNode = true) {
  let nextX = currentX;
  let x = currentX;

  // Replica a regra do algoritmo original:
  // quando há nó anterior e a ação é "grande", aplica deslocamento extra ANTES do nó atual.
  if (hasPreviousNode && ehAcaoComGrandeEspacoHorizontal(action)) {
    x += LAYOUT_SPACING.largeHorizontal - LAYOUT_SPACING.baseHorizontal;
  }

  nextX = x + LAYOUT_SPACING.baseHorizontal;

  return {
    x,
    y: currentY,
    nextX,
  };
}

/**
 * Calcula posição para um nó da mão inicial
 * Mão inicial tem espaçamento especial
 * @param {number} currentX - X atual
 * @param {number} currentY - Y atual
 * @param {number} index - Índice da carta na mão
 * @returns {Object} { x, y }
 */
function calcularPosicaoHandNode(currentX, currentY, index) {
  return {
    x: currentX + index * LAYOUT_SPACING.handNodeSpacing,
    y: currentY,
  };
}

/**
 * Determina o side da conexão baseado em posições relativas
 * @param {Object} fromNode - Nó de origem { x, y }
 * @param {Object} toNode - Nó de destino { x, y }
 * @returns {Object} { fromSide, toSide }
 */
function determinarSidesConexao(fromNode, toNode) {
  if (toNode.y < fromNode.y) {
    // Conexão para cima
    return { fromSide: "top", toSide: "bottom" };
  }
  if (toNode.y > fromNode.y) {
    // Conexão para baixo
    return { fromSide: "bottom", toSide: "top" };
  }
  // Conexão horizontal
  return { fromSide: "right", toSide: "left" };
}

module.exports = {
  identificaTipoDeBranch,
  ehAcaoComGrandeEspacoHorizontal,
  calcularPosicaoSearchNode,
  calcularPosicaoMaterialNode,
  calcularPosicaoNormalNode,
  calcularPosicaoHandNode,
  determinarSidesConexao,
  LAYOUT_SPACING,
};
