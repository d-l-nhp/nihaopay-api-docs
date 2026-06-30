---
id: reference/parameters-description
title: "Common Request Parameters"
type: reference
product: platform
tags:
  - parameters
  - amount
  - currency
  - items
  - reference
  - sys_reserve
  - vendor
  - terminal
  - callback
summary: "Reference for parameters that appear across multiple Nihaopay v1.2 endpoints: amount/currency minor units, rmb_amount foreign-currency pricing, the items[] order-line shape, reference uniqueness, vendor + terminal enums, callback_url accept semantics, and sys_reserve passthrough data."
related:
  - introduction/introduction
  - reference/ipn-mechanics
  - payment-products/securepay/standard
status: stable
last_reviewed: "2026-05-26"
---

## 1. `amount`

Positive integer expressed in the **currency's minor unit**. There is no decimal point.

| Currency | Minor unit | Example: 100.00 in this currency |
|---|---|---|
| USD | cents (1/100) | `amount=10000` |
| JPY | yen (1/1) — zero decimals | `amount=100` |
| HKD, EUR, CAD, GBP, SGD, AUD | cents (1/100) | `amount=10000` |

`amount` **must be greater than 0**. Customs declaration is the one exception to the "currency minor unit" rule — see `customs_amount` in the [Customs declaration](../02-customs-declaration/declaration.md) page, which uses **RMB fen** (cents).

## 2. `currency`

3-letter ISO 4217 currency code. Currently supported:

| Currency | Code | Minor unit |
|---|---|---|
| US Dollar | `USD` | 2 |
| Japanese Yen | `JPY` | 0 |
| Hong Kong Dollar | `HKD` | 2 |
| Euro | `EUR` | 2 |
| Canadian Dollar | `CAD` | 2 |
| Pound Sterling | `GBP` | 2 |
| Singapore Dollar | `SGD` | 2 |
| Australian Dollar | `AUD` | 2 |

> **Refund currency rule:** a refund's `currency` must match the original transaction's `currency`. Mismatch returns [`409-64`](../06-error-handling/error-list.md).

## 3. `rmb_amount` (RMB pricing)

Use `rmb_amount` **instead of** `amount` when you want to price the order in RMB. Nihaopay converts to your settlement currency at payment time and reports back the settled amount.

| Request | IPN response | Meaning |
|---|---|---|
| `rmb_amount=10000`, `currency=USD` | `rmb_amount=10000`, `amount=1441`, `currency=USD` | Order is ¥100, settled as $14.41. |
| `amount=10000`, `currency=USD` | `amount=10000`, `currency=USD` | Order and settlement both $100. |

**Mutual exclusion:** `amount` and `rmb_amount` are mutually exclusive — don't set both. When `rmb_amount` is used, `currency` is interpreted as the **settlement** currency.

## 4. `reference`

Alphanumeric string, **up to 30 characters**, **unique per transaction** for your merchant account. This is the field you use to correlate IPN payloads back to your records, since the IPN may arrive before (or instead of) the browser callback.

Submitting a duplicate `reference` returns [`400-31`](../06-error-handling/error-list.md): *Transaction reference number must be unique. Please re-submit.*

## 5. `items[]` (order line items)

Array of product objects, sent as **bracket-form URL-encoded** fields:

```
items[0][name]=T-Shirt&items[0][unitAmount]=500&items[0][quantity]=1&items[1][name]=Hat&items[1][unitAmount]=500&items[1][quantity]=2
```

(Some endpoint examples use `items[0].name=T-Shirt` — dot-form. Both forms are accepted; bracket-form is the spec-canonical encoding.)

| Field | Required | Description |
|---|---|---|
| `items[n].name` | Yes | Product name. |
| `items[n].unitAmount` | Yes | Unit price in the order currency's minor unit. |
| `items[n].quantity` | Yes | Quantity. |

**Sum-check:** the request `amount` must equal `Σ (unitAmount × quantity)`. Mismatch is a request error.

## 6. `vendor`

Identifies the upstream payment provider. Vendor enums vary by endpoint:

| Endpoint family | Allowed `vendor` values |
|---|---|
| SecurePay standard | `unionpay`, `alipay`, `wechatpay`, `PayPal` (note capitalization) |
| SecurePay QR / In-App | `alipay`, `wechatpay`, `unionpay` |
| AliPay A+ | (implicit — endpoint is AliPay-only) |
| In-Store Scan QR | `alipay`, `unionpay`, `wechatpay` |
| MuskPay CardPay | `Visa`, `Master`, `JCB`, `Amex`, `Discover` |

> **Quirk:** Nihaopay accepts `PayPal` with **capitalized P's** specifically. Other Nihaopay vendors are lowercase. The spec is genuinely inconsistent — don't try to "normalize" the casing.

## 7. `callback_url` and `ipn_url`

Both URLs **must be publicly reachable**. Intranet addresses (`localhost`, `127.0.0.1`, `10.x`, `192.168.x`, etc.) will be rejected as misconfigured.

- `ipn_url` — receives the async POST with transaction outcome. **Authoritative** source of payment status. See [IPN mechanics](./ipn-mechanics.md).
- `callback_url` — the browser is redirected here after the customer completes payment.

### The `accept` query parameter on `callback_url`

**By default, only successful payments redirect to `callback_url`.** To also receive failure or cancellation redirects, append an `accept=` query parameter to the URL **itself** (not as a separate request param):

```
callback_url=https://your-site.com/cb?accept=pending,failure
```

Without this, failed/cancelled flows just sit on the vendor's error page — easy to miss and produces silent integration bugs.

## 8. `terminal`

| Value | Meaning |
|---|---|
| `ONLINE` | Desktop browser (default) |
| `WAP` | Mobile browser |
| `APP` | Native mobile app (AliPay A+ only) |
| `MICRO` | Mini-program (AliPay A+ only) |

Not every endpoint accepts all four — see the endpoint-specific request tables.

## 9. `sys_reserve` (system-reserved JSON-in-string)

System passthrough field for vendor metadata. Format: **a JSON-encoded string**, not a nested JSON object:

```
sys_reserve = ["vendor_id":"4200000117201806013734875340"]
```

(The spec uses square-bracket sample syntax; the actual value is a stringified JSON object: `'{"vendor_id":"..."}'`.)

Currently the only documented key:

| Key | Description |
|---|---|
| `vendor_id` | Vendor's transaction ID — usually printed on the customer's payment receipt. |

When verifying an IPN signature, `sys_reserve` is treated as a single string value (not a parsed object) for the sorted-key concatenation.
