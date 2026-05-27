const { construirCanvas } = require('./src/services/canvasBuilder');
const { DIRETORIO_CANVAS } = require('./src/config');

// ============================================
// APPLICATION ENTRY POINT
// ============================================

// Input combo text
const comboInputText = `Monster
1 Witch of the Black Rose
1 Blue Rose Dragon
3 White Rose Dragon
3 Roxrose Dragon
1 Rose Princess
3 Red Rose Dragon
1 Rose Girl
3 Lonefire Blossom
1 Rose Lover
3 Ruddy Rose Witch
1 Spore
Spell
1 Terraforming
1 Frozen Rose
2 Basal Rose Shoot
1 Monster Reborn
1 White Rose Cloister
1 Fragrance Storm
2 Miracle Fertilizer
2 Black Garden
1 Thorn of Malice
Trap
1 Blooming of the Darkest Rose
Extra
2 Ruddy Rose Dragon
1 Black Rose Dragon
1 Black Rose Moonlight Dragon
1 Periallis, Empress of Blossoms
1 Splendid Rose
1 Garden Rose Maiden
1 Garden Rose Flora
2 Crossrose Dragon
`;

// Run canvas generation
construirCanvas(comboInputText, 'Combo_Trickstar.canvas', DIRETORIO_CANVAS);
