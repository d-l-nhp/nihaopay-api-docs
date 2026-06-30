---
id: payment-products/cardpay/charge
title: "CardPay: Charge a Credit Card"
type: endpoint
product: cardpay
tags:
  - cardpay
  - charge
  - direct
  - pci
  - muskpay
summary: "POST https://api.muskpay.io/v1.2/transactions/cardpay — direct credit-card charge with RSA-OAEP-encrypted card data. Requires PCI compliance on the merchant side. Captures funds immediately (use authorize for auth-only). USD only; Visa/Master/JCB/Amex/Discover."
related:
  - payment-products/cardpay/_overview
  - payment-products/cardpay/authorize
  - payment-products/cardpay/gateway-checkout
endpoint:
  method: POST
  path: /v1.2/transactions/cardpay
  request_content_type: application/x-www-form-urlencoded
  response_content_types:
    - { type: "application/json" }
quirks:
  - "muskpay_host_not_nihaopay"
  - "ipn_handler_must_print_literal_ok"
  - "card_data_encrypted_with_rsa_oaep_sha256_mgf1"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.muskpay.io/v1.2/transactions/cardpay
```

> **MuskPay host** — not `api.nihaopay.com`. See [CardPay overview](./_overview.md).

Direct credit-card charge. Card data is RSA-OAEP-encrypted client-side; the encrypted blob plus billing/shipping addresses are POSTed to MuskPay. Funds are captured immediately. For auth-only flows, use [Authorize](./authorize.md) instead.

> **PCI compliance required** on the merchant side to use this endpoint. If your environment isn't PCI-certified, use [Gateway checkout](./gateway-checkout.md) instead — it shifts card collection to a MuskPay-hosted page.

## Sample request

```bash
curl https://api.muskpay.io/v1.2/transactions/cardpay \
  -d reference="order19852245687" \
  -d amount=100 \
  -d currency="USD" \
  -d key_id="c36b6531b1f354a170e679d5f0b126e63" \
  -d encrypted_card_data="BtxSAiAxxxxxNB833t0g==" \
  -d card_holder="Tim Smith" \
  -d phone_number="123-123-1234" \
  -d phone_country_code="1" \
  -d email="customer@domain.com" \
  -d website="http://mywebsite.com" \
  -d client_ip="180.167.25.154" \
  -d description="order desc" \
  -d note="some tips" \
  -d items[0].name="T-Shirt Test" \
  -d items[0].unitAmount=100 \
  -d items[0].quantity=1 \
  -d billing_address_first_name="Tim" \
  -d billing_address_last_name="Smith" \
  -d billing_address_line1="4699 Old Ironsides Dr, Suite 270" \
  -d billing_address_city="Santa Clara" \
  -d billing_address_state="CA" \
  -d billing_address_zip="95054" \
  -d billing_address_country="US" \
  -d shipping_address_first_name="Tim" \
  -d shipping_address_last_name="Smith" \
  -d shipping_address_line1="4699 Old Ironsides Dr, Suite 270" \
  -d shipping_address_city="Santa Clara" \
  -d shipping_address_state="CA" \
  -d shipping_address_zip="95054" \
  -d shipping_address_country="US"
```

## Request parameters

| Property | Required | Description |
|---|---|---|
| `reference` | Required | Alphanumeric, ≤30 chars, unique per transaction. |
| `currency` | Required | `USD`. |
| `amount` | Required | Positive integer in cents. Minimum USD: $1 (`amount=100`). |
| `key_id` | Required | The RSA key ID (find in TMS). |
| `encrypted_card_data` | Required | Base64'd RSA-OAEP-encrypted card-info JSON. See [Overview — Card encryption](./_overview.md#card-encryption-rsaecboaepwithsha-256andmgf1padding). |
| `card_holder` | Required | Cardholder name. |
| `phone_number` | Required | Cardholder phone. |
| `phone_country_code` | Required | Cardholder phone country code (ISO numeric). |
| `email` | Required | Cardholder contact email. |
| `website` | Required | Merchant trading website. |
| `client_ip` | Required | Customer IP. |
| `items` | Conditional | Order line items (bracket-form). |
| `description` | Optional | Arbitrary string, may appear on card charge. |
| `note` | Optional | Arbitrary note. |
| `billing_address_first_name` | Required | First name on the billing address. |
| `billing_address_middle_name` | Optional | Middle name. |
| `billing_address_last_name` | Required | Last name. |
| `billing_address_line1` | Required | Address line 1. |
| `billing_address_line2` | Optional | Address line 2. |
| `billing_address_city` | Required | City. |
| `billing_address_state` | Conditional | State/Province. |
| `billing_address_zip` | Required | Zip / postal code. |
| `billing_address_country` | Required | ISO-3166-1 alpha-2 country code. |
| `shipping_address_*` | Required (same shape as billing) | Shipping address. `middle_name` and `line2` optional, `state` conditional. |

## Response

```json
{
  "id": "bn2345nb53454kjb",
  "status": "success",
  "amount": 110,
  "currency": "USD",
  "captured": true,
  "time": "2015-01-11T01:01:00Z",
  "reference": "jkh25jh1340fd09sg",
  "note": null
}
```

| Property | Description |
|---|---|
| `id` | Transaction ID. |
| `status` | `success`, `failure`, or `pending`. |
| `amount` | Amount in cents. |
| `currency` | `USD`. |
| `captured` | `true` for a successful charge. |
| `time` | UTC timestamp. |
| `reference` | Echo. |
| `note` | Echo (or `null`). |

## Asynchronous response (IPN)

MuskPay POSTs the outcome to your `ipn_url`. **Your handler must respond with the literal string `ok`** — see [Overview — IPN handler must print literal `"ok"`](./_overview.md#-ipn-handler-must-print-literal-ok-http-200-is-not-enough).

Same signature scheme as Nihaopay IPN (`§4.4` sorted-key MD5). See [IPN mechanics](../../07-reference/ipn-mechanics.md).
