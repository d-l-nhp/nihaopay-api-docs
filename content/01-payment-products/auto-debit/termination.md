---
id: payment-products/auto-debit/termination
title: "Auto Debit: Termination"
type: endpoint
product: auto-debit
tags:
  - auto-debit
  - contract
  - terminate
  - wechatpay
summary: "POST /v1.2/contract/terminate — merchant-initiated termination of an Auto Debit contract. Identify the contract by (agreementId + reference) OR by contractNo — but not both empty. Reason field required. User-initiated termination happens silently via the WeChat UI; notification mode field tells you which."
related:
  - payment-products/auto-debit/_overview
  - payment-products/auto-debit/contract-notifications
endpoint:
  method: POST
  path: /v1.2/contract/terminate
  request_content_type: application/json
  response_content_types:
    - { type: "application/json" }
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/contract/terminate
```

Merchant-initiated termination of an Auto Debit contract. (Users can also terminate from their own WeChat wallet UI — that path doesn't hit this endpoint.)

## Two ways to identify the contract

You must supply **one** of:

- `agreementId` + `reference`, OR
- `contractNo`

If both pairs are empty, the API rejects the request. If both are supplied, `contractNo` wins.

## Sample request — using `agreementId` + `reference`

```bash
curl --location 'https://api.nihaopay.com/v1.2/contract/terminate' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --data '{
    "agreementId": "your agreementId",
    "reference": "your unique reference",
    "reason": "your terminate reason"
  }'
```

## Sample request — using `contractNo`

```bash
curl --location 'https://api.nihaopay.com/v1.2/contract/terminate' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --data '{
    "contractNo": "d649252400014ea7a0a090704cc600d6",
    "reason": "your terminate reason"
  }'
```

## Request parameters

| Parameter | Required | Type | Description |
|---|---|---|---|
| `agreementId` | Optional | string | Contract template ID. |
| `reference` | Optional | string(64) | Your unique reference from the signing request. Pairs with `agreementId`. |
| `contractNo` | Optional | string | Nihaopay's contract identifier. Pairs alone. |
| `reason` | Yes | string | Termination reason (will appear in the contract record). |

## Response

```json
{
  "code": "00",
  "label": "00",
  "message": "success",
  "contractId": "contract id",
  "contractNo": "our contract number",
  "reference": "your unique reference"
}
```

| Parameter | Description |
|---|---|
| `code` | Return code. `00` = success. |
| `label` | Return code label. |
| `message` | Human-readable status. |
| `contractId` | Contract ID. |
| `contractNo` | Nihaopay contract number. |
| `reference` | Echo. |

## Async notification

When the termination is confirmed (by WeChat), a contract-status notification fires with `contractStatus=Terminated` and `terminateMode=MERCHANT`. See [Contract notifications](./contract-notifications.md).

The `terminateMode` field tells you who initiated the termination:

- `MERCHANT` — you called this endpoint.
- `USER` — the user terminated from the WeChat wallet UI.
- `PLATFORM` — the platform (WeChat / Nihaopay) terminated for policy reasons.
