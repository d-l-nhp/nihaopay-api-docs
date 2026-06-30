---
id: customs-declaration/redeclaration
title: "Customs Declaration: Redeclare"
type: endpoint
product: customs
tags:
  - customs
  - declaration
  - resubmit
  - redeclaration
summary: "POST /v1.2/customs/redeclaration/{request_no} — resubmit a previously-failed customs declaration without modifying its parameters. Use when the original declaration returned status=failure and the underlying cause (timing, customs-office hiccup) has resolved."
related:
  - customs-declaration/declaration
  - customs-declaration/declaration-query
endpoint:
  method: POST
  path: /v1.2/customs/redeclaration/{request_no}
  response_content_types:
    - { type: "application/json" }
  amount_unit: rmb_fen
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/customs/redeclaration/{request_no}
```

Retry a previously-failed customs declaration. The original request parameters are reused — you do **not** resend the original body. To change parameters, see [Declaration](./declaration.md) and submit a new `request_no`.

## When to use this

- The original [declaration](./declaration.md) returned `status=failure`.
- The cause was transient (customs office downtime, retransmission failure — error `402-100`) and is now resolved.
- You haven't changed any of the underlying transaction's properties.

If the *parameters* were wrong (split-amount mismatch, wrong cert, wrong customs office), do **not** redeclare. Fix the data first and submit a fresh declaration with a new `request_no`.

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/customs/redeclaration/20210101150033001421 \
  -H "Authorization: Bearer <TOKEN>"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `request_no` | Required (URL) | Request order number from the failed declaration. |

There is no request body.

## Response

```json
{
  "transaction_id": "20210101150833001421",
  "cert_check": "DIFFERENT",
  "ver_dept": 3,
  "request_no": "20210101150033001421",
  "pay_code": "31222699S7",
  "pay_transaction_id": "20210801108264002005570",
  "merchant_id": "M001100001",
  "id": "202108101503500015",
  "status": "success"
}
```

| Property | Description |
|---|---|
| `request_no` | Echo. |
| `id` | Declaration status request ID. |
| `merchant_id` | NihaoPay merchant ID. |
| `transaction_id` | Original transaction ID. |
| `status` | `success`, `failure`, or `pending`. |
| `pay_transaction_id` | Unique number assigned by the payment provider. |
| `ver_dept` | Verifying organization: `0`=UnionPay, `1`=NetsUnion, `2`=Other. |
| `pay_code` | Customs registration number of the payment provider. |
| `cert_check` | `SAME`, `DIFFERENT`, or `UNCHECKED`. |
