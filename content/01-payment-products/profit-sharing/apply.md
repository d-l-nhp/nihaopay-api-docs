---
id: payment-products/profit-sharing/apply
title: "Profit Sharing: Apply (5 Scenarios)"
type: endpoint
product: profit-sharing
tags:
  - profit-sharing
  - apply
  - splitting
  - reversal
  - global
summary: "POST /v1.2/sharing/apply — single endpoint covering five scenarios: global percentage sharing, per-order percentage sharing, per-order fixed-amount sharing, partial reversal, and full reversal. Scenarios are distinguished by the combination of sharingType, splitMethod, and presence of relationTxnId / originConfId."
related:
  - payment-products/profit-sharing/_overview
  - payment-products/profit-sharing/query-config
  - payment-products/profit-sharing/cancel
  - payment-products/profit-sharing/sharing-callback
endpoint:
  method: POST
  path: /v1.2/sharing/apply
  request_content_type: application/json
  response_content_types:
    - { type: "application/json" }
quirks:
  - "five_scenarios_one_endpoint"
  - "global_sharing_omits_relationTxnId_dangerous_in_prod"
  - "splitValue_unit_differs_by_method"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/sharing/apply
```

This is **one endpoint covering five scenarios**. The combination of `sharingType`, `splitMethod`, `relationTxnId`, and `originConfId` selects the scenario.

| # | Scenario | `sharingType` | `splitMethod` | `relationTxnId` | `originConfId` |
|---|---|---|---|---|---|
| 1 | Global percentage sharing | `0` | `0` | (omit) | — |
| 2 | Per-order percentage sharing | `0` | `0` | (set) | — |
| 3 | Per-order fixed-amount sharing | `0` | `1` | (set) | — |
| 4 | Partial reversal | `2` | `0` | (set) | (set) |
| 5 | Full reversal | `2` | (omit) | (set) | (set) |

## Parameters

| Parameter | Required | Type | Description |
|---|---|---|---|
| `reference` | Yes | string(240) | Unique identifier for the profit-sharing initiator. Used to deduplicate config entries. |
| `sharingType` | Yes | int | `0` = Profit Sharing; `2` = Reversal of Profit Sharing. |
| `splitMethod` | Conditional | int | `0` = Percentage; `1` = Fixed Amount. Required for `sharingType=0`. |
| `splitValue` | Conditional | int | When `splitMethod=0`: percentage with precision of 10000ths (e.g. `1023` = 10.23%). When `splitMethod=1`: **amount in the currency's base unit** (see [Overview — Fixed-amount sharing](./_overview.md#fixed-amount-sharing)). |
| `targetMerCode` | Conditional | string(11) | Recipient merchant for the sharing. |
| `sourceMerCode` | Optional | string(11) | Funding source merchant. Defaults to the current merchant. |
| `currency` | Conditional | string(3) | Currency code (USD / CNY / …). **Required for global sharing.** |
| `relationTxnId` | Conditional | string(21) | The ID of the payment order being shared. **Omitting this creates a global configuration** — be careful in production. |
| `remark` | Optional | string(128) | Remarks shown in the order description. |
| `feeFrom` | Optional | int | `0` = handling fee deducted from the transaction; `1` = deducted from the source account. Default `0`. |
| `baseFrom` | Optional | int | Used when reversing percentage-based sharing. `0` = base on original transaction settlement; `1` = base on original profit-share settlement; `2` = base on original transaction amount. Default `0`. |
| `originConfId` | Conditional | string(21) | The original profit-sharing configuration ID — required when reversing. |
| `notifyUrl` | Optional | string(240) | Callback URL for the sharing result. Both success and failure are notified. See [Sharing callback](./sharing-callback.md). |

## Sample — Scenario 1: Global percentage sharing

> ⚠️ Omitting `relationTxnId` makes this configuration **apply to every future payment in the given currency**. Verify the request before sending.

```bash
curl --location 'https://api.nihaopay.com/v1.2/sharing/apply' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --data '{
    "sharingType": 0,
    "splitMethod": 0,
    "splitValue": 10,
    "reference": "20211111153109001472",
    "targetMerCode": "M001000001",
    "currency": "USD",
    "remark": "test remark",
    "notifyUrl": "https://www.nihaopay.com/sharing/notify"
  }'
```

## Sample — Scenario 2: Per-order percentage sharing

```bash
curl --location 'https://api.nihaopay.com/v1.2/sharing/apply' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --data '{
    "relationTxnId": "20211111153109001472",
    "sharingType": 0,
    "splitMethod": 0,
    "splitValue": 1000,
    "targetMerCode": "M001000001",
    "reference": "20211111153109001472",
    "remark": "test remark",
    "notifyUrl": "https://www.nihaopay.com/sharing/notify",
    "currency": "USD"
  }'
```

## Sample — Scenario 3: Per-order fixed-amount sharing

```bash
curl --location 'https://api.nihaopay.com/v1.2/sharing/apply' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --data '{
    "relationTxnId": "20211111153109001472",
    "sharingType": 0,
    "splitMethod": 1,
    "splitValue": 100,
    "targetMerCode": "M001000001",
    "reference": "20211111153109001472",
    "remark": "test remark",
    "notifyUrl": "https://www.nihaopay.com/sharing/notify",
    "currency": "USD"
  }'
```

`splitValue=100` here means **1.00 USD** (since USD's base unit is cents).

## Sample — Scenario 4: Partial reversal

```bash
curl --location 'https://api.nihaopay.com/v1.2/sharing/apply' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --data '{
    "relationTxnId": "20211111153109001472",
    "sharingType": 2,
    "splitMethod": 0,
    "splitValue": 10,
    "reference": "20211111153109001472",
    "remark": "test remark",
    "notifyUrl": "https://www.nihaopay.com/sharing/notify",
    "originConfId": "20211111153109001472"
  }'
```

## Sample — Scenario 5: Full reversal

```bash
curl --location 'https://api.nihaopay.com/v1.2/sharing/apply' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --data '{
    "relationTxnId": "20211111153109001472",
    "sharingType": 2,
    "reference": "20211111153109001472",
    "remark": "test remark",
    "notifyUrl": "https://www.nihaopay.com/sharing/notify",
    "originConfId": "20211111153109001472"
  }'
```

(`splitMethod` and `splitValue` are omitted — full reversal returns the full original sharing amount.)

## Response

### Success

```json
{
  "confId": "20230804021118097285"
}
```

The `confId` is the unique identifier for the just-created profit-sharing configuration. Save it — you'll need it for [query-result](./query-result.md), [cancel](./cancel.md), and reversal flows.

### Failure

```json
{
  "code": 400,
  "label": "N/A",
  "message": "sharing conf already exists"
}
```

Common failure messages:

| Message | Cause |
|---|---|
| `sharing conf already exists` | Duplicate `reference` on a config that's already been created. |
| `sharing balance not enough` | Cumulative shared amount + fees would exceed the original settlement (or the previous successful share's settlement, for reversals). |
| `original sharing not success` | Trying to reverse a `Pending` or `Failed` profit-share — only `Success` is reversible. |

## Async result

Execution is deferred to the daily 15:00 UTC batch. Once executed, a callback fires to `notifyUrl` (see [Sharing callback](./sharing-callback.md)). To check status before that, use [query-result](./query-result.md).
