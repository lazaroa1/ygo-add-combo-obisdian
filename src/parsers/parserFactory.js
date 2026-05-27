const {
  validarTextoEntrada,
  validarContratoDaEstrategia,
} = require('./contracts/parserStrategyContract');
const {
  decklistParserStrategy,
} = require('./strategies/decklistParserStrategy');
const {
  comboGraphParserStrategy,
} = require('./strategies/comboGraphParserStrategy');

/**
 * Factory responsible for selecting the right parser strategy.
 */
class ParserFactory {
  /**
   * @param {Array<Object>} strategies - Strategy list in priority order
   */
  constructor(strategies) {
    this.strategies = (strategies || []).map((strategy) => {
      validarContratoDaEstrategia(strategy);
      return strategy;
    });
  }

  /**
   * Resolve strategy by input content.
   * @param {string} inputText - Raw input
   * @returns {Object} Matching strategy
   */
  resolve(inputText) {
    validarTextoEntrada(inputText);

    const strategy = this.strategies.find((candidate) =>
      candidate.canHandle(inputText),
    );

    if (!strategy) {
      throw new Error(
        'Unsupported input format. No parser strategy matched the provided content.',
      );
    }

    return strategy;
  }

  /**
   * Parse input using resolved strategy.
   * @param {string} inputText - Raw input
   * @returns {Object|string}
   */
  parse(inputText) {
    const strategy = this.resolve(inputText);
    return strategy.parse(inputText);
  }
}

const parserFactory = new ParserFactory([
  decklistParserStrategy,
  comboGraphParserStrategy,
]);

module.exports = {
  ParserFactory,
  parserFactory,
};
