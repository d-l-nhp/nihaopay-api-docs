---
id: reference/ipn-mechanics
title: "Instant Payment Notification (IPN): The Canonical Definition"
type: concept
product: platform
tags:
  - ipn
  - webhook
  - signature
  - async
  - md5
summary: "How Nihaopay delivers async payment events, the verify-signature algorithm, and retry semantics. The single canonical IPN definition; product-specific IPN pages reference this one for the base shape."
related:
  - payment-products/securepay/standard
signature_scheme: ipn-md5-sorted-keys
status: stable
last_reviewed: "2026-05-17"
---

## Overview

After a payment is completed, Nihaopay sends a **POST** request to your configured `ipn_url` containing the transaction outcome. IPNs are the **authoritative** source of payment status — they're more reliable than the browser callback because:

- The customer may close the browser before the callback fires.
- IPNs are retried until acknowledged; callbacks are not.

> **Whenever possible, record transaction state from the IPN, not the callback.**

## Delivery rules

- `ipn_url` **must** be publicly reachable. Intranet addresses (`localhost`, `192.168.x.x`, etc.) will not receive IPNs.
- Nihaopay POSTs to the URL with `Content-Type: application/x-www-form-urlencoded`.
- The IPN handler **must** return HTTP `200`. Any non-200 (including 3xx redirects) triggers a retry.
- The IPN response body is ignored.
- The IPN handler **must not** redirect.

### Retry schedule

Up to **8 notifications** within ~2 hours. Intervals between attempts:

| Attempt | Delay from initial event |
|---|---|
| 1 | 0m |
| 2 | 1m |
| 3 | 2m |
| 4 | 4m |
| 5 | 8m |
| 6 | 20m |
| 7 | 30m |
| 8 | (final) |

Duplicate notifications may arrive even after a successful 200 response. Handlers **must be idempotent** — key by the `id` field and ignore repeats.

## Payload shape

Fields are sent as URL-encoded form data (not JSON). A sample payload:

```
id=20170519103602011338
amount=2
currency=USD
rmb_amount=12
reference=20170519103456437807
sys_reserve={"vendor_id":"4200000117201806013734875340"}
status=success
time=2017-05-19T10:36:32Z
note=null
verify_sign=46072c81e3c6140d6bc92655196b247f
```

| Field | Type | Description |
|---|---|---|
| `id` | string | Nihaopay transaction ID. |
| `status` | string | Transaction status. SecurePay only sends `success`; other products may send `failure` or `pending`. |
| `amount` | int | Settlement amount in the foreign-currency minor unit. |
| `rmb_amount` | int | Payment RMB amount. Same as request; if not in request, payment amount is returned. |
| `currency` | string | 3-letter currency code. |
| `time` | string | UTC timestamp (`YYYY-MM-DDTHH:mm:ssZ`). |
| `reference` | string | Your merchant reference from the original request. |
| `note` | string | Note from the request, or literal `null` if not provided. |
| `sys_reserve` | json-in-string | Vendor passthrough data (a JSON string, not a JSON object). |
| `verify_sign` | string | Signature for the message (see below). |

## Signature verification

The IPN signature uses **MD5** over a deterministic, sorted-key concatenation of the message fields plus your merchant token.

### Algorithm

```
verify_sign = MD5( key1=value1 & key2=value2 & ... & keyN=valueN & MD5(TOKEN) )
```

Where:

1. Fields are pairs of `key=value`. **If a value is `null`, omit that key entirely** from the signed message.
2. Pairs are joined with `&`.
3. Pairs are **sorted by key in ascending order**.
4. `MD5(TOKEN)` is the merchant's bearer-token hash, **appended at the end** (after all key-value pairs).
5. MD5 outputs are lowercase hex; comparisons should be **case-insensitive**.
6. Charset is UTF-8 throughout.

### Step-by-step example

Given the payload above and merchant `TOKEN = "secret-token"`:

1. Take the fields (excluding `verify_sign` itself).
2. Drop any whose value is `null` (in this case, `note`).
3. Sort by key:
   ```
   amount=2
   currency=USD
   id=20170519103602011338
   reference=20170519103456437807
   rmb_amount=12
   status=success
   sys_reserve={"vendor_id":"4200000117201806013734875340"}
   time=2017-05-19T10:36:32Z
   ```
4. Join with `&` and append `MD5("secret-token")`:
   ```
   amount=2&currency=USD&id=20170519103602011338&reference=20170519103456437807&rmb_amount=12&status=success&sys_reserve={"vendor_id":"4200000117201806013734875340"}&time=2017-05-19T10:36:32Z&<md5-of-token>
   ```
5. Compute `MD5(...)` of the entire string.
6. Compare to the `verify_sign` field. If they match (case-insensitive), the IPN is authentic.

### Critical: do not substitute another algorithm

Nihaopay v1.2 requires MD5. Substituting SHA-256 or HMAC will produce a non-matching signature; you will reject valid IPNs and accept invalid ones if you skip verification. **Verify the signature on every IPN** before treating its contents as authoritative.

## Notes for product-specific IPN pages

Most payment products use this canonical scheme. Two known exceptions:

- **Auto Debit Contract notifications** (`§9.4`) use a different signature: `signature = MD5(body + '&' + MD5(token))` — a **body-based** scheme, not field-based.
- **Profit Sharing callbacks** (`§10.11`) have an **undocumented** signature scheme in the v1.2 spec. Contact Nihaopay tech support before deploying.

Product-specific IPN pages link back to this page for the canonical scheme and note any deltas.
