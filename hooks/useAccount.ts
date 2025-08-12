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
  } = useAccountStore()
  const { addRecord: addRecordStore, records, setRecords } = useRecordStore()
  const { transfers, setTransfers } = useTransferStore();

  const addAccount = async () => {
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

        // Obtener el registro recién insertado
        const insertedRecord = await db.getFirstAsync(
          'SELECT * FROM records WHERE rowid = last_insert_rowid()'
        ) as Record;

        console.log("Registro de saldo inicial creado:", insertedRecord);

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

      // Confirmar transacción
      await db.execAsync('COMMIT');

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
    let db: SQLite.SQLiteDatabase | null = null;
    try {
      // Abrir la base de datos
      db = await SQLite.openDatabaseAsync("finanzas.db", { useNewConnection: true });
  
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
  
          // Actualizar cuentas en el store: eliminar cuenta original y actualizar balance de destino
          const updatedAccounts = accounts
            .filter(account => account.id !== accountId) // Eliminar cuenta original
            .map(account =>
              account.id === transferToAccountId
                ? { ...account, balance: newBalance } // Actualizar balance de cuenta destino
                : account
            );
          setAccounts(updatedAccounts);
        }
  
        // Cambiar todos los records que tenían el accountId eliminado al transferToAccountId en el store
        const updatedRecords = records.map(record =>
          record.account === accountId
            ? { ...record, account: transferToAccountId }
            : record
        );
        setRecords(updatedRecords);
  
        // Actualizar transferencias en el store
        const updatedTransfers = transfers
          .filter(transfer => !transfersToDelete.includes(transfer.id)) // Eliminar redundantes
          .map(transfer => {
            const updatedTransfer = transfersToUpdate.find(t => t.id === transfer.id);
            return updatedTransfer || transfer; // Usar versión actualizada si existe
          });
        setTransfers(updatedTransfers);
  
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
        for (const transfer of transfersToDelete) {
          const originAccount = accounts.find(acc => acc.id === transfer.origin);
          const destinationAccount = accounts.find(acc => acc.id === transfer.destination);
  
          if (originAccount && destinationAccount) {
            // Solo actualizar balances de cuentas que NO sean la que se está eliminando
            if (transfer.origin !== accountId) {
              // Revertir efecto en cuenta origen (devolver el monto)
              const revertedOriginBalance = originAccount.balance + transfer.amount;
              await db.runAsync(
                'UPDATE accounts SET balance = ? WHERE id = ?',
                [revertedOriginBalance, transfer.origin]
              );
            }
  
            if (transfer.destination !== accountId) {
              // Revertir efecto en cuenta destino (quitar el monto)
              const revertedDestinationBalance = destinationAccount.balance - transfer.amount;
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
  
        // Eliminar registros del store
        const filteredRecords = records.filter(record => record.account !== accountId);
        setRecords(filteredRecords);
        setTotalBalance(totalBalance + totalDelta);
  
        // Actualizar transferencias en el store: eliminar las que involucren la cuenta eliminada
        // y actualizar balances de cuentas afectadas
        const remainingTransfers = transfers.filter(transfer => 
          transfer.origin !== accountId && transfer.destination !== accountId
        );
  
        // Actualizar balances en el store para cuentas afectadas por transferencias eliminadas
        const accountsToUpdate = new Map<string, number>();
        
        transfersToDelete.forEach(transfer => {
          if (transfer.origin !== accountId) {
            const currentBalance = accountsToUpdate.get(transfer.origin) ?? 
              accounts.find(acc => acc.id === transfer.origin)?.balance ?? 0;
            accountsToUpdate.set(transfer.origin, currentBalance + transfer.amount);
          }
          
          if (transfer.destination !== accountId) {
            const currentBalance = accountsToUpdate.get(transfer.destination) ?? 
              accounts.find(acc => acc.id === transfer.destination)?.balance ?? 0;
            accountsToUpdate.set(transfer.destination, currentBalance - transfer.amount);
          }
        });
  
        // Aplicar actualizaciones de balance en el store
        const finalAccounts = accounts
          .filter(account => account.id !== accountId)
          .map(account => {
            const newBalance = accountsToUpdate.get(account.id);
            return newBalance !== undefined ? { ...account, balance: newBalance } : account;
          });
        
        setAccounts(finalAccounts);
        setTransfers(remainingTransfers);
  
        console.log(`Transferencias eliminadas: ${transfersToDelete.length}`);
      }
  
      // Eliminar la cuenta de la base de datos
      await db.runAsync(
        'DELETE FROM accounts WHERE id = ?',
        [accountId]
      );
  
      console.log("Cuenta eliminada de DB:", accountId);
    } catch (error) {
      console.error("Error deleting account from database:", error);
      Alert.alert("Error", "No se pudo eliminar la cuenta de la base de datos");
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

  async function updateAccount() {
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
      return;
    }

    if (!currentAccount?.id) {
      Alert.alert("Error", "No se puede actualizar la cuenta: ID no encontrado");
      return;
    }

    let db: SQLite.SQLiteDatabase | null = null;
    try {
      // Abrir la base de datos
      db = await SQLite.openDatabaseAsync("finanzas.db", { useNewConnection: true });

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

      // Actualizar la cuenta en el store
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
      Alert.alert("Error", "No se pudo actualizar la cuenta en la base de datos");
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
  }
}
