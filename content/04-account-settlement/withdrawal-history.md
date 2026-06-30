---
id: account-settlement/withdrawal-history
title: "Inquiry Withdrawal History"
type: endpoint
product: account
tags:
  - withdrawal
  - history
  - account
summary: "GET /v1.2/withdrawal/history — list withdrawal records for a date range (YYYYMMDD). Returns id, status, amount, currency, fee, fee_currency, and date for each withdrawal."
related:
  - account-settlement/balance
  - account-settlement/withdrawal-details
endpoint:
  method: GET
  path: /v1.2/withdrawal/history
  response_content_types:
    - { type: "application/json" }
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
GET https://api.nihaopay.com/v1.2/withdrawal/history
```

List withdrawal records for a date range.

## Sample request

```bash
curl 'https://api.nihaopay.com/v1.2/withdrawal/history/?start_date=20170101&end_date=20170131' \
  -H "Authorization: Bearer <TOKEN>"
```

## Request parameters (URL query)

| Property | Required | Description |
|---|---|---|
| `start_date` | Required | `YYYYMMDD`. Inclusive. |
| `end_date` | Required | `YYYYMMDD`. Inclusive. |

## Response

```json
{
  "withdrawal": [
    {
      "id": "bn2345nb53454kjb",
      "status": "completed",
      "amount": "100.00",
      "currency": "USD",
      "fee": "0.30",
      "fee_currency": "USD",
      "date": "20170101"
    }
  ]
}
```

Empty array if no withdrawals match.

| Property | Description |
|---|---|
| `withdrawal[]` | Array of withdrawal records. |
| `withdrawal[].id` | Nihaopay withdrawal ID. |
| `withdrawal[].status` | `processing` or `completed`. |
| `withdrawal[].amount` | Withdrawal amount (stringified decimal). |
| `withdrawal[].currency` | Withdrawal currency. |
| `withdrawal[].fee` | Withdrawal fee. |
| `withdrawal[].fee_currency` | Currency the fee is charged in (may differ from withdrawal currency). |
| `withdrawal[].date` | `YYYYMMDD`. |

> Like [Balance](./balance.md), amounts are **stringified decimals** (not integer minor units).

## Withdrawal status

- `processing` — the withdrawal is in transit.
- `completed` — funds have landed in the destination account.

For full per-withdrawal detail (transactions covered, fee breakdown), see [Withdrawal details](./withdrawal-details.md).
