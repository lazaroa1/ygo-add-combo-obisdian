const crypto = require("crypto");

/**
 * Gera um ID aleatório hexadecimal único
 * @returns {string} ID hexadecimal de 16 caracteres
 */
function generateUniqueId() {
  return crypto.randomBytes(8).toString("hex");
}

module.exports = {
  generateUniqueId,
};
