---
id: payment-products/securepay/alipay-a-plus
title: "Alipay A+ Multi-Wallet Payment"
type: endpoint
product: securepay
tags:
  - payment
  - alipay
  - alipay-plus
  - wallets
  - cross-border
summary: "POST /v1.2/transactions/aplus — Alipay A+ multi-wallet payment. One endpoint, many wallets: AlipayHK, GCash, DANA, KaKaoPay, TNG, TrueMoney, ALIPAY_CN. Defaults to CONNECT_WALLET (let user pick). Returns a redirectUrl for the customer's browser/webview."
related:
  - payment-products/securepay/standard
  - reference/ipn-mechanics
endpoint:
  method: POST
  path: /v1.2/transactions/aplus
  request_content_type: application/x-www-form-urlencoded
  response_content_types:
    - { type: "application/json" }
quirks:
  - "wallet_enum_includes_CONNECT_WALLET_picker"
  - "timeout_default_10min_not_120"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/transactions/aplus
```

Alipay A+ is a federated payment surface: one endpoint that fans out to several regional wallets across Asia-Pacific. Available wallets: **AlipayHK** (Hong Kong), **GCash** (Philippines), **DANA** (Indonesia), **KaKaoPay** (Korea), **TNG** (Malaysia), **TrueMoney** (Thailand), and **ALIPAY_CN** (mainland China).

Default `wallet=CONNECT_WALLET` shows the customer a wallet picker; specify a single wallet to skip the picker.

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/transactions/aplus \
  -H "Authorization: Bearer <TOKEN>" \
  -d amount=100 \
  -d currency="USD" \
  -d reference="alipay20170503000300" \
  -d ipn_url="http://website.com/ipn" \
  -d callback_url="http://website.com/callback"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `currency` | Required | 3-letter currency code. |
| `amount` | Conditional | Positive integer in the currency's minor unit. Mutually exclusive with `rmb_amount`. |
| `rmb_amount` | Conditional | RMB-denominated amount (fen). Mutually exclusive with `amount`. |
| `reference` | Required | Alphanumeric, ≤30 chars, unique per transaction. |
| `items` | Conditional | Order line items. |
| `ipn_url` | Required | URL to receive the async transaction outcome. |
| `callback_url` | Conditional | URL the browser is redirected to after payment. Required when `terminal=ONLINE` or `terminal=WAP`. |
| `description` | Optional | Arbitrary string. |
| `note` | Optional | Arbitrary note; echoed in IPN. |
| `terminal` | Optional | `ONLINE` (default), `WAP` (mobile web), `APP` (native app), or `MICRO` (mini-program). |
| `timeout` | Optional | Order timeout in minutes. `1`–`10`. **Default `10`** — much shorter than other SecurePay endpoints (which default to 120). |
| `ostype` | Conditional | `ANDROID` or `IOS`. Required when `terminal=WAP`, `APP`, or `MICRO`. |
| `wallet` | Optional | One of: `ALIPAY_CN`, `ALIPAY_HK`, `TRUEMONEY`, `TNG`, `GCASH`, `DANA`, `KAKAOPAY`, `CONNECT_WALLET`. Default `CONNECT_WALLET` shows the user a picker across all available wallets. |

## Response

```json
{
  "amount": 10,
  "timeout": 10,
  "currency": "USD",
  "reference": "1657008342862",
  "id": "2022071422190300379",
  "time": "2022-07-14T22:19:03Z",
  "redirectUrl": "https://alipay.com/connect.html?code=2016660400982TL79hJiONxKfo"
}
```

| Property | Description |
|---|---|
| `amount` | Order amount in minor units. |
| `timeout` | Order timeout (minutes). |
| `currency` | 3-letter currency code. |
| `reference` | Echoes your request `reference`. |
| `id` | Nihaopay transaction ID. |
| `time` | Order creation timestamp (UTC). |
| `redirectUrl` | URL the customer's browser/WebView should be sent to. |

## Asynchronous response (IPN)

Same shape as SecurePay. See [IPN mechanics](../../07-reference/ipn-mechanics.md).

## Why `timeout` defaults are shorter here

A+ wallets are mostly used for one-shot, mobile-first checkout flows where the customer is actively present. The 10-minute default reflects this — if the customer hasn't completed payment within 10 minutes, it's safer to fail-and-retry than hold the order open. If you need a longer window (e.g. desktop checkout with intent to return), bump `timeout` explicitly.
