---
id: operations/refund
title: "Refund a Transaction"
type: endpoint
product: operations
tags:
  - refund
  - partial-refund
  - full-refund
summary: "POST /v1.2/transactions/refund/{transaction_id} — issue a full or partial refund. Full refunds: one per transaction. Partial refunds: multiple, until cumulative refunded amount reaches the original. Refund currency must match the original transaction's currency (409-64 otherwise)."
related:
  - operations/refund-query
  - operations/lookup-transaction
  - error-handling/error-list
endpoint:
  method: POST
  path: /v1.2/transactions/refund/{transaction_id}
  request_content_type: application/x-www-form-urlencoded
  response_content_types:
    - { type: "application/json" }
status: stable
last_reviewed: "2026-05-26"
error_codes:
  - "409-64"
  - "409-66"
  - "402-67"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/transactions/refund/{transaction_id}
```

Create a refund against an existing transaction. Two modes:

- **Full refund** — specify `amount` equal to the original transaction's full amount. Allowed **once** per transaction.
- **Partial refund** — specify `amount` less than the full amount. Allowed **multiple times** until cumulative `refunded_amount` reaches the original total.

Refunding more than the original amount returns [`402-67`](../06-error-handling/error-list.md): *Refund amount exceeds original transaction amount or remaining transaction balance.*

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/transactions/refund/{transaction_id} \
  -H "Authorization: Bearer <TOKEN>" \
  -d amount=100 \
  -d currency="USD"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `transaction_id` | Required (URL) | Nihaopay ID of the original transaction. |
| `currency` | Required | 3-letter code. **Must match** the original transaction's currency, or [`409-64`](../06-error-handling/error-list.md) fires. |
| `amount` | Conditional | Refund amount in the currency's minor unit. Must be ≤ the original (and ≤ the remaining refundable balance for partials). |
| `rmb_amount` | Conditional | If the original transaction was priced in RMB. Mutually exclusive with `amount`. |
| `reason` | Optional | Arbitrary string describing why. |

## Response

```json
{
  "id": "bn2345nb53454kjb",
  "status": "success",
  "refunded": true,
  "transaction_id": "jkh25jh1340fd09sg"
}
```

| Property | Description |
|---|---|
| `id` | Refund ID. |
| `status` | `success` or `failure`. |
| `refunded` | Always `true` on success. |
| `transaction_id` | The original transaction that was refunded. |

## Common errors

| Code | Meaning |
|---|---|
| [`409-64`](../06-error-handling/error-list.md) | Refund currency doesn't match original transaction currency. |
| [`409-66`](../06-error-handling/error-list.md) | Transaction has already been fully refunded. |
| [`402-67`](../06-error-handling/error-list.md) | Refund amount exceeds original or remaining balance. |

## Follow-up

To inspect the full refund history for a transaction (multiple partials, statuses, timestamps), use [Refund query](./refund-query.md).
