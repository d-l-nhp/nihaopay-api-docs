---
id: payment-products/securepay/paypal-acdc
title: "PayPal ACDC Order Capture"
type: endpoint
product: securepay
tags:
  - payment
  - paypal
  - acdc
  - capture
  - two-step
summary: "POST /v1.2/transactions/paypal/capture/{transaction_id} — capture funds for a PayPal ACDC (Advanced Credit/Debit Card) order. Use after creating the order via SecurePay with payment_source=ACDC and the PayPal JS SDK. This is step 2 of a two-step PayPal flow."
related:
  - payment-products/securepay/standard
  - reference/ipn-mechanics
endpoint:
  method: POST
  path: /v1.2/transactions/paypal/capture/{transaction_id}
  response_content_types:
    - { type: "application/json" }
quirks:
  - "two-step_create_then_capture_with_paypal_js_sdk"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.nihaopay.com/v1.2/transactions/paypal/capture/{transaction_id}
```

Capture funds against a PayPal **ACDC** (Advanced Credit/Debit Card) order that was previously created via [SecurePay standard](./standard.md) with `payment_source=ACDC` and the PayPal JavaScript SDK on the front-end.

## When to use this endpoint

This is **step 2 of a 2-step flow**:

1. **Step 1 — Create order:** Your front-end loads the PayPal JS SDK, then calls [`POST /v1.2/transactions/securepay`](./standard.md) with `vendor=PayPal` and `payment_source=ACDC`. SecurePay returns an `orderId` you pass back into the PayPal SDK on the front-end. The customer enters card details into PayPal's hosted card fields.
2. **Step 2 — Capture (this endpoint):** Once the customer authorizes the order on the front-end (and the PayPal JS SDK signals success), your *backend* calls this endpoint to actually capture the funds.

The PayPal JS SDK pre-order flow is documented on PayPal's developer site under "Advanced Credit and Debit Card payments" / ACDC. Nihaopay's role is to broker the SecurePay creation and the capture step.

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/transactions/paypal/capture/{transaction_id} \
  -H "Authorization: Bearer <TOKEN>"
```

Where `{transaction_id}` is the `id` returned from the step-1 SecurePay response.

## Request parameters

| Property | Required | Description |
|---|---|---|
| `transaction_id` | Required (URL) | The Nihaopay transaction ID from the SecurePay ACDC creation step. |

There is no request body.

## Response

```json
{
  "paypal_order_id": "8033567205747094K",
  "paypal_capture_id": "0CW443673C1190047",
  "id": "20251215131749104834",
  "status": "success"
}
```

| Property | Description |
|---|---|
| `id` | Nihaopay transaction ID. |
| `paypal_order_id` | The PayPal order ID — useful for cross-referencing with PayPal's dashboard. |
| `paypal_capture_id` | The PayPal capture ID — receipts, refund references on PayPal's side. |
| `status` | `success` or `failure`. |
| `processor_response_code` | (Failure mode) Response code from PayPal or the card network. Useful for diagnosing declines. |

## Asynchronous response (IPN)

The IPN behavior matches SecurePay — see [IPN mechanics](../../07-reference/ipn-mechanics.md). For PayPal ACDC, the IPN fires on the *capture* (this endpoint), not the order-creation step.

## Why PayPal needs two steps

PayPal's ACDC flow runs the actual card-authorization step on the front-end through their JS SDK (so card data never touches your server — this is PCI-scope-reducing). The backend capture step is what tells PayPal "yes, settle these funds." This split lets you implement order review or fraud checks between authorization and capture.

If you want a one-step PayPal experience without using the PayPal JS SDK, just call SecurePay with `vendor=PayPal` and *omit* `payment_source=ACDC` — that uses PayPal's hosted checkout (redirect) flow and this capture endpoint is not needed.
