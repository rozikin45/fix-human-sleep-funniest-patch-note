import { writeFileSync, readFileSync, renameSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const ENTRY_LINE =
  "v9.0: Fixed sleep. Users now wake up rested instead of haunted by a 3am spreadsheet. Known issue: dreams still in beta.";

// Gate limit from the competition RULES: entry must be 1 to 160 characters.
const MAX_CHARS = 160;

const outPath = "/output/entry.txt";
// Temp file lives in the output directory, so the rename to
// /output/entry.txt is atomic (same filesystem; a temp file next to
// this script fails with EXDEV because /output is a different device).
const tmpPath = join(dirname(outPath), ".entry.txt.tmp");

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(tmpPath, ENTRY_LINE, "utf8");
renameSync(tmpPath, outPath);

const back = readFileSync(outPath, "utf8");
if (back !== ENTRY_LINE) {
  throw new Error("[byte-equality] output differs from entry line");
}
if (back.length < 1 || back.length > MAX_CHARS) {
  throw new Error(
    `[length] entry is ${back.length} chars, must be 1-${MAX_CHARS}`,
  );
}
if (back.includes("\n")) {
  throw new Error("[single-line] entry contains a newline");
}
if (back.trim().length === 0) {
  throw new Error("[non-whitespace] entry is only whitespace");
}
for (const ch of back) {
  if (ch.charCodeAt(0) < 0x20) {
    throw new Error(
      `[control-character] entry contains U+${ch
        .charCodeAt(0)
        .toString(16)
        .padStart(4, "0")}`,
    );
  }
}

console.log(`wrote ${back.length} chars to ${outPath}`);
