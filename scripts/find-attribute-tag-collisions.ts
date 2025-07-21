import { basename, resolve } from "jsr:@std/path";
import { walk as denoWalk } from "jsr:@std/fs";

const foundLines: string[] = [];
const attributeRegex = /\b(GetAttribute|SetAttribute)\b/i;
const tagRegex = /tag/i;

function processLine(filePath: string, line: string, lineNumber: number) {
  if (attributeRegex.test(line) && tagRegex.test(line)) {
    foundLines.push(`${basename(filePath)}:line ${lineNumber + 1}: ${line.trim()}`);
  }
}

async function processFile(filePath: string) {
  const content = await Deno.readTextFile(filePath);
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => processLine(filePath, line, index));
}

async function main() {
  const searchPath = Deno.args[0] ? resolve(Deno.args[0]) : Deno.cwd();
  for await (
    const entry of denoWalk(searchPath, {
      match: [/\.luau$/],
      includeDirs: false,
    })
  ) {
    await processFile(entry.path);
  }
  console.log(foundLines.length === 0
    ? "No lines containing both 'attribute' and 'tag' found."
    : `Found ${foundLines.length} lines:\n${foundLines.join("\n")}`);
}

main();