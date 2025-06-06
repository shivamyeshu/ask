// utils.js
function chunkText(text, maxLen = 1000) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxLen;
    if (end >= text.length) end = text.length;

    const breakChars = ['.', '?', '!'];
    let lastBreak = -1;
    for (const char of breakChars) {
      const idx = text.lastIndexOf(char, end);
      if (idx > start && idx > lastBreak) {
        lastBreak = idx + 1;
      }
    }

    if (lastBreak !== -1 && lastBreak - start > 100) {
      end = lastBreak;
    } else {
      const lastSpace = text.lastIndexOf(' ', end);
      if (lastSpace > start) end = lastSpace;
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) chunks.push(chunk);
    start = end;
  }

  return chunks;
}

export { chunkText };
