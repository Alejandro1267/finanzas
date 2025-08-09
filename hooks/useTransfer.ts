import { TransferDraft } from "@/schemas";
import { useAccountStore } from "@/store/useAccountStore";
import { Transfer, useTransferStore } from "@/store/useTransferStore";
import { Transaction } from "@/types";
import { Alert } from "react-native";

export function useTransfer() {
  const { addTransfer: addTransferStore } = useTransferStore();
  const { accounts, updateAccountBalance } = useAccountStore();

  const isTransfer = (transaction: Transaction): transaction is Transfer & { type: "transfer" } => {
    return 'originAccount' in transaction || 'destinationAccount' in transaction;
  };

  const addTransfer = (transfer: TransferDraft) => {
    // Validar que las cuentas existan
    const originAccount = accounts.find(acc => acc.id === transfer.originAccount);
    const destinationAccount = accounts.find(acc => acc.id === transfer.destinationAccount);

    if (!originAccount) {
      Alert.alert("Error", "Cuenta de origen no encontrada.");
      return;
    }

    if (!destinationAccount) {
      Alert.alert("Error", "Cuenta de destino no encontrada.");
      return;
    }

    // Validar que la cuenta de origen tenga suficiente saldo
    if (originAccount.balance < transfer.amount) {
      Alert.alert("Error", "Saldo insuficiente en la cuenta de origen.");
      return;
    }

    try {
      // Crear la transferencia con ID único
      const newTransfer: Transfer = {
        id: Date.now().toString(), // ID temporal hasta implementar SQLite
        date: transfer.date,
        amount: transfer.amount,
        description: transfer.description,
        originAccount: transfer.originAccount,
        destinationAccount: transfer.destinationAccount,
      };

      // Agregar transferencia al store
      addTransferStore(newTransfer);

      // Actualizar balances de las cuentas
      const newOriginBalance = originAccount.balance - transfer.amount;
      const newDestinationBalance = destinationAccount.balance + transfer.amount;

      updateAccountBalance(originAccount.id, newOriginBalance);
      updateAccountBalance(destinationAccount.id, newDestinationBalance);

      console.log("Transferencia agregada:", transfer);
      console.log(`Balance actualizado - Origen: ${newOriginBalance}, Destino: ${newDestinationBalance}`);

    } catch (error) {
      console.error("Error adding transfer:", error);
      Alert.alert("Error", "No se pudo procesar la transferencia.");
    }
  };

  return {
    isTransfer,
    addTransfer,
  }
}
