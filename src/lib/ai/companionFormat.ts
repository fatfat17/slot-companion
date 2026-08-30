export type CompanionTextSegment = { text: string; bold: boolean };
export type CompanionTextBlock = { kind: "paragraph" | "bullet"; segments: CompanionTextSegment[] };

function segmentsFor(line: string): CompanionTextSegment[] {
  const segments: CompanionTextSegment[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let cursor = 0;
  for (const match of line.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) segments.push({ text: line.slice(cursor, index), bold: false });
    segments.push({ text: match[1], bold: true });
    cursor = index + match[0].length;
  }
  if (cursor < line.length) segments.push({ text: line.slice(cursor), bold: false });
  return segments.length ? segments : [{ text: line.replaceAll("**", ""), bold: false }];
}

export function formatCompanionAnswer(value: string): CompanionTextBlock[] {
  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const bullet = /^[-•]\s+/.test(line);
      return { kind: bullet ? "bullet" : "paragraph", segments: segmentsFor(line.replace(/^[-•]\s+/, "")) };
    });
}
