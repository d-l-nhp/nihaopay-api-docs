#!/usr/bin/env tsx
/**
 * validate-tag: checks the release tag before release.yml moves on.
 * pulls it from argv, or GITHUB_REF_NAME in CI. bad tag -> exit 1 with the
 * reason. rules live in lib/tag.ts.
 */

import { parseTag } from "./lib/tag.ts";

function resolveRawTag(argv: string[]): string {
  const fromArg = argv.find((a) => !a.startsWith("-"));
  if (fromArg) return fromArg;
  const fromEnv = process.env["GITHUB_REF_NAME"];
  if (fromEnv) return fromEnv;
  throw new Error("no tag provided — pass one as an argument or set GITHUB_REF_NAME");
}

function main(): void {
  try {
    const parsed = parseTag(resolveRawTag(process.argv.slice(2)));
    console.log(`validate-tag: ok — ${parsed.tag} (version ${parsed.version})`);
  } catch (err) {
    console.error(`validate-tag: ${(err as Error).message}`);
    process.exit(1);
  }
}

main();
