---
id: reference/payment-mode-chooser
title: "Payment Mode Chooser: Vendor × Surface → Endpoint"
type: reference
product: platform
tags:
  - chooser
  - matrix
  - vendors
  - surfaces
  - decision
summary: "Cross-reference matrix that maps (vendor × surface) → which Nihaopay endpoint to call. Five payment models exist (SecurePay, CardPay, In-App, Show QRcode, Scan QRcode); this page picks the right one based on whether the customer is on PC web, mobile web, in WeChat, in a native app, in WeChat mini-program, or face-to-face in a store."
related:
  - introduction/introduction
  - payment-products/securepay/standard
  - payment-products/securepay/qrcode
  - payment-products/in-store/scan-qrcode
status: stable
last_reviewed: "2026-05-26"
---

## The five payment models

Nihaopay supports five payment-flow models. They differ in **who initiates**, **where the customer enters credentials**, and **whether a browser is involved**.

| Model | Customer experience |
|---|---|
| **SecurePay** | Browser is redirected to the vendor's payment page; customer enters credentials there. |
| **CardPay (MuskPay)** | Merchant collects card info directly; submits encrypted card data to the API. Requires merchant PCI compliance. |
| **In-APP Payment** | Native app calls the vendor's SDK with parameters from our API. No browser. |
| **Show QRcode** | API returns a QR-code URL; merchant displays it; customer scans with WeChat / UnionPay / AliPay to pay. |
| **Scan QRcode** | Face-to-face in-store: merchant scans the QR/barcode on the customer's phone. |

The CardPay model is documented under a separate API host (**MuskPay** — `api.muskpay.io`). See [CardPay overview](../01-payment-products/cardpay/_overview.md).

## Matrix: vendor × surface

|   | **AliPay** | **WechatPay** | **UnionPay** |
|---|---|---|---|
| **PC browser** (`terminal=ONLINE`) | [Standard SecurePay](../01-payment-products/securepay/standard.md) | [SecurePay](../01-payment-products/securepay/standard.md) + [Generate QRcode](../01-payment-products/securepay/qrcode.md) | [SecurePay](../01-payment-products/securepay/standard.md) + [CardPay](../01-payment-products/cardpay/_overview.md) |
| **Mobile browser** (`terminal=WAP`) | [Standard SecurePay](../01-payment-products/securepay/standard.md) | [WeChat H5 payment](../01-payment-products/securepay/standard.md) — contact BD to enable | [SecurePay](../01-payment-products/securepay/standard.md) + [CardPay](../01-payment-products/cardpay/_overview.md) |
| **Inside WeChat browser** (`terminal=WAP`) | N/A | [Standard SecurePay](../01-payment-products/securepay/standard.md) (JSAPI, `in_wechat=true`) | [SecurePay](../01-payment-products/securepay/standard.md) + [CardPay](../01-payment-products/cardpay/_overview.md) |
| **Native app (in-APP)** | [In-APP Payment](../01-payment-products/securepay/in-app.md) | [In-APP Payment](../01-payment-products/securepay/in-app.md) | [In-APP Payment](../01-payment-products/securepay/in-app.md) |
| **WeChat Mini-program** | N/A | [Mini-Program Payment](../01-payment-products/securepay/wechat-miniprogram.md) | N/A |
| **In-store** — scanner | [Scan QRcode](../01-payment-products/in-store/scan-qrcode.md) | [Scan QRcode](../01-payment-products/in-store/scan-qrcode.md) | [Scan QRcode](../01-payment-products/in-store/scan-qrcode.md) (US merchants only) |
| **In-store** — display QR | [Show QRcode](../01-payment-products/in-store/show-qrcode.md) + [Static](../01-payment-products/in-store/static-alipay-qrcode.md) | [Show QRcode](../01-payment-products/in-store/show-qrcode.md) + [Static](../01-payment-products/in-store/static-omni-qrcode-create.md) | [Show QRcode](../01-payment-products/in-store/show-qrcode.md) (US merchants only) |

## How to read this

Pick the row matching where your customer is, then the column matching how they want to pay. The cell tells you which doc page (and therefore which endpoint) to call.

### Gotchas

- **`in_wechat` is sneaky.** When the customer is browsing your site *inside* the WeChat in-app browser, you must pass `in_wechat=true` to SecurePay to get the JSAPI flow. Outside WeChat, with H5 enabled, pass `in_wechat=false`. Outside WeChat, without H5 enabled, also pass `in_wechat=false` — but the flow silently downgrades to QR-code scanning. See [SecurePay standard](../01-payment-products/securepay/standard.md#in_wechat-parameter--three-behavioral-branches).
- **UnionPay in-store is US-only.** Two cells in the matrix (in-store UnionPay) are restricted to US-merchant accounts; non-US merchants don't see UnionPay in their in-store options.
- **Static vs dynamic QR.** "Show QRcode" generates a **dynamic** QR per transaction (one-shot). "Static" QR represents the merchant's account and the customer scans + types the amount — it's a different endpoint family. See [Static omni-channel](../01-payment-products/in-store/static-omni-qrcode-create.md).

## Related references

- [SecurePay standard](../01-payment-products/securepay/standard.md) — full request/response detail for the most-used model.
- [CardPay overview](../01-payment-products/cardpay/_overview.md) — for credit-card flows (MuskPay host).
- [Common parameters](./parameters-description.md) — for the shared `amount` / `currency` / `vendor` / `items` semantics referenced by all these endpoints.
