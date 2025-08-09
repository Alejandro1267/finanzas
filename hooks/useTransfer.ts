import { Transfer } from "@/store/useTransferStore";
import { Transaction } from "@/types";

export function useTransfer() {
  const isTransfer = (transaction: Transaction): transaction is Transfer & { type: "transfer" } => {
    return 'originAccount' in transaction || 'destinationAccount' in transaction;
  };

  return {
    isTransfer
  }
}
