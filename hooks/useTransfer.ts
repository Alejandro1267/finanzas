import { TransferDraft } from "@/schemas";
import { useAccountStore } from "@/store/useAccountStore";
import { useRecordStore } from "@/store/useRecordStore";
import { Transfer, useTransferStore } from "@/store/useTransferStore";
import { Transaction } from "@/types";
import * as SQLite from 'expo-sqlite';
import { Alert } from "react-native";

export function useTransfer() {
  const { addTransfer: addTransferStore, editTransfer: editTransferStore, transfers, deleteTransfer: deleteTransferStore } = useTransferStore();
  const { setIsLoading } = useRecordStore();
  const { accounts, updateAccountBalance } = useAccountStore();

  const isTransfer = (transaction: Transaction): transaction is Transfer & { type: "transfer" } => {
    return 'origin' in transaction || 'destination' in transaction;
  };

  const addTransfer = async (transfer: TransferDraft): Promise<boolean> => {
    setIsLoading(true)
    // Validar que las cuentas existan
    const origin = accounts.find(acc => acc.id === transfer.origin);
    const destination = accounts.find(acc => acc.id === transfer.destination);

    if (!origin) {
      Alert.alert("Error", "Cuenta de origen no encontrada.");
      setIsLoading(false)
      return false;
    }

    if (!destination) {
      Alert.alert("Error", "Cuenta de destino no encontrada.");
      setIsLoading(false)
      return false;
    }

    // Validar que la cuenta de origen tenga suficiente saldo
    if (origin.balance < transfer.amount) {
      Alert.alert("Error", "Saldo insuficiente en la cuenta de origen.");
      setIsLoading(false)
      return false;
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

      return true;
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
      return false;
    } finally {
      setIsLoading(false)
      if (db) {
        try {
          await db.closeAsync();
        } catch (closeError) {
          console.error("Error closing database:", closeError);
        }
      }
    }
  };

  const editTransfer = async (id: string, transfer: TransferDraft): Promise<boolean> => {
    setIsLoading(true)
    const originalTransfer = transfers.find(t => t.id === id);

    if (!originalTransfer) {
      Alert.alert("Error", "Transferencia no encontrada.");
      setIsLoading(false)
      return false;
    }

    const newOrigin = accounts.find(acc => acc.id === transfer.origin);
    const newDestination = accounts.find(acc => acc.id === transfer.destination);

    if (!newOrigin) {
      Alert.alert("Error", "Cuenta de origen no encontrada.");
      setIsLoading(false)
      return false;
    }

    if (!newDestination) {
      Alert.alert("Error", "Cuenta de destino no encontrada.");
      setIsLoading(false)
      return false;
    }

    let db: SQLite.SQLiteDatabase | null = null;
    try {
      db = await SQLite.openDatabaseAsync("finanzas.db", { useNewConnection: true });

      // Iniciar transacción
      await db.execAsync('BEGIN TRANSACTION');

      // Revertir el efecto de la transferencia original
      const originalOrigin = accounts.find(acc => acc.id === originalTransfer.origin);
      const originalDestination = accounts.find(acc => acc.id === originalTransfer.destination);

      if (!originalOrigin || !originalDestination) {
        Alert.alert("Error", "Cuentas originales no encontradas.");
        setIsLoading(false)
        return false;
      }

      // if (originalOrigin && originalDestination) {
        // Revertir balances originales
      const revertedOriginBalance = originalOrigin.balance + originalTransfer.amount;
      const revertedDestinationBalance = originalDestination.balance - originalTransfer.amount;
      
      updateAccountBalance(originalOrigin.id, revertedOriginBalance);
      updateAccountBalance(originalDestination.id, revertedDestinationBalance);
      // }

      // Validar que la nueva cuenta de origen tenga suficiente saldo (después de revertir)
      const currentOriginBalance = originalOrigin?.id === newOrigin.id 
        ? newOrigin.balance + originalTransfer.amount  // Si es la misma cuenta, usar balance revertido
        : newOrigin.balance;

      if (currentOriginBalance < transfer.amount) {
        // Si no hay suficiente saldo, revertir los cambios y mostrar error
        // if (originalOrigin && originalDestination) {
        updateAccountBalance(originalOrigin.id, originalOrigin.balance);
        updateAccountBalance(originalDestination.id, originalDestination.balance);
        // }
        Alert.alert("Error", "Saldo insuficiente en la cuenta de origen.");
        setIsLoading(false)
        return false;
      }

      // Aplicar la nueva transferencia
      const newOriginBalance = currentOriginBalance - transfer.amount;
      const newDestinationBalance = (originalDestination?.id === newDestination.id 
        ? newDestination.balance - originalTransfer.amount  // Si es la misma cuenta, usar balance revertido
        : newDestination.balance) + transfer.amount;

      // Actualizar en la base de datos
      await db.runAsync('UPDATE transfers SET date = ?, amount = ?, description = ?, origin = ?, destination = ? WHERE id = ?', [
        transfer.date,
        transfer.amount,
        transfer.description,
        transfer.origin,
        transfer.destination,
        id
      ]);

      // Actualizar balances de las cuentas en la base de datos
      // Primero actualizar las cuentas originales (revertir efectos)
      // if (originalOrigin) {
        // const revertedOriginBalance = originalOrigin.balance + originalTransfer.amount;
        await db.runAsync(
          'UPDATE accounts SET balance = ? WHERE id = ?',
          [revertedOriginBalance, originalOrigin.id]
        );
      // }

      // if (originalDestination) {
        // const revertedDestinationBalance = originalDestination.balance - originalTransfer.amount;
        await db.runAsync(
          'UPDATE accounts SET balance = ? WHERE id = ?',
          [revertedDestinationBalance, originalDestination.id]
        );
      // }

      // Luego actualizar las nuevas cuentas (aplicar nueva transferencia)
      await db.runAsync(
        'UPDATE accounts SET balance = ? WHERE id = ?',
        [newOriginBalance, newOrigin.id]
      );

      await db.runAsync(
        'UPDATE accounts SET balance = ? WHERE id = ?',
        [newDestinationBalance, newDestination.id]
      );

      // Confirmar transacción
      await db.execAsync('COMMIT');

      updateAccountBalance(newOrigin.id, newOriginBalance);
      updateAccountBalance(newDestination.id, newDestinationBalance);

      // Crear la transferencia actualizada
      const editedTransfer: Transfer = {
        id: id,
        date: transfer.date,
        amount: transfer.amount,
        description: transfer.description,
        origin: transfer.origin,
        destination: transfer.destination,
      };

      // Actualizar en el store
      editTransferStore(id, editedTransfer);

      console.log("Transferencia editada:", editedTransfer);
      console.log(`Nuevos balances - Origen: ${newOriginBalance}, Destino: ${newDestinationBalance}`);

      return true;
    } catch (error) {
      console.error("Error editing transfer:", error);

      // Revertir transacción en caso de error
      if (db) {
        try {
          await db.execAsync('ROLLBACK');
          console.log("🔄 Transacción revertida debido al error");
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
      }

      Alert.alert("Error", "No se pudo editar la transferencia.");
      return false;
    } finally {
      setIsLoading(false)
      if (db) {
        try {
          await db.closeAsync();
        } catch (closeError) {
          console.error("Error closing database:", closeError);
        }
      }
    }
  };

  const deleteTransfer = async (id: string) => {
    setIsLoading(true)
    // Buscar la transferencia a eliminar
    const transferToDelete = transfers.find(t => t.id === id);
    
    if (!transferToDelete) {
      Alert.alert("Error", "Transferencia no encontrada.");
      setIsLoading(false)
      return;
    }

    // Buscar las cuentas afectadas
    const originAccount = accounts.find(acc => acc.id === transferToDelete.origin);
    const destinationAccount = accounts.find(acc => acc.id === transferToDelete.destination);

    if (!originAccount || !destinationAccount) {
      Alert.alert("Error", "No se encontraron las cuentas de la transferencia.");
      setIsLoading(false)
      return;
    }

    let db: SQLite.SQLiteDatabase | null = null;
    try {
      db = await SQLite.openDatabaseAsync("finanzas.db", { useNewConnection: true });

      // Iniciar transacción
      await db.execAsync('BEGIN TRANSACTION');

      // Revertir los efectos de la transferencia en los balances
      const revertedOriginBalance = originAccount.balance + transferToDelete.amount;
      const revertedDestinationBalance = destinationAccount.balance - transferToDelete.amount;

      // Actualizar balances en la base de datos
      await db.runAsync(
        'UPDATE accounts SET balance = ? WHERE id = ?',
        [revertedOriginBalance, originAccount.id]
      );

      await db.runAsync(
        'UPDATE accounts SET balance = ? WHERE id = ?',
        [revertedDestinationBalance, destinationAccount.id]
      );

      // Eliminar transferencia de la base de datos
      await db.runAsync(
        'DELETE FROM transfers WHERE id = ?',
        [id]
      );

      // Confirmar transacción
      await db.execAsync('COMMIT');

      // Actualizar balances en el store
      updateAccountBalance(originAccount.id, revertedOriginBalance);
      updateAccountBalance(destinationAccount.id, revertedDestinationBalance);

      // Eliminar transferencia del store
      deleteTransferStore(id);

      console.log("Transferencia eliminada:", transferToDelete);
      console.log(`Balances revertidos - Origen: ${revertedOriginBalance}, Destino: ${revertedDestinationBalance}`);

    } catch (error) {
      console.error("Error deleting transfer:", error);

      // Revertir transacción en caso de error
      if (db) {
        try {
          await db.execAsync('ROLLBACK');
          console.log("Transacción revertida")
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
      }

      Alert.alert("Error", "No se pudo eliminar la transferencia.");
    } finally {
      setIsLoading(false)
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
    editTransfer,
    deleteTransfer,
  }
}
