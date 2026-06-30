---
id: operations/refund-query
title: "Refund Query"
type: endpoint
product: operations
tags:
  - refund
  - query
  - history
summary: "GET /v1.2/transactions/refunds/{transaction_id}/ — list all refunds against a transaction with statuses and timestamps. Note the trailing slash in the path — omitting it returns 404."
related:
  - operations/refund
endpoint:
  method: GET
  path: /v1.2/transactions/refunds/{transaction_id}/
  response_content_types:
    - { type: "application/json" }
quirks:
  - "trailing_slash_required_in_path"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
GET https://api.nihaopay.com/v1.2/transactions/refunds/{transaction_id}/
```

> **Trailing slash matters.** The path ends with `/` after `{transaction_id}`. Omitting it returns a 404, not a redirect. This is a known wart in the v1.2 path layout.

Lists every refund (full and partial) against the specified transaction, with statuses, timestamps, and amounts.

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/transactions/refunds/{transaction_id}/ \
  -H "Authorization: Bearer <TOKEN>"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `transaction_id` | Required (URL) | Original transaction ID. |

## Response

```json
{
  "note": null,
  "amount": 2,
  "type": "charge",
  "refunded_amount": 2,
  "refunds": [
    {
      "refund_time": "2021-11-29T05:42:33Z",
      "refund_id": "20211129054233000405",
      "refunded_amount": 1,
      "status": "success"
    },
    {
      "refund_time": "2021-11-29T05:41:55Z",
      "refund_id": "20211129054155000404",
      "refunded_amount": 1,
      "status": "success"
    }
  ],
  "reference": "20211129134105329320",
  "vendor": "unionpay",
  "vendor_id": "5121112913411783302S0",
  "currency": "USD",
  "id": "20211129054117043676",
  "time": "2021-11-29T05:41:17Z",
  "status": "success"
}
```

| Property | Description |
|---|---|
| `id` | Original transaction ID. |
| `status` | Original transaction status. |
| `type` | `charge`, `authorization`, or `capture`. |
| `amount` | Original transaction amount (minor unit). |
| `refunded_amount` | Total amount refunded across all refunds. |
| `currency` | 3-letter currency code. |
| `time` | Original transaction UTC timestamp. |
| `reference` | Merchant order number. |
| `note` | Original note, or `null`. |
| `vendor` | Payment method. |
| `vendor_id` | Vendor's transaction ID. |
| `refunds[]` | Array of refund records, most-recent-first. |
| `refunds[].refund_time` | UTC time the refund was issued. |
| `refunds[].refund_id` | Refund ID. |
| `refunds[].refunded_amount` | This refund's amount (minor unit). |
| `refunds[].status` | `success` or `failure`. |
