#!/usr/bin/env tsx
/**
 * lints content/**\/*.md against schemas/frontmatter.ts and the checks below.
 * any FAIL exits 1; warnings just print. each finding is one line:
 *   <severity> <path>:<line?> — <message>
 *
 * checks, FAIL unless it says warn:
 *   F-001 frontmatter parses as YAML
 *   F-002 frontmatter passes the Zod schema
 *   F-003 doc id is unique across the repo
 *   F-004 doc id matches the file path
 *   F-005 every related[] id points at a real file
 *   F-006 every error_codes[] entry is in _data/error-codes.yaml
 *   F-007 endpoint pages match _data/endpoints.yaml (method, path,
 *         discriminator, product)
 *   F-008 internal markdown links resolve
 *   W-001 last_reviewed older than 180 days
 *   W-002 body has an H1 (title already does that job)
 *   W-003 page isn't linked from any _overview.md
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import matter from "gray-matter";
import { parse as parseYaml } from "yaml";
import { EndpointsFile, ErrorCodesFile } from "../schemas/data.ts";
import { Frontmatter } from "../schemas/frontmatter.ts";

const CONTENT_DIR = "content";
const DATA_DIR = "content/_data";

type Severity = "FAIL" | "WARN";

interface Finding {
  severity: Severity;
  rule: string;
  file: string;
  line?: number;
  message: string;
}

interface ParsedDoc {
  file: string;
  relPath: string;
  /** doc id, derived from the file path. */
  pathSlug: string;
  /** frontmatter before Zod validation. */
  rawFm: Record<string, unknown>;
  /** Zod's verdict on the frontmatter, success or error. */
  fm: ReturnType<typeof Frontmatter.safeParse>;
  body: string;
}

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_data") continue;
      out.push(...(await walk(path)));
    } else if (entry.name.endsWith(".md")) {
      out.push(path);
    }
  }
  return out;
}

/**
 * turns a content file path into its doc id.
 *   content/01-payment-products/securepay/standard.md
 *   → payment-products/securepay/standard
 *
 * strips the leading number prefix from the top-level directory (00-/01-/...)
 * and the .md extension.
 */
function filePathToDocId(filePath: string): string {
  const rel = relative(CONTENT_DIR, filePath).replace(/\\/g, "/");
  const noExt = rel.replace(/\.md$/, "");
  return noExt.replace(/^\d{2}-/, "");
}

async function parseDoc(filePath: string): Promise<ParsedDoc | Finding> {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (err) {
    return {
      severity: "FAIL",
      rule: "F-001",
      file: filePath,
      message: `cannot read file: ${(err as Error).message}`,
    };
  }

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch (err) {
    return {
      severity: "FAIL",
      rule: "F-001",
      file: filePath,
      message: `frontmatter parse error: ${(err as Error).message}`,
    };
  }

  const fm = Frontmatter.safeParse(parsed.data);
  return {
    file: filePath,
    relPath: relative(process.cwd(), filePath),
    pathSlug: filePathToDocId(filePath),
    rawFm: parsed.data as Record<string, unknown>,
    fm,
    body: parsed.content,
  };
}

function checkSchemaValidation(doc: ParsedDoc, out: Finding[]): void {
  if (!doc.fm.success) {
    for (const issue of doc.fm.error.issues) {
      out.push({
        severity: "FAIL",
        rule: "F-002",
        file: doc.relPath,
        message: `${issue.path.join(".")}: ${issue.message}`,
      });
    }
  }
}

function checkIdMatchesPath(doc: ParsedDoc, out: Finding[]): void {
  if (!doc.fm.success) return;
  const declared = doc.fm.data.id;
  if (declared !== doc.pathSlug) {
    out.push({
      severity: "FAIL",
      rule: "F-004",
      file: doc.relPath,
      message: `frontmatter id="${declared}" does not match path-derived "${doc.pathSlug}"`,
    });
  }
}

function checkH1InBody(doc: ParsedDoc, out: Finding[]): void {
  const lines = doc.body.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (/^# (?!#)/.test(line)) {
      out.push({
        severity: "WARN",
        rule: "W-002",
        file: doc.relPath,
        line: i + 1,
        message: `body contains H1 heading "${line.trim()}"; the frontmatter title sets the page heading`,
      });
      break;
    }
  }
}

function checkLastReviewedFreshness(doc: ParsedDoc, out: Finding[]): void {
  if (!doc.fm.success) return;
  const lr = doc.fm.data.last_reviewed;
  if (lr === null) return;

  const reviewedAt = new Date(`${lr}T00:00:00Z`).getTime();
  const now = Date.now();
  const ageDays = Math.floor((now - reviewedAt) / (1000 * 60 * 60 * 24));
  if (ageDays > 180) {
    out.push({
      severity: "WARN",
      rule: "W-001",
      file: doc.relPath,
      message: `last_reviewed=${lr} is ${ageDays} days old (>180)`,
    });
  }
}

const INTERNAL_LINK_REGEX = /\]\(([^)]+?\.md)(#[^)]*)?\)/g;

function checkIdUniqueness(docs: ParsedDoc[], out: Finding[]): void {
  const seen = new Map<string, string>();
  for (const doc of docs) {
    if (!doc.fm.success) continue;
    const id = doc.fm.data.id;
    const prev = seen.get(id);
    if (prev !== undefined) {
      out.push({
        severity: "FAIL",
        rule: "F-003",
        file: doc.relPath,
        message: `duplicate id "${id}" (also in ${prev})`,
      });
    } else {
      seen.set(id, doc.relPath);
    }
  }
}

function checkRelatedResolves(docs: ParsedDoc[], allIds: Set<string>, out: Finding[]): void {
  for (const doc of docs) {
    if (!doc.fm.success) continue;
    for (const ref of doc.fm.data.related) {
      if (!allIds.has(ref)) {
        out.push({
          severity: "FAIL",
          rule: "F-005",
          file: doc.relPath,
          message: `related[] entry "${ref}" does not resolve to any content file`,
        });
      }
    }
  }
}

function checkErrorCodesExist(docs: ParsedDoc[], knownCodes: Set<string>, out: Finding[]): void {
  for (const doc of docs) {
    if (!doc.fm.success) continue;
    for (const code of doc.fm.data.error_codes) {
      if (!knownCodes.has(code)) {
        out.push({
          severity: "FAIL",
          rule: "F-006",
          file: doc.relPath,
          message: `error_codes[] entry "${code}" not found in _data/error-codes.yaml`,
        });
      }
    }
  }
}

interface EndpointKey {
  method: string;
  path: string;
  discriminator: { param: string; value: string } | undefined;
}

interface CatalogEntry extends EndpointKey {
  product: string;
}

function endpointKeyMatches(a: EndpointKey, b: EndpointKey): boolean {
  if (a.method !== b.method || a.path !== b.path) return false;
  if (a.discriminator === undefined && b.discriminator === undefined) return true;
  if (a.discriminator === undefined || b.discriminator === undefined) return false;
  return (
    a.discriminator.param === b.discriminator.param &&
    a.discriminator.value === b.discriminator.value
  );
}

function checkEndpointsInCatalog(docs: ParsedDoc[], catalog: CatalogEntry[], out: Finding[]): void {
  for (const doc of docs) {
    if (!doc.fm.success) continue;
    const fm = doc.fm.data;
    if (fm.type !== "endpoint" || fm.gap) continue;
    if (!fm.endpoint) continue;
    const docKey: EndpointKey = {
      method: fm.endpoint.method,
      path: fm.endpoint.path,
      discriminator: fm.endpoint.discriminator,
    };
    const desc = docKey.discriminator
      ? `${docKey.method} ${docKey.path} (${docKey.discriminator.param}=${docKey.discriminator.value})`
      : `${docKey.method} ${docKey.path}`;
    const match = catalog.find((c) => endpointKeyMatches(c, docKey));
    if (!match) {
      out.push({
        severity: "FAIL",
        rule: "F-007",
        file: doc.relPath,
        message: `endpoint ${desc} not registered in _data/endpoints.yaml`,
      });
      continue;
    }
    if (fm.product !== match.product) {
      out.push({
        severity: "FAIL",
        rule: "F-007",
        file: doc.relPath,
        message: `endpoint ${desc} product="${fm.product}" disagrees with catalog product="${match.product}"`,
      });
    }
  }
}

function checkInternalLinks(docs: ParsedDoc[], out: Finding[]): void {
  const docFileSet = new Set(docs.map((d) => resolve(d.file)));

  for (const doc of docs) {
    const docDir = dirname(doc.file);
    for (const match of doc.body.matchAll(INTERNAL_LINK_REGEX)) {
      const targetMd = match[1];
      if (!targetMd) continue;
      const targetAbs = resolve(docDir, targetMd);
      if (!docFileSet.has(targetAbs)) {
        out.push({
          severity: "FAIL",
          rule: "F-008",
          file: doc.relPath,
          message: `internal markdown link to "${targetMd}" does not resolve (computed: ${relative(process.cwd(), targetAbs)})`,
        });
      }
    }
  }
}

/**
 * W-003: flags pages that aren't reachable from any _overview.md. walks
 * related[] and internal .md links out from the overview files.
 */
function checkOrphans(docs: ParsedDoc[], out: Finding[]): void {
  const idToDoc = new Map<string, ParsedDoc>();
  const absToDoc = new Map<string, ParsedDoc>();
  for (const d of docs) {
    absToDoc.set(resolve(d.file), d);
    if (d.fm.success) idToDoc.set(d.fm.data.id, d);
  }

  const isOverview = (d: ParsedDoc): boolean => d.file.endsWith("_overview.md");

  const neighbors = (d: ParsedDoc): ParsedDoc[] => {
    const result: ParsedDoc[] = [];
    if (d.fm.success) {
      for (const ref of d.fm.data.related) {
        const target = idToDoc.get(ref);
        if (target) result.push(target);
      }
    }
    const docDir = dirname(d.file);
    for (const match of d.body.matchAll(INTERNAL_LINK_REGEX)) {
      const targetMd = match[1];
      if (!targetMd) continue;
      const target = absToDoc.get(resolve(docDir, targetMd));
      if (target) result.push(target);
    }
    return result;
  };

  const reached = new Set<ParsedDoc>();
  const stack: ParsedDoc[] = [];
  for (const d of docs) {
    if (isOverview(d)) {
      reached.add(d);
      stack.push(d);
    }
  }
  while (stack.length > 0) {
    const cur = stack.pop();
    if (!cur) break;
    for (const n of neighbors(cur)) {
      if (!reached.has(n)) {
        reached.add(n);
        stack.push(n);
      }
    }
  }

  for (const d of docs) {
    if (!isOverview(d) && !reached.has(d)) {
      out.push({
        severity: "WARN",
        rule: "W-003",
        file: d.relPath,
        message: "orphan file — not reachable from any _overview.md",
      });
    }
  }
}

async function loadKnownErrorCodes(): Promise<Set<string>> {
  const path = join(DATA_DIR, "error-codes.yaml");
  try {
    await stat(path);
  } catch {
    return new Set();
  }
  const raw = await readFile(path, "utf8");
  const parsed = ErrorCodesFile.parse(parseYaml(raw));
  return new Set(parsed.codes.map((c) => c.code));
}

async function loadEndpointCatalog(): Promise<CatalogEntry[]> {
  const path = join(DATA_DIR, "endpoints.yaml");
  try {
    await stat(path);
  } catch {
    return [];
  }
  const raw = await readFile(path, "utf8");
  const parsed = EndpointsFile.parse(parseYaml(raw));
  return parsed.endpoints.map((e) => ({
    method: e.method,
    path: e.path,
    discriminator: e.discriminator,
    product: e.product,
  }));
}

async function main(): Promise<void> {
  try {
    await stat(CONTENT_DIR);
  } catch {
    console.info("[lint-content] content/ directory not found — skipping.");
    return;
  }

  const files = await walk(CONTENT_DIR);

  if (files.length === 0) {
    console.info("[lint-content] content/ has no markdown files yet — skipping.");
    return;
  }

  console.info(`[lint-content] scanning ${files.length} file(s)...`);

  const parsedOrFinding = await Promise.all(files.map((f) => parseDoc(f)));

  const findings: Finding[] = [];
  const docs: ParsedDoc[] = [];

  for (const p of parsedOrFinding) {
    if ("severity" in p) {
      findings.push(p);
    } else {
      docs.push(p);
    }
  }

  for (const doc of docs) {
    checkSchemaValidation(doc, findings);
    checkIdMatchesPath(doc, findings);
    checkH1InBody(doc, findings);
    checkLastReviewedFreshness(doc, findings);
  }

  const allIds = new Set(docs.flatMap((d) => (d.fm.success ? [d.fm.data.id] : [])));
  checkIdUniqueness(docs, findings);
  checkRelatedResolves(docs, allIds, findings);

  const knownCodes = await loadKnownErrorCodes();
  checkErrorCodesExist(docs, knownCodes, findings);

  const catalog = await loadEndpointCatalog();
  checkEndpointsInCatalog(docs, catalog, findings);

  checkInternalLinks(docs, findings);
  checkOrphans(docs, findings);

  const failCount = findings.filter((f) => f.severity === "FAIL").length;
  const warnCount = findings.filter((f) => f.severity === "WARN").length;

  for (const f of findings) {
    const location = f.line !== undefined ? `${f.file}:${f.line}` : f.file;
    console.error(`${f.severity} ${f.rule} ${location} — ${f.message}`);
  }

  console.info(
    `[lint-content] ${docs.length} file(s) scanned; ${failCount} fail, ${warnCount} warn.`,
  );

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error("[lint-content] failed:", err);
  process.exit(1);
});
