---
id: payment-products/cardpay/capture
title: "CardPay: Capture a Previously Authorized Transaction"
type: endpoint
product: cardpay
tags:
  - cardpay
  - capture
  - authorization
  - muskpay
summary: "POST https://api.muskpay.io/v1.2/transactions/capture/{transaction_id} — capture funds for a previously-authorized credit-card transaction. Capture amount cannot exceed the authorized amount. Must be done within 30 days of the auth — afterward the auth auto-releases and a new authorization is required."
related:
  - payment-products/cardpay/_overview
  - payment-products/cardpay/authorize
  - payment-products/cardpay/release
endpoint:
  method: POST
  path: /v1.2/transactions/capture/{transaction_id}
  request_content_type: application/x-www-form-urlencoded
  response_content_types:
    - { type: "application/json" }
quirks:
  - "muskpay_host_not_nihaopay"
  - "capture_amount_cannot_exceed_auth_amount"
  - "auto_release_after_30_days_means_new_auth_needed"
status: stable
last_reviewed: "2026-05-26"
error_codes:
  - "402-68"
  - "402-69"
  - "402-70"
---

## Definition

```
POST https://api.muskpay.io/v1.2/transactions/capture/{transaction_id}
```

Capture funds against a previously-authorized credit-card transaction. The capture amount cannot exceed the original authorization amount ([`402-70`](../../06-error-handling/error-list.md) otherwise). Must be done within 30 days — afterward the authorization auto-releases.

## Sample request

```bash
curl https://api.muskpay.io/v1.2/transactions/capture/{transaction_id} \
  -H "Authorization: Bearer <TOKEN>" \
  -d amount=100 \
  -d currency="USD"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `transaction_id` | Required (URL) | The transaction ID from a previous [Authorize](./authorize.md) call. |
| `amount` | Required | Capture amount in cents. ≤ the authorization's amount. For $10.50, `amount=1050`. |
| `currency` | Required | `USD`. Must match the authorization's currency. |

## Response

```json
{
  "id": "bn2345nb53454kjb",
  "status": "success",
  "captured": true,
  "transaction_id": "bn2345nb53454kjb"
}
```

| Property | Description |
|---|---|
| `id` | Transaction ID. |
| `status` | `success`, `failure`, or `pending`. |
| `captured` | `true` on success. |
| `transaction_id` | Echo. |

## Common errors

| Code | Meaning |
|---|---|
| [`402-68`](../../06-error-handling/error-list.md) | Transaction has previously been released — can't capture. |
| [`402-69`](../../06-error-handling/error-list.md) | Transaction has previously been captured — can't capture again. (Use refund if you need to undo.) |
| [`402-70`](../../06-error-handling/error-list.md) | Capture amount exceeds authorization amount. |
