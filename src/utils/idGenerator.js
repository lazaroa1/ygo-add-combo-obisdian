const crypto = require("crypto");

/**
 * Generate a unique random hexadecimal ID
 * @returns {string} 16-character hexadecimal ID
 */
function generateUniqueId() {
  return crypto.randomBytes(8).toString("hex");
}

module.exports = {
  generateUniqueId,
};
