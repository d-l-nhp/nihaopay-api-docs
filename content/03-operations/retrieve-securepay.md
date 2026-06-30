---
id: operations/retrieve-securepay
title: "Retrieve a SecurePay Transaction (by reference)"
type: endpoint
product: operations
tags:
  - retrieve
  - securepay
  - reference
  - lookup
summary: "GET /v1.2/transactions/merchant/{reference} — fetch a SecurePay transaction's details by your merchant reference. Useful when you didn't receive an IPN and need to look up state by the field you control. SecurePay only — for other products, use lookup-transaction with the Nihaopay transaction_id."
related:
  - operations/lookup-transaction
  - reference/ipn-mechanics
endpoint:
  method: GET
  path: /v1.2/transactions/merchant/{reference}
  response_content_types:
    - { type: "application/json" }
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
GET https://api.nihaopay.com/v1.2/transactions/merchant/{reference}
```

Look up a SecurePay transaction by **your** merchant `reference` (the alphanumeric string you supplied on creation). Useful when the IPN never arrived and you need to reconcile by the field you control.

**SecurePay only.** For other transaction types, you need the Nihaopay `transaction_id` — use [Look up a transaction](./lookup-transaction.md) instead.

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/transactions/merchant/{reference} \
  -H "Authorization: Bearer <TOKEN>"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `reference` | Required (URL) | Your merchant reference from the original SecurePay request. |

## Response

```json
{
  "id": "bn2345nb53454kjb",
  "status": "success",
  "type": "charge",
  "amount": 1111,
  "currency": "USD",
  "time": "2015-01-01T01:01:01Z",
  "reference": "jkh25jh1340fd09sg",
  "note": "sample note"
}
```

| Property | Description |
|---|---|
| `id` | Nihaopay transaction ID. |
| `status` | `success`, `failure`, or `pending`. |
| `type` | `charge`, `authorization`, or `capture`. |
| `vendor` | Payment method: `unionpay`, `alipay`, `wechatpay`, or `alipayhk`. |
| `vendor_id` | Vendor's transaction ID. |
| `amount` | Amount in the currency's minor unit. |
| `currency` | 3-letter currency code. |
| `time` | UTC timestamp. |
| `reference` | Echo. |
| `note` | Echo from creation, or `null`. |
