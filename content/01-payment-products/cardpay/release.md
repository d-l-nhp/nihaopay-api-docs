---
id: payment-products/cardpay/release
title: "CardPay: Release a Previously Authorized Transaction"
type: endpoint
product: cardpay
tags:
  - cardpay
  - release
  - authorization
  - muskpay
summary: "POST https://api.muskpay.io/v1.2/transactions/release/{transaction_id} — release (cancel) a previously-authorized credit-card transaction. Frees the reserved funds back to the cardholder. Authorizations not captured within 30 days auto-release."
related:
  - payment-products/cardpay/_overview
  - payment-products/cardpay/authorize
  - payment-products/cardpay/capture
endpoint:
  method: POST
  path: /v1.2/transactions/release/{transaction_id}
  response_content_types:
    - { type: "application/json" }
quirks:
  - "muskpay_host_not_nihaopay"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.muskpay.io/v1.2/transactions/release/{transaction_id}
```

Release (cancel) a previously-authorized transaction, freeing the reserved funds back to the cardholder.

## Sample request

```bash
curl https://api.muskpay.io/v1.2/transactions/release/{transaction_id} \
  -H "Authorization: Bearer <TOKEN>"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `transaction_id` | Required (URL) | The transaction ID from a previous [Authorize](./authorize.md) call. |

No request body.

## Response

```json
{
  "id": "bn2345nb53454kjb",
  "status": "success",
  "released": true,
  "transaction_id": "bn2345nb53454kjb"
}
```

| Property | Description |
|---|---|
| `id` | Transaction ID. |
| `status` | `success`, `failure`, or `pending`. |
| `released` | `true` on a successful release. |
| `transaction_id` | Echo of the released transaction ID. |

## Failure cases

| Cause | Behavior |
|---|---|
| Authorization was already captured | Returns failure — captured transactions can't be released, only refunded. |
| Authorization was already released | Returns failure (idempotent re-release isn't allowed). |
| Authorization auto-released (30-day timeout) | Returns failure — same as "already released". |
