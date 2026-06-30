---
id: payment-products/securepay/in-app
title: "In-App Payment"
type: endpoint
product: securepay
tags:
  - payment
  - in-app
  - mobile
  - alipay
  - wechatpay
  - unionpay
summary: "POST /v1.2/transactions/apppay — get the parameters needed to invoke the vendor's native SDK (AliPay / WeChat / UnionPay) inside an Android/iOS app. Returns either orderInfo (for SDK call) or a redirectUrl (for in-app webview). Outcome arrives at ipn_url."
related:
  - payment-products/securepay/standard
  - reference/ipn-mechanics
endpoint:
  method: POST
  path: /v1.2/transactions/apppay
  request_content_type: application/x-www-form-urlencoded
  response_content_types:
    - { type: "application/json" }
quirks:
  - "orderInfo_xor_redirectUrl_response"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/transactions/apppay
```

In-App Payment returns a payload that your native mobile app feeds into the vendor's payment SDK. The customer never leaves your app — the vendor's SDK handles the payment UI overlay.

For WeChatPay in-app payments, contact Nihaopay first to enable WeChat in-app support on your merchant account.

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/transactions/apppay \
  -H "Authorization: Bearer <TOKEN>" \
  -d amount=100 \
  -d currency="USD" \
  -d vendor="alipay" \
  -d reference="alipay20170503000300" \
  -d ipn_url="http://website.com/ipn"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `currency` | Required | 3-letter currency code. |
| `amount` | Conditional | Positive integer in the currency's minor unit. Mutually exclusive with `rmb_amount`. |
| `rmb_amount` | Conditional | RMB-denominated amount (fen). Mutually exclusive with `amount`. |
| `reference` | Required | Alphanumeric, ≤30 chars, unique per transaction. |
| `items` | Conditional | Order line items. |
| `vendor` | Required | `alipay`, `wechatpay`, or `unionpay`. |
| `app_id` | Conditional | WeChat APPID (from WeChat Open Platform). Required when `vendor=wechatpay`. |
| `ipn_url` | Required | URL to receive the async transaction outcome. |
| `description` | Optional | Arbitrary string. |
| `note` | Optional | Arbitrary note; echoed in IPN. |
| `timeout` | Optional | Minutes until payment page times out. `1`–`1440`. Default `120`. |
| `ostype` | Required | `ANDROID` or `IOS`. |

## Response

```json
{
  "orderInfo": "orderinfo string.....",
  "redirectUrl": "https://wallet.com/xxx?xxx=xx....."
}
```

| Property | Description |
|---|---|
| `orderInfo` | String to pass into the vendor's native SDK on the mobile device. Used by `AlipaySDK.payV2()` (Android) / equivalent (iOS). |
| `redirectUrl` | A WAP-style URL the app can open in a `WebView` (or hand to the system browser) to complete payment. |

**Important — these are mutually exclusive in practice:**

> Only one of `orderInfo` and `redirectUrl` is returned per response. If both are present in the JSON, `orderInfo` takes precedence and `redirectUrl` should be ignored.

## Asynchronous response (IPN)

Same shape as SecurePay. See [IPN mechanics](../../07-reference/ipn-mechanics.md).

## Integration references

Nihaopay publishes sample iOS and Android demos that show the SDK-wiring steps for each vendor — see the GitHub link from the upstream docs site. For WeChat in-app payment specifically, contact Nihaopay support for an enablement-gate sign-off before going live.
