import { Record as RecordType } from "@/store/useRecordStore";
import { Transfer } from "@/store/useTransferStore";

export type ValidationErrors = Record<string, string>

export type Transaction = RecordType | (Transfer & { type: "transfer" });