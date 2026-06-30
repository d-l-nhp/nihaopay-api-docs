#!/usr/bin/env tsx
/**
 * builds content-<tag>.tar.gz — the parsed-and-linted content/ tree we
 * attach to each GitHub Release. self-contained: just builds the artifact,
 * doesn't reach out to or get called by any downstream consumer.
 *
 * reads the tag from the first CLI arg or GITHUB_REF_NAME, tars content/ (as
 * the archive root) into build-artifacts/, and prints the sha256 + file
 * count. under GitHub Actions it also writes path, checksum, filename,
 * version, and sha256 to $GITHUB_OUTPUT so the release step can attach
 * the assets.
 */

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { parseTag } from "./lib/tag.ts";

const execFileAsync = promisify(execFile);
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function resolveRawTag(argv: string[]): string {
  const fromArg = argv.find((a) => !a.startsWith("-"));
  if (fromArg) return fromArg;
  const fromEnv = process.env["GITHUB_REF_NAME"];
  if (fromEnv) return fromEnv;
  throw new Error("no tag provided — pass one as an argument or set GITHUB_REF_NAME");
}

async function countTarFiles(tarPath: string): Promise<number> {
  const { stdout } = await execFileAsync("tar", ["-tzf", tarPath]);
  return stdout.split("\n").filter((line) => line && !line.endsWith("/")).length;
}

async function emitGithubOutput(outputs: Record<string, string>): Promise<void> {
  const target = process.env["GITHUB_OUTPUT"];
  if (!target) return;
  const lines = Object.entries(outputs)
    .map(([key, value]) => `${key}=${value}\n`)
    .join("");
  await appendFile(target, lines);
}

async function main(): Promise<void> {
  const { tag, version } = parseTag(resolveRawTag(process.argv.slice(2)));
  const filename = `content-${tag}.tar.gz`;

  const outDir = join(REPO_ROOT, "build-artifacts");
  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, filename);

  await execFileAsync("tar", ["-czf", outPath, "-C", REPO_ROOT, "content"]);

  const bytes = await readFile(outPath);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const fileCount = await countTarFiles(outPath);

  const checksumPath = `${outPath}.sha256`;
  await writeFile(checksumPath, `${sha256}  ${filename}\n`);

  console.log(`build-tarball: wrote ${outPath}`);
  console.log(`build-tarball: ${fileCount} files, ${bytes.length} bytes, sha256=${sha256}`);
  console.log(`build-tarball: wrote ${checksumPath}`);

  await emitGithubOutput({ path: outPath, checksum: checksumPath, filename, version, sha256 });
}

main().catch((err: unknown) => {
  console.error(`build-tarball: ${(err as Error).message}`);
  process.exit(1);
});
