---
id: introduction/introduction
title: "Introduction to the Nihaopay v1.2 API"
type: concept
product: platform
tags:
  - overview
  - rest
  - https
  - getting-started
  - muskpay
  - cardpay
summary: "Nihaopay and MuskPay (CardPay) are peer REST APIs sharing the v1.2 spec: resource-oriented URLs, JSON responses (SecurePay defaults to HTML), HTTPS-only. Production splits per product (api.nihaopay.com, api.muskpay.io); testing collapses to a single shared host (apitest.nihaopay.com)."
related:
  - introduction/version
  - introduction/authentication
  - reference/ipn-mechanics
status: stable
last_reviewed: "2026-05-26"
---

## What this API does

Nihaopay's v1.2 REST API lets merchants accept payments from Chinese consumers (AliPay, WeChat Pay, UnionPay) and international wallets (PayPal, AliPay A+ multi-wallet family) across browsers, mobile apps, mini-programs, and in-store checkouts. It also covers customs declaration, automatic debits, profit sharing, refunds, balance/withdrawal inquiry, and reconciliation.

Credit-card processing (Visa/Master/JCB/Amex/Discover) is delegated to a **separate API** — **MuskPay** — documented under [Payment Products → CardPay](../01-payment-products/cardpay/_overview.md).

## API conventions

- **Resource-oriented URLs** following REST naming.
- **Standard HTTP verbs:** `GET` (read) and `POST` (write). v1.2 does not use `PUT`/`PATCH`/`DELETE`.
- **JSON responses by default.** SecurePay is the major exception — its default is `text/html` (an auto-submit form). Pass `response_format=JSON` to opt into JSON.
- **HTTPS only.** Plain HTTP is rejected.
- **Base URLs:**
  - **Production:** `https://api.nihaopay.com` for Nihaopay endpoints; `https://api.muskpay.io` for CardPay / MuskPay endpoints (MuskPay is a separate API product alongside Nihaopay; CardPay is the credit-card payment product offered through MuskPay).
  - **Testing:** `https://apitest.nihaopay.com` — both products' test traffic routes through this single shared host. There is no `apitest.muskpay.io`. See [Testing](../05-testing/testing.md).

## Where to start

Pick the document that matches your need:

- **Picking a payment product:** [Payment-mode chooser](../07-reference/payment-mode-chooser.md) — a matrix of vendor × surface (PC / mobile / WeChat / in-store) and which endpoint to call.
- **Auth:** [Authentication](./authentication.md).
- **First integration:** [SecurePay (standard)](../01-payment-products/securepay/standard.md) — the most common entry point.
- **Receiving payment events:** [IPN mechanics](../07-reference/ipn-mechanics.md).
- **Error handling:** [Error list](../06-error-handling/error-list.md) + [Error object](../06-error-handling/error-object.md).

## Supporting resources

- **Transaction Management System (TMS):** the web UI for inspecting transactions, bearer tokens, customer-merchant configuration. Login is separate from API auth — your TMS credentials are different from your API bearer token.
- **GitHub:** Nihaopay publishes sample code, SDKs, and plugins on GitHub. Not all language SDKs are first-party; verify the publisher before adopting.
- **中文文档:** A Chinese-language version of this documentation exists in parallel; field names and behavior are identical.
- **Tech support:** contact via the form linked from the upstream docs site if you encounter undocumented behavior. Several IPN/signature edges (Profit Sharing callback signature, WeChat H5 enablement) are gated behind a support conversation.
