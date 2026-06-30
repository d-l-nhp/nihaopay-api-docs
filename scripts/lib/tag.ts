/**
 * tag parsing, shared by the release scripts.
 *
 * tags are v<MAJOR>.<MINOR>.<PATCH>, where MAJOR.MINOR has to match the
 * Nihaopay API version this repo documents (currently 1.2). both
 * validate-tag.ts and build-release.ts go through parseTag, so the
 * format check and the version-line check only live in one place.
 */

/** API line this repo tracks — tags off this line get rejected. */
export const API_LINE = "1.2";

const TAG_RE = /^v(\d+)\.(\d+)\.(\d+)$/;

export interface ParsedTag {
  /** the original tag, e.g. "v1.2.5". */
  tag: string;
  /** the tag without its leading "v", e.g. "1.2.5" — used for artifact names. */
  version: string;
  major: number;
  minor: number;
  patch: number;
}

export function parseTag(raw: string): ParsedTag {
  const tag = raw.trim();
  const match = TAG_RE.exec(tag);
  if (!match) {
    throw new Error(`tag must look like v<major>.<minor>.<patch> (got: ${JSON.stringify(raw)})`);
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);

  const line = `${major}.${minor}`;
  if (line !== API_LINE) {
    throw new Error(
      `tag ${tag} is off the documented API line: expected v${API_LINE}.x, got v${line}.x`,
    );
  }

  return { tag, version: `${major}.${minor}.${patch}`, major, minor, patch };
}
