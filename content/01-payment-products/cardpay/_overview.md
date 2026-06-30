---
id: payment-products/cardpay/_overview
title: "CardPay (MuskPay) Overview"
type: overview
product: cardpay
tags:
  - cardpay
  - muskpay
  - pci
  - credit-card
  - card-encryption
  - test-host
  - ipn-ok
summary: "CardPay is MuskPay's credit-card product (Visa/Master/JCB/Amex/Discover, USD only). Production host: api.muskpay.io; testing shares apitest.nihaopay.com with Nihaopay under one unified bearer token. Direct flow needs PCI + RSA-OAEP-encrypted card data; gateway-hosted flow does not. MuskPay IPN handlers MUST print literal 'ok'. Test list returns mixed product rows without a vendor field."
related:
  - payment-products/cardpay/charge
  - payment-products/cardpay/authorize
  - payment-products/cardpay/gateway-checkout
  - reference/ipn-mechanics
quirks:
  - "single_test_host"
  - "unified_token"
  - "muskpay_ipn_ok_required"
  - "rsa_oaep_card_encryption"
  - "pci_required_for_direct_cardpay"
status: stable
last_reviewed: "2026-05-27"
---

## What CardPay covers

CardPay handles direct credit-card processing through the **MuskPay** backend:

- **Vendors:** Visa, Master, JCB, Amex, Discover.
- **Base URL:**
  - **Production:** `https://api.muskpay.io` (NOT `api.nihaopay.com`).
  - **Testing:** `https://apitest.nihaopay.com` — there is no `apitest.muskpay.io`. CardPay test traffic shares the host with Nihaopay test traffic; routing is by path. See [Testing](../../05-testing/testing.md) for the full asymmetry.
- **Currencies:** **USD only** in v1.2.
- **Authentication:** same Bearer-token mechanism as Nihaopay. One production token works against both `api.nihaopay.com` and `api.muskpay.io`; the same token value is displayed in both `tms.nihaopay.com` and `tms.muskpay.io`. What's split in production is the TMS UI and transaction data — not the auth credential. In testing, both products share `apitest.nihaopay.com` and one token from `betatms.aurfy.com`.

The Nihaopay v1.2 spec defers all credit-card flows to MuskPay; this is why the rest of the docs say "for credit card pay, please refer to MuskPay API Documentation."

## Two flow shapes

| Flow | PCI required? | Where customer enters card | Endpoint |
|---|---|---|---|
| **Direct CardPay** | ✅ Yes | Merchant's site collects card data, encrypts it client-side, then POSTs to MuskPay | [Charge](./charge.md) / [Authorize](./authorize.md) |
| **Gateway-Hosted** | ❌ No | MuskPay-hosted payment page (browser redirect) | [Gateway checkout](./gateway-checkout.md) |

The direct flow is for merchants with PCI compliance and a need for in-context card collection (e.g. a single-page checkout). The gateway-hosted flow is the right default for most merchants — no PCI scope on your side.

## Authorization-and-capture pattern

Direct CardPay supports the standard auth/capture pattern:

| Step | Endpoint |
|---|---|
| **Authorize only** (reserve funds, don't settle) | [Authorize](./authorize.md) |
| **Release** (cancel an authorization) | [Release](./release.md) |
| **Capture** (settle an authorization) | [Capture](./capture.md) |

> **Auto-release after 30 days.** Authorizations not captured within 30 days are automatically released — you'll need to re-auth + capture to settle.

## Card encryption (RSA/ECB/OAEPWithSHA-256AndMGF1Padding)

Direct CardPay requires `encrypted_card_data` — a base64'd RSA-OAEP-encrypted JSON blob of the card info:

```json
{"card_number":"4800012345655556","card_exp_month":"12","card_exp_year":"2025","card_cvv":"997"}
```

Encryption algorithm:

- **Cipher:** `RSA/ECB/OAEPWithSHA-256AndMGF1Padding`
- **OAEP digest:** SHA-256
- **OAEP MGF:** MGF1 with SHA-256
- **Key:** RSA public key obtained from TMS, alongside its `key_id` (passed in the request).
- **Output encoding:** base64 of the ciphertext bytes.

Reference Java snippet:

```java
final String encodedPublicKey = "MIIBIjAN...";   // RSA public key from TMS
final String cardData = "{\"card_number\":\"4800012345655556\",\"card_exp_month\":\"12\",\"card_exp_year\":\"2025\",\"card_cvv\":\"997\"}";

Cipher oaepFromInit = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
OAEPParameterSpec oaepParams = new OAEPParameterSpec("SHA-256", "MGF1",
                                                     new MGF1ParameterSpec("SHA-256"),
                                                     PSource.PSpecified.DEFAULT);
byte[] publicBytes = Base64.decodeBase64(encodedPublicKey);
X509EncodedKeySpec x509EncodedKeySpec = new X509EncodedKeySpec(publicBytes);
KeyFactory keyFactory = KeyFactory.getInstance("RSA");
PublicKey publicKey = keyFactory.generatePublic(x509EncodedKeySpec);
oaepFromInit.init(Cipher.ENCRYPT_MODE, publicKey, oaepParams);
byte[] bytes = oaepFromInit.doFinal(cardData.getBytes("UTF-8"));
String encrypted_card_data = Base64.encodeBase64String(bytes);
```

Equivalent Python:

```python
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes, serialization
import base64, json

public_key = serialization.load_pem_public_key(public_key_pem)
card_data = json.dumps({"card_number": "...", "card_exp_month": "12", "card_exp_year": "2025", "card_cvv": "997"})
ciphertext = public_key.encrypt(
    card_data.encode("utf-8"),
    padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None),
)
encrypted_card_data = base64.b64encode(ciphertext).decode("ascii")
```

## ⚠️ IPN handler MUST print literal `"ok"` (HTTP 200 is not enough)

This is the **single biggest MuskPay footgun** that doesn't exist on the Nihaopay side.

> After MuskPay POSTs the IPN to your `ipn_url`, your handler MUST **print** (i.e. write to the response body) the literal string `ok` — without quotes, without JSON wrapping. If your response body is anything else — including an empty body with an HTTP 200 — MuskPay treats the IPN as **failed** and keeps retrying.

Compare:

| Backend | What the IPN handler must return |
|---|---|
| Nihaopay | HTTP 200 (body ignored). |
| MuskPay | HTTP 200 **and** body must be the literal 2-byte string `ok`. |

In practice: have your handler always finish with `response.write("ok")` for MuskPay IPNs.

## Operations endpoints

MuskPay's operations endpoints — `/refund/`, `/transactions/{transaction_id}`, `/transactions/`, `/transactions/merchant/{reference}`, `/download/transactions`, `/billing`, `/accounts`, `/withdrawal/history`, `/withdrawal/detail/{withdrawal_id}` — are documented in MuskPay's own spec at [`docs.muskpay.io`](https://docs.muskpay.io). The paths happen to be identical to Nihaopay's, but the two products' documentation is independent.

**Data scope differs by environment:**

- **Production:** the MuskPay host `api.muskpay.io` returns CardPay-only data on these endpoints — your MuskPay transactions, accounts, refunds, and withdrawals. The Nihaopay host `api.nihaopay.com` returns its own product data on the same paths. The two hosts are completely separate data scopes.
- **Testing:** all calls go through the shared `apitest.nihaopay.com`, and the test backend is **unified** — `GET /v1.2/transactions/` returns both Nihaopay-product and CardPay transactions intermixed. The list response shape has no `vendor` field, so callers cannot tell from a list which product created each row; follow up with `GET /v1.2/transactions/merchant/{reference}` (which includes `vendor`) to disambiguate.

## API surface (CardPay-specific)

| Endpoint | Purpose |
|---|---|
| [Charge](./charge.md) | Direct card charge (PCI required). |
| [Authorize](./authorize.md) | Authorize without capturing. |
| [Release](./release.md) | Release a previously-authorized transaction. |
| [Capture](./capture.md) | Capture a previously-authorized transaction. |
| [Gateway checkout](./gateway-checkout.md) | Non-PCI redirect-based card payment. |

## Test cards

Real cards don't work in testing. POST CardPay charges to `https://apitest.nihaopay.com/v1.2/transactions/cardpay` (or the corresponding `/auth`, `/capture/{id}`, `/release/{id}`, `/cardpay/checkout` path) using the test cards below:

| Card | Number | CVV | EXP |
|---|---|---|---|
| Visa Credit Card 1 | `4012 0000 7777 7777` | `997` | `12/2025` |
| Visa Credit Card 2 | `4264 2815 6666 6664` | `997` | `12/2025` |
| Visa Credit Card 3 | `4761 7300 0000 0011` | `997` | `12/2025` |

These three Visa cards are CardPay-specific. Nihaopay's non-CardPay endpoints (SecurePay, In-Store, etc.) use a separate set of test cards (UnionPay / Visa / Mastercard / UnionPay Debit) — see [Testing](../../05-testing/testing.md) for that catalog plus the full test-environment overview (test TMS, test accounts for AliPay / WeChat / PayPal, environment differences).
