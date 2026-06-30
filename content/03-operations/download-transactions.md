---
id: operations/download-transactions
title: "Download Transactions (CSV)"
type: endpoint
product: operations
tags:
  - download
  - csv
  - reconciliation
summary: "GET /v1.2/download/transactions — CSV download of transactions in a date range, for reconciliation. Max 10-day window per request. Returns text/csv, not JSON."
related:
  - operations/download-billing
  - operations/list-transactions
endpoint:
  method: GET
  path: /v1.2/download/transactions
  response_content_types:
    - { type: "text/csv" }
quirks:
  - "max_10_day_window"
  - "returns_csv_not_json"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
GET https://api.nihaopay.com/v1.2/download/transactions
```

Download a CSV of transactions for a date range. Used for reconciliation. **Maximum 10-day window** per request — for longer ranges, chunk into multiple calls.

## Sample request

```bash
curl 'https://api.nihaopay.com/v1.2/download/transactions/?start_date=20170101&end_date=20170110' \
  -H "Authorization: Bearer <TOKEN>"
```

## Request parameters (URL query)

| Property | Required | Description |
|---|---|---|
| `start_date` | Required | `YYYYMMDD`. Inclusive. |
| `end_date` | Required | `YYYYMMDD`. Inclusive. Must be within 10 days of `start_date`. |

## Response

`Content-Type: text/csv` — a CSV file. Save to disk; the column shape isn't documented in v1.2 spec but mirrors the list-transactions response.

For a programmatic JSON view of recent transactions, use [List transactions](./list-transactions.md) instead.
