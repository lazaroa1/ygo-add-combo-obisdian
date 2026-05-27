/**
 * Shared contracts and guards for parser strategies.
 */

/**
 * Validate the main input text shape before detection/parsing.
 * @param {unknown} inputText - Raw user input
 */
function validarTextoEntrada(inputText) {
  if (typeof inputText !== 'string') {
    throw new TypeError('Parser input must be a string.');
  }

  if (!inputText.trim()) {
    throw new Error('Parser input cannot be empty.');
  }
}

/**
 * Validate that a strategy implements the required contract.
 * @param {Object} strategy - Candidate strategy object
 */
function validarContratoDaEstrategia(strategy) {
  const temKey =
    typeof strategy?.key === 'string' && strategy.key.trim().length > 0;
  const temCanHandle = typeof strategy?.canHandle === 'function';
  const temParse = typeof strategy?.parse === 'function';

  if (!temKey || !temCanHandle || !temParse) {
    throw new Error(
      'Invalid parser strategy contract. Expected: { key, canHandle(inputText), parse(inputText) }.',
    );
  }
}

module.exports = {
  validarTextoEntrada,
  validarContratoDaEstrategia,
};
