---
id: payment-products/securepay/_overview
title: "SecurePay Overview"
type: overview
product: securepay
tags:
  - securepay
  - redirect
  - qrcode
  - in-app
  - alipay
  - wechatpay
  - paypal
summary: "SecurePay is Nihaopay's hosted-redirect payment product: the customer completes payment on the vendor's page and the outcome arrives at your ipn_url. One request shape spans desktop/mobile browsers, QR codes, in-app SDK flows, and wallet-specific variants (Alipay A+, WeChat Mini-Program, PayPal ACDC)."
related:
  - payment-products/securepay/standard
  - payment-products/securepay/qrcode
  - payment-products/securepay/in-app
  - payment-products/securepay/wechat-miniprogram
  - payment-products/securepay/alipay-a-plus
  - payment-products/securepay/paypal-acdc
  - reference/ipn-mechanics
status: stable
last_reviewed: "2026-06-29"
---

## What SecurePay covers

SecurePay handles redirect-based payments: you POST a transaction, Nihaopay returns
a redirect (HTML form-post by default, or a JSON redirect URL when
`response_format=JSON`), the customer pays on the vendor's site, and the result is
delivered asynchronously to your `ipn_url`. See [IPN mechanics](../../07-reference/ipn-mechanics.md)
for signature verification.

## API surface

| Page | Purpose |
|---|---|
| [Standard](./standard.md) | Redirect-based payment for desktop and mobile browsers. |
| [QRcode](./qrcode.md) | Generate a scannable payment QR code. |
| [In-App](./in-app.md) | Payment from inside a native app via the SDK flow. |
| [WeChat Mini-Program](./wechat-miniprogram.md) | Payment within a WeChat Mini-Program. |
| [Alipay A+](./alipay-a-plus.md) | Multi-wallet payment via the Alipay A+ network. |
| [PayPal ACDC](./paypal-acdc.md) | PayPal advanced card / order-capture flow. |

All variants share the SecurePay request shape; the wallet-specific pages document
only what differs (extra parameters, response branches, and quirks).
