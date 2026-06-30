---
id: operations/lookup-transaction
title: "Look Up a Transaction (by transaction_id)"
type: endpoint
product: operations
tags:
  - lookup
  - transaction
  - retrieve
summary: "GET /v1.2/transactions/{transaction_id} — fetch a transaction's details by Nihaopay's transaction_id. SecurePay scope only. For released / cancelled / refunded transaction details, use TMS instead — this endpoint doesn't surface those."
related:
  - operations/retrieve-securepay
  - operations/list-transactions
endpoint:
  method: GET
  path: /v1.2/transactions/{transaction_id}
  response_content_types:
    - { type: "application/json" }
quirks:
  - "released_cancelled_refunded_only_in_tms_not_api"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
GET https://api.nihaopay.com/v1.2/transactions/{transaction_id}
```

Look up a transaction by **Nihaopay's** `transaction_id` (the `id` returned from the creation call). SecurePay only.

> **Scope limit:** Released, Cancelled, and Refunded transactions are **not surfaced through this API endpoint**. For those, use the TMS web UI instead — see the [TMS link in the Introduction](../00-introduction/introduction.md).

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/transactions/{transaction_id} \
  -H "Authorization: Bearer <TOKEN>"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `transaction_id` | Required (URL) | Nihaopay transaction ID. |

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
| `vendor` | Payment method. |
| `vendor_id` | Vendor's transaction ID. |
| `amount` | Amount in minor units. |
| `currency` | 3-letter currency code. |
| `time` | UTC timestamp. |
| `reference` | Your reference from the original request. |
| `note` | Echo, or `null`. |
