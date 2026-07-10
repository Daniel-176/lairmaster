function hexToTerminal(text, hex) {
  // Remove # if present and parse to RGB
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // ANSI escape code for 24-bit text color: \x1b[38;2;R;G;Bm
  // ANSI escape code for reset: \x1b[0m
  return(`\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`);
}

module.exports = hexToTerminal;