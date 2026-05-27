const fs = require('fs/promises');
const path = require('path');
const logger = require('../utils/logger');
const { parsearEntradaPrincipal } = require('./mainInputParser');
const { copiarTextoParaClipboard } = require('./clipboardService');
const {
  parseaInicialCombo,
  parseaSequenciaCombo,
  ehInicioDoCombo,
} = require('./comboParser');
const { obterPathImagemCarta } = require('./cardImageService');
const {
  criarNo,
  converterParaNoComImagem,
  converterParaNoComTexto,
} = require('../entities/node');
const { criarConexoesEntreListas } = require('../entities/edge');
const {
  identificaTipoDeBranch,
  calcularPosicaoSearchNode,
  calcularPosicaoMaterialNode,
  calcularPosicaoNormalNode,
  calcularPosicaoHandNode,
  determinarSidesConexao,
  LAYOUT_SPACING,
} = require('../entities/layoutEngine');

/**
 * Canvas builder - orchestrates the full generation process
 * Responsibility: coordinate parser, layout, images, and persistence
 */

/**
 * Load existing canvas data if available
 * @param {string} caminhoArquivo - Canvas file path
 * @returns {Promise<Object>} Canvas data { nodes, edges }
 */
async function carregarCanvasExistente(caminhoArquivo) {
  try {
    const conteudo = await fs.readFile(caminhoArquivo, 'utf8');
    return JSON.parse(conteudo);
  } catch {
    return { nodes: [], edges: [] };
  }
}

/**
 * Calculate starting Y based on existing canvas
 * @param {Object} canvasExistente - Current canvas data
 * @returns {number} Starting Y for new content
 */
function calcularYInicial(canvasExistente) {
  if (canvasExistente.nodes.length === 0) {
    return 0;
  }
  const maxY = Math.max(...canvasExistente.nodes.map((n) => n.y));
  return maxY + LAYOUT_SPACING.fileBottomOffset;
}

/**
 * Process opening hand nodes
 * @param {Array<Object>} nodosIniciais - Opening hand cards
 * @param {number} posX - Initial X position
 * @param {number} posY - Y position
 * @returns {Array<Object>} Created nodes
 */
function processarMaoInicial(nodosIniciais, posX, posY) {
  const nos = [];
  let currentX = posX;
  let ultimoNo = null;

  for (let i = 0; i < nodosIniciais.length; i++) {
    const { name, action } = nodosIniciais[i];
    const { x, y } = calcularPosicaoHandNode(currentX, posY, 0);
    const novoNo = criarNo(name, action, x, y);
    nos.push(novoNo);
    ultimoNo = novoNo;
    currentX += LAYOUT_SPACING.handNodeSpacing;
  }

  if (nodosIniciais.length > 0) {
    currentX += LAYOUT_SPACING.handNodePadding;
  }

  return {
    nos,
    ultimoNo,
    proxX: currentX,
  };
}

/**
 * Process one combo line generating nodes and connections
 * Preserves the exact semantics of the original algorithm (line-by-line chaining).
 * @param {Array<Array<Object>>} etapasDaLinha - Line steps (split by ->)
 * @param {Array<Object>} nosGlobaisAnteriores - Previous global nodes
 * @param {number} posX - Current X position
 * @param {number} posY - Current Y position
 * @returns {Object} { nos, conexoes, novosGlobaisAnteriores, proxX }
 */
function processarLinhaCombo(etapasDaLinha, nosGlobaisAnteriores, posX, posY) {
  const todosOs = [];
  const todasConexoes = [];
  let previousNodes = [...nosGlobaisAnteriores];
  let isFirstStepInLine = previousNodes.length === 0;
  let currentX = posX;

  for (const etapa of etapasDaLinha) {
    const nosNaEtapa = [];
    const nosPrincipaisDaEtapa = [];

    for (let idx = 0; idx < etapa.length; idx++) {
      const { name, action } = etapa[idx];
      const { isBranch, branchType } = identificaTipoDeBranch(action);
      let novoNo;
      let branchAtual = false;

      if (previousNodes.length > 0) {
        const pai = previousNodes[0];

        if (isBranch && branchType === 'search') {
          const { x, y } = calcularPosicaoSearchNode(pai);
          novoNo = criarNo(name, action, x, y);
          branchAtual = true;
        } else if (isBranch && branchType === 'material') {
          const { x, y } = calcularPosicaoMaterialNode(pai, idx, etapa.length);
          novoNo = criarNo(name, action, x, y);
          branchAtual = true;
        } else {
          const { x, y, nextX } = calcularPosicaoNormalNode(
            currentX,
            posY,
            action,
            true,
          );
          novoNo = criarNo(name, action, x, y);
          currentX = nextX;
        }
      } else if (isFirstStepInLine) {
        const { x, y, nextX } = calcularPosicaoNormalNode(
          currentX,
          posY,
          action,
          false,
        );
        novoNo = criarNo(name, action, x, y);
        currentX = nextX;
      }

      if (novoNo) {
        todosOs.push(novoNo);
        nosNaEtapa.push(novoNo);

        if (!branchAtual) {
          nosPrincipaisDaEtapa.push(novoNo);
        }
      }
    }

    // Create connections between previous and current nodes
    if (previousNodes.length > 0 && nosNaEtapa.length > 0) {
      const sides = determinarSidesConexao(previousNodes[0], nosNaEtapa[0]);
      const conexoes = criarConexoesEntreListas(
        previousNodes,
        nosNaEtapa,
        sides,
      );
      todasConexoes.push(...conexoes);
    }

    if (nosPrincipaisDaEtapa.length > 0) {
      previousNodes = nosPrincipaisDaEtapa;
    }

    isFirstStepInLine = false;
  }

  return {
    nos: todosOs,
    conexoes: todasConexoes,
    novosGlobaisAnteriores: previousNodes,
    proxX: currentX,
  };
}

/**
 * Convert internal nodes to canvas nodes with image or text
 * @param {Array<Object>} nos - Internal nodes
 * @returns {Promise<Array<Object>>} Canvas nodes
 */
async function converterNosParaCanvas(nos) {
  const nosCanvas = [];

  for (const no of nos) {
    const caminhoImagem = await obterPathImagemCarta(no.name);

    if (caminhoImagem) {
      nosCanvas.push(converterParaNoComImagem(no, caminhoImagem));
    } else {
      nosCanvas.push(converterParaNoComTexto(no));
    }
  }

  return nosCanvas;
}

/**
 * Build and persist the canvas
 * @param {string} textoEntrada - Combo input text
 * @param {string} nomeArquivo - Canvas file name
 * @param {string} diretorioDestino - Destination directory
 */
async function construirCanvas(textoEntrada, nomeArquivo, diretorioDestino) {
  try {
    // 1. Load existing canvas and calculate initial position
    const caminhoArquivo = path.join(diretorioDestino, nomeArquivo);
    const canvasExistente = await carregarCanvasExistente(caminhoArquivo);
    const yInicial = calcularYInicial(canvasExistente);

    // 2. Parse input via strategy/factory entrypoint
    const parseResult = await parsearEntradaPrincipal(textoEntrada);

    if (parseResult.parserType === 'decklist') {
      await copiarTextoParaClipboard(parseResult.output || '');
      logger.info('Decklist parsing selected. Output copied to clipboard.');
      return parseResult.output;
    }

    if (parseResult.parserType !== 'comboGraph') {
      throw new Error(
        `Unsupported parser type for canvas build: ${parseResult.parserType}`,
      );
    }

    const linhas = parseResult.lines;

    // 3. Process lines while keeping shared global state
    const todosOs = [];
    const todasConexoes = [];
    let posX = 0;
    let globalPreviousNodes = [];

    for (const linha of linhas) {
      if (ehInicioDoCombo(linha)) {
        const nodosIniciais = parseaInicialCombo(linha);
        const { nos, ultimoNo, proxX } = processarMaoInicial(
          nodosIniciais,
          posX,
          yInicial,
        );

        todosOs.push(...nos);
        posX = proxX;

        if (ultimoNo) {
          globalPreviousNodes = [ultimoNo];
        }

        continue;
      }

      const etapasDaLinha = parseaSequenciaCombo(linha);
      const { nos, conexoes, novosGlobaisAnteriores, proxX } =
        processarLinhaCombo(etapasDaLinha, globalPreviousNodes, posX, yInicial);

      todosOs.push(...nos);
      todasConexoes.push(...conexoes);
      globalPreviousNodes = novosGlobaisAnteriores;
      posX = proxX;
    }

    // 4. Convert nodes to canvas format (with images)
    const nosCanvasNovos = await converterNosParaCanvas(todosOs);
    const conexoesCanvasNovas = todasConexoes;

    // 5. Update canvas
    canvasExistente.nodes.push(...nosCanvasNovos);
    canvasExistente.edges.push(...conexoesCanvasNovas);

    // 6. Save file
    await fs.mkdir(diretorioDestino, { recursive: true });
    await fs.writeFile(
      caminhoArquivo,
      JSON.stringify(canvasExistente, null, 2),
    );

    logger.info(`Canvas gerado com sucesso: ${caminhoArquivo}`);
  } catch (erro) {
    logger.fatal(`Erro ao construir canvas: ${erro.message}`);
    throw erro;
  }
}

module.exports = {
  construirCanvas,
};
