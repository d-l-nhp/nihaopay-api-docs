---
id: payment-products/cardpay/gateway-checkout
title: "CardPay: Gateway-Hosted Checkout"
type: endpoint
product: cardpay
tags:
  - cardpay
  - gateway
  - hosted
  - non-pci
  - redirect
  - muskpay
summary: "POST https://api.muskpay.io/v1.2/cardpay/checkout — gateway-hosted credit-card payment. Customer is redirected to a MuskPay-hosted page to enter card details. No PCI scope on the merchant side. Returns redirect_url synchronously; transaction outcome arrives at ipn_url."
related:
  - payment-products/cardpay/_overview
  - payment-products/cardpay/charge
  - reference/ipn-mechanics
endpoint:
  method: POST
  path: /v1.2/cardpay/checkout
  request_content_type: application/x-www-form-urlencoded
  response_content_types:
    - { type: "application/json" }
quirks:
  - "muskpay_host_not_nihaopay"
  - "non_pci_alternative_to_direct_cardpay"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.muskpay.io/v1.2/cardpay/checkout
```

Gateway-hosted credit-card payment. Your backend POSTs the order details; MuskPay returns a `redirect_url`. Send the customer's browser there; they enter card details on a MuskPay-hosted page; on success they're redirected to your `callback_url`. The IPN to `ipn_url` is the authoritative source of the outcome.

> **Non-PCI alternative.** Card data is collected by MuskPay, so your environment doesn't need PCI compliance. The flip side: you lose in-context control of the card form — the customer leaves your site.

## Sample request

```bash
curl https://api.muskpay.io/v1.2/cardpay/checkout \
  -H "Authorization: Bearer <TOKEN>" \
  -d reference="order19852245687" \
  -d amount=100 \
  -d currency="USD" \
  -d website="http://mywebsite.com" \
  -d ipn_url="http://website.com/ipn" \
  -d description="description" \
  -d client_ip="180.167.25.154" \
  -d note="note" \
  -d shipping_address_first_name="Tim" \
  -d shipping_address_last_name="Smith" \
  -d shipping_address_line1="4699 Old Ironsides Dr, Suite 270" \
  -d shipping_address_city="Santa Clara" \
  -d shipping_address_zip="95054" \
  -d shipping_address_country="US"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `reference` | Required | Alphanumeric, ≤30 chars, unique. |
| `currency` | Required | `USD`. |
| `amount` | Required | Positive integer in cents. |
| `website` | Required | Merchant trading website. |
| `ipn_url` | Required | URL to receive async transaction outcome. |
| `callback_url` | Required | URL the browser is redirected to after payment. |
| `description` | Optional | String shown on card charge. |
| `note` | Optional | Arbitrary note. |
| `client_ip` | Required | Customer IP. |
| `items` | Conditional | Order line items. |
| `shipping_address_first_name` | Required | First name. |
| `shipping_address_middle_name` | Optional | Middle name. |
| `shipping_address_last_name` | Required | Last name. |
| `shipping_address_line1` | Required | Address line 1. |
| `shipping_address_line2` | Optional | Address line 2. |
| `shipping_address_city` | Required | City. |
| `shipping_address_state` | Conditional | State/Province. |
| `shipping_address_zip` | Required | Zip / postal code. |
| `shipping_address_country` | Required | ISO-3166-1 alpha-2. |

(No `card_*`, no `key_id`, no `encrypted_card_data`, no billing address — those are collected on the MuskPay-hosted page.)

## Response

```json
{
  "redirect_url": "https://apitest.nihaopay.com/v1.2/cardpay/checkout/2010..."
}
```

| Property | Description |
|---|---|
| `redirect_url` | URL to redirect the customer's browser to. The hosted page collects card data and processes the payment. |

## Asynchronous response (IPN)

After payment, MuskPay POSTs the outcome to your `ipn_url`. **Your handler must respond with the literal string `ok`** — see [Overview — IPN handler must print literal `"ok"`](./_overview.md#-ipn-handler-must-print-literal-ok-http-200-is-not-enough).

Signature scheme: same as Nihaopay's `§4.4` IPN (sorted-key MD5). See [IPN mechanics](../../07-reference/ipn-mechanics.md).
