import { z } from "zod";

export const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  percentage: z.number(),
  balance: z.number(),
  color: z.string(),
});

export type AccountDraft = z.infer<typeof accountSchema>;

export const recordSchema = z.object({
//   id: z.string(),
  type: z.enum(["income", "expense"]),
  amount: z.number().min(1, "El importe debe ser mayor a 0"),
  description: z.string().min(1, "La descripción es requerida"),
  date: z.string().min(1, "La fecha es requerida"),
  account: z.string().min(1, "La cuenta es requerida"),
});

export type RecordDraft = z.infer<typeof recordSchema>;
