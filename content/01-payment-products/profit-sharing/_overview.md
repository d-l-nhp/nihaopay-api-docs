---
id: payment-products/profit-sharing/_overview
title: "Profit Sharing: Overview, Rules, and Effects"
type: overview
product: profit-sharing
tags:
  - profit-sharing
  - splitting
  - reversal
  - settlement
summary: "Profit Sharing distributes part of a payment to additional merchants. Configurations apply either globally (per currency) or per-order. Ten operational rules govern multi-execution, reversal, and fee handling. This page covers concepts; the apply / query / cancel endpoints are documented separately."
related:
  - payment-products/profit-sharing/apply
  - payment-products/profit-sharing/query-config
  - payment-products/profit-sharing/query-result
  - payment-products/profit-sharing/cancel
  - payment-products/profit-sharing/sharing-callback
status: stable
last_reviewed: "2026-05-26"
---

## What Profit Sharing does

Profit Sharing splits the proceeds of a payment between the original receiving merchant and one or more downstream merchants. Two flavors exist:

- **Global (per-currency) sharing** — a standing rule that automatically applies to all incoming payments in a given currency. Initiated by omitting `relationTxnId`. Use with care in production.
- **Per-order sharing** — a one-shot configuration tied to a specific payment order. Initiated by passing `relationTxnId`.

Execution is **deferred**: orders in `Pending` status are batched and processed at **15:00 UTC daily**. Success → `SUCCESS`; failure → `FAILED`.

## The 10 rules (§10.2)

1. **One global per currency.** Only one global profit-sharing configuration per currency. You can cancel and replace it at any time.
2. **Multiple executions per payment.** A single payment order may be profit-shared multiple times, but the cumulative shared amount + fees cannot exceed the original settlement amount.
3. **Daily execution batch at 15:00 UTC.** Pending orders enter execution at that time. Success → `Success`; failure → `Failed`.
4. **Pending orders are cancellable; not reversible.** Use [cancel](./cancel.md) for `Pending`; reversal isn't allowed in that state.
5. **Success orders are reversible; not cancellable.** Use [apply](./apply.md) with `sharingType=2` (reversal) for `Success` orders. Cancellation is not allowed.
6. **Partial or full reversals.** A `Success` profit-sharing order can be partially or fully reversed multiple times, as long as cumulative reversed + reversal-fees ≤ original settled sharing amount.
7. **Profit sharing incurs handling fees.** Cumulative shared + reversed amounts cannot exceed (original payment − handling fees). You may opt to deduct fees from the **source** account instead — see `feeFrom`.
8. **Merchants share only their own orders.** A merchant can only initiate profit sharing for payment orders it received.
9. **Platform merchants can share for sub-merchants.** Platform-type merchants can initiate sharing across all their associated merchants' payment orders.
10. **Per-payment-order maximum.** There's a maximum number of profit-sharing executions allowed per payment order — contact BD for the specific number.

## Worked example — execution effects (§10.3)

Setup:

- Payment order amount: 100 USD
- Platform fee collected: 2 USD
- Actual settlement to Merchant A: 98 USD
- Merchant A initiates a 10% profit-share to Merchant B, with a 2% sharing fee
- Payment processing fee rate: 2%
- Profit-sharing fee rate: 2%

### Scenario 1 — handling fee deducted from the transaction

| Account | Profit Sharing Amount | Handling Fee | Amount Received |
|---|---|---|---|
| Merchant A | −9.8 | 0.00 | −9.8 |
| Merchant B | 9.8 | 0.196 | **9.604** |

### Scenario 2 — handling fee deducted from the source account

| Account | Profit Sharing Amount | Handling Fee | Amount Received |
|---|---|---|---|
| Merchant A | −9.8 | 0.196 | **−9.996** |
| Merchant B | 9.8 | 0.00 | **9.80** |

## Worked example — reversing a profit-share (§10.4)

Same setup as above, then Merchant A initiates a **full reversal** of the profit-share. Note: the original profit-share might not be fully reversible due to fee deductions.

### Scenario 1 — handling fee deducted from the transaction

| Account | Profit Sharing Amount | Handling Fee | Amount Received |
|---|---|---|---|
| Merchant A (initial) | −9.8 | 0.00 | −9.8 |
| Merchant B (initial) | 9.8 | 0.196 | 9.604 |
| Merchant A (reversal) | 9.604 | 0.19208 | 9.41192 |
| Merchant B (reversal) | −9.604 | 0.00 | −9.604 |

### Scenario 2 — handling fee deducted from the source account

| Account | Profit Sharing Amount | Handling Fee | Amount Received |
|---|---|---|---|
| Merchant A (initial) | −9.8 | 0.196 | −9.996 |
| Merchant B (initial) | 9.8 | 0.00 | 9.80 |
| Merchant A (reversal) | 9.8 | 0.00 | 9.8 |
| Merchant B (reversal) | −9.8 | 0.196 | −9.996 |

## Fixed-amount sharing

When `splitMethod=1` (fixed-amount), `splitValue` is the **profit-sharing amount in the currency's base unit**:

- Currencies whose smallest unit is the base unit (JPY, KRW, VND): `splitValue=1000` = 1000 yen / won / dong.
- Currencies whose smallest unit is cents (USD, CNY, EUR, ...): `splitValue=1023` = **10.23** of the currency (i.e. value is in **cents**).

## API surface

| Endpoint | Purpose |
|---|---|
| [Apply](./apply.md) | Initiate sharing or reversal. Five scenarios distinguished by `sharingType` + `splitMethod` + `relationTxnId`. |
| [Query config](./query-config.md) | List configured profit-sharing rules (global or per-order). |
| [Query result](./query-result.md) | Look up the execution result of a specific sharing configuration. |
| [Cancel](./cancel.md) | Cancel a `Pending` configuration. (Use [Apply](./apply.md) with `sharingType=2` for `Success` reversals.) |
| [Sharing callback](./sharing-callback.md) | Async webhook fired after batch execution. |
