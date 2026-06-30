---
id: payment-products/profit-sharing/cancel
title: "Profit Sharing: Cancel"
type: endpoint
product: profit-sharing
tags:
  - profit-sharing
  - cancel
  - pending
summary: "POST /v1.2/sharing/cancel — cancel a Pending profit-sharing configuration before the daily 15:00 UTC batch runs. SUCCESS configurations cannot be cancelled — use Apply with sharingType=2 (reversal) instead."
related:
  - payment-products/profit-sharing/_overview
  - payment-products/profit-sharing/apply
endpoint:
  method: POST
  path: /v1.2/sharing/cancel
  request_content_type: application/json
  response_content_types:
    - { type: "application/json" }
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/sharing/cancel
```

Cancel a `Pending` profit-sharing configuration. Only works on configurations that haven't yet been executed by the daily 15:00 UTC batch.

> **For `SUCCESS` configurations:** cancellation is not allowed. Use [Apply](./apply.md) with `sharingType=2` (reversal) to undo a successful share.

## Sample request

```bash
curl --location 'https://apitest.nihaopay.com/v1.2/sharing/cancel' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --data '{
    "confId": "20230719002724096890"
  }'
```

## Request parameters

| Parameter | Required | Description |
|---|---|---|
| `confId` | Yes | Configuration ID from [Apply](./apply.md). |

## Response — success

```json
{
  "confId": "20230719002724096890",
  "reason": "",
  "txnStatus": "SUCCESS"
}
```

## Response — failure

```json
{
  "confId": "20230719002724096890",
  "reason": "sharing config not exist",
  "txnStatus": "FAIL"
}
```

| Property | Description |
|---|---|
| `confId` | Echo. |
| `reason` | Empty on success; failure reason otherwise. |
| `txnStatus` | `SUCCESS` (cancellation succeeded) or `FAIL`. |

## Common failure reasons

| `reason` | Cause |
|---|---|
| `sharing config not exist` | The `confId` doesn't resolve. |
| `sharing config already success/failed` | The 15:00 UTC batch already executed this config — cancellation no longer applicable. |
