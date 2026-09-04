const { parserFactory } = require('../parsers/parserFactory');

/**
 * Main parser entrypoint used by services.
 * Delegates detection and parsing to strategy factory.
 * @param {string} inputText - Raw user input
 * @returns {Promise<Object|string>}
 */
async function parsearEntradaPrincipal(inputText) {
  return parserFactory.parse(inputText);
}

module.exports = {
  parsearEntradaPrincipal,
};
