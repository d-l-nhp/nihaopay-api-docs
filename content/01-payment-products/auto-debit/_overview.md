---
id: payment-products/auto-debit/_overview
title: "Auto Debit: Overview and Rules"
type: overview
product: auto-debit
tags:
  - auto-debit
  - contract
  - recurring
  - wechatpay
  - papay
summary: "Auto Debit lets merchants deduct funds from a user's wallet on a recurring basis after a one-time contract signing. WeChat Pay only in v1.2. Five rules (one contract per user, dual-party termination, refund-after-deduct doesn't restore the cycle limit, etc.) plus a separate body-based signature scheme for contract-status notifications."
related:
  - payment-products/auto-debit/signing
  - payment-products/auto-debit/contract-notifications
  - payment-products/auto-debit/initiate-deduction
status: stable
last_reviewed: "2026-05-26"
---

## What Auto Debit does

Auto Debit (sometimes called "PaPay" — `papay` is WeChat's internal name) lets you charge a user **without their per-transaction approval** by:

1. **Signing a contract** with the user once (`POST /v1.2/contract/sign`). The user agrees in the WeChat UI to authorize future debits.
2. **Initiating deductions** against that contract later (`POST /v1.2/transactions/autodebit`), as needed.

Auto Debit is **WeChat Pay only** in v1.2. Other vendors don't expose a comparable recurring-debit primitive through Nihaopay yet.

## The five rules

These are spec-level invariants that shape your integration:

1. **One contract per user.** The same `agreementId` can only be signed once per user. Resubmitting a signing request after success returns a failure response, not a duplicate contract.
2. **Either party can terminate.** Both the merchant (via [Termination API](./termination.md)) and the user (via their wallet UI) can end the contract at any time post-signing.
3. **Refunds don't restore deduction quota.** If a user has a per-cycle deduction limit and you fully refund a deduction, the refund does *not* free up the limit. Plan around this — full-refund-then-rededuce is **not** a way to retry within the cycle.
4. **WeChat is the only supported vendor.** `vendor=wechatpay` is the only valid value.
5. **Per-cycle limits.** WeChat enforces per-user deduction limits per cycle. Contact your BD rep for the specific numbers — they vary by merchant category.

## Integration topology

```
USER WALLET (WeChat)
        ↑
        │ (1) Sign contract — user approves
        │ (2) Initiate deduction — merchant triggers, user is silent
        ↓
NIHAOPAY  ←—  IPN: deduction outcome
        ↑
        │ Async: contract-status changes (signed / terminated / failed)
        ↓
MERCHANT BACKEND
```

There are **two** async notification streams to handle:

- **Deduction outcome** — fires on each `initiate-deduction` call. Same shape as SecurePay IPN (see [IPN mechanics](../../07-reference/ipn-mechanics.md)).
- **Contract-status notifications** — fire when a contract transitions (signed, terminated, failed). **Different signature scheme** from the regular IPN — see [Contract notifications](./contract-notifications.md).

## API surface

| Endpoint | Purpose |
|---|---|
| [Signing](./signing.md) | Create a new contract; redirect user to WeChat to authorize. |
| [Termination](./termination.md) | Merchant-initiated end-of-contract. |
| [Contract query](./contract-query.md) | Look up a contract's current state. |
| [Initiate deduction](./initiate-deduction.md) | Charge against an active contract. |
| [Contract notifications](./contract-notifications.md) | Async webhook spec for contract-status changes. |

## Why the signature scheme is different

The regular Nihaopay IPN signs a **sorted-key concatenation** of fields (`§4.4`). Contract-status notifications instead sign the **raw request body** as a single string (`MD5(body + '&' + MD5(token))`, see `§9.4`). This is because WeChat's underlying papay callback uses a body-based signing scheme that Nihaopay passes through without re-signing into the field-based format. Verifying the wrong scheme will reject every notification.
