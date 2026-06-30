---
id: payment-products/in-store/static-omni-qrcode-create
title: "Create a Static Omni-Channel QRcode (UnionPay / WeChat)"
type: endpoint
product: in-store
tags:
  - in-store
  - static-qrcode
  - omni-channel
  - wechatpay
  - unionpay
summary: "POST /v1.2/merchantqrcode (vendor unionpay|wechatpay) — create a static QR code representing the merchant's store. Print and post it in-store; customers scan with WeChat or UnionPay QuickPass, then type the amount. Returns a printable qrcode_img_url plus the underlying qrcode URL."
related:
  - payment-products/in-store/static-alipay-qrcode
  - payment-products/in-store/static-omni-qrcode-payment
  - reference/ipn-mechanics
endpoint:
  method: POST
  path: /v1.2/merchantqrcode
  discriminator:
    param: vendor
    value: "unionpay|wechatpay"
  request_content_type: application/x-www-form-urlencoded
  response_content_types:
    - { type: "application/json" }
quirks:
  - "shared_path_with_static_alipay_qrcode"
  - "static_means_no_amount_in_create"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/merchantqrcode
```

Creates a **static** QR code that represents the merchant's account (a specific store + seller). The QR is printed and displayed in-store. Customers scan, the wallet app opens, the customer types the amount, confirms, and pays.

**This endpoint shares its HTTP path with [Static AliPay QRcode](./static-alipay-qrcode.md).** The two are distinguished by the `vendor` request parameter:

| `vendor` | Page |
|---|---|
| `unionpay` or `wechatpay` | **This page** (omni-channel WeChat + UnionPay scan) |
| `alipay` | [Static AliPay QRcode](./static-alipay-qrcode.md) |

The static-create endpoint sets up the QR; actual payments flow through [Static QRcode payment](./static-omni-qrcode-payment.md).

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/merchantqrcode \
  -H "Authorization: Bearer <TOKEN>" \
  -d ipn_url="http://website.com/ipn" \
  -d trade_currency="USD" \
  -d seller_name="NihaoPay" \
  -d store_name="LA Branch" \
  -d store_no="B001"
```

(No `vendor` parameter shown above defaults to the WeChat/UnionPay omni-channel path. AliPay-specific creation uses `vendor=alipay` — see the [AliPay page](./static-alipay-qrcode.md).)

## Request parameters

| Property | Required | Description |
|---|---|---|
| `trade_currency` | Required | `USD` or `JPY`. |
| `ipn_url` | Optional | URL to receive the async transaction outcome (per future payment). |
| `seller_name` | Required | Seller name; displayed on the payment page when the QR is scanned. |
| `store_name` | Required | Store name. |
| `store_no` | Required | Store number / identifier. |

> No amount is set at QR-create time — that's the defining property of a **static** QR. The customer types the amount when scanning.

## Response

```json
{
  "seller_name": "NihaoPay",
  "store_name": "LA Branch",
  "store_no": "B001",
  "qrcode_img_url": "https://apitest.nihaopay.com/merqrcode/9b2487be23a3434b9eb62870fcb",
  "qrcode": "https://apitest.nihaopay.com/topayment/9b2487be23a3434b9eb62870fcb"
}
```

| Property | Description |
|---|---|
| `seller_name` | Echo. |
| `store_name` | Echo. |
| `store_no` | Echo. |
| `qrcode_img_url` | URL to a rendered QR-code image — print and post this in the store. |
| `qrcode` | The underlying QR URL value (use this if you want to render the QR yourself). |

## What happens when the QR is scanned

The customer's WeChat / UnionPay QuickPass app opens the URL, displays a "pay" form, and the customer enters the amount. Once submitted, the actual payment is handled through [Static QRcode payment](./static-omni-qrcode-payment.md). That payment endpoint's IPN delivers the transaction outcome to the `ipn_url` configured at QR-creation time.

## Asynchronous response (IPN)

Same shape as SecurePay. See [IPN mechanics](../../07-reference/ipn-mechanics.md).
