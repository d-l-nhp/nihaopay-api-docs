---
id: payment-products/profit-sharing/query-result
title: "Profit Sharing: Query Execution Result"
type: endpoint
product: profit-sharing
tags:
  - profit-sharing
  - query
  - result
  - execution
summary: "POST /v1.2/sharing/detail — query the execution result of a specific profit-sharing configuration. Returns the actual settlement amounts, service fees, clearing batch info, and execution timestamp. Use to verify outcome after the daily 15:00 UTC batch runs."
related:
  - payment-products/profit-sharing/_overview
  - payment-products/profit-sharing/apply
  - payment-products/profit-sharing/query-config
endpoint:
  method: POST
  path: /v1.2/sharing/detail
  request_content_type: application/json
  response_content_types:
    - { type: "application/json" }
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/sharing/detail
```

Returns the execution result of a specific profit-sharing configuration — the settled sharing amount, service fee, clearing batch ID, and final status. Use this **after** the 15:00 UTC batch has run to verify the outcome.

## Sample request

```bash
curl --location 'https://apitest.nihaopay.com/v1.2/sharing/detail' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --data '{
    "relationTxnId": "20230804021118097285",
    "confId": "20230804021822097288"
  }'
```

## Request parameters

| Parameter | Required | Description |
|---|---|---|
| `relationTxnId` | Yes | Payment order ID. |
| `confId` | Yes | Configuration ID from [Apply](./apply.md). |

## Response — success

```json
{
  "id": 37,
  "initMerCode": "M001000003",
  "sourceMerCode": "M001000001",
  "targetMerCode": "M001000002",
  "clearBatchId": "20230804022150056802",
  "clearBatchDate": 1691107200000,
  "sharingType": 0,
  "splitMethod": 0,
  "splitValue": 22,
  "sharingAmount": 0.29,
  "serviceFee": 0.01,
  "sharingCurrency": "USD",
  "relationTxnId": "20230804021118097285",
  "relationTxnNetSettlementAmount": 130.75,
  "sharingConfId": "20230804021822097288",
  "originSharingConfId": "",
  "reference": "9200",
  "isGlobalSharing": 0,
  "feeFrom": 0,
  "baseFrom": 0,
  "sharingStatus": 1,
  "notifyUrl": "https://nihaopay.com/sharing/notify",
  "notifyStatus": 1,
  "failReason": "",
  "createAt": 1691115721800
}
```

| Property | Description |
|---|---|
| `id` | Internal record ID. |
| `initMerCode` | Initiating merchant (the merchant who called `apply`). |
| `sourceMerCode` | Source merchant. |
| `targetMerCode` | Target (recipient) merchant. |
| `clearBatchId` | Clearing batch this share was processed in. |
| `clearBatchDate` | Batch date (Unix millis). |
| `sharingType` | `0` = sharing, `2` = reversal. |
| `splitMethod` | `0` = percentage, `1` = fixed. |
| `splitValue` | Echo from apply. |
| `sharingAmount` | Actual amount transferred (e.g. `0.29` for 0.29 USD). |
| `serviceFee` | Sharing-fee amount. |
| `sharingCurrency` | Currency. |
| `relationTxnId` | Payment order ID. |
| `relationTxnNetSettlementAmount` | The payment order's net settlement amount this share is drawn from. |
| `sharingConfId` | This configuration's ID. |
| `originSharingConfId` | Original config ID (for reversals; empty otherwise). |
| `reference` | Echo. |
| `isGlobalSharing` | `1` = global, `0` = per-order. |
| `feeFrom` | `0` = fee from transaction, `1` = from source account. |
| `baseFrom` | Reversal base. |
| `sharingStatus` | `0` = pending, `1` = success, `2` = failed. |
| `notifyUrl` | Echo. |
| `notifyStatus` | Notification delivery status. `1` = notified successfully. |
| `failReason` | Empty on success. |
| `createAt` | Creation timestamp (Unix millis). |

## Response — failure (config not found)

```json
{
  "code": 400,
  "label": "N/A",
  "message": "sharing history not exist"
}
```
