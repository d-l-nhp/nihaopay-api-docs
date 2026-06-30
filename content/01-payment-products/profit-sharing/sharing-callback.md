---
id: payment-products/profit-sharing/sharing-callback
title: "Profit Sharing: Async Callback"
type: concept
product: profit-sharing
tags:
  - profit-sharing
  - callback
  - webhook
  - signature
summary: "Async callback fired after the 15:00 UTC daily batch executes a profit-sharing configuration. Posts to notifyUrl with the sharing outcome (SUCCESS or FAIL). Signature scheme is UNDOCUMENTED in the v1.2 spec — contact Nihaopay tech support before relying on this."
related:
  - payment-products/profit-sharing/_overview
  - payment-products/profit-sharing/apply
signature_scheme: undocumented
status: stable
last_reviewed: "2026-05-26"
---

## What this covers

After the daily 15:00 UTC profit-sharing batch executes, Nihaopay POSTs a callback to the `notifyUrl` you supplied during [Apply](./apply.md). The callback reports whether the share succeeded or failed.

## ⚠️ Signature scheme is undocumented

**The v1.2 spec does not document a signature scheme for this callback.** Neither the field-based `§4.4` IPN scheme nor the body-based `§9.4` Auto Debit scheme is specified to apply.

**Before relying on this callback in production:**

1. Contact Nihaopay tech support to confirm the current signature mechanism (it may have been added since the spec was last published).
2. Until confirmed, treat the callback payload as **advisory only** — re-verify the outcome via [query-result](./query-result.md) before acting on it.

## Sample — success request

```json
{
  "sharingStatus": "SUCCESS",
  "sourceMerCode": "M001100001",
  "sharingConfId": "20230803211516007112",
  "targetSharingTxnAmount": 499,
  "txnType": "SHARE_PROFIT",
  "targetMerCode": "M006100129",
  "baseAmount": 2496,
  "reference": "TEST_20230803211516007112",
  "targetServiceFee": 10,
  "relationTxnId": "20230803211516007111",
  "rate": {
    "minAmount": 0,
    "percentage": 2,
    "txnCurrency": "USD",
    "refundReturn": 0,
    "fixedAmount": 0,
    "maxAmount": 0
  },
  "sourceSharingTxnAmount": -499,
  "txnCurrency": "USD",
  "sourceServiceFee": 0
}
```

## Sample — failure request

```json
{
  "sharingStatus": "FAIL",
  "sourceMerCode": "M001100001",
  "sharingConfId": "20230803211516007112",
  "txnType": "SHARE_PROFIT",
  "targetMerCode": "M006100129",
  "reference": "TEST_20230803211516007112",
  "relationTxnId": "20230803211516007111",
  "failReason": "balance not enough"
}
```

## Payload fields

| Property | Description |
|---|---|
| `sharingStatus` | `SUCCESS` or `FAIL`. |
| `sourceMerCode` | Source merchant. |
| `targetMerCode` | Target (recipient) merchant. |
| `sharingConfId` | Profit-sharing configuration ID. |
| `relationTxnId` | Original payment order ID. |
| `reference` | Echo from `Apply`. |
| `txnType` | `SHARE_PROFIT` (sharing) or `SHARE_PROFIT_REVERSE` (reversal). |
| `txnCurrency` | Currency code. |
| `baseAmount` | The amount the share was calculated against, in the currency's minor unit. |
| `targetSharingTxnAmount` | Amount credited to target merchant (minor unit). |
| `sourceSharingTxnAmount` | Amount debited from source (negative). |
| `targetServiceFee` | Fee charged on the target side (minor unit). |
| `sourceServiceFee` | Fee charged on the source side. |
| `rate` | Object describing the rate config: `percentage`, `fixedAmount`, `minAmount`, `maxAmount`, `refundReturn`, `txnCurrency`. |
| `failReason` | Set only on `FAIL`. E.g. `balance not enough`. |

## Handling guidance

- **Verify via [query-result](./query-result.md) before acting** on a `SUCCESS` callback in financially-sensitive code paths — until signature verification is confirmed working.
- **Failure handling:** on `failReason: balance not enough`, the original payment didn't have enough net settlement to cover the share + fees. Investigate per-merchant settlement balances; the rule may need to be adjusted before retrying.
- **Idempotency:** key by `sharingConfId`. Duplicate callbacks may occur.
