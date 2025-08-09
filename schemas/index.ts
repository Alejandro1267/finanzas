import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  percentage: z.number(),
  balance: z.number(),
  color: z.string().min(1, "El color es requerido"),
});

export type AccountDraft = z.infer<typeof accountSchema>;

export const recordSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().min(0.01, "El importe debe ser mayor a 0"),
  description: z.string().min(1, "La descripción es requerida"),
  date: z.string().min(1, "La fecha es requerida"),
  account: z.string().min(1, "La cuenta es requerida"),
});

export type RecordDraft = z.infer<typeof recordSchema>;

export const transferSchema = z.object({
  amount: z.number().min(0.01, "El importe debe ser mayor a 0"),
  description: z.string(),
  date: z.string().min(1, "La fecha es requerida"),
  origin: z.string().min(1, "La cuenta origen es requerida"),
  destination: z.string().min(1, "La cuenta destino es requerida"),
});

export type TransferDraft = z.infer<typeof transferSchema>;