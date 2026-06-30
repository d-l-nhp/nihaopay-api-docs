---
id: introduction/version
title: "API Version: v1.2"
type: concept
product: platform
tags:
  - version
  - url-namespace
  - compatibility
summary: "Explains how API versioning works for Nihaopay: the current version is v1.2, how it is namespaced into the URL path, and how to pin a version. Reference doc, not an endpoint."
related:
  - introduction/introduction
  - changelog/api-changelog
status: stable
last_reviewed: "2026-05-26"
---

## Current version

**v1.2** — current. All endpoints in this documentation correspond to v1.2.

## How to specify a version

The version goes immediately after the host, as a path segment:

```
https://api.nihaopay.com/v1.2/transactions
                         ^^^^
                         version
```

For MuskPay (CardPay):

```
https://api.muskpay.io/v1.2/transactions/cardpay
                      ^^^^
                      version
```

## Why versioning matters

The API evolves over time — new endpoints get added, occasionally fields are added to responses, and rarely (but not never) behavior changes. By pinning your client to `/v1.2/` you opt out of being broken by changes that ship under future major/minor versions.

See [API change log](../08-changelog/api-changelog.md) for the dated history of additions and behavior tweaks within v1.2.

## What "v1.2" actually freezes

- **URL paths** — `/v1.2/transactions/securepay` etc. are stable.
- **Response field names and types** for existing fields.
- **Signature algorithms** — `ipn-md5-sorted-keys` for IPN, `auto-debit-md5-body` for Auto Debit notifications.

What's **not** frozen by the version namespace:

- New **fields** may be added to responses within v1.2 (additive, non-breaking).
- New **endpoints** may be added (the change log lists each addition with a date).
- New **vendors** or **wallets** may be added to existing enums (e.g. AliPay A+ wallet list grew across releases).
- **Quirks** that aren't strictly behavior changes (documentation clarifications, error-message wording) may be tightened without a version bump.

If you parse responses defensively (ignore-unknown-fields, switch on known enum values, default-branch unknowns), an integration written against v1.2 today should continue to work against v1.2 indefinitely.
