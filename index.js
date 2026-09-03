const { construirCanvas } = require('./src/services/canvasBuilder');
const { DIRETORIO_CANVAS } = require('./src/config');

const comboInputText = `
Start hand -> Mirror Swordknight
Mirror Swordknight[ns]
Mirror Swordknight[act eff] -> Big-Winged Berfomet[sp]
Big-Winged Berfomet[act eff] -> Gazelle the King of Mythical Claws[search] + Chimera Fusion[search]
Chimera Fusion[act eff] -> Chimera the King of Phantom Beasts[sp]
Chimera the King of Phantom Beasts[sp] -> Gazelle the King of Mythical Claws[material] + Big-Winged Berfomet[material]
Gazelle the King of Mythical Claws[gy eff] -> Cornfield Coatl[search]
Big-Winged Berfomet[gy eff] -> Mirror Swordknight[sp gy]
Chimera Fusion[gy eff] -> Chimera Fusion[search gy]
Chimera Fusion[act eff] -> Magnum the Reliever[sp]
Magnum the Reliever[sp] -> Chimera the King of Phantom Beasts[material] + Cornfield Coatl[material]
[enemy turn]
Chimera the King of Phantom Beasts[act eff]
Mirror Swordknight[act eff] -> Gazelle the King of Mythical Claws[sp]
Gazelle the King of Mythical Claws[act eff] -> Big-Winged Berfomet[search]
Mirror Swordknight[gy eff]
Magnum the Reliever[act eff] -> 1 card[destroy]
Chimera the King of Phantom Beasts[gy eff] -> Big-Winged Berfomet[sp gy]
Big-Winged Berfomet[act eff] -> Gazelle the King of Mythical Claws[search] + Chimera Fusion[search]
`;

construirCanvas(comboInputText, 'combo.canvas', DIRETORIO_CANVAS);
