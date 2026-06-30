---
id: operations/_overview
title: "Operations Overview"
type: overview
product: operations
tags:
  - operations
  - transactions
  - refund
  - reporting
  - exchange-rate
summary: "Operations endpoints act on transactions after they're created: list and look up transactions, retrieve a SecurePay transaction by reference, issue and query refunds, download transaction and billing files as CSV, and query the current exchange rate used for currency conversion."
related:
  - operations/list-transactions
  - operations/lookup-transaction
  - operations/retrieve-securepay
  - operations/refund
  - operations/refund-query
  - operations/download-transactions
  - operations/download-billing
  - operations/exchange-rate
status: stable
last_reviewed: "2026-06-29"
---

## What this section covers

Operations are the post-payment endpoints — everything you do with a transaction
once it exists, plus the reporting and exchange-rate lookups. For balances and
payouts, see [Account & Settlement](../04-account-settlement/balance.md).

## API surface

| Page | Purpose |
|---|---|
| [List transactions](./list-transactions.md) | List transactions for the account. |
| [Look up a transaction](./lookup-transaction.md) | Fetch one transaction by `transaction_id`. |
| [Retrieve a SecurePay transaction](./retrieve-securepay.md) | Fetch a SecurePay transaction by merchant reference. |
| [Refund](./refund.md) | Refund a transaction. |
| [Refund query](./refund-query.md) | Check the status of a refund. |
| [Download transactions](./download-transactions.md) | Download a transactions report as CSV. |
| [Download billing](./download-billing.md) | Download a billing file as CSV. |
| [Exchange rate](./exchange-rate.md) | Query the current conversion rate. |
