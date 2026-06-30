---
id: payment-products/securepay/wechat-miniprogram
title: "WeChat Mini-Program Payment"
type: endpoint
product: securepay
tags:
  - payment
  - wechatpay
  - mini-program
  - mini-app
  - miniprogram
  - jsapi-disambiguation
  - wx-request-payment
summary: "POST /v1.2/transactions/micropay — pre-pay request for WeChat Mini-Programs (小程序, also called MINI_APP in WeChat SDK terminology). Returns the timestamp/nonceStr/wechatPackage/signType/paySign payload that the mini-program hands to wx.requestPayment(). Distinct from JSAPI (in-WeChat H5 browser, served by SecurePay with in_wechat=true). Outcome arrives at ipn_url."
related:
  - payment-products/securepay/standard
  - payment-products/securepay/in-app
  - reference/ipn-mechanics
endpoint:
  method: POST
  path: /v1.2/transactions/micropay
  request_content_type: application/x-www-form-urlencoded
  response_content_types:
    - { type: "application/json" }
quirks:
  - "open_id_required_via_wx_login_first"
  - "appid_must_be_sent_to_nihaopay_support_before_use"
  - "distinct_from_securepay_jsapi_in_wechat"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/transactions/micropay
```

Pre-pay endpoint for WeChat **Mini-Programs** (小程序, also referred to as **MINI_APP** in WeChat SDK terminology). The mini-program calls your backend; your backend calls this endpoint; you return the response to the mini-program; the mini-program passes it into `wx.requestPayment()`. WeChat invokes the IPN to your `ipn_url` when payment settles.

**Before going live:** send your WeChat Mini-program APPID to Nihaopay support — it must be whitelisted before this endpoint will accept it.

## Mini-Program vs JSAPI vs H5 — pick the right endpoint

These are three distinct WeChat payment surfaces. Picking the wrong endpoint is the most common first-time integration mistake:

| Surface | Where the code runs | Endpoint | SecurePay flag |
|---|---|---|---|
| **Mini-Program (小程序 / MINI_APP)** | Inside the WeChat client as a Mini-Program | **`/v1.2/transactions/micropay`** (this page) | n/a |
| **JSAPI** | An H5 page rendered in WeChat's built-in browser | `/v1.2/transactions/securepay` | `in_wechat=true` |
| **H5** | A mobile web page outside the WeChat client | `/v1.2/transactions/securepay` | `in_wechat=false` |

If your code calls `wx.requestPayment()` from a Mini-Program runtime, you want **this** endpoint (`micropay`). The SecurePay `in_wechat=true` flag is for JSAPI (H5-in-WeChat) only — it cannot drive a Mini-Program payment because SecurePay returns an HTML form/redirect that Mini-Programs have no way to render.

## Integration flow

```
MINI-PROGRAM    →    MERCHANT BACKEND    →    NIHAOPAY    →    WECHATPAY
       (1) Call wx.login() → return code
       (2) Send to merchant backend
                      (3) Request pre-pay (this API)
                                                 (4) Return payment parameters
                      (5) Return payment params to mini-program
       (6) wx.requestPayment({...payment params})
       (7) Payment result (success / fail) shown to user
                                                 (8) IPN to merchant backend
                      (9) Notify mini-program of finalized result
```

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/transactions/micropay \
  -H "Authorization: Bearer <TOKEN>" \
  -d amount=100 \
  -d currency="USD" \
  -d reference="wechatpay20171109000300" \
  -d ipn_url="http://website.com/ipn" \
  -d open_id="oSC6Tw7--mfjTCpIr-7zrWloABTU" \
  -d client_ip="100.167.25.154"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `currency` | Required | 3-letter currency code. |
| `amount` | Conditional | Positive integer in the currency's minor unit. Mutually exclusive with `rmb_amount`. |
| `rmb_amount` | Conditional | RMB-denominated amount (fen). Mutually exclusive with `amount`. |
| `reference` | Required | Alphanumeric, ≤30 chars, unique per transaction. |
| `items` | Conditional | Order line items. |
| `app_id` | Required | Your WeChat Mini-program APPID (whitelisted with Nihaopay support). |
| `ipn_url` | Required | URL to receive the async transaction outcome. |
| `client_ip` | Required | The customer's IP address. |
| `open_id` | Required | The WeChat user's `openid`. Obtain by calling `wx.login()` in the mini-program and exchanging the returned `code`. |
| `description` | Optional | Arbitrary string. |
| `note` | Optional | Arbitrary note. |
| `timeout` | Optional | Minutes until payment-page timeout. `1`–`1440`. Default `120`. |

## Response

```json
{
  "timeStamp": "1510341067563",
  "nonceStr": "4611bdaa03d544b9f9413093c40c2e517",
  "wechatPackage": "prepay_id=wx20171110325070cf2a7060670530604",
  "signType": "MD5",
  "paySign": "09E50BE509093080E3870D05CBF41049E"
}
```

| Property | Description |
|---|---|
| `timeStamp` | Time stamp (Unix seconds as string). Pass into `wx.requestPayment()` as `timeStamp`. |
| `nonceStr` | Random string. |
| `wechatPackage` | Data package containing the `prepay_id`. Pass as `package` to `wx.requestPayment()`. |
| `signType` | Signature type. Currently always `MD5`. |
| `paySign` | The signature. Pass as `paySign` to `wx.requestPayment()`. |

The mini-program then invokes:

```js
wx.requestPayment({
  timeStamp,
  nonceStr,
  package: wechatPackage,
  signType,
  paySign,
  success(res) { /* payment success */ },
  fail(err) { /* user cancelled or failed */ }
});
```

## Asynchronous response (IPN)

Same shape as SecurePay. See [IPN mechanics](../../07-reference/ipn-mechanics.md). The IPN is the authoritative source — don't rely on `wx.requestPayment`'s `success` callback (the user may close before the network confirms).

## Obtaining `open_id`

The `open_id` field uniquely identifies a WeChat user **per mini-program**. To obtain it:

1. The mini-program calls `wx.login()`, receiving a temporary `code`.
2. The mini-program sends `code` to your backend.
3. Your backend exchanges `code` for `openid` via WeChat's `jscode2session` API.
4. Cache `openid` against the customer's identity in your system.

See WeChat's mini-program docs for the canonical reference on `wx.login()` and openid-issuance semantics.
