const fs = require("fs/promises");
const path = require("path");
const logger = require("../utils/logger");
const {
  parseaInicialCombo,
  parseaSequenciaCombo,
  ehInicioDoCombo,
} = require("./comboParser");
const { obterPathImagemCarta } = require("./cardImageService");
const {
  criarNo,
  converterParaNoComImagem,
  converterParaNoComTexto,
} = require("../entities/node");
const { criarConexoesEntreListas } = require("../entities/edge");
const {
  identificaTipoDeBranch,
  calcularPosicaoSearchNode,
  calcularPosicaoMaterialNode,
  calcularPosicaoNormalNode,
  calcularPosicaoHandNode,
  determinarSidesConexao,
  LAYOUT_SPACING,
} = require("../entities/layoutEngine");

/**
 * Builder do canvas - orquestra todo o processo de geração
 * Responsabilidade: coordenar parser, layout, imagens e persistência
 */

/**
 * Carrega dados de canvas existente se disponível
 * @param {string} caminhoArquivo - Path do arquivo canvas
 * @returns {Promise<Object>} Dados do canvas { nodes, edges }
 */
async function carregarCanvasExistente(caminhoArquivo) {
  try {
    const conteudo = await fs.readFile(caminhoArquivo, "utf8");
    return JSON.parse(conteudo);
  } catch {
    return { nodes: [], edges: [] };
  }
}

/**
 * Calcula o Y inicial baseado no canvas existente
 * @param {Object} canvasExistente - Dados do canvas atual
 * @returns {number} Y inicial para novo conteúdo
 */
function calcularYInicial(canvasExistente) {
  if (canvasExistente.nodes.length === 0) {
    return 0;
  }
  const maxY = Math.max(...canvasExistente.nodes.map((n) => n.y));
  return maxY + LAYOUT_SPACING.fileBottomOffset;
}

/**
 * Processa nós da mão inicial
 * @param {Array<Object>} nodosIniciais - Cartas da mão inicial
 * @param {number} posX - Posição X inicial
 * @param {number} posY - Posição Y
 * @returns {Array<Object>} Nós criados
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
 * Processa uma linha de combo gerando nós e conexões
 * Mantém exatamente a semântica do algoritmo original (encadeamento por linha).
 * @param {Array<Array<Object>>} etapasDaLinha - Etapas da linha (split por ->)
 * @param {Array<Object>} nosGlobaisAnteriores - Nós globais anteriores
 * @param {number} posX - Posição X atual
 * @param {number} posY - Posição Y atual
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

        if (isBranch && branchType === "search") {
          const { x, y } = calcularPosicaoSearchNode(pai);
          novoNo = criarNo(name, action, x, y);
          branchAtual = true;
        } else if (isBranch && branchType === "material") {
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

    // Criar conexões entre nós anteriores e atuais
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
 * Converte nós internos para nós do canvas com imagens ou texto
 * @param {Array<Object>} nos - Nós internos
 * @returns {Promise<Array<Object>>} Nós do canvas
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
 * Constrói e persiste o canvas
 * @param {string} textoEntrada - Texto de entrada do combo
 * @param {string} nomeArquivo - Nome do arquivo canvas
 * @param {string} diretorioDestino - Diretório onde salvar
 */
async function construirCanvas(textoEntrada, nomeArquivo, diretorioDestino) {
  try {
    // 1. Carregar canvas existente e calcular posição inicial
    const caminhoArquivo = path.join(diretorioDestino, nomeArquivo);
    const canvasExistente = await carregarCanvasExistente(caminhoArquivo);
    const yInicial = calcularYInicial(canvasExistente);

    // 2. Parsear linhas
    const linhas = textoEntrada
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    // 3. Processar linhas mantendo estado global entre elas
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

    // 4. Converter nós para canvas (com imagens)
    const nosCanvasNovos = await converterNosParaCanvas(todosOs);
    const conexoesCanvasNovas = todasConexoes;

    // 5. Atualizar canvas
    canvasExistente.nodes.push(...nosCanvasNovos);
    canvasExistente.edges.push(...conexoesCanvasNovas);

    // 6. Salvar arquivo
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
