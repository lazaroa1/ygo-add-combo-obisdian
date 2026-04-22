const fs = require("fs/promises");
const path = require("path");
const logger = require("../utils/logger");
const {
  DIRETORIO_IMAGENS_ABSOLUTO,
  PASTA_ANEXOS_RELATIVA,
} = require("../config");

/**
 * Serviço responsável por gerenciar download e cache de imagens de cartas
 * Responsabilidade única: gerenciar imagens (download, cache, paths)
 */

/**
 * Normaliza o nome de uma carta para um nome de arquivo válido
 * @param {string} cardName - Nome da carta
 * @returns {string} Nome do arquivo normalizado
 */
function normalizeCardNameToFilename(cardName) {
  return cardName.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".jpg";
}

/**
 * Calcula os paths absoluto e relativo para uma imagem de carta
 * @param {string} cardName - Nome da carta
 * @returns {Object} { absolutePath, relativePath }
 */
function getCardImagePaths(cardName) {
  const fileName = normalizeCardNameToFilename(cardName);
  const absolutePath = path.join(DIRETORIO_IMAGENS_ABSOLUTO, fileName);
  const relativePath = PASTA_ANEXOS_RELATIVA
    ? `${PASTA_ANEXOS_RELATIVA}/${fileName}`
    : fileName;

  return { absolutePath, relativePath };
}

/**
 * Verifica se a imagem já existe em cache
 * @param {string} absolutePath - Path absoluto da imagem
 * @returns {Promise<boolean>} True se arquivo existe
 */
async function imagemEmCache(absolutePath) {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Busca a imagem da API YGOProDeck
 * @param {string} cardName - Nome da carta
 * @returns {Promise<?string>} URL da imagem ou null
 */
async function buscarImagemDaAPI(cardName) {
  try {
    const response = await fetch(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(cardName)}`,
    );

    if (!response.ok) {
      logger.error(`Carta não encontrada: "${cardName}".`);
      return null;
    }

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      return data.data[0].card_images[0].image_url;
    }

    return null;
  } catch (error) {
    logger.fatal(`Falha de conexão ao buscar "${cardName}": ${error.message}`);
    return null;
  }
}

/**
 * Baixa e salva a imagem da carta
 * @param {string} imageUrl - URL da imagem
 * @param {string} absolutePath - Path onde salvar
 * @returns {Promise<boolean>} True se sucesso
 */
async function baixarESalvarImagem(imageUrl, absolutePath) {
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();

    await fs.mkdir(DIRETORIO_IMAGENS_ABSOLUTO, { recursive: true });
    await fs.writeFile(absolutePath, Buffer.from(buffer));

    return true;
  } catch (error) {
    logger.fatal(`Erro ao salvar imagem em ${absolutePath}: ${error.message}`);
    return false;
  }
}

/**
 * Busca e retorna o path relativo da imagem de uma carta
 * Verifica cache primeiro, depois faz download se necessário
 * @param {string} cardName - Nome da carta a buscar
 * @returns {Promise<?string>} Path relativo da imagem ou null
 */
async function obterPathImagemCarta(cardName) {
  const cleanName = cardName.trim();
  if (!cleanName) return null;

  const { absolutePath, relativePath } = getCardImagePaths(cleanName);

  // Verifica se está em cache
  const existeEmCache = await imagemEmCache(absolutePath);
  if (existeEmCache) {
    return relativePath;
  }

  // Busca imagem da API
  logger.info(`Baixando imagem: ${cleanName}...`);
  const imageUrl = await buscarImagemDaAPI(cleanName);
  if (!imageUrl) return null;

  // Salva imagem
  const sucesso = await baixarESalvarImagem(imageUrl, absolutePath);
  return sucesso ? relativePath : null;
}

module.exports = {
  obterPathImagemCarta,
  getCardImagePaths,
};
