---
id: payment-products/auto-debit/contract-notifications
title: "Auto Debit: Contract-Status Notifications (Async)"
type: concept
product: auto-debit
tags:
  - auto-debit
  - notification
  - webhook
  - signature
  - md5-body
summary: "Async notifications for Auto Debit contract-status transitions (signed / terminated / failed). POSTed to the notifyUrl supplied at signing. Uses a body-based MD5 signature (§9.4), distinct from the field-based IPN signature. Retry schedule: up to 7 notifications at 0m / 1m / 2m / 4m / 8m / 20m / 30m intervals."
related:
  - payment-products/auto-debit/_overview
  - payment-products/auto-debit/signing
  - reference/ipn-mechanics
signature_scheme: auto-debit-md5-body
status: stable
last_reviewed: "2026-05-26"
---

## What this covers

When an Auto Debit contract changes state — signed by user, terminated, signing failed — Nihaopay POSTs a notification to the `notifyUrl` you supplied during [signing](./signing.md). This page documents:

- The notification payload.
- The **body-based signature** (different from the standard field-based IPN signature).
- The retry schedule.

This page does **not** cover deduction-outcome IPNs (those use the standard IPN scheme — see [IPN mechanics](../../07-reference/ipn-mechanics.md)).

## Delivery rules

- `notifyUrl` **must** be publicly reachable.
- Nihaopay POSTs with the contract-status payload as the request body.
- Your handler must return HTTP `200`. Any non-200 (or no response) triggers a retry.

### Retry schedule

Up to **7 notifications** within ~1 hour. Intervals from the initial event:

| Attempt | Delay |
| ------- | ----- |
| 1       | 0m    |
| 2       | 1m    |
| 3       | 2m    |
| 4       | 4m    |
| 5       | 8m    |
| 6       | 20m   |
| 7       | 30m   |

Handlers must be **idempotent** — key by `contractNo` + `contractStatus`.

## Payload

| Parameter        | Type   | Description                                                                         |
| ---------------- | ------ | ----------------------------------------------------------------------------------- |
| `agreementId`    | string | Contract template ID — `plan_id` in WeChat.                                         |
| `userId`         | string | User identifier (`openid` in WeChat).                                               |
| `contractId`     | string | Contract ID — needed for initiating future deductions.                              |
| `contractNo`     | string | Nihaopay contract number.                                                           |
| `reference`      | string | Merchant unique identifier from signing request.                                    |
| `contractStatus` | string | One of: `Signed`, `Terminated`, `Processing`, `FAIL`.                               |
| `signedAt`       | string | Signing time. Set for signing notifications. Format `yyyy-MM-dd'T'HH:mm:ss.SSSZZZ`. |
| `terminateAt`    | string | Termination time. Set for termination notifications. Same format.                   |
| `terminateMode`  | string | `USER`, `MERCHANT`, or `PLATFORM`. Set for termination notifications.               |

## Signature verification — different scheme

**This notification uses a body-based MD5 scheme, NOT the sorted-key concatenation used by the regular IPN.**

The HTTP request carries a `Signature` header. Verify it as:

```
signature = MD5(body + '&' + MD5(token))
```

Where:

- `body` = the **raw HTTP request body** (the JSON string as received, with no normalization).
- `MD5(token)` = the MD5 hash of your merchant bearer token.
- Charset is UTF-8.
- Lowercase hex; compare case-insensitively.

### Why this matters

The regular IPN scheme (`§4.4`) builds the signed string from **parsed fields** in sorted order. Trying that scheme on this payload will reject every valid notification. Conversely, applying this body-based scheme to a regular IPN will likewise fail.

Tag your notification handler with a route prefix (`/papay-notify` vs `/ipn`) so the routing dispatches the right verifier. Mixing them up is a common production incident.

### Worked example

Given request body:

```json
{
  "agreementId": "your agreementId",
  "userId": "contract user id",
  "contractId": "contract id",
  "contractNo": "our contract number",
  "reference": "your unique reference",
  "contractStatus": "Signed",
  "signedAt": "2025-01-15T19:15:14.000Z",
  "terminateAt": null,
  "terminateMode": null
}
```

And `TOKEN = "secret-token"`:

1. `MD5("secret-token")` → `<token-hash>`
2. Signed string = `<body-json>` + `&` + `<token-hash>`
3. `signature = MD5(<signed-string>)`
4. Compare to the `Signature` HTTP header.

## Example cURL of a signing notification

```bash
curl -> POST ${YOUR_NOTIFY_URL} \
  --header 'Content-Type: application/json' \
  --header 'Signature: ${signature}' \
  --data '{
    "agreementId": "your agreementId",
    "userId": "contract user id",
    "contractId": "contract id",
    "contractNo": "our contract number",
    "reference": "your unique reference",
    "contractStatus": "Signed/Terminated",
    "signedAt": "yyyy-MM-dd'\''T'\''HH:mm:ss.SSSZZZ",
    "terminateAt": "yyyy-MM-dd'\''T'\''HH:mm:ss.SSSZZZ",
    "terminateMode": "USER/MERCHANT/PLATFORM"
  }'
```

## Handling guidance

- **Always verify the signature first.** Reject unsigned or mis-signed payloads silently (don't 500 — that triggers retries).
- **Idempotency key:** `(contractNo, contractStatus, signedAt|terminateAt)`. Duplicates are normal; treat repeats as no-ops.
- **`Processing` status** is rare in notifications (most signings either succeed → `Signed` or fail → `FAIL`); you may see it if WeChat is taking unusually long. Don't act on `Processing` — wait for the terminal state.
