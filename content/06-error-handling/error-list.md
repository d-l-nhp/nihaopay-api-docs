---
id: error-handling/error-list
title: "Error Code Reference"
type: error-code
product: platform
tags:
  - errors
  - http-status
  - troubleshooting
  - reference
summary: "Canonical list of all Nihaopay v1.2 API error codes. Format: HTTP-status hyphen 2-or-3-digit label (e.g. 400-23). Includes general codes (§14.2) plus customs-declaration-specific codes 100-109 (§8.4). For 500-91 signature errors, see error-handling/signature-errors."
related:
  - error-handling/signature-errors
error_codes:
  - "200-00"
  - "400-31"
  - "400-32"
  - "400-90"
  - "401-301"
  - "402-01"
  - "402-02"
  - "402-03"
  - "402-06"
  - "402-11"
  - "402-14"
  - "402-15"
  - "402-21"
  - "402-22"
  - "402-30"
  - "402-36"
  - "402-56"
  - "402-57"
  - "402-61"
  - "402-62"
  - "402-63"
  - "402-67"
  - "402-68"
  - "402-69"
  - "402-70"
  - "402-71"
  - "402-72"
  - "402-86"
  - "402-87"
  - "402-88"
  - "404-59"
  - "404-60"
  - "404-93"
  - "409-33"
  - "409-64"
  - "409-65"
  - "409-66"
  - "429-39"
  - "500-81"
  - "500-82"
  - "500-83"
  - "500-84"
  - "500-91"
  - "500-92"
  - "500-96"
  - "500-97"
  - "500-98"
  - "500-99"
  - "402-100"
  - "402-101"
  - "402-102"
  - "402-103"
  - "402-104"
  - "402-105"
  - "402-106"
  - "402-107"
  - "402-108"
  - "402-109"
status: stable
last_reviewed: "2026-05-18"
---

## Overview

When a Nihaopay API request fails, the response is a JSON object with the shape:

```json
{
  "code": 409,
  "label": "64",
  "message": "Refund or capture currency does not match the original transaction currency."
}
```

The pair `(code, label)` is the canonical identifier. We render it as ``code-label`` (e.g. `400-23`) throughout this documentation and the MCP tooling. See [error object](./error-object.md) for the field-by-field shape.

For deep-dives into common errors:

- [Signature errors (500-91)](./signature-errors.md) — by far the most common payment-integration error after credential issues.

## General error codes (§14.2)

Apply across all v1.2 API endpoints.

| Code | HTTP | Label | Message |
|---|---:|---:|---|
| `200-00` | 200 | 00 | Success |
| `400-31` | 400 | 31 | Transaction reference number must be unique. Please re-submit. |
| `400-32` | 400 | 32 | This payment channel is restricted. Please contact NihaoPay customer service. |
| `400-90` | 400 | 90 | The field not valid. |
| `401-301` | 401 | 301 | Invalid merchant credentials provided |
| `402-01` | 402 | 01 | Transaction failed. Please try again. |
| `402-02` | 402 | 02 | Cardholder input an incorrect card number. |
| `402-03` | 402 | 03 | Cardholder's issuing bank prevented the transaction. |
| `402-06` | 402 | 06 | Customer input an expired card number. |
| `402-11` | 402 | 11 | Customer has insufficient funds available. |
| `402-14` | 402 | 14 | Cardholder input an incorrect expiration date. |
| `402-15` | 402 | 15 | Cardholder authentication failed. Please verify cardholder's information. |
| `402-21` | 402 | 21 | Cardholder authentication failed. Please verify cardholder's information. |
| `402-22` | 402 | 22 | Card state is incorrect. |
| `402-30` | 402 | 30 | The amount exceeds transaction limit placed. |
| `402-36` | 402 | 36 | Transaction exceeds the cardholder's credit limit. |
| `402-56` | 402 | 56 | Cardholder's chosen payment card is not supported in this Gateway. |
| `402-57` | 402 | 57 | Cardholder has not activated online payments with their issuing bank. |
| `402-61` | 402 | 61 | Transaction not found. |
| `402-62` | 402 | 62 | Transaction is not within the acceptance time range. |
| `402-63` | 402 | 63 | The original transaction failed. You cannot refund, cancel, capture, or release an unsuccessful transaction. |
| `402-67` | 402 | 67 | Failed to refund transaction. Refund amount exceeds original transaction amount or remaining transaction balance. |
| `402-68` | 402 | 68 | Failed to capture transaction. Transaction has previously been released. |
| `402-69` | 402 | 69 | Failed to capture transaction. Transaction has previously been captured. |
| `402-70` | 402 | 70 | Failed to capture transaction. Capture amount exceeds authorization amount. |
| `402-71` | 402 | 71 | Buyer not exist or buyer account info error |
| `402-72` | 402 | 72 | Transaction amount is exceed the limit |
| `402-86` | 402 | 86 | Withdrawal amount exceeds account balance |
| `402-87` | 402 | 87 | Withdrawal amount less than the minimum withdrawal amount |
| `402-88` | 402 | 88 | Invalid application, it's only available for manually withdrawal merchant |
| `404-59` | 404 | 59 | Failed. Transaction have refund or chargeback. |
| `404-60` | 404 | 60 | Transaction has been cleared, please request refund. |
| `404-93` | 404 | 93 | The Exchange rate not found. |
| `409-33` | 409 | 33 | Transaction failed. Information submitted in a repeat transaction must match the original attempted transaction exactly. |
| `409-64` | 409 | 64 | Refund or capture currency does not match the original transaction currency. |
| `409-65` | 409 | 65 | Transaction has previously been cancelled. |
| `409-66` | 409 | 66 | Failed to refund transaction. Transaction has previously been fully refunded. |
| `429-39` | 429 | 39 | Too many transactions attempts by cardholder. |
| `500-81` | 500 | 81 | Merchant config error |
| `500-82` | 500 | 82 | Merchant unavailable |
| `500-83` | 500 | 83 | QRcode has expired |
| `500-84` | 500 | 84 | Service is not activated for this account |
| `500-91` | 500 | 91 | Signature error |
| `500-92` | 500 | 92 | The {0} field is required. |
| `500-96` | 500 | 96 | Timeout |
| `500-97` | 500 | 97 | Inner error |
| `500-98` | 500 | 98 | Vendor error |
| `500-99` | 500 | 99 | System error |

## Customs-declaration error codes (§8.4)

Returned by the customs declaration endpoints (`/v1.2/customs/...`) in addition to the general set above. The 12 codes shared with the general set are documented above; only the 10 customs-specific additions (labels 100–109) are listed here.

| Code | HTTP | Label | Message |
|---|---:|---:|---|
| `402-100` | 402 | 100 | Transaction retransmission fail, please try it after 5 minutes. |
| `402-101` | 402 | 101 | Customs not supported. |
| `402-102` | 402 | 102 | Customs information changed. |
| `402-103` | 402 | 103 | Certification not correct. |
| `402-104` | 402 | 104 | Split amount not correct. |
| `402-105` | 402 | 105 | Can not be modified as it is on declaration. |
| `402-106` | 402 | 106 | Same customs declare once. |
| `402-107` | 402 | 107 | Your request has been submitted, please confirm that it has taken effect. |
| `402-108` | 402 | 108 | The original customs does not exist. |
| `402-109` | 402 | 109 | The declaration is not allowed for refunded orders. |

## Per-code notes

Selected codes have additional context that doesn't fit in the tables above.

### `200-00` — Success

Success state from §14.2. Included for completeness; not an error.

### `402-21` — Cardholder authentication failed. Please verify cardholder's information.

Spec quirk: same message as 402-15. Both codes appear in §14.2 distinctly.
Reserved for future divergence; treat as functionally equivalent today.

### `500-92` — The {0} field is required.

Format string — `{0}` is replaced by the actual field name at runtime.

> Generated from `content/_data/error-codes.yaml` by `pnpm generate-error-list`. Edits to this file will be overwritten — modify the YAML instead.
