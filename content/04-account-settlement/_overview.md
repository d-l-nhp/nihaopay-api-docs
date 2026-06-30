---
id: account-settlement/_overview
title: "Account & Settlement Overview"
type: overview
product: account
tags:
  - account
  - balance
  - withdrawal
  - settlement
summary: "Account and settlement endpoints let a merchant inspect its balance and reconcile payouts: query the current account balance, list withdrawal history, and download per-withdrawal detail as CSV. These are read/reporting calls, separate from the transaction-level operations endpoints."
related:
  - account-settlement/balance
  - account-settlement/withdrawal-history
  - account-settlement/withdrawal-details
status: stable
last_reviewed: "2026-06-29"
---

## What this section covers

These endpoints answer "how much do I have, and what has been paid out?" — the
account and settlement side of the API, as opposed to per-transaction
[operations](../03-operations/list-transactions.md).

## API surface

| Page | Purpose |
|---|---|
| [Account balance](./balance.md) | Inquire the current account balance. |
| [Withdrawal history](./withdrawal-history.md) | List past withdrawals. |
| [Withdrawal details](./withdrawal-details.md) | Download the line-item detail for a withdrawal as CSV. |
