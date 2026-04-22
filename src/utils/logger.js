/**
 * Serviço de logging com prefixos consistentes
 */

const logger = {
  info(message) {
    console.log(`[INFO] ${message}`);
  },

  warn(message) {
    console.warn(`[WARN] ${message}`);
  },

  error(message) {
    console.error(`[ERRO] ${message}`);
  },

  fatal(message) {
    console.error(`[ERRO FATAL] ${message}`);
  },

  debug(message) {
    if (process.env.DEBUG) {
      console.log(`[DEBUG] ${message}`);
    }
  },
};

module.exports = logger;
