const {
  LAYOUT_SPACING,
  LARGE_HORIZONTAL_ACTIONS,
  BRANCH_ACTION_PATTERNS,
} = require("../config");

/**
 * Layout engine for canvas node positioning
 * Responsibility: calculate X/Y coordinates for each node
 */

/**
 * Check whether an action is classified as a "branch"
 * (does not follow normal linear sequence)
 * @param {string} action - Action to check
 * @returns {Object} { isBranch: boolean, branchType: 'search'|'material'|null }
 */
function identificaTipoDeBranch(action) {
  if (BRANCH_ACTION_PATTERNS.search.some((a) => action.includes(a))) {
    return { isBranch: true, branchType: "search" };
  }
  if (BRANCH_ACTION_PATTERNS.material.some((a) => action.includes(a))) {
    return { isBranch: true, branchType: "material" };
  }
  return { isBranch: false, branchType: null };
}

/**
 * Check whether an action should use more horizontal space
 * @param {string} action - Action to check
 * @returns {boolean} True if larger spacing is required
 */
function ehAcaoComGrandeEspacoHorizontal(action) {
  return LARGE_HORIZONTAL_ACTIONS.some((a) => action.includes(a));
}

/**
 * Calculate position for a "search" branch node
 * Search nodes are placed above (lower Y) the parent node
 * @param {Object} parentNode - Parent node { x, y }
 * @returns {Object} { x, y }
 */
function calcularPosicaoSearchNode(parentNode) {
  return {
    x: parentNode.x,
    y: parentNode.y - LAYOUT_SPACING.verticalBranch,
  };
}

/**
 * Calculate position for a "material" branch node
 * Material nodes are placed below (higher Y) the parent node, spaced horizontally
 * @param {Object} parentNode - Parent node { x, y }
 * @param {number} materialIndex - Index of this material in the list
 * @param {number} totalMaterials - Total material nodes in this step
 * @returns {Object} { x, y }
 */
function calcularPosicaoMaterialNode(
  parentNode,
  materialIndex,
  totalMaterials,
) {
  const offset = materialIndex * 320 - (totalMaterials - 1) * 160;
  return {
    x: parentNode.x + offset,
    y: parentNode.y + LAYOUT_SPACING.verticalBranch,
  };
}

/**
 * Calculate position for a regular node (linear sequence)
 * @param {number} currentX - Current X in layout
 * @param {number} currentY - Current Y in layout
 * @param {string} action - Node action
 * @param {boolean} hasPreviousNode - Whether a previous node exists in sequence
 * @returns {Object} { x, y, nextX }
 */
function calcularPosicaoNormalNode(
  currentX,
  currentY,
  action,
  hasPreviousNode = true,
) {
  let nextX = currentX;
  let x = currentX;

  // Mirrors the original algorithm rule:
  // if there is a previous node and the action is "large", apply extra offset BEFORE current node.
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
 * Calculate position for an opening hand node
 * Opening hand uses special spacing
 * @param {number} currentX - Current X
 * @param {number} currentY - Current Y
 * @param {number} index - Card index in opening hand
 * @returns {Object} { x, y }
 */
function calcularPosicaoHandNode(currentX, currentY, index) {
  return {
    x: currentX + index * LAYOUT_SPACING.handNodeSpacing,
    y: currentY,
  };
}

/**
 * Determine connection sides based on relative positions
 * @param {Object} fromNode - Source node { x, y }
 * @param {Object} toNode - Destination node { x, y }
 * @returns {Object} { fromSide, toSide }
 */
function determinarSidesConexao(fromNode, toNode) {
  if (toNode.y < fromNode.y) {
    // Upward connection
    return { fromSide: "top", toSide: "bottom" };
  }
  if (toNode.y > fromNode.y) {
    // Downward connection
    return { fromSide: "bottom", toSide: "top" };
  }
  // Horizontal connection
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
