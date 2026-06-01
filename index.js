const { construirCanvas } = require('./src/services/canvasBuilder');
const { DIRETORIO_CANVAS } = require('./src/config');

// ============================================
// APPLICATION ENTRY POINT
// ============================================

// Input combo text
const comboInputText = `
`;

// Run canvas generation
construirCanvas(comboInputText, 'deck_combos.canvas', DIRETORIO_CANVAS);
