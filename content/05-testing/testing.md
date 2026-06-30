---
id: testing/testing
title: "Testing: Environments, Test Cards, Test Accounts"
type: guide
product: platform
tags:
  - testing
  - sandbox
  - test-cards
  - test-accounts
  - test-host
  - muskpay
  - cardpay
  - aurfy
  - betatms
summary: "Single test host (apitest.nihaopay.com) serves both Nihaopay and MuskPay/CardPay traffic — there is no apitest.muskpay.io. The unified bearer token issued from the testing TMS at betatms.aurfy.com (note the aurfy.com domain) authenticates against both product families. Lists test cards split by endpoint family, plus AliPay/PayPal sandbox accounts and the WeChat real-money approach."
related:
  - introduction/introduction
  - introduction/authentication
  - payment-products/cardpay/_overview
quirks:
  - "single_test_host"
  - "tms_aurfy_domain"
  - "unified_token_across_products"
status: stable
last_reviewed: "2026-05-27"
---

## Two environments

| Environment | Nihaopay API | MuskPay (CardPay) API | Nihaopay TMS | MuskPay TMS |
|---|---|---|---|---|
| **Production** | `https://api.nihaopay.com` | `https://api.muskpay.io` | `https://tms.nihaopay.com` | `https://tms.muskpay.io` |
| **Testing** | `https://apitest.nihaopay.com` | `https://apitest.nihaopay.com` *(same host)* | `https://betatms.aurfy.com` | `https://betatms.aurfy.com` *(same host)* |

> **The Nihaopay/MuskPay host split exists in production only.** In production, each product has its own API host (`api.nihaopay.com` vs `api.muskpay.io`) and its own TMS (`tms.nihaopay.com` vs `tms.muskpay.io`). In testing, both products collapse to single shared hosts — `apitest.nihaopay.com` for the API and `betatms.aurfy.com` for the TMS. **There is no `apitest.muskpay.io`** — all CardPay test traffic routes through `apitest.nihaopay.com`. Paths under `/v1.2/...` are identical to production; only the host changes.
>
> The MuskPay v1.2 spec itself confirms the shared test host: its Gateway Hosted Payment sample response returns a `redirect_url` of `https://apitest.nihaopay.com/v1.2/cardpay/checkout/...`, not a `muskpay.io` URL.

> **The testing TMS lives on a different domain** (`aurfy.com`, not `nihaopay.com` or `muskpay.io`). Bookmark `https://betatms.aurfy.com` directly; you won't find it by searching the Nihaopay or MuskPay domain.

The two environments have **identical APIs** — same paths, same shapes — except:

- No real money moves in testing.
- Bank-issued cards do **not** work in testing. Use the test cards below.
- **Production tokens don't work against the testing host, and vice versa.** Get a separate token from the testing TMS.
- **The bearer token is unified across products in both environments — only the TMS dashboard is split in production.** Your testing token (from `betatms.aurfy.com`) authenticates against `apitest.nihaopay.com` for both Nihaopay and CardPay (MuskPay) endpoints. Your production token authenticates against **both** `api.nihaopay.com` and `api.muskpay.io`; the same token value is displayed in both `tms.nihaopay.com` and `tms.muskpay.io`. What's actually segregated in production is the TMS UI and TMS data (transaction history, merchant configuration), not the auth credential.

## How to get a test account

Apply for a test account at [`https://nihaopay.com/apply`](https://nihaopay.com/apply) (also linked from the docs site footer as "Apply for Test Account"). Once approved, you'll receive credentials for the testing TMS at `https://betatms.aurfy.com`.

## Test cards

Test cards are split by **endpoint family**, not by host:

- **Non-CardPay endpoints** (SecurePay, In-Store QR, Auto Debit, etc.) accept the first set of cards below.
- **CardPay endpoints** route to the MuskPay backend and require the second set:
  - `POST /v1.2/transactions/cardpay` (charge)
  - `POST /v1.2/transactions/auth` (authorize)
  - `POST /v1.2/transactions/capture/{transaction_id}`
  - `POST /v1.2/transactions/release/{transaction_id}`
  - `POST /v1.2/cardpay/checkout` (gateway-hosted)

In the **test environment**, both groups POST to the same host (`apitest.nihaopay.com`); only the path determines which backend handles the card. In **production**, the split is visible because the hosts diverge (`api.nihaopay.com` for non-CardPay, `api.muskpay.io` for CardPay), but the principle is identical.

### Cards for non-CardPay endpoints

#### UnionPay Credit Card 1

| Field | Value |
|---|---|
| Card Number | `6250 9470 0000 0014` |
| CVV | `123` |
| EXP | `12/2033` |
| Phone # | `852-11112222` |
| Verification Code | `111111` |

#### Visa Credit Card (Test approval)

| Field | Value |
|---|---|
| Card Number | `4111 1111 1111 1111` |
| CVV | `123` |
| EXP | `12/2023` |

#### Visa Credit Card (Test wrong expiration)

| Field | Value |
|---|---|
| Card Number | `4387 7511 1111 1046` |
| CVV | `123` |
| EXP | `12/2023` |

#### Mastercard Credit Card (Test approval)

| Field | Value |
|---|---|
| Card Number | `5454 5454 5454 5454` |
| CVV | `123` |
| EXP | `12/2023` |

#### Mastercard Credit Card (Test wrong expiration)

| Field | Value |
|---|---|
| Card Number | `5442 9811 1111 1049` |
| CVV | `123` |
| EXP | `12/2023` |

#### UnionPay Debit Card

| Field | Value |
|---|---|
| Card Number | `6226 0900 0000 0048` |
| PIN | `123456` |
| Phone # | `1810000000` |
| Verification Code | `111111` |

### Cards for CardPay endpoints (MuskPay backend)

| Card | Number | CVV | EXP |
|---|---|---|---|
| Visa Credit Card 1 | `4012 0000 7777 7777` | `997` | `12/2025` |
| Visa Credit Card 2 | `4264 2815 6666 6664` | `997` | `12/2025` |
| Visa Credit Card 3 | `4761 7300 0000 0011` | `997` | `12/2025` |

See also [CardPay overview](../01-payment-products/cardpay/_overview.md) for the broader MuskPay testing context.

## AliPay Test Account

| Field | Value |
|---|---|
| Account | `forex_1701852082070@alitest.com` |
| Login password | `111111` |
| Payment password on cashier page | `111111` |

## WeChatPay Test Info

Nihaopay does **not** provide a WeChat test account. To simulate transactions, use your **real WeChat account** with small amounts; once successful, immediately call [Refund](../03-operations/refund.md) to return the money.

> Keep test amounts small.

## PayPal Test Account

| Field | Value |
|---|---|
| Account | `sb-s47aho8657191@personal.example.com` |
| Login password | `J^Fby/5@` |

This is a PayPal sandbox personal account — works against PayPal's sandbox via Nihaopay's testing host.

## Common testing pitfalls

- **`401-301` Invalid merchant credentials provided** — you're probably hitting the wrong host. Production tokens fail against `apitest.nihaopay.com` and vice versa.
- **Test cards rejected with "card error"** — the test card might be expiration-locked (some test cards' `EXP` field is in the past — they're meant to *fail* for testing wrong-expiration paths).
- **WeChat real-money testing** — easy to forget to refund. Set a calendar reminder, or wrap it in a script that auto-refunds within a few seconds.
