---
id: payment-products/securepay/qrcode
title: "Generate a Payment QRcode"
type: endpoint
product: securepay
tags:
  - payment
  - qrcode
  - securepay
  - wechatpay
  - unionpay
summary: "POST /v1.2/transactions/qrcode — request an ad-hoc, single-transaction QR code URL. Merchant displays code_url on its checkout page; customer scans with WeChat Pay or UnionPay QuickPass to complete the transaction. Outcome arrives at ipn_url."
related:
  - payment-products/securepay/standard
  - payment-products/in-store/show-qrcode
  - reference/ipn-mechanics
endpoint:
  method: POST
  path: /v1.2/transactions/qrcode
  request_content_type: application/x-www-form-urlencoded
  response_content_types:
    - { type: "application/json" }
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/transactions/qrcode
```

Returns a `code_url` representing a one-shot QR code for a specific transaction. The merchant displays the QR (on a checkout page, on a printed bill, or rendered into an image) and the customer scans it with WeChat Pay or UnionPay QuickPass.

This endpoint is conceptually similar to [In-Store Show QRcode](../in-store/show-qrcode.md) but is intended for e-commerce checkout, not face-to-face point-of-sale.

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/transactions/qrcode \
  -H "Authorization: Bearer <TOKEN>" \
  -d amount=100 \
  -d vendor="wechatpay" \
  -d currency="USD" \
  -d reference="jkh25jh1340fd09sg" \
  -d ipn_url="http://website.com/ipn"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `currency` | Required | 3-letter currency code. See [Common parameters](../../07-reference/parameters-description.md). |
| `amount` | Conditional | Positive integer in the currency's minor unit. Mutually exclusive with `rmb_amount`. |
| `rmb_amount` | Conditional | RMB-denominated amount (in fen). Mutually exclusive with `amount`. |
| `vendor` | Required | `unionpay` or `wechatpay`. |
| `reference` | Required | Alphanumeric, ≤30 chars, unique per transaction. |
| `items` | Conditional | Order line items (bracket-form). See [Common parameters](../../07-reference/parameters-description.md). |
| `ipn_url` | Required | URL to receive the async transaction outcome. Must be publicly reachable. |
| `timeout` | Optional | Minutes until QR auto-expires. `1`–`1440`. Default `120`. |
| `description` | Optional | Arbitrary string; may appear on the card charge / receipt. |
| `note` | Optional | Arbitrary note; echoed back in the IPN. |

## Response

JSON object containing the `code_url`:

```json
{
  "id": "2016082907582003759",
  "code_url": "weixin://wxpay/bizpayurl?pr=1dVyJZF",
  "timeout": 90,
  "amount": 100,
  "currency": "USD",
  "reference": "jkh25jh1340fd09sg",
  "time": "2017-05-19T09:38:28Z"
}
```

| Property | Description |
|---|---|
| `code_url` | The QR code URL string. Render this as a QR code on your checkout page. |
| `id` | Nihaopay transaction ID. |
| `amount` | Amount in the currency's minor unit. |
| `currency` | 3-letter currency code. |
| `timeout` | Minutes until this code URL stops being valid (defaults applied if omitted in request). |
| `reference` | Echoes your request `reference`. |
| `time` | UTC creation timestamp. |

## Asynchronous response (IPN)

Same shape as SecurePay — see [IPN mechanics](../../07-reference/ipn-mechanics.md). If no IPN arrives, [look up the transaction](../../03-operations/lookup-transaction.md) before retrying.

## Operational notes

- **Expiry:** the `code_url` is single-shot — once the transaction settles or the `timeout` elapses, the URL stops resolving. To regenerate, submit a new request with a *new* `reference`.
- **Rendering the QR:** the response is a URL, not an image. Use any QR rendering library (e.g. `qrcode.js`, server-side `qrencode`) to display it.
- **In-store vs. e-commerce:** for face-to-face displays (POS terminals, printed bills), prefer [In-Store Show QRcode](../in-store/show-qrcode.md). The two endpoints look similar but differ in IPN handling and vendor support.
