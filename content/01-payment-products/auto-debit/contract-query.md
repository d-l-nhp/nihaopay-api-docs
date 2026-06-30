---
id: payment-products/auto-debit/contract-query
title: "Auto Debit: Contract Query"
type: endpoint
product: auto-debit
tags:
  - auto-debit
  - contract
  - query
  - status
summary: "GET /v1.2/contract/query — look up an Auto Debit contract's status by (agreementId + reference) or by contractNo. Returns contractStatus (Signed / Terminated / Processing / FAIL), signed/terminate timestamps, and termination mode."
related:
  - payment-products/auto-debit/_overview
  - payment-products/auto-debit/signing
  - payment-products/auto-debit/initiate-deduction
endpoint:
  method: GET
  path: /v1.2/contract/query
  request_content_type: application/json
  response_content_types:
    - { type: "application/json" }
quirks:
  - "uses_GET_with_request_body_unusual_for_get"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
GET https://api.nihaopay.com/v1.2/contract/query
```

> **Quirk:** this endpoint is `GET` but takes a **JSON request body** — unusual. Most clients allow GET-with-body, but some (notably some Java HttpClient configurations) silently drop it. Test with cURL first if you're seeing empty-body errors.

## Identifying the contract

Same identification rules as [Termination](./termination.md):

- Supply `agreementId + reference`, OR
- Supply `contractNo`

Both pairs cannot be empty at the same time.

## Sample request — using `agreementId` + `reference`

```bash
curl --location 'https://api.nihaopay.com/v1.2/contract/query' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --data '{
    "agreementId": "your agreementId",
    "reference": "your unique reference"
  }'
```

## Sample request — using `contractNo`

```bash
curl --location 'https://api.nihaopay.com/v1.2/contract/query' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --data '{
    "contractNo": "d649252400014ea7a0a090704cc600d6"
  }'
```

## Request parameters

| Parameter | Required | Type | Description |
|---|---|---|---|
| `agreementId` | Optional | string | Contract template ID. |
| `reference` | Optional | string(64) | Merchant unique identifier from signing. |
| `contractNo` | Optional | string | Nihaopay's contract identifier. |

## Response

```json
{
  "code": "00",
  "label": "00",
  "message": "success",
  "contractId": "contract id",
  "contractNo": "our contract number",
  "contractStatus": "Signed",
  "signedTime": "2025-01-15 19:15:14",
  "terminateTime": "2025-01-15 19:15:14",
  "terminateMode": "USER/MERCHANT/PLATFORM"
}
```

| Parameter | Description |
|---|---|
| `code` | Return code. `00` = success. |
| `label` | Return code label. |
| `message` | Status text. |
| `contractId` | Contract ID. |
| `contractNo` | Nihaopay contract number. |
| `contractStatus` | One of: `Signed`, `Terminated`, `Processing` (pending signing), `FAIL` (signing failed). |
| `signedTime` | Signing timestamp. May be null if not yet signed. |
| `terminateTime` | Termination timestamp. May be null if active. |
| `terminateMode` | `USER`, `MERCHANT`, or `PLATFORM`. Null if active. |

## Status semantics

| `contractStatus` | What you can do |
|---|---|
| `Processing` | Wait for the contract-status notification. No deductions allowed. |
| `Signed` | Eligible for [deductions](./initiate-deduction.md). |
| `Terminated` | Contract is closed. No further deductions. Re-sign with a new request to create a new contract. |
| `FAIL` | Signing failed. Re-sign with a new request — the original `contractNo` is dead. |

Polling this endpoint is a legitimate fallback when you missed (or are skeptical of) a contract-status notification. Use it sparingly — the notification is the canonical source of truth.
