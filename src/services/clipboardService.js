const os = require('os');
const { spawn } = require('child_process');

/**
 * Copy plain text to the operating system clipboard.
 * @param {string} text - Text to copy
 * @returns {Promise<void>}
 */
function copiarTextoParaClipboard(text) {
  const content = String(text ?? '');
  const platform = os.platform();

  if (platform === 'win32') {
    return executarComandoClipboard('clip', [], content);
  }

  if (platform === 'darwin') {
    return executarComandoClipboard('pbcopy', [], content);
  }

  return executarComandoClipboard(
    'xclip',
    ['-selection', 'clipboard'],
    content,
  );
}

/**
 * Run clipboard command and pipe content to stdin.
 * @param {string} command - Command name
 * @param {Array<string>} args - Command args
 * @param {string} content - Clipboard text payload
 * @returns {Promise<void>}
 */
function executarComandoClipboard(command, args, content) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: ['pipe', 'ignore', 'pipe'] });
    let stderr = '';

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    proc.on('error', (error) => {
      reject(
        new Error(`Clipboard command failed (${command}): ${error.message}`),
      );
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `Clipboard command exited with code ${code}: ${stderr.trim()}`,
        ),
      );
    });

    proc.stdin.write(content);
    proc.stdin.end();
  });
}

module.exports = {
  copiarTextoParaClipboard,
};
