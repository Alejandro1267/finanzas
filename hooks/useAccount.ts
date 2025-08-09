import { Colors } from "@/constants/Colors"
import { accountSchema } from "@/schemas"
import { Account, useAccountStore } from "@/store/useAccountStore"
import { Record, useRecordStore } from "@/store/useRecordStore"
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

      } else {
        // ELIMINACIÓN: Eliminar todos los registros de la cuenta en la base de datos
        await db.runAsync(
          'DELETE FROM records WHERE account = ?',
          [accountId]
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
        setAccounts(accounts.filter(account => account.id !== accountId));
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
