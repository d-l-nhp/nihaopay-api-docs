---
id: error-handling/error-object
title: "Error Object Shape"
type: concept
product: platform
tags:
  - errors
  - reference
  - troubleshooting
summary: "The JSON shape Nihaopay v1.2 returns on failed API requests: a {code, label, message} object. The (code, label) pair is the canonical identifier used throughout this documentation."
related:
  - error-handling/error-list
  - error-handling/signature-errors
status: stable
last_reviewed: "2026-05-17"
---

## Shape

When a Nihaopay API request fails, the response body is a JSON object:

```json
{
  "code": 409,
  "label": "64",
  "message": "Refund or capture currency does not match the original transaction currency."
}
```

| Field | Type | Description |
|---|---|---|
| `code` | int | The HTTP status code (also the response status code). |
| `label` | string | Nihaopay-specific error label. Preserved as a string to keep leading zeros (e.g. `"00"`, `"31"`, `"301"`). |
| `message` | string | Human-readable cause. Stable per (code, label) pair across deployments. |

## Identifier convention

The pair `(code, label)` uniquely identifies an error condition. Throughout this documentation and the Nihaopay docs MCP tooling, errors are referred to as **`code-label`** (e.g. `400-23`, `500-91`, `402-67`).

The MCP server's `get_error_code` tool accepts this same format. Looking up `400-23` is preferable to searching for "validation error" — direct lookup is faster, deterministic, and surfaces the canonical message.

## HTTP status categories

Per the spec:

- **2xx** — Request success. Will not appear in error objects (the body is the success payload, not an error).
- **4xx** — Client error: malformed request, unauthenticated, unknown endpoint.
- **5xx** — Nihaopay internal server error.

Some documented features may not be available yet; those endpoints return `501 Not Implemented`.

## Why labels are strings

The label is preserved as a string in this documentation and in our `_data/error-codes.yaml` source-of-truth file. This is deliberate — labels include leading zeros (`"00"`, `"01"`, `"06"`) that would silently disappear if treated as integers, breaking the canonical identifier format.

When consuming Nihaopay error responses, treat `label` as an opaque string. Do not parse it as an integer.

## Support escalation

When contacting `tech_support@nihaopay.com` about a specific error, include:

- The (code, label) identifier.
- Your merchant reference for the failing transaction.
- The request you sent (with sensitive credentials redacted).

The label is what support uses internally to route the issue.

## Related

- [Full error list](./error-list.md) — every documented (code, label) with its message.
- [Signature errors](./signature-errors.md) — deep-dive on `500-91`, the most common integration-time error.
