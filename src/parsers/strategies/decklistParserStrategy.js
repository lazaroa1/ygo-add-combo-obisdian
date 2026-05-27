/**
 * Decklist strategy.
 * Detection rule: section header followed by numbered card line(s).
 */

const DECK_SECTIONS = ['monster', 'spell', 'trap', 'extra', 'side'];
const CARD_LINE_REGEX = /^\s*(\d+)\s+(.+)\s*$/;

function ehCabecalhoDeDecklist(line) {
  const normalized = (line || '').trim().toLowerCase();
  return DECK_SECTIONS.some((section) => normalized.startsWith(section));
}

function ehLinhaDeQuantidade(line) {
  return CARD_LINE_REGEX.test(line || '');
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
   * Parse decklist and return formatted plain text.
   * @param {string} inputText - Raw input
   * @returns {Promise<Object>}
   */
  async parse(inputText) {
    const blocks = extrairBlocosDecklist(inputText);
    const cards = blocks.filter((item) => item.kind === 'card');
    const cardInfoMap = await buscarInfosDasCartas(
      cards.map((item) => item.name),
    );
    const output = formatarDecklistParaTexto(blocks, cardInfoMap);

    return {
      parserType: this.key,
      output,
    };
  },
};

/**
 * Parse input preserving category lines and card rows order.
 * @param {string} inputText - Raw input
 * @returns {Array<Object>} Mixed list of category/card blocks
 */
function extrairBlocosDecklist(inputText) {
  const lines = inputText.split('\n');
  const blocks = [];

  for (const rawLine of lines) {
    const line = (rawLine || '').trim();
    if (!line) {
      continue;
    }

    const match = CARD_LINE_REGEX.exec(line);
    if (match) {
      blocks.push({
        kind: 'card',
        qtdCard: match[1],
        name: match[2].trim(),
      });
      continue;
    }

    blocks.push({
      kind: 'category',
      title: line,
    });
  }

  return blocks;
}

/**
 * Fetch card info from YGOProDeck API for each unique name.
 * @param {Array<string>} names - Card names
 * @returns {Promise<Map<string, Object>>}
 */
async function buscarInfosDasCartas(names) {
  const uniqueNames = Array.from(
    new Set((names || []).map((name) => name.trim()).filter(Boolean)),
  );
  const infoMap = new Map();

  for (const name of uniqueNames) {
    infoMap.set(name, await buscarCardInfoPorNome(name));
  }

  return infoMap;
}

/**
 * Query YGOProDeck card endpoint by exact name.
 * @param {string} name - Card name
 * @returns {Promise<Object>} API card payload or fallback object
 */
async function buscarCardInfoPorNome(name) {
  try {
    const response = await fetch(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(name)}`,
    );

    if (!response.ok) {
      return criarCardInfoVazio(name);
    }

    const data = await response.json();
    const card = data?.data?.[0];

    if (!card) {
      return criarCardInfoVazio(name);
    }

    return card;
  } catch {
    return criarCardInfoVazio(name);
  }
}

/**
 * Build deterministic fallback when card lookup fails.
 * @param {string} name - Card name
 * @returns {Object}
 */
function criarCardInfoVazio(name) {
  return {
    id: '',
    name: name || '',
    typeline: [],
    type: '',
    desc: '',
    race: '',
    atk: '',
    def: '',
    level: '',
    attribute: '',
  };
}

/**
 * Format output preserving category separators and card block order.
 * @param {Array<Object>} blocks - Mixed category/card list
 * @param {Map<string, Object>} cardInfoMap - API payloads by name
 * @returns {string}
 */
function formatarDecklistParaTexto(blocks, cardInfoMap) {
  const lines = [];

  for (const block of blocks) {
    if (block.kind === 'category') {
      if (lines.length > 0 && lines[lines.length - 1] !== '') {
        lines.push('');
      }

      lines.push(block.title);
      lines.push('');
      continue;
    }

    const card = cardInfoMap.get(block.name) || criarCardInfoVazio(block.name);
    const typeline = Array.isArray(card.typeline)
      ? card.typeline.join(' / ')
      : card.typeline || '';

    lines.push(`qtd_card: ${block.qtdCard || ''}`);
    lines.push(`id: ${valorOuVazio(card.id)}`);
    lines.push(`name: ${valorOuVazio(card.name || block.name)}`);
    lines.push(`typeline: ${valorOuVazio(typeline)}`);
    lines.push(`type: ${valorOuVazio(card.type)}`);
    lines.push(`desc: ${valorOuVazio(card.desc)}`);
    lines.push(`race: ${valorOuVazio(card.race)}`);
    lines.push(`atk: ${valorOuVazio(card.atk)}`);
    lines.push(`def: ${valorOuVazio(card.def)}`);
    lines.push(`level: ${valorOuVazio(card.level)}`);
    lines.push(`attribute: ${valorOuVazio(card.attribute)}`);
    lines.push('');
  }

  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines.join('\n');
}

/**
 * Convert nullish values to empty string while preserving 0.
 * @param {unknown} value - Field value
 * @returns {string|number}
 */
function valorOuVazio(value) {
  return value === null || value === undefined ? '' : value;
}

module.exports = {
  decklistParserStrategy,
};
