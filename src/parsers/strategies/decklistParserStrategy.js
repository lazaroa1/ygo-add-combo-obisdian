/**
 * Temporary decklist strategy.
 * Detection rule: section header followed by numbered card line(s).
 */

const DECK_SECTIONS = ['monster', 'spell', 'trap', 'extra', 'side'];

function ehCabecalhoDeDecklist(line) {
  const normalized = (line || '').trim().toLowerCase();
  return DECK_SECTIONS.some((section) => normalized.startsWith(section));
}

function ehLinhaDeQuantidade(line) {
  return /^\s*\d+\s+.+/.test(line || '');
}

function possuiSecaoComQuantidade(lines) {
  for (let i = 0; i < lines.length; i++) {
    if (!ehCabecalhoDeDecklist(lines[i])) {
      continue;
    }

    for (let j = i + 1; j < lines.length; j++) {
      const candidate = lines[j].trim();

      if (!candidate) {
        continue;
      }

      if (ehCabecalhoDeDecklist(candidate)) {
        break;
      }

      if (ehLinhaDeQuantidade(candidate)) {
        return true;
      }

      break;
    }
  }

  return false;
}

const decklistParserStrategy = {
  key: 'decklist',

  /**
   * Detect classic decklist sections with numbered card rows.
   * @param {string} inputText - Raw input
   * @returns {boolean}
   */
  canHandle(inputText) {
    const lines = inputText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);

    return possuiSecaoComQuantidade(lines);
  },

  /**
   * Temporary parser output.
   * @returns {Object}
   */
  parse() {
    return {
      parserType: this.key,
      output: 'soon',
    };
  },
};

module.exports = {
  decklistParserStrategy,
};
