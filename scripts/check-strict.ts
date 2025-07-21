import { resolve } from "jsr:@std/path";
import { walk as denoWalk } from "jsr:@std/fs";

const missingStrictFiles: string[] = [];
const strictRegex = /^--!strict/;

async function checkFileForStrict(filePath: string) {
  const content = await Deno.readTextFile(filePath);
  const lines = content.split(/\r?\n/);
  if (lines.length > 0 && !strictRegex.test(lines[0])) {
    missingStrictFiles.push(filePath);
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
    await checkFileForStrict(entry.path);
  }

  console.log(missingStrictFiles.length === 0 ? "All .luau files start with '--!strict'." : `Files NOT starting with '--!strict':\n${missingStrictFiles.map(file => `  ${file}`).join("\n")}`);
}

main();