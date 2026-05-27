const { parserFactory } = require('../parsers/parserFactory');

/**
 * Main parser entrypoint used by services.
 * Delegates detection and parsing to strategy factory.
 * @param {string} inputText - Raw user input
 * @returns {Object|string}
 */
function parsearEntradaPrincipal(inputText) {
  return parserFactory.parse(inputText);
}

module.exports = {
  parsearEntradaPrincipal,
};
