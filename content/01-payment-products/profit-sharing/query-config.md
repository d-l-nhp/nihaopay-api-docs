---
id: payment-products/profit-sharing/query-config
title: "Profit Sharing: Query Configurations"
type: endpoint
product: profit-sharing
tags:
  - profit-sharing
  - query
  - config
summary: "POST /v1.2/sharing/query — list profit-sharing configurations. Empty body returns all configurations on the account; pass relationTxnId to filter to a specific payment order."
related:
  - payment-products/profit-sharing/_overview
  - payment-products/profit-sharing/apply
  - payment-products/profit-sharing/query-result
endpoint:
  method: POST
  path: /v1.2/sharing/query
  request_content_type: application/json
  response_content_types:
    - { type: "application/json" }
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/sharing/query
```

List profit-sharing configurations. Two modes:

- **All configurations:** send empty body `{}` — returns every profit-sharing configuration on your account (including any global rules).
- **Per-order configurations:** send `{"relationTxnId": "..."}` — returns just the sharing rules for the specific payment order.

## Sample — query all configurations

```bash
curl --location 'https://apitest.nihaopay.com/v1.2/sharing/query' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --data '{}'
```

## Sample — query configurations for a specific payment order

```bash
curl --location 'https://apitest.nihaopay.com/v1.2/sharing/query' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --data '{
    "relationTxnId": "20230804021118097285"
  }'
```

## Request parameters

| Parameter | Required | Description |
|---|---|---|
| `relationTxnId` | Optional | Payment order ID to filter to. Omit for all-configurations mode. |

## Response — success

```json
{
  "relationTxnId": "20230804021118097285",
  "sharingConfItems": [
    {
      "confId": "20230804021822097288",
      "reference": "9200",
      "originConfId": "",
      "relationTxnId": "20230804021118097285",
      "sourceMerCode": "M001000001",
      "targetMerCode": "M001000002",
      "sharingType": 0,
      "splitMethod": 0,
      "splitValue": 22,
      "currency": "USD",
      "txnStatus": "SUCCESS",
      "failReason": "",
      "feeFrom": 0,
      "baseFrom": 0,
      "remark": "test",
      "notifyUrl": "https://www.nihaopay.com/sharing/notify"
    }
  ]
}
```

| Property | Description |
|---|---|
| `relationTxnId` | Payment order ID. |
| `sharingConfItems` | Array of profit-sharing configuration records. |
| `sharingConfItems[].confId` | Configuration ID — primary key for further operations on this config. |
| `sharingConfItems[].reference` | Echo of the `reference` from the apply request. |
| `sharingConfItems[].originConfId` | Original configuration ID (empty for non-reversals). |
| `sharingConfItems[].sourceMerCode` | Funding source merchant. |
| `sharingConfItems[].targetMerCode` | Recipient merchant. |
| `sharingConfItems[].sharingType` | `0` = sharing, `2` = reversal. |
| `sharingConfItems[].splitMethod` | `0` = percentage, `1` = fixed amount. |
| `sharingConfItems[].splitValue` | Value (interpretation depends on `splitMethod` — see [Apply](./apply.md)). |
| `sharingConfItems[].txnStatus` | `PENDING`, `SUCCESS`, or `FAILED`. |
| `sharingConfItems[].failReason` | Error message when `FAILED`. |
| `sharingConfItems[].feeFrom` | `0` = fee from transaction, `1` = fee from source account. |
| `sharingConfItems[].baseFrom` | Reversal base. See [Apply](./apply.md). |
| `sharingConfItems[].remark` | Echo. |
| `sharingConfItems[].notifyUrl` | Echo. |

## Response — no configurations found

```json
{
  "relationTxnId": "",
  "sharingConfItems": []
}
```

(Empty `relationTxnId` and empty list — even when querying by a non-existent ID.)
