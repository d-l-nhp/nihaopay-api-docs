---
id: payment-products/in-store/static-omni-qrcode-payment
title: "Static QRcode Payment"
type: endpoint
product: in-store
tags:
  - in-store
  - static-qrcode
  - payment
  - wechatpay
  - alipay
summary: "POST /v1.2/transactions/staticqrcode — invoked when a customer scans a previously-created static merchant QR. Builds the H5 payment page that the customer's app loads. The page wakes up the WeChat or AliPay wallet to complete payment. Returns a redirect_url for the customer's app."
related:
  - payment-products/in-store/static-omni-qrcode-create
  - payment-products/in-store/static-alipay-qrcode
  - reference/ipn-mechanics
endpoint:
  method: POST
  path: /v1.2/transactions/staticqrcode
  request_content_type: application/x-www-form-urlencoded
  response_content_types:
    - { type: "application/json" }
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/transactions/staticqrcode
```

Builds the customer-facing payment page that gets served when a customer scans a static merchant QR (created via [Static omni-channel QRcode](./static-omni-qrcode-create.md) or [Static AliPay QRcode](./static-alipay-qrcode.md)). The returned `redirect_url` is the page the customer is sent to; that page wakes up the relevant wallet app (WeChat / AliPay) and finalizes payment.

> **Vendor determined by which app scanned:** WeChat app → `vendor=wechatpay`; AliPay app → `vendor=alipay`. Your backend infers this from the scanning context, not from a customer choice.

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/transactions/staticqrcode \
  -H "Authorization: Bearer <TOKEN>" \
  -d amount=100 \
  -d vendor="alipay" \
  -d reference="20170503030002" \
  -d qrcode="https://apitest.nihaopay.com/topayment/9b2487be23a3434b9eb62870fcb" \
  -d callback_url="https://nihaopay.com" \
  -d description="static QrCode"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `amount` | Required | Positive integer in the currency's minor unit (the amount the customer just typed). |
| `vendor` | Required | `alipay` or `wechatpay` — determined by which app scanned the QR. |
| `qrcode` | Required | The `qrcode` URL returned when the static QR was created. |
| `reference` | Optional | Alphanumeric, ≤30 chars, unique per transaction. |
| `items` | Conditional | Order line items. |
| `callbacl_url` | Optional | URL the browser is redirected to after payment. *(Note: the spec field name is literally `callbacl_url` — typo'd. Use this spelling exactly.)* |
| `description` | Optional | Arbitrary string. |

> **Spec quirk:** the request parameter name `callbacl_url` is misspelled (missing the second `k`) in the upstream spec. The actual API accepts it under that exact spelling — submitting `callback_url` will be silently ignored.

## Response

```json
{
  "redirect_url": "https://wxcode.nihaopay.com/wechatpay/openid?txnId=20180314..."
}
```

| Property | Description |
|---|---|
| `redirect_url` | URL the customer's browser/app should be sent to. The page wakes up the WeChat / AliPay wallet and finalizes payment. |

## Asynchronous response (IPN)

The IPN arrives at the `ipn_url` configured during static-QR creation, not at any URL set on this request. Same shape as SecurePay — see [IPN mechanics](../../07-reference/ipn-mechanics.md).
