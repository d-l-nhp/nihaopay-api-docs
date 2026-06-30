---
id: changelog/api-changelog
title: "API Change Log"
type: reference
product: platform
tags:
  - changelog
  - history
  - versioning
summary: "Dated change log for the Nihaopay v1.2 API. Tracks endpoint additions, parameter additions, and behavior tweaks since the initial v1.2 release in 2017. MuskPay (CardPay) was added 2024-09-18."
related:
  - introduction/version
status: stable
last_reviewed: "2026-05-26"
---

## 2025-01-16
- Add Auto Debit API.

## 2024-09-18
- Add CardPay (MuskPay).

## 2023-08-23
- SecurePay supports returning data in JSON format (via `response_format=JSON`).

## 2023-08-05
- Add Profit Sharing Interface.

## 2022-07-18
- Add interface Alipay A+.

## 2020-09-01
- Update currencies list.
- Support UnionPay customs declaration.

## 2018-06-01
- Add customs declaration.
- Add vendor's transaction in IPN.

## 2018-05-17
- In-App payment support WeChatPay.
- Scan QRcode support UnionPay QRcode, U.S. merchants only.

## 2018-03-15
- Add interface Static Omni-Channel QRcode.
- Add interface Static AliPay QRcode.

## 2017-11-10
- Add interface WeChat Mini-program payment.

## 2017-08-21
- Add interface Download transactions.
- Add interface Static QRcode.
- Add interface Inquiry account balance.
- Add interface Apply withdrawal.
- Add interface Inquiry withdrawal history.

## 2017-05-25
- Add In-Store Payment API.
- Add In-App Payment API.
- Add verify signature in IPN notification.
- Change IPN notification frequency.

## 2017-04-10
- Update Error list.
- Add parameter `rmb_amount` in SecurePay and ExpressPay request field list.

## 2017-03-07
- Add Chinese document.
- Add parameter `client_ip` in ExpressPay request field list.
- Add interface Query Exchange Rate.
- Add interface Download Billing.

## 2017-01-01
- Upgrade to v1.2.

## What "version" means here

All entries above are within **v1.2** — they are additive (new endpoints, new parameters, new vendors) rather than breaking changes to existing endpoints. See [Version](../00-introduction/version.md) for the contract that v1.2 freezes.
