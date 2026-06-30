---
id: account-settlement/balance
title: "Inquiry Account Balance"
type: endpoint
product: account
tags:
  - balance
  - account
  - settlement
summary: "GET /v1.2/accounts — fetch the merchant's account balance, broken out per currency. Returns balance, pending_amount (unsettled purchases), and freeze_amount (unsettled refunds). One row per currency."
related:
  - account-settlement/withdrawal-history
endpoint:
  method: GET
  path: /v1.2/accounts
  response_content_types:
    - { type: "application/json" }
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
GET https://api.nihaopay.com/v1.2/accounts
```

Returns the merchant's account balance(s). One row per currency the merchant transacts in.

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/accounts \
  -H "Authorization: Bearer <TOKEN>"
```

## Response

```json
{
  "accounts": [
    {
      "balance": "100.00",
      "currency": "USD",
      "pending_amount": "12.40",
      "freeze_amount": "0.00"
    }
  ]
}
```

| Property | Description |
|---|---|
| `accounts[]` | Array of account-balance records. |
| `accounts[].currency` | Account currency. |
| `accounts[].balance` | Current settled balance. Stringified decimal (preserves precision). |
| `accounts[].pending_amount` | Currently unsettled purchase amount — funds in flight that will land in `balance` later. |
| `accounts[].freeze_amount` | Currently unsettled refund amount — funds reserved against pending refunds. |

> All amount fields are **stringified decimals** (`"100.00"`), not integer-minor-units. This differs from transaction endpoints which use integer minor units. Be careful when parsing.
