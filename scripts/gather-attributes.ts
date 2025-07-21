import { basename, resolve } from "jsr:@std/path";
import { walk as denoWalk } from "jsr:@std/fs";

const foundLines: string[] = [];
const attributeRegex = /_ATTRIBUTE\s*=/;

function processLine(filePath: string, line: string) {
  if (attributeRegex.test(line)) {
    foundLines.push(`${basename(filePath)}:${line.trim()}`);
  }
}

async function processFile(filePath: string) {
  const content = await Deno.readTextFile(filePath);
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    processLine(filePath, line);
  }
}

async function main() {
  const searchPath = Deno.args[0] ? resolve(Deno.args[0]) : Deno.cwd();
  const stat = await Deno.stat(searchPath);
  if (!stat.isDirectory) Deno.exit(1);

  for await (
    const entry of denoWalk(searchPath, {
      match: [/\.luau$/],
      includeDirs: false,
    })
  ) {
    await processFile(entry.path);
  }

  console.log(foundLines.length === 0 ? "No lines found." : `Found ${foundLines.length} lines:\n${foundLines.join("\n")}`);
}

main();