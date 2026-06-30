import { z } from "zod";
import { HttpMethod, Product } from "./frontmatter.js";

export const ErrorCategory = z.enum(["general", "customs"]);

export const ErrorCodeEntry = z
  .object({
    code: z.string().regex(/^[1-5]\d{2}-\d{2,3}$/),
    http_status: z.number().int().min(100).max(599),
    label: z.string().regex(/^\d{2,3}$/),
    message: z.string().min(1),
    category: ErrorCategory,
    notes: z.string().optional(),
  })
  .strict();
export type ErrorCodeEntry = z.infer<typeof ErrorCodeEntry>;

export const ErrorCodesFile = z.object({
  codes: z.array(ErrorCodeEntry).min(1),
});
export type ErrorCodesFile = z.infer<typeof ErrorCodesFile>;

export const EndpointDiscriminatorData = z
  .object({
    param: z.string().min(1),
    value: z.string().min(1),
  })
  .strict();

export const EndpointEntry = z
  .object({
    doc_id: z.string().regex(/^[a-z0-9][a-z0-9-]*(\/_?[a-z0-9][a-z0-9-]*)*$/),
    method: HttpMethod,
    path: z.string().regex(/^\/v1\.2\//),
    product: Product,
    discriminator: EndpointDiscriminatorData.optional(),
    amount_unit: z.enum(["currency_minor_unit", "rmb_fen"]).default("currency_minor_unit"),
    summary: z.string().min(10).max(400),
  })
  .strict();
export type EndpointEntry = z.infer<typeof EndpointEntry>;

export const EndpointsFile = z.object({
  endpoints: z.array(EndpointEntry).min(1),
});
export type EndpointsFile = z.infer<typeof EndpointsFile>;

export const CustomsEntry = z
  .object({
    key: z
      .string()
      .min(1)
      .regex(/^[A-Z_]+$/, "customs keys must be UPPER_SNAKE"),
    display_name: z.string().min(1),
    registration_code: z.string().nullable(),
    aliases: z.array(z.string()).optional(),
    spec_notes: z.string().optional(),
  })
  .strict();

export const PaymentProviderRegistration = z
  .object({
    vendor: z.string().min(1),
    name_zh: z.string().min(1),
    name_en: z.string().min(1),
    code: z.string().nullable(),
    spec_notes: z.string().optional(),
  })
  .strict();

export const EnumValueWithMeaning = z
  .object({
    value: z.union([z.string(), z.number()]),
    meaning: z.string(),
    spec_notes: z.string().optional(),
  })
  .strict();

export const CustomsFile = z.object({
  customs: z.array(CustomsEntry).min(1),
  payment_provider_registrations: z.array(PaymentProviderRegistration),
  ver_dept: z.array(EnumValueWithMeaning),
  cert_check: z.array(EnumValueWithMeaning),
});
export type CustomsFile = z.infer<typeof CustomsFile>;

export const EnumsFile = z.record(z.unknown()).refine((r) => Object.keys(r).length > 0, {
  message: "enums.yaml must contain at least one top-level enum definition",
});
export type EnumsFile = z.infer<typeof EnumsFile>;
