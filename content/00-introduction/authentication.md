---
id: introduction/authentication
title: "Authentication: Bearer Token"
type: concept
product: platform
tags:
  - auth
  - bearer
  - tms
  - aurfy
  - credentials
  - security
  - muskpay
  - cross-product-token
summary: "One bearer token authenticates every v1.2 request (HTTPS + Authorization: Bearer <TOKEN>) across both Nihaopay and MuskPay within an environment. Production TMS is split per product (tms.nihaopay.com, tms.muskpay.io); testing uses a single TMS at betatms.aurfy.com. Covers how to obtain, use, and rotate the token."
related:
  - introduction/introduction
  - error-handling/error-list
quirks:
  - unified_token_across_products
  - tms_aurfy_domain
  - 15_min_propagation_after_rotation
status: stable
last_reviewed: "2026-05-27"
---

## The header

Every request must include:

```
Authorization: Bearer <TOKEN>
```

Where `<TOKEN>` is the bearer token issued to your merchant account. Requests without this header (or with an invalid token) return [`401-301`](../06-error-handling/error-list.md): _Invalid merchant credentials provided._

| Header          | Required | Description                                 |
| --------------- | -------- | ------------------------------------------- |
| `Authorization` | Yes      | Auth type `Bearer` plus a TMS-issued token. |

## How to obtain the token

1. Log into your TMS:
   - **Production:** [`https://tms.nihaopay.com`](https://tms.nihaopay.com) (Nihaopay TMS) or [`https://tms.muskpay.io`](https://tms.muskpay.io) (MuskPay TMS) — both show the same merchant's bearer token.
   - **Testing:** [`https://betatms.aurfy.com`](https://betatms.aurfy.com).
2. Navigate to **Settings → Certificate**.
3. Copy the bearer token displayed for your merchant account.

The token is environment-specific but **product-unified** — one token covers both Nihaopay and CardPay (MuskPay) endpoints within a given environment:

- **Production tokens** authenticate against **both** `https://api.nihaopay.com` and `https://api.muskpay.io`. In production, the same token value is displayed in both `https://tms.nihaopay.com` (Nihaopay TMS) and `https://tms.muskpay.io` (MuskPay TMS) — the TMS dashboards and transaction data are split by product, but the auth credential is shared.
- **Testing tokens** are issued by the single testing TMS at `https://betatms.aurfy.com` and authenticate against `https://apitest.nihaopay.com` for both Nihaopay and CardPay endpoints. They are _not_ interchangeable with production tokens.

## What to protect

Three credentials are merchant-private and must never be shared or committed to source control:

- **Merchant ID**
- **Secret key** (used to derive new bearer tokens)
- **Bearer token** (used at request time)

If any of the three is compromised:

1. Regenerate the secret key in TMS.
2. A new bearer token is auto-generated from the new secret key.
3. **Allow ~15 minutes** for the new bearer token to propagate through the API edge before retrying authenticated calls.

## Sample request

```bash
curl https://api.nihaopay.com/v1.2/transactions \
  -H "Authorization: Bearer <TOKEN>"
```

## Token use beyond auth

The bearer token is also used in **IPN signature verification** — `MD5(TOKEN)` appears in the signed-message tail (see [IPN mechanics](../07-reference/ipn-mechanics.md)). This means: rotating the bearer token rotates your IPN signing key. If you're rotating in production, expect a window where in-flight IPNs are signed with the _old_ token and incoming requests authenticate with the _new_ one. Plan a brief overlap.

## Common failure modes

- **`401-301` immediately after rotation:** the new token hasn't propagated yet. Wait 15 minutes.
- **`401-301` with a token that "works locally":** you're probably hitting the wrong host (e.g. using a testing token against `api.nihaopay.com`).
- **`500-91 Signature error`** on IPN verification right after rotation: your IPN handler is still using the cached old token to compute `MD5(TOKEN)`. Reload or invalidate the cache.
