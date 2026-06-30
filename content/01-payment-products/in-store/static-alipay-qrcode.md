---
id: payment-products/in-store/static-alipay-qrcode
title: "Create a Static AliPay QRcode"
type: endpoint
product: in-store
tags:
  - in-store
  - static-qrcode
  - alipay
summary: "POST /v1.2/merchantqrcode (vendor=alipay) — create a static QR code specifically for the AliPay app. Print and post in-store; customers scan with AliPay, type the amount, and pay. Same HTTP path as the omni-channel WeChat/UnionPay variant — disambiguated by vendor=alipay."
related:
  - payment-products/in-store/static-omni-qrcode-create
  - payment-products/in-store/static-omni-qrcode-payment
  - reference/ipn-mechanics
endpoint:
  method: POST
  path: /v1.2/merchantqrcode
  discriminator:
    param: vendor
    value: "alipay"
  request_content_type: application/x-www-form-urlencoded
  response_content_types:
    - { type: "application/json" }
quirks:
  - "shared_path_with_static_omni_qrcode_create"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/merchantqrcode
```

Creates a static QR code specifically for the **AliPay** app (the omni-channel WeChat / UnionPay variant lives at the same path with different `vendor`). Print + display in-store; customer scans with AliPay, types the amount, and pays.

**Path is shared** with [Static omni-channel QRcode (WeChat/UnionPay)](./static-omni-qrcode-create.md) — distinguished only by the `vendor` parameter:

| `vendor` | Page |
|---|---|
| `alipay` | **This page** |
| `unionpay` or `wechatpay` | [Static omni-channel QRcode](./static-omni-qrcode-create.md) |

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/merchantqrcode \
  -H "Authorization: Bearer <TOKEN>" \
  -d ipn_url="http://website.com/ipn" \
  -d trade_currency="USD" \
  -d vendor="alipay" \
  -d seller_name="NihaoPay" \
  -d store_name="LA Branch" \
  -d store_no="B001"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `trade_currency` | Required | `USD` or `JPY`. |
| `vendor` | Required | Must be `alipay`. (Setting `unionpay`/`wechatpay` routes to the [omni-channel variant](./static-omni-qrcode-create.md).) |
| `ipn_url` | Optional | URL to receive the async transaction outcome per future payment. |
| `seller_name` | Required | Seller name; displayed on the AliPay payment page when scanned. |
| `store_name` | Required | Store name. |
| `store_no` | Required | Store number / identifier. |

## Response

```json
{
  "seller_name": "NihaoPay",
  "store_name": "LA Branch",
  "store_no": "B001",
  "qrcode_img_url": "https://mobilecodec.alipay.com/show.htm?code=ocx09459xspxx8...",
  "qrcode": "https://qr.alipay.com/ocx09459xspxxdajnvzik3d"
}
```

| Property | Description |
|---|---|
| `seller_name` | Echo. |
| `store_name` | Echo. |
| `store_no` | Echo. |
| `qrcode_img_url` | URL to a rendered QR-code image (includes the AliPay branding overlay). Print and post in store. |
| `qrcode` | The underlying QR URL value. Use if you want to render the QR yourself. |

## Asynchronous response (IPN)

Once a customer scans + pays, the transaction flows through [Static QRcode payment](./static-omni-qrcode-payment.md) and the IPN lands at the `ipn_url` configured here. Same shape as SecurePay — see [IPN mechanics](../../07-reference/ipn-mechanics.md).
