---
id: customs-declaration/declaration-query
title: "Customs Declaration: Query Status"
type: endpoint
product: customs
tags:
  - customs
  - declaration
  - query
  - status
summary: "GET /v1.2/customs/{request_no} — query the status of a previously-submitted customs declaration. Returns the full declaration record including amounts, cert-check result, and the customs office's verification status."
related:
  - customs-declaration/declaration
  - customs-declaration/redeclaration
endpoint:
  method: GET
  path: /v1.2/customs/{request_no}
  response_content_types:
    - { type: "application/json" }
  amount_unit: rmb_fen
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
GET https://api.nihaopay.com/v1.2/customs/{request_no}
```

Look up the status of a customs declaration by `request_no` (the unique order number you supplied when submitting the declaration).

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/customs/20180529073648029702 \
  -H "Authorization: Bearer <TOKEN>"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `request_no` | Required (URL) | Request order number from the original declaration. |

## Response

```json
{
  "id": "20180529084416000000",
  "request_no": "20180529073648029702",
  "status": "pending",
  "vendor_id": "4200000112201805292728213273",
  "customs": "NINGBO",
  "split": true,
  "customs_amount": 1284,
  "product_amount": 1284,
  "transport_amount": 0,
  "transaction_id": "20180529073648029764",
  "sub_order_id": "20180529073648029701",
  "pay_transaction_id": "201801112200137640450035544",
  "ver_dept": 2,
  "pay_code": "312226T001"
}
```

| Property | Description |
|---|---|
| `id` | Declaration status request ID. |
| `transaction_id` | Original transaction ID. |
| `vendor_id` | Vendor's serial number for the original transaction. |
| `status` | `success`, `failure`, or `pending`. |
| `customs` | Customs office key (e.g. `NINGBO`). |
| `customs_amount` | RMB fen. Echo from request. |
| `duty_amount` | RMB fen. Echo from request. |
| `split` | Splitting flag. Echo. |
| `sub_order_id` | Merchant sub-order number. Echo. |
| `product_amount` | RMB fen. Echo. |
| `transport_amount` | RMB fen. Echo. |
| `pay_transaction_id` | Unique number assigned by the payment provider. |
| `ver_dept` | Verifying organization: `0`=UnionPay, `1`=NetsUnion, `2`=Other. |
| `pay_code` | Customs registration number of the payment provider. |

## Status semantics

- **`pending`** — Nihaopay accepted the declaration; customs has not yet processed it. Poll periodically; expect resolution within minutes to hours depending on the customs office.
- **`success`** — Customs accepted the declaration. No further action needed.
- **`failure`** — Customs rejected. Use [Redeclaration](./redeclaration.md) to retry, fixing the rejection reason first.

All amounts in this response are in **RMB fen** (cents) — same unit as the original declaration.
