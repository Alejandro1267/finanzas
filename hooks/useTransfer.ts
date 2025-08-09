import { TransferDraft } from "@/schemas";
import { useAccountStore } from "@/store/useAccountStore";
import { Transfer, useTransferStore } from "@/store/useTransferStore";
import { Transaction } from "@/types";
import * as SQLite from 'expo-sqlite';
import { Alert } from "react-native";

export function useTransfer() {
  const { addTransfer: addTransferStore } = useTransferStore();
  const { accounts, updateAccountBalance } = useAccountStore();

  const isTransfer = (transaction: Transaction): transaction is Transfer & { type: "transfer" } => {
    return 'origin' in transaction || 'destination' in transaction;
  };

  const addTransfer = async (transfer: TransferDraft) => {
    // Validar que las cuentas existan
    const origin = accounts.find(acc => acc.id === transfer.origin);
    const destination = accounts.find(acc => acc.id === transfer.destination);

    if (!origin) {
      Alert.alert("Error", "Cuenta de origen no encontrada.");
      return;
    }

    if (!destination) {
      Alert.alert("Error", "Cuenta de destino no encontrada.");
      return;
    }

    // Validar que la cuenta de origen tenga suficiente saldo
    if (origin.balance < transfer.amount) {
      Alert.alert("Error", "Saldo insuficiente en la cuenta de origen.");
      return;
    }

    let db: SQLite.SQLiteDatabase | null = null;
    try {
      db = await SQLite.openDatabaseAsync("finanzas.db", { useNewConnection: true });

      await db.execAsync('BEGIN TRANSACTION');

      await db.runAsync(
        'INSERT INTO transfers (date, amount, description, origin, destination) VALUES (?, ?, ?, ?, ?)',
        [
          transfer.date,
          transfer.amount,
          transfer.description,
          transfer.origin,
          transfer.destination
        ]
      );

      // Obtener la transferencia recién insertada con su ID generado
      const insertedTransfer = await db.getFirstAsync(
        'SELECT * FROM transfers WHERE rowid = last_insert_rowid()'
      ) as Transfer;

      console.log("Transferencia insertada en DB:", insertedTransfer);

      // Crear la transferencia con ID único
      const newTransfer: Transfer = {
        id: insertedTransfer.id.toString(),
        date: insertedTransfer.date,
        amount: insertedTransfer.amount,
        description: insertedTransfer.description,
        origin: insertedTransfer.origin,
        destination: insertedTransfer.destination,
      };

      // Calcular nuevos balances
      const newOriginBalance = origin.balance - transfer.amount;
      const newDestinationBalance = destination.balance + transfer.amount;

      // Actualizar balances en la base de datos
      await db.runAsync(
        'UPDATE accounts SET balance = ? WHERE id = ?',
        [newOriginBalance, origin.id]
      );

      await db.runAsync(
        'UPDATE accounts SET balance = ? WHERE id = ?',
        [newDestinationBalance, destination.id]
      );

      // Confirmar transacción
      await db.execAsync('COMMIT');


      // Agregar transferencia al store
      addTransferStore(newTransfer);

      updateAccountBalance(origin.id, newOriginBalance);
      updateAccountBalance(destination.id, newDestinationBalance);

      console.log("Transferencia agregada:", transfer);
      console.log(`Balance actualizado - Origen: ${newOriginBalance}, Destino: ${newDestinationBalance}`);

    } catch (error) {
      console.error("Error adding transfer:", error);

      if (db) {
        try {
          await db.execAsync('ROLLBACK');
          console.log("Transacción revertida");
        } catch (rollbackError) {
          console.error("Error rolling back transaction:", rollbackError);
        }
      }

      Alert.alert("Error", "No se pudo procesar la transferencia.");
    } finally {
      if (db) {
        try {
          await db.closeAsync();
        } catch (closeError) {
          console.error("Error closing database:", closeError);
        }
      }
    }
  };

  return {
    isTransfer,
    addTransfer,
  }
}
