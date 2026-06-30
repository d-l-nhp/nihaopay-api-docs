---
id: error-handling/signature-errors
title: "Signature Errors (500-91): Causes and Recovery"
type: error-code
product: platform
tags:
  - errors
  - signature
  - ipn
  - troubleshooting
  - md5
summary: "When error 500-91 'Signature error' appears, it almost always means the IPN signature failed verification. This page documents the common root causes (sorting, encoding, token mismatch, null fields) and how to diagnose each."
related:
  - reference/ipn-mechanics
error_codes:
  - "500-91"
status: stable
last_reviewed: "2026-05-17"
---

## When you see this error

`500-91` (Signature error) is returned by Nihaopay when an IPN, callback, or signed-request signature doesn't match the expected value. It's the single most common payment-integration error after credential issues — and almost always caused by a subtle implementation bug rather than malicious tampering.

## The signature scheme (recap)

Most signatures use the canonical IPN scheme documented in [IPN mechanics](../07-reference/ipn-mechanics.md):

```
verify_sign = MD5( key1=value1 & key2=value2 & ... & keyN=valueN & MD5(TOKEN) )
```

If your implementation differs from this exact algorithm, you'll see 500-91 on every signed message.

## Common root causes (in rough order of frequency)

### 1. Sorting order

Pairs must be sorted by key **ascending, lexicographically**, before joining.

```
❌ status=success&amount=100&id=...     // wrong order — "status" sorts after "amount" alphabetically
✅ amount=100&id=...&status=success      // correct
```

**Diagnose:** print the message string just before MD5; verify keys are sorted.

### 2. Including null-valued keys

The spec says: **omit keys whose value is null**.

```
status=success&note=null&amount=2     // ❌ "null" is the string "null", not a null value
```

If the value is the literal string `"null"`, that's still a value — include it.
If the value is genuinely absent (`undefined`, missing from the payload), omit the key entirely.

**Diagnose:** decode the incoming form-encoded body and check whether the `note` (or other optional) field is literally "null" vs. missing.

### 3. URL-encoding the message

Some HTTP libraries automatically URL-encode form data on output. The signed message should use the **decoded** values:

```
sys_reserve={"vendor_id":"4200..."}   // ✅ decoded JSON
sys_reserve=%7B%22vendor_id...        // ❌ URL-encoded — wrong for signing
```

**Diagnose:** check whether you're hashing the wire bytes (URL-encoded) or the parsed form data (decoded). It should be the decoded form.

### 4. Token mismatch

The signature uses `MD5(your_merchant_token)` appended at the end. Two failure modes:

- **Wrong token**: using a test-environment token in production (or vice versa).
- **Token rotated**: a regenerated token doesn't propagate for 15 minutes per the spec. During the window, IPNs may be signed with the old or new token.

**Diagnose:** print `MD5(token)` and compare to a freshly-computed value from your TMS. Verify environment.

### 5. Charset

Spec says UTF-8 throughout. If your stack defaults to ISO-8859-1 (Java/Tomcat default) or another encoding, multi-byte characters in `description` or `note` will produce a different hash.

**Diagnose:** if the payload contains only ASCII, this isn't the issue. If it contains Chinese characters or other multi-byte UTF-8, force UTF-8 encoding at the byte-level before hashing.

### 6. Case sensitivity

MD5 output is lowercase per spec. If you uppercase the hash for comparison and your library produces lowercase (or vice versa), comparison fails.

**Diagnose:** print both sides of the comparison and verify the case matches. Use case-insensitive comparison to be safe.

### 7. Including `verify_sign` itself in the signed message

Exclude the `verify_sign` field from the input to the MD5 computation.

```
❌ amount=2&id=...&verify_sign=46072c81...&MD5(token)
✅ amount=2&id=...&MD5(token)
```

**Diagnose:** print the sorted-keys list; verify `verify_sign` is not in it.

## Other signature schemes (not 500-91 cases)

Two endpoints use **different** signature algorithms; verifying them with the canonical scheme will look like a 500-91-shaped bug but is actually an algorithm mismatch:

- **Auto Debit contract notifications** (§9.4) use `signature = MD5(body + '&' + MD5(token))` — a body-based scheme. See [IPN mechanics](../07-reference/ipn-mechanics.md) for the canonical-vs-variant split.
- **Profit Sharing callbacks** (§10.11) have no documented scheme in v1.2. Contact Nihaopay tech support.

If you're handling Auto Debit or Profit Sharing notifications and seeing signature mismatches, verify you're applying the right algorithm before chasing 500-91 root causes.

## Recovery flow

1. **Capture the failing IPN payload exactly as received** (raw bytes, not parsed structure).
2. **Compute the expected signature locally** using the canonical algorithm.
3. **Compare** with the `verify_sign` field in the payload.
4. **Print the intermediate string** that was MD5'd; eyeball-diff against expectations.
5. If still stuck, send the IPN payload (with merchant credentials redacted) to `tech_support@nihaopay.com`.

## Related

- [IPN mechanics](../07-reference/ipn-mechanics.md) — the full signature spec.
