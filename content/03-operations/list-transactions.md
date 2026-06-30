---
id: operations/list-transactions
title: "List Transactions"
type: endpoint
product: operations
tags:
  - list
  - pagination
  - reconciliation
summary: "GET /v1.2/transactions/ — paginated list of recent transactions, most-recent first. Filter by starting_after / ending_before (UTC timestamps). Limit 1–100. SecurePay only; released/cancelled/refunded transactions surface only in TMS."
related:
  - operations/lookup-transaction
  - operations/download-transactions
endpoint:
  method: GET
  path: /v1.2/transactions/
  response_content_types:
    - { type: "application/json" }
quirks:
  - "trailing_slash_required_in_path"
  - "released_cancelled_refunded_only_in_tms"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
GET https://api.nihaopay.com/v1.2/transactions/
```

Returns a list of previously-created transactions, most-recent first. SecurePay only. For Released, Cancelled, and Refunded transaction details, use the TMS web UI.

## Sample request

```bash
curl 'https://api.nihaopay.com/v1.2/transactions/?starting_after=2015-01-01T01:01:01Z' \
  -H "Authorization: Bearer <TOKEN>"
```

## Request parameters (URL query)

| Property | Required | Description |
|---|---|---|
| `limit` | Optional | Number of transactions per request. `1`–`100`. Default `10`. |
| `starting_after` | Optional | UTC `YYYY-MM-DDThh:mm:ssZ`. Returns transactions processed *after* this time. |
| `ending_before` | Optional | UTC `YYYY-MM-DDThh:mm:ssZ`. Returns transactions processed *before* this time. |

Combine both to get a window: `?starting_after=...&ending_before=...`.

## Response

```json
{
  "transactions": [
    {
      "id": "bn2345nb53454kjb",
      "status": "success",
      "type": "charge",
      "amount": 1111,
      "currency": "USD",
      "time": "2015-01-01T01:05:0Z",
      "reference": "jkh25jh1340fd09sg",
      "note": "sample note"
    },
    {
      "id": "16zfmK2eZvKYlo2C6X3",
      "status": "success",
      "type": "authorization",
      "amount": 1111,
      "currency": "USD",
      "time": "2015-01-01T01:01:01Z",
      "reference": "6LJDMbC6Ybqlt7fd",
      "note": "sample note"
    }
  ]
}
```

Empty array if no transactions match.

| Property | Description |
|---|---|
| `transactions[]` | Array of transaction objects, most-recent first. |
| `transactions[].id` | Nihaopay transaction ID. |
| `transactions[].status` | `success`, `failure`, or `pending`. |
| `transactions[].type` | `charge`, `authorization`, or `capture`. |
| `transactions[].amount` | Amount in minor units. |
| `transactions[].currency` | 3-letter currency code. |
| `transactions[].time` | UTC timestamp. |
| `transactions[].reference` | Your merchant reference. |
| `transactions[].note` | Echo, or `null`. |

## Pagination strategy

There's no cursor field — pagination is timestamp-based. To page forward, take the smallest `time` from the current response and use it as the next call's `ending_before`. To page backward, take the largest `time` and use it as `starting_after`. Mind the boundaries: `starting_after` and `ending_before` are exclusive.
