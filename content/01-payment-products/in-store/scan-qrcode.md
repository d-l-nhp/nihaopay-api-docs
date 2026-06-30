---
id: payment-products/in-store/scan-qrcode
title: "Scan QRcode (Merchant-Scans-Customer)"
type: endpoint
product: in-store
tags:
  - in-store
  - face-to-face
  - barcode
  - alipay
  - wechatpay
  - unionpay
summary: "POST /v1.2/transactions/scanqrcode — face-to-face in-store payment where the merchant scans the QR/barcode on the customer's phone. Returns a transaction outcome synchronously (status may be success/failure/pending). UnionPay restricted to US merchants. USD/JPY only."
related:
  - payment-products/in-store/show-qrcode
  - reference/ipn-mechanics
endpoint:
  method: POST
  path: /v1.2/transactions/scanqrcode
  request_content_type: application/x-www-form-urlencoded
  response_content_types:
    - { type: "application/json" }
quirks:
  - "usd_jpy_only"
  - "unionpay_us_merchants_only"
  - "synchronous_status_includes_pending"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/transactions/scanqrcode
```

Face-to-face flow where the **merchant scans the customer's QR/barcode** (displayed in the customer's AliPay / WeChat / UnionPay app). Used at point-of-sale with scanning guns, mobile devices with the merchant's app, or mPOS terminals with camera.

## How the flow works

```
1. Customer pays for the purchased items
2. Customer opens AliPay/WeChat/UnionPay → "Pay" → barcode is displayed
3. Merchant scans the customer's barcode with this endpoint
4. Nihaopay forwards to the vendor
5. The vendor charges the customer's wallet
6. Customer receives SMS / in-app notification
7. Merchant receives the result synchronously (this response)
```

## Supported currencies and vendors

- **Currencies:** `USD`, `JPY` only.
- **Vendors:** `alipay`, `wechatpay`, `unionpay` — note that **UnionPay scan-QR is restricted to US-merchant accounts**.

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/transactions/scanqrcode \
  -H "Authorization: Bearer <TOKEN>" \
  -d amount=100 \
  -d currency="USD" \
  -d vendor="alipay" \
  -d reference="alipay20170503000200" \
  -d buyer_identity_code="288463630882104202" \
  -d client_ip="104.167.25.158" \
  -d note="alipay" \
  -d description="Scan AliPay QrCode"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `currency` | Required | `USD` or `JPY`. |
| `amount` | Required | Positive integer in the currency's minor unit. |
| `vendor` | Required | `alipay`, `unionpay`, or `wechatpay`. |
| `reference` | Required | Alphanumeric, ≤30 chars, unique per transaction. |
| `items` | Conditional | Order line items. |
| `buyer_identity_code` | Required | The scanned QR/barcode value from the customer's phone. |
| `client_ip` | Required | The merchant terminal's IP address. |
| `description` | Optional | Arbitrary string. |
| `note` | Optional | Arbitrary note. |

## Response

```json
{
  "amount": 12,
  "id": "20170519093105011337",
  "time": "2017-05-19T09:31:45Z",
  "status": "success",
  "sys_reserve": "{\"vendor_id\":\"2018031421001008497050215891\"}",
  "note": "123456789",
  "reference": "alipay201705030004",
  "currency": "USD"
}
```

| Property | Description |
|---|---|
| `id` | Nihaopay transaction ID. |
| `status` | `success`, `failure`, or `pending`. |
| `sys_reserve` | Vendor metadata (JSON-in-string). Includes `vendor_id` once known. |
| `amount` | Amount in the currency's minor unit. |
| `currency` | 3-letter currency code. |
| `time` | UTC timestamp. |
| `reference` | Echoes your request `reference`. |
| `note` | Echoes your request `note`. |

> **`status=pending` is real here.** Unlike SecurePay (where `pending` doesn't appear in the sync response), scan-QR may return `pending` if the vendor hasn't confirmed yet. In that case, poll [Look up transaction](../../03-operations/lookup-transaction.md) for the final outcome — or wait for the IPN.

## Asynchronous response (IPN)

For `pending` outcomes, the final result is delivered via IPN. See [IPN mechanics](../../07-reference/ipn-mechanics.md). For synchronous `success` / `failure`, no IPN is sent.
