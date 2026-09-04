const { PATTERNS } = require('../../config');
const { parseaComboCompleto } = require('../../services/comboParser');

/**
 * Combo graph strategy for Obsidian Canvas style input.
 */
const comboGraphParserStrategy = {
  key: 'comboGraph',

  /**
   * Detect combo graph content by Start hand marker or flow operator.
   * @param {string} inputText - Raw input
   * @returns {boolean}
   */
  canHandle(inputText) {
    return PATTERNS.handStart.test(inputText) || inputText.includes('->');
  },

  /**
   * Parse combo graph input preserving non-empty lines for builder processing.
   * @param {string} inputText - Raw input
   * @returns {Object}
   */
  parse(inputText) {
    const lines = inputText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);

    return {
      parserType: this.key,
      lines,
      graph: parseaComboCompleto(inputText),
    };
  },
};

module.exports = {
  comboGraphParserStrategy,
};
