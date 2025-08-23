import { Colors } from "@/constants/Colors"
import { accountSchema } from "@/schemas"
import { Account, useAccountStore } from "@/store/useAccountStore"
import { Record, useRecordStore } from "@/store/useRecordStore"
import { Transfer, useTransferStore } from "@/store/useTransferStore"
import { ValidationErrors } from "@/types"
import * as SQLite from 'expo-sqlite'
import { Alert } from "react-native"

export function useAccount() {
  const {
    accounts,
    setTotalBalance,
    totalBalance,
    addAccount: addAccountStore,
    clearAccountErrors,
    currentAccount,
    setShowAccountModal,
    setAccountErrors,
    setAccounts,
    setIsLoading,
  } = useAccountStore()
  const { addRecord: addRecordStore, records, setRecords } = useRecordStore()
  const { transfers, setTransfers } = useTransferStore();

  const addAccount = async () => {
    setIsLoading(true);
    clearAccountErrors();

    const account = accountSchema.safeParse(currentAccount)

    if (!account.success) {
      const errors: ValidationErrors = {};
      account.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          errors[issue.path[0] as string] = issue.message;
        }
      });

      setAccountErrors(errors);
      console.log("Errores de validación:", errors);
      setIsLoading(false);
      return;
    }

    let db: SQLite.SQLiteDatabase | null = null;
    try {
      // Abrir la base de datos
      db = await SQLite.openDatabaseAsync("finanzas.db", { useNewConnection: true });

      // Iniciar transacción para operaciones atómicas
      await db.execAsync('BEGIN TRANSACTION');

      // Insertar la nueva cuenta en la base de datos
      await db.runAsync(
        'INSERT INTO accounts (name, percentage, balance, color) VALUES (?, ?, ?, ?)',
        [
          account.data.name,
          account.data.percentage,
          account.data.balance,
          account.data.color || Colors.blue
        ]
      );

      // Obtener la cuenta recién insertada con su ID generado
      const insertedAccount = await db.getFirstAsync(
        'SELECT * FROM accounts WHERE rowid = last_insert_rowid()'
      ) as Account;

      console.log("Cuenta insertada en DB:", insertedAccount);

      // Si el saldo inicial es mayor a 0, crear un registro de "Saldo inicial"
      if (insertedAccount.balance > 0) {
        const today = new Date().toLocaleDateString('en-CA'); // Formato YYYY-MM-DD en zona local

        // Insertar registro de saldo inicial en la base de datos
        await db.runAsync(
          'INSERT INTO records (type, amount, description, date, account) VALUES (?, ?, ?, ?, ?)',
          [
            'income',
            insertedAccount.balance,
            `Saldo inicial de ${insertedAccount.name}`,
            today,
            insertedAccount.id.toString()
          ]
        );
      }

      // Confirmar transacción
      await db.execAsync('COMMIT');

      if (insertedAccount.balance > 0) {
        // Obtener el registro recién insertado
        const insertedRecord = await db.getFirstAsync(
          'SELECT * FROM records WHERE rowid = last_insert_rowid()'
        ) as Record;

        // Agregar el registro al store
        addRecordStore({
          id: insertedRecord.id.toString(),
          type: insertedRecord.type,
          amount: insertedRecord.amount,
          description: insertedRecord.description,
          date: insertedRecord.date,
          account: insertedRecord.account,
        });
      }

      // Agregar la cuenta al store con el ID real de la base de datos
      addAccountStore({
        id: insertedAccount.id.toString(),
        name: insertedAccount.name,
        percentage: insertedAccount.percentage,
        balance: insertedAccount.balance,
        color: insertedAccount.color,
      });

      setTotalBalance(totalBalance + insertedAccount.balance);
      setShowAccountModal(false);
      clearAccountErrors();
    } catch (error) {
      console.error("Error adding account to database:", error);

      // Revertir transacción en caso de error
      if (db) {
        try {
          await db.execAsync('ROLLBACK');
          console.log("🔄 Transacción revertida debido al error");
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
      }

      Alert.alert("Error", "No se pudo agregar la cuenta a la base de datos");
    } finally {
      setIsLoading(false);
      if (db) {
        try {
          await db.closeAsync();
        } catch (closeError) {
          console.error("Error closing database:", closeError);
        }
      }
    }
  };

  async function deleteAccount(accountId: string, transferToAccountId?: string) {
    setIsLoading(true);
    let db: SQLite.SQLiteDatabase | null = null;

    // Variables para almacenar cambios que se aplicarán al store después del COMMIT
    let updatedAccounts: Account[] = [];
    let updatedRecords: Record[] = [];
    let updatedTransfers: Transfer[] = [];
    let newTotalBalance = totalBalance;

    try {
      // Abrir la base de datos
      db = await SQLite.openDatabaseAsync("finanzas.db", { useNewConnection: true });

      // Iniciar transacción para operaciones atómicas
      await db.execAsync('BEGIN TRANSACTION');

      if (transferToAccountId) {
        // TRANSFERENCIA: Actualizar registros en la base de datos
        await db.runAsync(
          'UPDATE records SET account = ? WHERE account = ?',
          [transferToAccountId, accountId]
        );

        // TRANSFERENCIAS: Manejar transferencias afectadas
        const transfersToUpdate: Transfer[] = [];
        const transfersToDelete: string[] = [];

        transfers.forEach(transfer => {
          if (transfer.origin === accountId || transfer.destination === accountId) {
            // Determinar nueva transferencia
            const newOrigin = transfer.origin === accountId ? transferToAccountId : transfer.origin;
            const newDestination = transfer.destination === accountId ? transferToAccountId : transfer.destination;

            // Si quedaría como A → A, eliminar
            if (newOrigin === newDestination) {
              transfersToDelete.push(transfer.id);
            } else {
              // Migrar transferencia
              transfersToUpdate.push({
                ...transfer,
                origin: newOrigin,
                destination: newDestination
              });
            }
          }
        });

        // Actualizar transferencias válidas en SQLite
        for (const transfer of transfersToUpdate) {
          await db.runAsync(
            'UPDATE transfers SET origin = ?, destination = ? WHERE id = ?',
            [transfer.origin, transfer.destination, transfer.id]
          );
        }

        // Eliminar transferencias redundantes de SQLite
        for (const transferId of transfersToDelete) {
          await db.runAsync(
            'DELETE FROM transfers WHERE id = ?',
            [transferId]
          );
        }

        // Actualizar balance de la cuenta destino en la base de datos
        const transferToAccount = accounts.find(account => account.id === transferToAccountId);
        if (transferToAccount) {
          const delta = accounts.find(account => account.id === accountId)?.balance || 0;
          const newBalance = transferToAccount.balance + delta;

          await db.runAsync(
            'UPDATE accounts SET balance = ? WHERE id = ?',
            [newBalance, transferToAccountId]
          );

          // Preparar actualizaciones para el store
          updatedAccounts = accounts
            .filter(account => account.id !== accountId) // Eliminar cuenta original
            .map(account =>
              account.id === transferToAccountId
                ? { ...account, balance: newBalance } // Actualizar balance de cuenta destino
                : account
            );
        }

        // Preparar cambios de records para el store
        updatedRecords = records.map(record =>
          record.account === accountId
            ? { ...record, account: transferToAccountId }
            : record
        );

        // Preparar actualizaciones de transferencias para el store
        updatedTransfers = transfers
          .filter(transfer => !transfersToDelete.includes(transfer.id)) // Eliminar redundantes
          .map(transfer => {
            const updatedTransfer = transfersToUpdate.find(t => t.id === transfer.id);
            return updatedTransfer || transfer; // Usar versión actualizada si existe
          });

        console.log(`Transferencias migradas: ${transfersToUpdate.length}, eliminadas: ${transfersToDelete.length}`);

      } else {
        // ELIMINACIÓN: Eliminar todos los registros de la cuenta en la base de datos
        await db.runAsync(
          'DELETE FROM records WHERE account = ?',
          [accountId]
        );

        // TRANSFERENCIAS: Eliminar todas las transferencias que involucren esta cuenta
        const transfersToDelete = transfers.filter(transfer =>
          transfer.origin === accountId || transfer.destination === accountId
        );

        // Revertir efectos de las transferencias en los balances antes de eliminar
        const accountBalanceUpdates = new Map<string, number>();

        for (const transfer of transfersToDelete) {
          const originAccount = accounts.find(acc => acc.id === transfer.origin);
          const destinationAccount = accounts.find(acc => acc.id === transfer.destination);

          if (originAccount && destinationAccount) {
            // Solo actualizar balances de cuentas que NO sean la que se está eliminando
            if (transfer.origin !== accountId) {
              // Revertir efecto en cuenta origen (devolver el monto)
              const currentBalance = accountBalanceUpdates.get(transfer.origin) ?? originAccount.balance;
              const revertedOriginBalance = currentBalance + transfer.amount;
              accountBalanceUpdates.set(transfer.origin, revertedOriginBalance);

              await db.runAsync(
                'UPDATE accounts SET balance = ? WHERE id = ?',
                [revertedOriginBalance, transfer.origin]
              );
            }

            if (transfer.destination !== accountId) {
              // Revertir efecto en cuenta destino (quitar el monto)
              const currentBalance = accountBalanceUpdates.get(transfer.destination) ?? destinationAccount.balance;
              const revertedDestinationBalance = currentBalance - transfer.amount;
              accountBalanceUpdates.set(transfer.destination, revertedDestinationBalance);

              await db.runAsync(
                'UPDATE accounts SET balance = ? WHERE id = ?',
                [revertedDestinationBalance, transfer.destination]
              );
            }
          }
        }

        // Eliminar transferencias de SQLite
        await db.runAsync(
          'DELETE FROM transfers WHERE origin = ? OR destination = ?',
          [accountId, accountId]
        );

        // Calcular el impacto total de los registros eliminados en el totalBalance
        const recordsToDelete = records.filter(record => record.account === accountId);
        const totalDelta = recordsToDelete.reduce((sum, record) => {
          return record.type === "income" ? sum - record.amount : sum + record.amount;
        }, 0);

        // Preparar cambios para el store
        updatedRecords = records.filter(record => record.account !== accountId);
        newTotalBalance = totalBalance + totalDelta;

        // Preparar transferencias actualizadas para el store
        updatedTransfers = transfers.filter(transfer =>
          transfer.origin !== accountId && transfer.destination !== accountId
        );

        // Preparar cuentas actualizadas para el store
        updatedAccounts = accounts
          .filter(account => account.id !== accountId)
          .map(account => {
            const newBalance = accountBalanceUpdates.get(account.id);
            return newBalance !== undefined ? { ...account, balance: newBalance } : account;
          });

        console.log(`Transferencias eliminadas: ${transfersToDelete.length}`);
      }

      // Eliminar la cuenta de la base de datos
      await db.runAsync(
        'DELETE FROM accounts WHERE id = ?',
        [accountId]
      );

      // ✅ Confirmar transacción UNA SOLA VEZ
      await db.execAsync('COMMIT');

      // ✅ Actualizar store DESPUÉS del commit exitoso
      setAccounts(updatedAccounts);
      setRecords(updatedRecords);
      setTransfers(updatedTransfers);
      setTotalBalance(newTotalBalance);

      console.log("Cuenta eliminada de DB:", accountId);
    } catch (error) {
      console.error("Error deleting account from database:", error);
      // Revertir transacción en caso de error
      if (db) {
        try {
          await db.execAsync('ROLLBACK');
          console.log("🔄 Transacción revertida debido al error");
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
      }
      Alert.alert("Error", "No se pudo eliminar la cuenta de la base de datos");
    } finally {
      setIsLoading(false);
      if (db) {
        try {
          await db.closeAsync();
        } catch (closeError) {
          console.error("Error closing database:", closeError);
        }
      }
    }
  }

  async function updateAccount() {
    setIsLoading(true);
    clearAccountErrors();

    const account = accountSchema.safeParse(currentAccount);

    if (!account.success) {
      const errors: ValidationErrors = {};
      account.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          errors[issue.path[0] as string] = issue.message;
        }
      });

      setAccountErrors(errors);
      console.log("Errores de validación:", errors);
      setIsLoading(false);
      return;
    }

    if (!currentAccount?.id) {
      Alert.alert("Error", "No se puede actualizar la cuenta: ID no encontrado");
      setIsLoading(false);
      return;
    }

    let db: SQLite.SQLiteDatabase | null = null;
    try {
      // Abrir la base de datos
      db = await SQLite.openDatabaseAsync("finanzas.db", { useNewConnection: true });

      // Iniciar transacción para operaciones atómicas
      await db.execAsync('BEGIN TRANSACTION');

      // Actualizar la cuenta en la base de datos
      await db.runAsync(
        'UPDATE accounts SET name = ?, percentage = ?, color = ? WHERE id = ?',
        [
          account.data.name,
          account.data.percentage,
          account.data.color || Colors.blue,
          currentAccount.id
        ]
      );

      console.log("Cuenta actualizada en DB:", currentAccount.id);

      // ✅ Confirmar transacción UNA SOLA VEZ
      await db.execAsync('COMMIT');

      // ✅ Actualizar store DESPUÉS del commit exitoso
      const updatedAccounts = accounts.map(acc =>
        acc.id === currentAccount.id
          ? {
              ...acc,
              name: account.data.name,
              percentage: account.data.percentage,
              color: account.data.color || Colors.blue,
              balance: acc.balance
            }
          : acc
      );

      setAccounts(updatedAccounts);
      setShowAccountModal(false);
      clearAccountErrors();
    } catch (error) {
      console.error("Error updating account in database:", error);

      // Revertir transacción en caso de error
      if (db) {
        try {
          await db.execAsync('ROLLBACK');
          console.log("🔄 Transacción revertida debido al error");
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
      }

      Alert.alert("Error", "No se pudo actualizar la cuenta en la base de datos");
    } finally {
      setIsLoading(false);
      if (db) {
        try {
          await db.closeAsync();
        } catch (closeError) {
          console.error("Error closing database:", closeError);
        }
      }
    }
  }

  async function reconcileBalances() {
    let db: SQLite.SQLiteDatabase | null = null;

    try {
      // Abrir la base de datos
      db = await SQLite.openDatabaseAsync("finanzas.db", { useNewConnection: true });

      // Iniciar transacción para operaciones atómicas
      await db.execAsync('BEGIN TRANSACTION');

      // Obtener todas las cuentas
      const allAccounts = await db.getAllAsync('SELECT * FROM accounts') as Account[];

      // Calcular el balance real de cada cuenta
      const updatedAccounts: Account[] = [];
      let newTotalBalance = 0;

      for (const account of allAccounts) {
        // Sumar todos los records de la cuenta
        const recordsBalance = await db.getFirstAsync(
          `SELECT
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance
           FROM records
           WHERE account = ?`,
          [account.id]
        ) as { balance: number };

        // Sumar transferencias recibidas y restar transferencias enviadas
        const transfersReceived = await db.getFirstAsync(
          `SELECT COALESCE(SUM(amount), 0) as received FROM transfers WHERE destination = ?`,
          [account.id]
        ) as { received: number };

        const transfersSent = await db.getFirstAsync(
          `SELECT COALESCE(SUM(amount), 0) as sent FROM transfers WHERE origin = ?`,
          [account.id]
        ) as { sent: number };

        // Calcular balance real
        const realBalance = recordsBalance.balance + transfersReceived.received - transfersSent.sent;

        // Actualizar balance en la base de datos
        await db.runAsync(
          'UPDATE accounts SET balance = ? WHERE id = ?',
          [realBalance, account.id]
        );

        // Preparar cuenta actualizada para el store
        updatedAccounts.push({
          ...account,
          id: account.id.toString(),
          balance: realBalance
        });

        newTotalBalance += realBalance;
      }

      // Confirmar transacción
      await db.execAsync('COMMIT');

      // Actualizar store después del commit exitoso
      setAccounts(updatedAccounts);
      setTotalBalance(newTotalBalance);

      Alert.alert(
        "Reconciliación Exitosa",
        `Se han recalculado los balances de ${updatedAccounts.length} cuenta(s). Balance total: $${newTotalBalance.toFixed(2)}`
      );

      console.log("Balances reconciliados exitosamente");
    } catch (error) {
      console.error("Error reconciling balances:", error);

      // Revertir transacción en caso de error
      if (db) {
        try {
          await db.execAsync('ROLLBACK');
          console.log("🔄 Transacción revertida debido al error");
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
      }

      Alert.alert("Error", "No se pudieron reconciliar los balances");
    } finally {
      if (db) {
        try {
          await db.closeAsync();
        } catch (closeError) {
          console.error("Error closing database:", closeError);
        }
      }
    }
  }

  return {
    addAccount,
    deleteAccount,
    updateAccount,
    reconcileBalances,
  }
}