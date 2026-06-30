---
id: payment-products/securepay/standard
title: "Create a Standard SecurePay Transaction"
type: endpoint
product: securepay
tags:
  - payment
  - redirect
  - securepay
  - alipay
  - wechatpay
  - unionpay
  - paypal
summary: "POST /v1.2/transactions/securepay — redirect-based payment for desktop and mobile browsers. Returns an HTML form-post by default (auto-submits to the vendor); returns JSON with a redirect URL when response_format=JSON. Customer completes payment on the vendor's site; outcome arrives at ipn_url."
related:
  - reference/ipn-mechanics
endpoint:
  method: POST
  path: /v1.2/transactions/securepay
  request_content_type: application/x-www-form-urlencoded
  response_content_types:
    - { type: "text/html" }
    - { type: "application/json", condition: "response_format=JSON" }
quirks:
  - "default_response_is_html_not_json"
  - "paypal_capitalized_in_vendor_enum"
  - "in_wechat_param_has_three_branches"
status: stable
last_reviewed: "2026-05-17"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/transactions/securepay
```

SecurePay redirects the customer to the vendor's payment page. After the customer completes payment, two things happen:

1. **Sync**: The browser is redirected to your `callback_url`.
2. **Async**: A POST is sent to your `ipn_url` with the transaction outcome. See [IPN mechanics](../../07-reference/ipn-mechanics.md) for signature verification.

Because customers can close the browser before the sync redirect, the IPN is the authoritative source of payment status.

## Response format: HTML by default

**This endpoint returns `text/html` by default** — specifically, an HTML form that JavaScript auto-submits to the vendor's payment portal. This surprises developers who expect JSON.

To get JSON instead, pass `response_format=JSON`. The JSON response gives you either:

- A `url` to redirect the customer to, OR
- A `form` object with `actionUrl`, `method`, `target`, `params` — you construct the form and submit it client-side.

Only one of `url` or `form` is returned per JSON response. Never both.

## Sample request (cURL, Alipay)

```bash
curl https://api.nihaopay.com/v1.2/transactions/securepay \
  -H "Authorization: Bearer <TOKEN>" \
  -d rmb_amount=100 \
  -d currency="USD" \
  -d vendor="alipay" \
  -d reference="20171023191505118594" \
  -d items[0].name="T-Shirt Test" \
  -d items[0].unitAmount=100 \
  -d items[0].quantity=1 \
  -d ipn_url="https://demo.nihaopay.com/ipn" \
  -d callback_url="https://demo.nihaopay.com/callback"
```

## Sample request (cURL, WeChatPay with `in_wechat`)

```bash
curl https://api.nihaopay.com/v1.2/transactions/securepay \
  -H "Authorization: Bearer <TOKEN>" \
  -d rmb_amount=100 \
  -d currency="USD" \
  -d vendor="wechatpay" \
  -d reference="20171023191505118594" \
  -d items[0].name="T-Shirt Test" \
  -d items[0].unitAmount=100 \
  -d items[0].quantity=1 \
  -d ipn_url="https://demo.nihaopay.com/ipn" \
  -d in_wechat="false" \
  -d callback_url="https://demo.nihaopay.com/callback"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `currency` | Required | 3-letter ISO 4217 currency code (USD, JPY, HKD, EUR, CAD, GBP, SGD, AUD). |
| `amount` | Conditional | Positive integer in the currency's minor unit. Mutually exclusive with `rmb_amount`. |
| `rmb_amount` | Conditional | Use to price in RMB. Mutually exclusive with `amount`. When set, `currency` is the **settlement** currency. |
| `vendor` | Required | One of: `unionpay`, `alipay`, `wechatpay`, `PayPal` (note the capitalization for PayPal). |
| `payment_source` | Optional | Pass `ACDC` for PayPal card payments via the PayPal JS SDK pre-order flow. See the PayPal ACDC page (`payment-products/securepay/paypal-acdc`) for the full multi-step capture sequence — that endpoint is required after creating the order here. |
| `reference` | Required | Alphanumeric, up to 30 chars, **unique per transaction**. Used to correlate IPN data with your records. |
| `items` | Conditional | Order item list (see Item structure below). Item-total must equal `amount`. |
| `ipn_url` | Required | URL to receive the async transaction outcome. Must be publicly reachable. |
| `callback_url` | Required | URL the browser is redirected to after payment. By default only **successful** payments trigger this; see "callback_url accept parameter" below. |
| `description` | Optional | Arbitrary string. May appear on the customer's card charge or vendor receipt. |
| `note` | Optional | Arbitrary string note. Echoed back in the IPN. |
| `terminal` | Optional | `ONLINE` (desktop, default) or `WAP` (mobile). |
| `timeout` | Optional | Minutes until payment-page timeout. `1`–`1440`. Default `120`. |
| `in_wechat` | Optional | See below. Valid only when `vendor=wechatpay`. |
| `response_format` | Optional | `HTML` (default) or `JSON`. See "Response format" above. |

### Item structure

For `items`, use array-bracket form:

```
items[0].name=T-Shirt&items[0].unitAmount=500&items[0].quantity=1&items[1].name=Hat&items[1].unitAmount=500&items[1].quantity=2
```

| Field | Description |
|---|---|
| `items[n].name` (required) | Product name. |
| `items[n].unitAmount` (required) | Unit price in the currency's minor unit. |
| `items[n].quantity` (required) | Quantity. |

Sum must equal `amount`: `amount = Σ (unitAmount × quantity)`.

### `in_wechat` parameter — three behavioral branches

For WeChat payments, `in_wechat` selects the flow:

| `in_wechat` | When | Flow |
|---|---|---|
| `true` | Inside WeChat's built-in browser | JSAPI (in-WeChat H5 payment) |
| `false`, H5 enabled | Outside WeChat, H5 enabled on your merchant account | WeChat H5 payment |
| `false`, H5 not enabled | Outside WeChat, H5 not enabled | Downgrades to QR code scanning |

The H5-enabled path is opt-in — contact your Nihaopay BD rep to enable it on your account.

> **Mini-Programs (MINI_APP / 小程序) are not covered by this endpoint.** `in_wechat=true` is JSAPI — an H5 page rendered inside WeChat's browser. If your code calls `wx.requestPayment()` from a Mini-Program runtime, use [`/v1.2/transactions/micropay`](./wechat-miniprogram.md) instead. SecurePay returns an HTML form/redirect that a Mini-Program cannot render.

### `callback_url` accept parameter

**By default, only successful payments redirect to `callback_url`.** To receive failure or cancellation callbacks, append `?accept=pending,failure` to the URL:

```
callback_url=https://your-site.com/cb?accept=pending,failure
```

Easy to miss — and produces silent integration bugs if developers assume all outcomes hit the callback.

## JSON synchronous response (when `response_format=JSON`)

Returns either `url` or `form`:

**Example 1 — `url`:**

```json
{
  "url": "https://openapi.alipay.com/gateway.do?app_id=2019031263534265"
}
```

**Example 2 — `form`:**

```json
{
  "form": {
    "actionUrl": "https://www.nihaopay.com/",
    "method": "POST",
    "target": "_self",
    "params": {
      "bizType": "000201",
      "backUrl": "https://bgw.nihaopay.com/payBackResp/44e4af32d6494c71aaafe2eaf6c05910",
      "orderId": "u20230827102153QvCEZp",
      "txnSubType": "01"
    }
  }
}
```

With `url`: redirect the customer's browser directly.
With `form`: construct an HTML form using the fields and submit it client-side; the page will jump to the payment page after submission.

## Asynchronous response (IPN)

After payment, the API sends a transaction object to `ipn_url` via POST. For the full IPN spec — payload shape, signature verification, retry semantics — see [IPN mechanics](../../07-reference/ipn-mechanics.md).

SecurePay-specific note: the IPN `status` field is always `success` for this product (failed and pending transactions don't generate an IPN).

## Idempotency

There is no explicit idempotency key. Each request with a unique `reference` is a distinct transaction. Submitting the same `reference` twice will fail with error code `400-31` ("Transaction reference number must be unique. Please re-submit.").

## Related

- [IPN mechanics](../../07-reference/ipn-mechanics.md) — required reading for verifying webhook signatures.
