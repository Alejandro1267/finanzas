import { Colors } from "@/constants/Colors"
import { accountSchema, RecordDraft } from "@/schemas"
import { Account, Record, useFinanceStore } from "@/store/FinanceStore"
import { ValidationErrors } from "@/types"
import * as SQLite from 'expo-sqlite'
import { Alert } from "react-native"

export function useFinance() {
  const {
    addRecord: addRecordStore,
    updateAccountBalance,
    accounts,
    setTotalBalance,
    totalBalance,
    addAccount: addAccountStore,
    clearAccountErrors,
    currentAccount,
    setShowAccountModal,
    setAccountErrors,
    records,
    setRecords,
  } = useFinanceStore()

  async function addRecord(record: RecordDraft, updateTotal: boolean = true) {
    const account = accounts.find(acc => acc.id === record.account)
    if (!account) {
      Alert.alert("Error", "Cuenta no encontrada.")
      return
    }

    try {
      // Abrir la base de datos
      const db = await SQLite.openDatabaseAsync("finanzas.db");

      // Insertar el nuevo registro en la base de datos
      await db.runAsync(
        'INSERT INTO records (type, amount, description, date, account) VALUES (?, ?, ?, ?, ?)',
        [
          record.type,
          record.amount,
          record.description,
          record.date,
          record.account
        ]
      );

      // Obtener el registro recién insertado con su ID generado
      const insertedRecord = await db.getFirstAsync(
        'SELECT * FROM records WHERE rowid = last_insert_rowid()'
      ) as Record;

      console.log("Registro insertado en DB:", insertedRecord);

      // Agregar el registro al store con el ID real de la base de datos
      addRecordStore({
        id: insertedRecord.id.toString(),
        type: insertedRecord.type,
        amount: insertedRecord.amount,
        description: insertedRecord.description,
        date: insertedRecord.date,
        account: insertedRecord.account,
      });

      // Actualizar balance de la cuenta
      const delta = record.type === "income" ? record.amount : -record.amount
      const newBalance = account.balance + delta

      // Actualizar balance en la base de datos
      await db.runAsync(
        'UPDATE accounts SET balance = ? WHERE id = ?',
        [newBalance, account.id]
      );

      updateAccountBalance(account.id, newBalance)

      if (updateTotal) {
        setTotalBalance(totalBalance + delta)
      }

    } catch (error) {
      console.error("Error adding record to database:", error);
      Alert.alert("Error", "No se pudo agregar el registro a la base de datos");
    }
  }

  function distributePercentages(totalCents: number, percentages: number[]): number[] {
    const distribution = percentages.map(p =>
      Math.floor((totalCents * p) / 100)
    )

    const totalDistributed = distribution.reduce((a, b) => a + b, 0)
    let difference = totalCents - totalDistributed

    const residuals = percentages.map((p, i) => ({
      index: i,
      residual: (totalCents * p) % 100,
    }))

    residuals.sort((a, b) => b.residual - a.residual)

    for (let i = 0; i < residuals.length && difference > 0; i++) {
      distribution[residuals[i].index] += 1
      difference--
    }

    return distribution
  }

  async function handleAutomaticDistribution(
    baseRecord: RecordDraft,
  ) {
    const accountsWithPercentage = accounts.filter(
      (account) => account.id !== "distribute" && account.percentage && account.percentage > 0
    )

    if (accountsWithPercentage.length === 0) {
      Alert.alert("Error", "No hay cuentas con porcentaje definido para la distribución")
      return
    }

    const totalPercentage = accountsWithPercentage.reduce(
      (sum, account) => sum + (account.percentage || 0), 0
    )

    if (Math.abs(totalPercentage - 100) > 0.01) {
      Alert.alert("Error", `Los porcentajes no suman 100%\nTotal: ${totalPercentage}%`)
      return
    }

    const totalCents = Math.round(baseRecord.amount * 100)
    const percentages = accountsWithPercentage.map(a => a.percentage || 0)
    const distributionCents = distributePercentages(totalCents, percentages)

    const totalDelta = accountsWithPercentage.reduce((sum, account, index) => {
      const amount = distributionCents[index] / 100
      return sum + (baseRecord.type === "income" ? amount : -amount)
    }, 0)

    console.log("totalDelta", totalDelta)

    setTotalBalance(totalBalance + totalDelta)

    try {
      // Abrir la base de datos
      const db = await SQLite.openDatabaseAsync("finanzas.db");

      // Insertar cada registro distribuido
      for (let index = 0; index < accountsWithPercentage.length; index++) {
        const account = accountsWithPercentage[index];
        const amount = distributionCents[index] / 100;

        // Insertar el registro en la base de datos
        await db.runAsync(
          'INSERT INTO records (type, amount, description, date, account) VALUES (?, ?, ?, ?, ?)',
          [
            baseRecord.type,
            amount,
            `${baseRecord.description} (${account.percentage}%)`,
            baseRecord.date,
            account.id
          ]
        );

        // Obtener el registro recién insertado
        const insertedRecord = await db.getFirstAsync(
          'SELECT * FROM records WHERE rowid = last_insert_rowid()'
        ) as Record;

        console.log(`Registro distribuido insertado para ${account.name}:`, insertedRecord);

        // Agregar el registro al store con el ID real de la base de datos
        addRecordStore({
          id: insertedRecord.id.toString(),
          type: insertedRecord.type,
          amount: insertedRecord.amount,
          description: insertedRecord.description,
          date: insertedRecord.date,
          account: insertedRecord.account,
        });

        // Actualizar balance de la cuenta
        const delta = baseRecord.type === "income" ? amount : -amount
        const newBalance = account.balance + delta

        // Actualizar balance en la base de datos
        // await db.runAsync(
        //   'UPDATE accounts SET balance = ? WHERE id = ?',
        //   [newBalance, account.id]
        // );

        console.log(`Updating balance for account ${account.id}: ${account.balance} + ${delta} = ${newBalance}`);

        // Actualizar balance en la base de datos
        if (account.id && !isNaN(newBalance)) {
          await db.runAsync(
            'UPDATE accounts SET balance = ? WHERE id = ?',
            [newBalance, account.id]
          );
        } else {
          console.error(`Invalid data for balance update: accountId=${account.id}, newBalance=${newBalance}`);
        }

        updateAccountBalance(account.id, newBalance)
      }
    } catch (error) {
      console.error("Error in automatic distribution:", error);
      Alert.alert("Error", "No se pudo distribuir el registro automáticamente");
    }
  }

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

    try {
      // Abrir la base de datos
      const db = await SQLite.openDatabaseAsync("finanzas.db");

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
      Alert.alert("Error", "No se pudo agregar la cuenta a la base de datos");
    }
  };

  async function deleteRecord(recordId: string) {
    try {
      // Abrir la base de datos
      const db = await SQLite.openDatabaseAsync("finanzas.db");

      // Obtener el registro antes de eliminarlo para revertir balances
      const recordToDelete = await db.getFirstAsync(
        'SELECT * FROM records WHERE id = ?',
        [recordId]
      ) as Record;

      if (!recordToDelete) {
        Alert.alert("Error", "Registro no encontrado.");
        return;
      }

      // Encontrar la cuenta afectada
      const account = accounts.find(acc => acc.id === recordToDelete.account);
      if (!account) {
        Alert.alert("Error", "Cuenta no encontrada.");
        return;
      }

      // Calcular el delta a revertir (opuesto al original)
      const originalDelta = recordToDelete.type === "income" ? recordToDelete.amount : -recordToDelete.amount;
      const revertDelta = -originalDelta;
      const newBalance = account.balance + revertDelta;

      // Eliminar el registro de la base de datos
      await db.runAsync(
        'DELETE FROM records WHERE id = ?',
        [recordId]
      );

      // Actualizar balance de la cuenta en la base de datos
      await db.runAsync(
        'UPDATE accounts SET balance = ? WHERE id = ?',
        [newBalance, account.id]
      );

      // Actualizar balance en el store
      updateAccountBalance(account.id, newBalance);

      // Actualizar balance total
      setTotalBalance(totalBalance + revertDelta);

      // Eliminar el registro del store
      const updatedRecords = records.filter(record => record.id !== recordId);
      setRecords(updatedRecords);

    } catch (error) {
      console.error("Error deleting record from database:", error);
      Alert.alert("Error", "No se pudo eliminar el registro de la base de datos");
    }
  }

  async function editRecord(recordId: string, newRecord: RecordDraft) {
    try {
      // 1. Encontrar el registro original en el store
      const originalRecord = records.find(record => record.id === recordId);
      if (!originalRecord) {
        Alert.alert("Error", "Registro original no encontrado.");
        return;
      }

      // 2. Encontrar la cuenta original
      const originalAccount = accounts.find(acc => acc.id === originalRecord.account);
      if (!originalAccount) {
        Alert.alert("Error", "Cuenta original no encontrada.");
        return;
      }

      // 3. Revertir el balance de la cuenta original
      const originalDelta = originalRecord.type === "income" ? originalRecord.amount : -originalRecord.amount;
      const revertedBalance = originalAccount.balance - originalDelta;
      updateAccountBalance(originalAccount.id, revertedBalance);

      // 4. Calcular el totalBalance correcto después de la reversión
      const revertedTotalBalance = totalBalance - originalDelta;

      // 5. Eliminar el registro original del store Y de la DB
      const updatedRecords = records.filter(record => record.id !== recordId);
      setRecords(updatedRecords);

      // Eliminar de la base de datos
      const db = await SQLite.openDatabaseAsync("finanzas.db");
      await db.runAsync('DELETE FROM records WHERE id = ?', [recordId]);

      // 6. Agregar el nuevo registro(s) al store Y a la DB
      if (newRecord.account === "distribute") {
        // DISTRIBUCIÓN AUTOMÁTICA
        const accountsWithPercentage = accounts.filter(
          (account) => account.id !== "distribute" && account.percentage && account.percentage > 0
        );

        if (accountsWithPercentage.length === 0) {
          Alert.alert("Error", "No hay cuentas con porcentaje definido para la distribución");
          return;
        }

        const totalPercentage = accountsWithPercentage.reduce(
          (sum, account) => sum + (account.percentage || 0), 0
        );

        if (Math.abs(totalPercentage - 100) > 0.01) {
          Alert.alert("Error", `Los porcentajes no suman 100%\nTotal: ${totalPercentage}%`);
          return;
        }

        const totalCents = Math.round(newRecord.amount * 100);
        const percentages = accountsWithPercentage.map(a => a.percentage || 0);
        const distributionCents = distributePercentages(totalCents, percentages);

        let totalDeltaDistribution = 0;

        // Crear y agregar cada registro distribuido
        for (let index = 0; index < accountsWithPercentage.length; index++) {
          const account = accountsWithPercentage[index];
          const amount = distributionCents[index] / 100;

          // Insertar en la base de datos primero
          const result = await db.runAsync(
            'INSERT INTO records (type, amount, description, date, account) VALUES (?, ?, ?, ?, ?)',
            [newRecord.type, amount, `${newRecord.description} (${account.percentage}%)`, newRecord.date, account.id]
          );

          // Obtener el registro insertado con su ID real
          const insertedRecord = await db.getFirstAsync(
            'SELECT * FROM records WHERE rowid = ?',
            [result.lastInsertRowId]
          ) as Record;

          // Agregar al store con el ID real de la DB
          addRecordStore(insertedRecord);

          // Actualizar balance de la cuenta
          const delta = newRecord.type === "income" ? amount : -amount;

          // USAR EL BALANCE CORRECTO: Si es la misma cuenta que el registro original, usar el balance revertido
          let baseBalance = account.balance;
          if (account.id === originalAccount.id) {
            baseBalance = revertedBalance;
          }

          const newBalance = baseBalance + delta;
          updateAccountBalance(account.id, newBalance);

          // Actualizar balance en la base de datos
          if (account.id && !isNaN(newBalance)) {
            await db.runAsync(
              'UPDATE accounts SET balance = ? WHERE id = ?',
              [newBalance, account.id]
            );
          }

          totalDeltaDistribution += delta;

          // console.log(`🔧 DISTRIBUTION DEBUG: account.id=${account.id}, originalAccount.id=${originalAccount.id}`);
          // console.log(`🔧 DISTRIBUTION DEBUG: account.balance=${account.balance}, revertedBalance=${revertedBalance}`);
          // console.log(`🔧 DISTRIBUTION DEBUG: baseBalance=${baseBalance}, delta=${delta}, newBalance=${newBalance}`);
        }

        // Calcular totalBalance manualmente para distribución
        const newTotalBalance = revertedTotalBalance + totalDeltaDistribution;
        setTotalBalance(newTotalBalance);
        // console.log(`📊 DISTRIBUTION Final totalBalance: ${revertedTotalBalance} + ${totalDeltaDistribution} = ${newTotalBalance}`);

      } else {
        // REGISTRO INDIVIDUAL
        const account = accounts.find(acc => acc.id === newRecord.account);
        if (!account) {
          Alert.alert("Error", "Cuenta no encontrada.");
          return;
        }

        // Insertar en la base de datos primero
        const result = await db.runAsync(
          'INSERT INTO records (type, amount, description, date, account) VALUES (?, ?, ?, ?, ?)',
          [newRecord.type, newRecord.amount, newRecord.description, newRecord.date, newRecord.account]
        );

        // Obtener el registro insertado con su ID real
        const insertedRecord = await db.getFirstAsync(
          'SELECT * FROM records WHERE rowid = ?',
          [result.lastInsertRowId]
        ) as Record;

        // Agregar al store con el ID real de la DB
        addRecordStore(insertedRecord);

        // Actualizar balance de la cuenta
        const delta = newRecord.type === "income" ? newRecord.amount : -newRecord.amount;

        // USAR EL BALANCE CORRECTO: Si es la misma cuenta que el registro original, usar el balance revertido
        let baseBalance = account.balance;
        if (account.id === originalAccount.id) {
          baseBalance = revertedBalance;
        }

        const newBalance = baseBalance + delta;
        updateAccountBalance(account.id, newBalance);

        // Actualizar balance en la base de datos
        if (account.id && !isNaN(newBalance)) {
          await db.runAsync(
            'UPDATE accounts SET balance = ? WHERE id = ?',
            [newBalance, account.id]
          );
        }

        // console.log(`🔧 INDIVIDUAL DEBUG: account.id=${account.id}, originalAccount.id=${originalAccount.id}`);
        // console.log(`🔧 INDIVIDUAL DEBUG: account.balance=${account.balance}, revertedBalance=${revertedBalance}`);
        // console.log(`🔧 INDIVIDUAL DEBUG: baseBalance=${baseBalance}, delta=${delta}, newBalance=${newBalance}`);

        // Calcular totalBalance manualmente para registro individual
        // Usar el totalBalance revertido como base y aplicar el nuevo delta
        const newTotalBalance = revertedTotalBalance + delta;
        setTotalBalance(newTotalBalance);
        // console.log(`📊 INDIVIDUAL Final totalBalance: ${revertedTotalBalance} + ${delta} = ${newTotalBalance}`);
      }
      console.log("Record edited successfully:", newRecord);
    } catch (error) {
      console.error("Error editing record:", error);
      Alert.alert("Error", "No se pudo editar el registro");
    }
  }

  return { addRecord, handleAutomaticDistribution, addAccount, deleteRecord, editRecord }
}
