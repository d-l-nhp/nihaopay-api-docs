---
id: operations/exchange-rate
title: "Query Exchange Rate"
type: endpoint
product: operations
tags:
  - exchange-rate
  - currency
  - rmb
summary: "GET /v1.2/exchangerate — query Nihaopay's daily foreign-currency-to-RMB exchange rate per (currency, vendor). Updates 10:30 China Standard Time (UTC+8) daily. Rate-limited to 1 request per minute — call at most once a day."
related:
  - reference/parameters-description
  - error-handling/error-list
endpoint:
  method: GET
  path: /v1.2/exchangerate
  response_content_types:
    - { type: "application/json" }
quirks:
  - "rate_limit_1_per_minute"
  - "rate_updates_10_30_china_time_daily"
status: stable
last_reviewed: "2026-05-26"
error_codes:
  - "404-93"
---

## Definition

```
GET https://api.nihaopay.com/v1.2/exchangerate
```

Query Nihaopay's foreign-currency-to-RMB exchange rate for a specific date. Rates update at **10:30 China Standard Time (UTC+8)** once daily. Rate-limited to **1 request per minute** — query at most once a day in production.

## Sample request

```bash
curl 'https://api.nihaopay.com/v1.2/exchangerate/?rate_date=20170308&currency=USD' \
  -H "Authorization: Bearer <TOKEN>"
```

## Request parameters (URL query)

| Property | Required | Description |
|---|---|---|
| `rate_date` | Required | `YYYYMMDD`. The date you want rates for. |
| `currency` | Required | One of: `USD`, `JPY`, `HKD`, `GBP`, `EUR`. |
| `vendor` | Optional | One of: `alipay`, `wechatpay`, `unionpay`. Omit to return all vendors' rates. |

## Response

```json
{
  "rates": [
    {
      "rate_date": "20170308",
      "currency": "usd",
      "vendor": "unionpay",
      "rate": "6.948700"
    },
    {
      "rate_date": "20170308",
      "currency": "usd",
      "vendor": "alipay",
      "rate": "6.921791"
    },
    {
      "rate_date": "20170308",
      "currency": "usd",
      "vendor": "wechatpay",
      "rate": "6.923911"
    }
  ]
}
```

| Property | Description |
|---|---|
| `rates[]` | Array of rate records. |
| `rates[].rate_date` | Echo. |
| `rates[].currency` | Foreign currency code (**lowercase** in response — spec quirk). |
| `rates[].vendor` | `alipay`, `wechatpay`, or `unionpay`. |
| `rates[].rate` | Foreign-currency → RMB rate as a string (preserves precision). |

> **Casing inconsistency:** request uses uppercase (`USD`), response uses lowercase (`usd`). Normalize on the read side.

## Common error

- [`404-93`](../06-error-handling/error-list.md) *The Exchange rate not found* — date too old, weekend/holiday gap, or rate not yet posted for today (poll after 10:30 CST).
