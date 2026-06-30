---
id: customs-declaration/declaration
title: "Customs Declaration: Submit"
type: endpoint
product: customs
tags:
  - customs
  - declaration
  - china
  - rmb-fen
  - cross-border
summary: "POST /v1.2/customs/declaration/{transaction_id} — declare a successful Nihaopay transaction to Chinese customs for cross-border e-commerce shipments. Supports UnionPay, AliPay, and WeChatPay-funded orders. All amounts in RMB fen (cents) — different unit from the rest of the API. Customer's Chinese national ID required."
related:
  - customs-declaration/declaration-query
  - customs-declaration/redeclaration
  - error-handling/error-list
endpoint:
  method: POST
  path: /v1.2/customs/declaration/{transaction_id}
  request_content_type: application/x-www-form-urlencoded
  response_content_types:
    - { type: "application/json" }
  amount_unit: rmb_fen
quirks:
  - "amount_unit_is_rmb_fen_not_currency_minor_unit"
  - "wechatpay_requires_contact_for_enablement"
  - "cert_no_capitalize_trailing_X"
status: stable
last_reviewed: "2026-05-26"
error_codes:
  - "402-100"
  - "402-101"
  - "402-102"
  - "402-103"
  - "402-104"
  - "402-105"
  - "402-106"
  - "402-107"
  - "402-108"
  - "402-109"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/customs/declaration/{transaction_id}
```

Submit a customs declaration for a Nihaopay transaction whose goods are being shipped directly to China from an international merchant. Required for cross-border e-commerce compliance.

Supports orders paid via **UnionPay**, **AliPay**, and **WeChatPay**. For WeChatPay specifically, **contact Nihaopay tech support** before using — WeChat customs declaration is gated by an enablement step.

## All amounts are in RMB fen (cents) — not currency minor units

This is **the** quirk to remember. Every other amount field in the API is in the *transaction currency's* minor unit. Customs declaration is different: `customs_amount`, `duty_amount`, `product_amount`, and `transport_amount` are all in **RMB fen** (1/100 of a yuan), regardless of the original transaction's settlement currency.

¥12.84 = `1284` in these fields.

The frontmatter declares `amount_unit: rmb_fen` so downstream tooling can flag this in retrieval results.

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/customs/declaration/20180529073648029764 \
  -H "Authorization: Bearer <TOKEN>" \
  -d request_no=20180529073648029702 \
  -d customs=ningbo \
  -d merchant_customs_code=4403169D3W \
  -d merchant_customs_name="财付通支付科技有限公司" \
  -d customs_amount=1284 \
  -d split=true \
  -d product_amount=1284 \
  -d transport_amount=0 \
  -d sub_order_id=20180529073648029701
```

## Request parameters

| Property | Required | Type | Description |
|---|---|---|---|
| `request_no` | Required | String(36) | Your unique request order number for this declaration. |
| `customs` | Required | String(64) | Customs office to declare to. One of the enum values — see [Customs offices](#customs-offices) below. |
| `merchant_customs_code` | Required | String(32) | The merchant's customs recordation number. |
| `merchant_customs_name` | Required | String(64) | The merchant's customs recordation name (Chinese name string). |
| `customs_amount` | Required | Int | Declaration amount in **RMB fen**. Cannot be empty if the order is split. |
| `duty_amount` | Optional | Int | Customs duty in **RMB fen**. Required by some customs offices. |
| `split` | Required | bool (default `true`) | Whether this is a splitting order. |
| `sub_order_id` | Required | String(64) | Merchant's sub-order number. |
| `product_amount` | Conditional | Int | Product value in **RMB fen**. Required when `split=true`. |
| `transport_amount` | Conditional | Int | Shipping cost in **RMB fen**. Required when `split=true`. |
| `cert_type` | Required | String(16) | Certification type. Only `ID_CARD` (Chinese Mainland ID) is supported. Default `ID_CARD`. |
| `cert_name` | Required | String(64) | Name as it appears on the certificate. |
| `cert_no` | Required | String(32) | Chinese mainland ID number. **Capitalize the trailing X** if present. |

## Customs offices

You can declare through any of the following customs offices. The full enum is mirrored in `_data/customs.yaml` with registration codes (where the spec provides them).

| Key | Office |
|---|---|
| `ZONGSHU` | General Administration of Customs |
| `BEIJING` | Beijing Customs |
| `HANGZHOU` | Hangzhou Customs |
| `NINGBO` | Ningbo Customs |
| `GUANGZHOU` | Guangzhou Customs |
| `GUANGZHOU_HUANGPU` | Guangzhou Huangpu Customs |
| `SHENZHEN` | Shenzhen Customs |
| `NANSHA` | Nansha Guo Jian |
| `ZHENGZHOU` | Zhengzhou Customs (Henan bonded logistics center) |
| `XINZHENG` | Xinzheng comprehensive free trade zone (Airport) |
| `CHONGQING` | Chongqing Customs |
| `SHANGHAI` | Shanghai Customs |
| `XIAN` | Xi'an Customs |
| `TIANJING` | Tianjin Customs *(spec uses TIANJING — keep the typo)* |
| `XIAMEN` | Xiamen Customs |

### Payment-provider customs registration

Each upstream payment provider (UnionPay, WeChatPay, AliPay) registers with Chinese customs under its own name and code:

- **UnionPay:** 中国银联股份有限公司 — code `312228034U`
- **WeChatPay:** 财付通支付科技有限公司 — code `4403169D3W`
- **AliPay:** 支付宝(中国)网络技术有限公司 — codes vary by customs office (`31226699S7` for ZONGSHU, SHANGHAI, NINGBO, ZHENGZHOU; `P460400005` for XINZHENG; etc. — see `_data/customs.yaml`).

## Response

```json
{
  "id": "20180529084416000000",
  "status": "pending",
  "transaction_id": "20180529073648029764",
  "pay_transaction_id": "201801112200137640450003544",
  "ver_dept": 2,
  "pay_code": "312226T001",
  "cert_check": "UNCHECKED"
}
```

| Property | Description |
|---|---|
| `id` | Serial number for the customs declaration, generated by Nihaopay. |
| `status` | `success`, `failure`, or `pending`. |
| `transaction_id` | Original transaction ID. |
| `pay_transaction_id` | Unique number assigned by the payment provider. |
| `ver_dept` | Verifying organization: `0`=UnionPay, `1`=NetsUnion, `2`=Other. |
| `pay_code` | Customs registration number of the payment provider. |
| `cert_check` | `SAME` (identity matched), `DIFFERENT` (mismatch), `UNCHECKED` (no purchaser identity provided). |

## Customs-specific error codes

In addition to the general error set, customs returns 10 codes specific to declaration (`402-100` through `402-109`). See [Error list](../06-error-handling/error-list.md) for the full table.

Common ones:

- **`402-101` Customs not supported** — the `customs` key isn't enabled for your merchant account or doesn't match the payment provider's registered offices.
- **`402-104` Split amount not correct** — `customs_amount ≠ product_amount + transport_amount + duty_amount` when `split=true`.
- **`402-106` Same customs declare once** — duplicate declaration for the same transaction.
- **`402-109` The declaration is not allowed for refunded orders** — refunded transactions cannot be declared (cancel any refunds first, or declare before refunding).

For status checks see [Declaration query](./declaration-query.md); for resubmissions see [Redeclaration](./redeclaration.md).
