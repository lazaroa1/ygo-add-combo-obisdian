const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

// --- CONFIGURAÇÕES DO COFRE (VAULT) ---
const VAULT_ROOT = "G:/Meu Drive/MyMind";
const DIRETORIO_CANVAS = path.join(VAULT_ROOT, "Yugioh/Decks/Combos");
const NOME_ARQUIVO = "Combo_Trickstar.canvas";

const PASTA_ANEXOS_RELATIVA = "Arquivos/Yugioh";
const DIRETORIO_IMAGENS_ABSOLUTO = path.join(VAULT_ROOT, PASTA_ANEXOS_RELATIVA);

// --- ESPAÇAMENTOS (Ajuste aqui) ---
const STEP_X_BASE = 400; // Espaço horizontal padrão
const STEP_X_LARGE = 600; // Espaço horizontal para textos longos (ACT EFF, GY EFF)
const STEP_Y_BRANCH = 700; // Espaço vertical para ramificações (search, material)

const generateId = () => crypto.randomBytes(8).toString("hex");

// --- FUNÇÃO DE DOWNLOAD ---
async function fetchAndSaveCardImage(cardName) {
  const cleanName = cardName.trim();
  if (!cleanName) return null;

  const fileName = `${cleanName.replace(/[^a-z0-9]/gi, "_")}.jpg`;
  const absolutePath = path.join(DIRETORIO_IMAGENS_ABSOLUTO, fileName);

  const relativePath = PASTA_ANEXOS_RELATIVA
    ? `${PASTA_ANEXOS_RELATIVA}/${fileName}`
    : fileName;

  try {
    await fs.access(absolutePath);
    return relativePath;
  } catch {
    console.log(`Baixando e salvando imagem: ${cleanName}...`);
    try {
      const res = await fetch(
        `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(cleanName)}`,
      );

      if (!res.ok) {
        console.error(`[ERRO] Carta não encontrada: "${cleanName}".`);
        return null;
      }

      const data = await res.json();

      if (data.data && data.data.length > 0) {
        const imgUrl = data.data[0].card_images[0].image_url;
        const imgRes = await fetch(imgUrl);
        const buffer = await imgRes.arrayBuffer();

        await fs.mkdir(DIRETORIO_IMAGENS_ABSOLUTO, { recursive: true });
        await fs.writeFile(absolutePath, Buffer.from(buffer));

        return relativePath;
      }
    } catch (error) {
      console.error(`[ERRO FATAL] Falha de conexão ao searchr: ${cleanName}`);
      return null;
    }
  }
  return null;
}

// --- ENGINE DE LAYOUT E GERAÇÃO ---
async function buildCanvas(inputText, outputName, vaultDir) {
  const lines = inputText.split("\n").filter((line) => line.trim() !== "");
  const nodes = [];
  const edges = [];
  const regexNode = /([^\[\-\>\|]+)(?:\[([^\]]+)\])?/g;

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

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

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
          mainX += 274;
        }
        mainX += 150;
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
      const mainNodesForThisStep = [];

      for (let entityIdx = 0; entityIdx < entities.length; entityIdx++) {
        const entityStr = entities[entityIdx];
        const match = regexNode.exec(entityStr);

        if (match) {
          const name = match[1].trim();
          const action = (match[2] || "").trim().toLowerCase();

          // Identifica apenas ações que correm no eixo horizontal para alongar o passo
          const isLargeHorizontal = ["act eff", "gy eff"].some((a) =>
            action.includes(a),
          );

          let nodeX = mainX;
          let nodeY = mainY;
          let isBranch = false;

          if (previousNodes.length > 0) {
            const parent = previousNodes[0];

            if (
              action.includes("search") ||
              action.includes("add") ||
              action.includes("busca")
            ) {
              nodeX = parent.x;
              nodeY = parent.y - STEP_Y_BRANCH;
              isBranch = true;
            } else if (action.includes("material")) {
              const totalMaterials = entities.length;
              // Aumentado levemente o offset de material para evitar sobreposição
              const offset = entityIdx * 320 - (totalMaterials - 1) * 160;
              nodeX = parent.x + offset;
              nodeY = parent.y + STEP_Y_BRANCH;
              isBranch = true;
            } else {
              if (isLargeHorizontal) {
                mainX += STEP_X_LARGE - STEP_X_BASE;
              }
              nodeX = mainX;
              nodeY = mainY;
              mainX += STEP_X_BASE;
            }
          } else if (isFirstStepInLine) {
            nodeX = mainX;
            nodeY = mainY;
            mainX += STEP_X_BASE;
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
              label: curr.label || undefined,
            });
          }
        }
      }

      if (mainNodesForThisStep.length > 0) {
        previousNodes = mainNodesForThisStep;
      }
      isFirstStepInLine = false;
    }

    globalPreviousNodes = previousNodes;
  }

  for (const node of nodes) {
    const imageRelativePath = await fetchAndSaveCardImage(node.name);

    if (imageRelativePath) {
      canvasData.nodes.push({
        id: node.id,
        type: "file",
        file: imageRelativePath,
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

const inputText = `
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

buildCanvas(inputText, NOME_ARQUIVO, DIRETORIO_CANVAS);
