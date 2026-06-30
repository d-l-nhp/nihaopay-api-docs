---
id: payment-products/cardpay/authorize
title: "CardPay: Authorize a Credit Card"
type: endpoint
product: cardpay
tags:
  - cardpay
  - authorize
  - pci
  - muskpay
summary: "POST https://api.muskpay.io/v1.2/transactions/auth — authorize a credit-card charge without capturing funds. Visa / Master / JCB / Amex / Discover. Must follow up with /capture to settle (within 30 days, else the authorization auto-releases). PCI required."
related:
  - payment-products/cardpay/_overview
  - payment-products/cardpay/charge
  - payment-products/cardpay/capture
  - payment-products/cardpay/release
endpoint:
  method: POST
  path: /v1.2/transactions/auth
  request_content_type: application/x-www-form-urlencoded
  response_content_types:
    - { type: "application/json" }
quirks:
  - "muskpay_host_not_nihaopay"
  - "auth_auto_releases_after_30_days"
status: stable
last_reviewed: "2026-05-26"
---

## Definition

```
POST https://api.muskpay.io/v1.2/transactions/auth
```

Authorize a credit-card payment **without** capturing funds. The card issuer reserves the funds; merchant settles later via [Capture](./capture.md) (or cancels via [Release](./release.md)).

> **Auto-release after 30 days.** Authorizations not captured within 30 days are automatically released — re-authorize + capture to actually settle.

Vendors: Visa, Master, JCB, Amex, Discover.

## Sample request

```bash
curl https://api.muskpay.io/v1.2/transactions/auth \
  -H "Authorization: Bearer <TOKEN>" \
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

Same parameter set as [Charge](./charge.md). The differences are at the response level (no immediate capture) and in lifecycle (you must follow up with Capture or Release).

## Response

```json
{
  "id": "bn2345nb53454kjb",
  "status": "success",
  "amount": 110,
  "currency": "USD",
  "captured": false,
  "time": "2015-01-11T01:01:00Z",
  "reference": "jkh25jh1340fd09sg",
  "note": null
}
```

`captured: false` is the key signal that this is an authorization, not a settled charge.

| Property | Description |
|---|---|
| `id` | Transaction ID — use this for follow-up [Capture](./capture.md) / [Release](./release.md). |
| `status` | `success`, `failure`, or `pending`. |
| `amount` | Authorized amount in cents. |
| `currency` | `USD`. |
| `captured` | `false` for an authorization. |
| `time` | UTC timestamp. |
| `reference` | Echo. |
| `note` | Echo (or `null`). |

## Next steps

| If you want to | Call |
|---|---|
| Settle the auth and collect funds | [Capture](./capture.md) (within 30 days; ≤ auth amount) |
| Cancel the auth and free the funds | [Release](./release.md) |
| Do nothing | The auth auto-releases after 30 days |
