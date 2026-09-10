const { construirCanvas } = require("./src/services/canvasBuilder");
const { DIRETORIO_CANVAS } = require("./src/config");

// ============================================
// APPLICATION ENTRY POINT
// ============================================

// Input combo text
const comboInputText = `
Start hand -> Trickstar Festival | Trickstar Light Stage | Trickstar Aqua Angel
Trickstar Festival[ACT EFF]
Trickstar Holly Angel[SP]
Trickstar Light Stage[ACT EFF] -> Trickstar Candina[search]
Trickstar Candina[NS] -> trickstar hoody[search]
trickstar hoody[SP]
Trickstar Bloom[SP] -> trickstar hoody[material]
trickstar hoody[GY EFF] -> Trickstar Fusion[search]
Trickstar Colchica[SP] -> Trickstar Candina[material]
Trickstar Fusion[ACT EFF]
Trickstar Band Drumatis[SP] -> Trickstar Colchica[material] + trickstar hoody[material] -> Trickstar Lilybell[search]
`;

// Run canvas generation
construirCanvas(comboInputText, "Combo_Trickstar.canvas", DIRETORIO_CANVAS);
