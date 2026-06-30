---
id: payment-products/auto-debit/initiate-deduction
title: "Auto Debit: Initiate Deduction"
type: endpoint
product: auto-debit
tags:
  - auto-debit
  - deduction
  - recurring
  - wechatpay
summary: "POST /v1.2/transactions/autodebit — debit funds against a previously-signed Auto Debit contract. Synchronous response reports success/failure of the deduction itself; the IPN to ipn_url is the authoritative settled-or-failed event."
related:
  - payment-products/auto-debit/_overview
  - payment-products/auto-debit/signing
  - reference/ipn-mechanics
endpoint:
  method: POST
  path: /v1.2/transactions/autodebit
  request_content_type: application/json
  response_content_types:
    - { type: "application/json" }
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/transactions/autodebit
```

Charge the user against an active Auto Debit contract. The contract must be in `Signed` state (verify with [Contract query](./contract-query.md) if uncertain).

## Sample request

```bash
curl --location 'https://api.nihaopay.com/v1.2/transactions/autodebit' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --data '{
    "amount": "1",
    "currency": "USD",
    "note": "your order note",
    "description": "your debit description",
    "ipn_url": "your ipn url",
    "reference": "your unique reference",
    "vendor": "wechatpay",
    "contract_id": "your contract id"
  }'
```

## Request parameters

| Parameter | Required | Type | Description |
|---|---|---|---|
| `amount` | Yes | string | Deduction amount in the currency's minor unit. |
| `currency` | Yes | string(3) | Currency code. |
| `note` | Optional | string | Order remarks. |
| `description` | Yes | string | Deduction description — visible to the user in their WeChat transaction history. |
| `ipn_url` | Yes | string | Async notification URL for the deduction outcome. |
| `reference` | Yes | string(64) | Merchant unique identifier for this deduction. |
| `vendor` | Yes | string(16) | `wechatpay`. |
| `contract_id` | Yes | string | The `contractId` from the signing callback / query. |

## Synchronous response — success

```json
{
  "status": "success",
  "reference": "your unique reference",
  "currency": "USD",
  "amount": 1,
  "rmb_amount": 0,
  "id": "20250111220054100012",
  "note": "autodebit test",
  "time": "2025-01-11T22:00:34Z",
  "message": ""
}
```

## Synchronous response — failure

```json
{
  "status": "failure",
  "reference": "your unique reference",
  "currency": "USD",
  "amount": 1,
  "rmb_amount": 0,
  "id": "20250111220054100012",
  "note": "autodebit test",
  "time": "2025-01-11T22:00:54Z",
  "message": "User account payment limit reached"
}
```

| Parameter | Description |
|---|---|
| `status` | `success` or `failure`. |
| `reference` | Echo. |
| `currency` | Echo. |
| `amount` | Echo (deduction amount). |
| `rmb_amount` | RMB equivalent (or 0). |
| `id` | Nihaopay transaction ID. |
| `note` | Echo. |
| `time` | UTC transaction timestamp. |
| `message` | Empty on success; error text on failure (e.g. `User account payment limit reached`). |

## Asynchronous response (IPN)

Settlement confirmation arrives at your `ipn_url` once WeChat finalizes the deduction. **Same payload shape and signature scheme as the standard IPN** (`§4.4`, sorted-key MD5). See [IPN mechanics](../../07-reference/ipn-mechanics.md).

This is the **deduction** IPN — distinct from contract-status notifications, which use a different signing scheme (see [Contract notifications](./contract-notifications.md)).

## Common failure messages

| `message` | Meaning |
|---|---|
| `User account payment limit reached` | The per-cycle deduction limit has been hit. Refunding does NOT restore quota — wait until the next cycle. |
| `Contract not signed` | The contract is in `Processing` or `FAIL` state. Re-check via [Contract query](./contract-query.md). |
| `Contract terminated` | The user or merchant terminated. Re-sign for a fresh contract. |
