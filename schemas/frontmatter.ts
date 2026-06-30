import { z } from "zod";

export const DocType = z.enum([
  "concept",
  "endpoint",
  "error-code",
  "guide",
  "reference",
  "overview",
]);
export type DocType = z.infer<typeof DocType>;

export const Product = z.enum([
  "securepay",
  "cardpay",
  "in-store",
  "customs",
  "auto-debit",
  "profit-sharing",
  "operations",
  "account",
  "platform",
]);
export type Product = z.infer<typeof Product>;

export const Status = z.enum(["draft", "stable", "deprecated"]);
export type Status = z.infer<typeof Status>;

export const HttpMethod = z.enum(["GET", "POST"]);
export type HttpMethod = z.infer<typeof HttpMethod>;

export const RequestContentType = z.enum([
  "application/x-www-form-urlencoded",
  "application/json",
  "multipart/form-data",
]);

export const ResponseContentTypeValue = z.enum([
  "application/json",
  "text/html",
  "text/plain",
  "text/csv",
]);

export const ResponseContentType = z
  .object({
    type: ResponseContentTypeValue,
    condition: z.string().optional(),
  })
  .strict();
export type ResponseContentType = z.infer<typeof ResponseContentType>;

export const EndpointDiscriminator = z
  .object({
    param: z.string().min(1),
    value: z.string().min(1),
  })
  .strict();
export type EndpointDiscriminator = z.infer<typeof EndpointDiscriminator>;

export const AmountUnit = z.enum(["currency_minor_unit", "rmb_fen"]);
export type AmountUnit = z.infer<typeof AmountUnit>;

export const SignatureScheme = z.enum([
  "ipn-md5-sorted-keys",
  "auto-debit-md5-body",
  "undocumented",
]);
export type SignatureScheme = z.infer<typeof SignatureScheme>;

export const EndpointBlock = z
  .object({
    method: HttpMethod,
    path: z.string().regex(/^\/v1\.2\//, "endpoint.path must start with /v1.2/"),
    auth: z.literal("bearer").default("bearer"),
    request_content_type: RequestContentType.optional(),
    response_content_types: z.array(ResponseContentType).min(1).optional(),
    /** tells apart endpoints that share a path, e.g. /v1.2/merchantqrcode. */
    discriminator: EndpointDiscriminator.optional(),
    /** defaults to currency_minor_unit; customs uses rmb_fen. */
    amount_unit: AmountUnit.default("currency_minor_unit"),
  })
  .strict();
export type EndpointBlock = z.infer<typeof EndpointBlock>;

const docIdRegex = /^[a-z0-9][a-z0-9-]*(\/_?[a-z0-9][a-z0-9-]*)*$/;

const errorCodeRegex = /^[1-5]\d{2}-\d{2,3}$/;

export const Frontmatter = z
  .object({
    id: z
      .string()
      .regex(
        docIdRegex,
        "id must be lowercase kebab path: lowercase letters, digits, hyphens, optional /-separated segments",
      ),
    title: z.string().min(3).max(120),
    type: DocType,
    product: Product,
    tags: z.array(z.string().min(1)).default([]),
    summary: z
      .string()
      .min(20, "summary must be at least 20 chars — it's the search-result hook")
      .max(400, "summary must be ≤400 chars — keep it tight"),
    related: z
      .array(z.string().regex(docIdRegex, "related entries must be valid doc_ids"))
      .default([]),
    endpoint: EndpointBlock.optional(),
    error_codes: z
      .array(
        z.string().regex(errorCodeRegex, "error codes must match HTTP-status + label, e.g. 400-23"),
      )
      .default([]),
    status: Status.default("draft"),
    last_reviewed: z
      .string()
      .date("last_reviewed must be a real ISO calendar date YYYY-MM-DD")
      .nullable()
      .default(null),
    signature_scheme: SignatureScheme.optional(),
    /** free-form tags for spec-derived quirks, e.g. "response_currency_lowercase". */
    quirks: z.array(z.string()).default([]),
    /**
     * true for pages documenting an API gap — an endpoint the spec mentions
     * but never actually specifies. skips the "must have endpoint block" rule.
     */
    gap: z.boolean().default(false),
  })
  .strict()
  .refine((fm) => fm.status !== "stable" || fm.last_reviewed !== null, {
    message: "status=stable requires last_reviewed to be set",
    path: ["last_reviewed"],
  })
  .refine((fm) => fm.status !== "stable" || fm.tags.length > 0, {
    message: "status=stable requires at least one tag (it's load-bearing for the search index)",
    path: ["tags"],
  })
  .refine((fm) => fm.type !== "endpoint" || fm.gap || fm.endpoint !== undefined, {
    message: "type=endpoint requires `endpoint` block (or gap=true)",
    path: ["endpoint"],
  })
  .refine((fm) => fm.type !== "error-code" || fm.error_codes.length > 0, {
    message: "type=error-code requires non-empty error_codes",
    path: ["error_codes"],
  });

export type Frontmatter = z.infer<typeof Frontmatter>;

/** sort key for stable doc ordering in the index. */
export function docIdSortKey(id: string): string {
  return id.toLowerCase();
}

/** splits a doc_id into its path segments ("a/b/c" → ["a", "b", "c"]). */
export function docIdSegments(id: string): string[] {
  return id.split("/");
}

/** turns a doc_id into a breadcrumb string. */
export function breadcrumb(id: string, separator = " › "): string {
  return docIdSegments(id)
    .map((seg) => seg.replace(/-/g, " "))
    .join(separator);
}
