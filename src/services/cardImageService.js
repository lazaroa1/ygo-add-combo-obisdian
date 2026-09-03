const fs = require('fs/promises');
const path = require('path');
const logger = require('../utils/logger');
const {
  DIRETORIO_IMAGENS_ABSOLUTO,
  PASTA_ANEXOS_RELATIVA,
} = require('../config');

/**
 * Service responsible for card image download and caching
 * Single responsibility: manage images (download, cache, paths)
 */

/**
 * Remove parser/action artifacts from card names before image lookup.
 * Handles trailing tags like "[banish]" and suffixes like "attacks".
 * @param {string} cardName - Raw card name
 * @returns {string} Sanitized card name
 */
function sanitizeCardNameForLookup(cardName) {
  return (cardName || '')
    .trim()
    .replace(/(?:\s*\[[^\]]+\]\s*)+$/g, '')
    .replace(/\s+(ataca|attacks)$/i, '')
    .trim();
}

/**
 * Normalize a card name into a valid file name
 * @param {string} cardName - Card name
 * @returns {string} Normalized file name
 */
function normalizeCardNameToFilename(cardName) {
  const sanitizedName = sanitizeCardNameForLookup(cardName);
  return sanitizedName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';
}

/**
 * Calculate absolute and relative paths for a card image
 * @param {string} cardName - Card name
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
 * Check whether image already exists in cache
 * @param {string} absolutePath - Absolute image path
 * @returns {Promise<boolean>} True if file exists
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
 * Fetch image URL from YGOProDeck API
 * @param {string} cardName - Card name
 * @returns {Promise<?string>} Image URL or null
 */
async function buscarImagemDaAPI(cardName) {
  try {
    const response = await fetch(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(cardName)}`,
    );

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(
        `Falha ao buscar "${cardName}" na API (status ${response.status}): ${errorBody}`,
      );
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
 * Download and save card image
 * @param {string} imageUrl - Image URL
 * @param {string} absolutePath - Path where image is saved
 * @returns {Promise<boolean>} True on success
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
 * Resolve and return relative path for a card image
 * Checks cache first, then downloads when needed
 * @param {string} cardName - Card name to fetch
 * @returns {Promise<?string>} Relative image path or null
 */
async function obterPathImagemCarta(cardName) {
  const cleanName = sanitizeCardNameForLookup(cardName);
  if (!cleanName) return null;

  const { absolutePath, relativePath } = getCardImagePaths(cleanName);

  // Check cache first
  const existeEmCache = await imagemEmCache(absolutePath);
  if (existeEmCache) {
    return relativePath;
  }

  // Fetch image from API
  logger.info(`Baixando imagem: ${cleanName}...`);
  const imageUrl = await buscarImagemDaAPI(cleanName);
  if (!imageUrl) return null;

  // Save image
  const sucesso = await baixarESalvarImagem(imageUrl, absolutePath);
  return sucesso ? relativePath : null;
}

module.exports = {
  obterPathImagemCarta,
  getCardImagePaths,
};
