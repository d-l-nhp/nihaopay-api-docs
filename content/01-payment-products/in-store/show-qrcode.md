---
id: payment-products/in-store/show-qrcode
title: "Show QRcode (Customer-Scans-Merchant)"
type: endpoint
product: in-store
tags:
  - in-store
  - qrcode
  - face-to-face
  - alipay
  - wechatpay
  - unionpay
summary: "POST /v1.2/transactions/showqrcode — face-to-face flow where the merchant displays a dynamic QR code (one per transaction) and the customer scans it with AliPay / WeChat / UnionPay. Returns a code_url; outcome arrives at ipn_url. USD/JPY only; UnionPay US-merchants-only."
related:
  - payment-products/in-store/scan-qrcode
  - payment-products/in-store/static-omni-qrcode-create
  - reference/ipn-mechanics
endpoint:
  method: POST
  path: /v1.2/transactions/showqrcode
  request_content_type: application/x-www-form-urlencoded
  response_content_types:
    - { type: "application/json" }
quirks:
  - "usd_jpy_only"
  - "unionpay_us_merchants_only"
  - "dynamic_qr_per_transaction_not_static"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/transactions/showqrcode
```

The **merchant displays a dynamic QR code** (specific to one transaction) and the **customer scans it** with the wallet app. The merchant's POS/checkout screen renders the QR; the customer's phone scans, confirms the amount, and pays.

This is the opposite-direction flow from [Scan QRcode](./scan-qrcode.md):

| Endpoint | Who scans whom? |
|---|---|
| [Scan QRcode](./scan-qrcode.md) | Merchant scans the customer's barcode. |
| **Show QRcode (this page)** | Customer scans the merchant's QR. |
| [Static omni-channel QR](./static-omni-qrcode-create.md) | Customer scans a *static* merchant QR (printed once, reused). |

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/transactions/showqrcode \
  -H "Authorization: Bearer <TOKEN>" \
  -d amount=100 \
  -d currency="USD" \
  -d vendor="alipay" \
  -d reference="jkh25jh1340fd09sg" \
  -d ipn_url="http://website.com/ipn"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `amount` | Required | Positive integer in the currency's minor unit. |
| `currency` | Required | `USD` or `JPY`. |
| `reference` | Required | Alphanumeric, ≤30 chars, unique per transaction. |
| `items` | Conditional | Order line items. |
| `vendor` | Required | `alipay`, `unionpay`, or `wechatpay`. |
| `ipn_url` | Required | URL to receive the async transaction outcome. |
| `timeout` | Optional | Minutes until QR auto-expires. `1`–`1440`. Default `120`. |
| `description` | Optional | Arbitrary string. |
| `note` | Optional | Arbitrary note. |

## Response

```json
{
  "code_url": "https://qr.alipay.com/bax02617gyevjsjqxgoz2038",
  "id": "20170519093382010512",
  "timeout": 120,
  "currency": "USD",
  "amount": 100,
  "reference": "20170427-137-0011",
  "time": "2017-05-19T09:38:28Z"
}
```

| Property | Description |
|---|---|
| `code_url` | The QR-code URL string. Render this as a QR image on the merchant's display. |
| `id` | Nihaopay transaction ID. |
| `amount` | Amount in the currency's minor unit. |
| `currency` | 3-letter currency code. |
| `timeout` | Minutes until the QR stops being valid. |
| `reference` | Echoes your request `reference`. |
| `time` | UTC creation timestamp. |

## Asynchronous response (IPN)

The IPN arrives once the customer has scanned and paid (or once the QR times out). Same shape as SecurePay — see [IPN mechanics](../../07-reference/ipn-mechanics.md).

## Dynamic vs static QR

This endpoint creates a **dynamic** QR — bound to a single transaction with a specific amount and `reference`. Once paid (or timed out), it stops working. For a **static** QR that represents the merchant's account and lets the customer type the amount, see [Static omni-channel QRcode](./static-omni-qrcode-create.md).
