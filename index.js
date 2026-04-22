const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

// --- CONFIGURAÇÕES ---
const NOME_ARQUIVO = "Combo_Trickstar.canvas";
// Diretório onde o arquivo .canvas será salvo e lido
const DIRETORIO_OBSIDIAN = "G:/Meu Drive/MyMind/Yugioh/Decks/Combos";

const generateId = () => crypto.randomBytes(8).toString("hex");

// --- FUNÇÃO DE BUSCA DE URL (Sem Download) ---
async function getCardImageUrl(cardName) {
  const cleanName = cardName.trim();
  if (!cleanName) return null;

  console.log(`Buscando URL na API: ${cleanName}...`);
  try {
    const res = await fetch(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(cleanName)}`,
    );

    if (!res.ok) {
      console.error(
        `[ERRO] Carta não encontrada: "${cleanName}". Verifique a grafia.`,
      );
      return null;
    }

    const data = await res.json();

    if (data.data && data.data.length > 0) {
      return data.data[0].card_images[0].image_url;
    }
  } catch (error) {
    console.error(`[ERRO FATAL] Falha de conexão ao buscar: ${cleanName}`);
    return null;
  }
  return null;
}

// --- ENGINE DE LAYOUT E GERAÇÃO ---
async function buildCanvas(inputText, outputName, vaultDir) {
  const lines = inputText.split("\n").filter((line) => line.trim() !== "");
  const nodes = [];
  const edges = [];
  const regexNode = /([^\[\-\>\|]+)(?:\[([^\]]+)\])?/g;

  const STEP_X = 350;
  const STEP_Y = 500;
  let mainX = 0;
  let mainY = 0;

  const canvasFilePath = path.join(vaultDir, outputName);
  let canvasData = { nodes: [], edges: [] };

  try {
    const existingData = await fs.readFile(canvasFilePath, "utf8");
    canvasData = JSON.parse(existingData);
    if (canvasData.nodes.length > 0) {
      mainY = Math.max(...canvasData.nodes.map((n) => n.y)) + 800;
    }
  } catch {}

  let globalPreviousNodes = [];

  // 1º LOOP: Processamento do texto e cálculo de coordenadas
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    // Processamento da "Start hand"
    if (line.toLowerCase().startsWith("start hand")) {
      const parts = line.split("->");
      let lastHandNode = null;
      if (parts.length > 1) {
        const entities = parts[1]
          .split("|")
          .map((e) => e.trim())
          .filter((e) => e);
        for (let i = 0; i < entities.length; i++) {
          const name = entities[i].replace(/\[.*?\]/g, "").trim();
          const newNode = {
            id: generateId(),
            name: name,
            label: "",
            x: mainX,
            y: mainY,
            width: 274,
            height: 400,
          };
          nodes.push(newNode);
          lastHandNode = newNode;
          mainX += 274; // Gruda as cartas da mão
        }
        mainX += 150; // Separa a mão inicial do combo principal
      }
      if (lastHandNode) {
        globalPreviousNodes = [lastHandNode];
      }
      continue;
    }

    const steps = line.split("->").map((s) => s.trim());
    let previousNodes = [...globalPreviousNodes];
    let isFirstStepInLine = previousNodes.length === 0;

    for (let stepIdx = 0; stepIdx < steps.length; stepIdx++) {
      const step = steps[stepIdx];
      const entities = step
        .split(/[\+\|\-]/)
        .map((e) => e.trim())
        .filter((e) => e);
      const currentNodes = [];
      const mainNodesForThisStep = []; // Rastreador da linha principal

      for (let entityIdx = 0; entityIdx < entities.length; entityIdx++) {
        const entityStr = entities[entityIdx];
        const match = regexNode.exec(entityStr);

        if (match) {
          const name = match[1].trim();
          const action = (match[2] || "").trim().toLowerCase();
          let nodeX = mainX;
          let nodeY = mainY;
          let isBranch = false;

          if (previousNodes.length > 0) {
            const parent = previousNodes[0];

            if (action.includes("busca") || action.includes("add")) {
              nodeX = parent.x;
              nodeY = parent.y - STEP_Y;
              isBranch = true;
            } else if (action.includes("material")) {
              const totalMaterials = entities.length;
              const offset = entityIdx * 300 - (totalMaterials - 1) * 150;
              nodeX = parent.x + offset;
              nodeY = parent.y + STEP_Y;
              isBranch = true;
            } else {
              nodeX = mainX;
              nodeY = mainY;
              mainX += STEP_X;
            }
          } else if (isFirstStepInLine) {
            nodeX = mainX;
            nodeY = mainY;
            mainX += STEP_X;
          }

          const newNode = {
            id: generateId(),
            name: name,
            label: action,
            x: nodeX,
            y: nodeY,
            width: 274,
            height: 400,
          };

          nodes.push(newNode);
          currentNodes.push(newNode);

          // Se não for ramificação (busca/material), marca como carta da linha principal
          if (!isBranch) {
            mainNodesForThisStep.push(newNode);
          }
        }
        regexNode.lastIndex = 0;
      }

      if (previousNodes.length > 0 && currentNodes.length > 0) {
        for (const prev of previousNodes) {
          for (const curr of currentNodes) {
            let fromSide = "right";
            let toSide = "left";

            if (curr.y < prev.y) {
              fromSide = "top";
              toSide = "bottom";
            } else if (curr.y > prev.y) {
              fromSide = "bottom";
              toSide = "top";
            }

            edges.push({
              id: generateId(),
              fromNode: prev.id,
              fromSide: fromSide,
              toNode: curr.id,
              toSide: toSide,
              label: curr.label || undefined, // Aplica o texto da ação na linha
            });
          }
        }
      }

      // Atualiza a origem apenas se novas cartas entraram na linha principal
      if (mainNodesForThisStep.length > 0) {
        previousNodes = mainNodesForThisStep;
      }
      isFirstStepInLine = false;
    }

    globalPreviousNodes = previousNodes;
  }

  // 2º LOOP: Requisições à API e injeção do Markdown no JSON final
  for (const node of nodes) {
    const imageUrl = await getCardImageUrl(node.name);

    if (imageUrl) {
      canvasData.nodes.push({
        id: node.id,
        type: "text",
        text: `![${node.name}](${imageUrl})`,
        x: node.x,
        y: node.y,
        width: 274,
        height: 400,
      });
    } else {
      canvasData.nodes.push({
        id: node.id,
        type: "text",
        text: node.name,
        x: node.x,
        y: node.y,
        width: 250,
        height: 60,
      });
    }
  }

  for (const edge of edges) {
    canvasData.edges.push(edge);
  }

  await fs.mkdir(vaultDir, { recursive: true });
  await fs.writeFile(canvasFilePath, JSON.stringify(canvasData, null, 2));
  console.log(`Canvas gerado/atualizado com sucesso em: ${canvasFilePath}`);
}

// --- EXECUÇÃO ---
const inputText = `Start hand -> Trickstar Festival | Trickstar Light Stage | Trickstar Aqua Angel
Trickstar Festival[ativacao]
Trickstar Holly Angel[SP]
Trickstar Light Stage[ativacao] -> Trickstar Candina[busca]
Trickstar Candina[NS] -> trickstar hoody[busca]
trickstar hoody[SP]
Trickstar Bloom[SP] -> trickstar hoody[material]
trickstar hoody[efeito cemiterio] -> Trickstar Fusion[busca]
Trickstar Colchica -> Trickstar Candina[material]
Trickstar Fusion[ativacao]
Trickstar Band Dramatis -> Trickstar Colchica[material] + trickstar hoody[material] -> Trickstar Lilybell[busca]`;

buildCanvas(inputText, NOME_ARQUIVO, DIRETORIO_OBSIDIAN);
