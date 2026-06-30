---
id: payment-products/auto-debit/signing
title: "Auto Debit: Signing"
type: endpoint
product: auto-debit
tags:
  - auto-debit
  - contract
  - sign
  - wechatpay
summary: "POST /v1.2/contract/sign — initiate WeChat Auto Debit contract signing. Returns a signUrl (WEB / H5) or signId (APP / Mini-Program / JSAPI) the user follows to authorize future debits in WeChat. Contract-status notifications arrive at notifyUrl async."
related:
  - payment-products/auto-debit/_overview
  - payment-products/auto-debit/contract-notifications
  - payment-products/auto-debit/termination
endpoint:
  method: POST
  path: /v1.2/contract/sign
  request_content_type: application/json
  response_content_types:
    - { type: "application/json" }
quirks:
  - "signUrl_vs_signId_depends_on_platform"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/contract/sign
```

Start an Auto Debit signing flow. The user is sent into WeChat to confirm the contract; once they approve, a contract-status notification fires to your `notifyUrl` (and optionally a sync `returnUrl` for H5/web).

## Sample request (WEB)

```bash
curl --location 'https://api.nihaopay.com/v1.2/contract/sign' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --data '{
    "appId": "your appId",
    "agreementId": "your agreementId",
    "username": "your customer name",
    "vendor": "wechatpay",
    "currency": "USD",
    "notifyUrl": "https://YOUR_HOST/notify",
    "returnUrl": "https://YOUR_HOST/callback",
    "platform": "WEB",
    "clientIp": "127.0.0.1",
    "reference": "your unique reference",
    "remark": "remark"
  }'
```

## Request parameters

| Parameter | Required | Type | Description |
|---|---|---|---|
| `appId` | No | string | WeChat App ID. Required if multiple apps are enabled for differentiation. |
| `agreementId` | Yes | string | Contract template ID — corresponds to `plan_id` in WeChat. |
| `username` | Yes | string(32) | User name for display in the signing UI. No URL encoding. Does NOT support UTF8 non-3-byte chars. |
| `vendor` | Yes | string(16) | `wechatpay`. |
| `currency` | Yes | string(3) | 3-letter currency code. |
| `notifyUrl` | Yes | string | Async notification URL for contract-status events. |
| `returnUrl` | No | string | Sync return URL after signing. Required for H5 and JSAPI platforms. |
| `userId` | No | string | User identifier. Required when `vendor=wechatpay` for `JSAPI` / `MINI_APP` platforms. |
| `platform` | Yes | string | One of: `WEB`, `H5`, `APP`, `MINI_APP`, `JSAPI`. |
| `clientIp` | No | string | Client IP. Required for risk control when `vendor=wechatpay` and `platform=H5`. |
| `reference` | Yes | string(64) | Your unique identifier for this signing request. |
| `remark` | No | string | Additional remarks. |

## Response — WEB / H5 / JSAPI

```json
{
  "code": "00",
  "label": "00",
  "message": "success",
  "agreementId": "your agreementId",
  "contractNo": "our contractNo",
  "signUrl": "https://api.mch.weixin.qq.com/global/papay/contracts/login?os_..."
}
```

## Response — APP / Mini-Program

```json
{
  "code": "00",
  "label": "00",
  "message": "success",
  "agreementId": "your agreementId",
  "contractNo": "our contractNo",
  "signId": "xxxxxxxx"
}
```

| Parameter | Description |
|---|---|
| `code` | Return code. `00` = success; any other value indicates failure. |
| `label` | Return code label (mirrors `code`). |
| `message` | Human-readable status. `success` on success; failure reason on failure. |
| `agreementId` | Echo of request. |
| `contractNo` | Unique contract identifier issued by Nihaopay. Save this — it's the canonical key for subsequent calls. |
| `signUrl` | Redirect URL the user follows in their browser (WEB/H5/JSAPI). |
| `signId` | Signing ID the native app or Mini-Program passes to the WeChat SDK (APP/MINI_APP). |

## What happens next

1. User completes the signing flow in WeChat.
2. WeChat sends a signing-result callback to Nihaopay.
3. Nihaopay forwards a contract-status notification to your `notifyUrl` (see [Contract notifications](./contract-notifications.md)).
4. The contract is now in `Signed` state — eligible for [deductions](./initiate-deduction.md).

Until the notification arrives confirming `Signed`, treat the contract as `Processing`. Do **not** attempt a deduction against a contract that has not been confirmed as signed.
