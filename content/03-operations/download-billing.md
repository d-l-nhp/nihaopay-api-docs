---
id: operations/download-billing
title: "Download Billing File (CSV)"
type: endpoint
product: operations
tags:
  - download
  - billing
  - csv
  - reconciliation
summary: "GET /v1.2/billing — CSV billing file download for a date range. Excludes closed / failed / cancelled transactions (use download-transactions for the full set). Max 10-day window per request."
related:
  - operations/download-transactions
endpoint:
  method: GET
  path: /v1.2/billing
  response_content_types:
    - { type: "text/csv" }
quirks:
  - "max_10_day_window"
  - "excludes_closed_failed_cancelled"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
GET https://api.nihaopay.com/v1.2/billing
```

Download a billing CSV for a date range. **Excludes** closed, failed, and cancelled transactions — the file represents the merchant's reconcilable receivables. For a full transaction list (including failures), use [Download transactions](./download-transactions.md).

**Maximum 10-day window** per request.

## Sample request

```bash
curl 'https://api.nihaopay.com/v1.2/billing/?start_date=20171016&end_date=20171025' \
  -H "Authorization: Bearer <TOKEN>"
```

## Request parameters (URL query)

| Property | Required | Description |
|---|---|---|
| `start_date` | Required | `YYYYMMDD`. Inclusive. |
| `end_date` | Required | `YYYYMMDD`. Inclusive. Within 10 days of `start_date`. |

## Response

`Content-Type: text/csv`. The column shape isn't documented in the v1.2 spec; typically includes per-transaction settlement, fees, and net-to-merchant.
