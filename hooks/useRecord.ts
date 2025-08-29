import { RecordDraft } from "@/schemas"
import { useAccountStore } from "@/store/useAccountStore"
import { Record, useRecordStore } from "@/store/useRecordStore"
import { useTransferStore } from "@/store/useTransferStore"
import * as SQLite from 'expo-sqlite'
import { Alert } from "react-native"

export function useRecord() {
  const {
    updateAccountBalance,
    accounts,
    setTotalBalance,
    totalBalance,
  } = useAccountStore()
  const { addRecord: addRecordStore, records, setRecords, setIsLoading } = useRecordStore()

  async function addRecord(record: RecordDraft, updateTotal: boolean = true): Promise<boolean> {
    setIsLoading(true)
    const account = accounts.find(acc => acc.id === record.account)
    if (!account) {
      Alert.alert("Error", "Cuenta no encontrada.")
      setIsLoading(false)
      return false;
    }

    let db: SQLite.SQLiteDatabase | null = null;
    try {
      // Abrir la base de datos
      db = await SQLite.openDatabaseAsync("finanzas.db", { useNewConnection: true });

      // Iniciar transacción para operaciones atómicas
      await db.execAsync('BEGIN TRANSACTION');

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

      // Actualizar balance de la cuenta
      const delta = record.type === "income" ? record.amount : -record.amount
      const newBalance = account.balance + delta

      // Actualizar balance en la base de datos
      await db.runAsync(
        'UPDATE accounts SET balance = ? WHERE id = ?',
        [newBalance, account.id]
      );

      // Confirmar transacción
      await db.execAsync('COMMIT');

      // Agregar el registro al store con el ID real de la base de datos
      addRecordStore({
        id: insertedRecord.id.toString(),
        type: insertedRecord.type,
        amount: insertedRecord.amount,
        description: insertedRecord.description,
        date: insertedRecord.date,
        account: insertedRecord.account,
      });      

      updateAccountBalance(account.id, newBalance)

      if (updateTotal) {
        setTotalBalance(totalBalance + delta)
      }

      return true;
    } catch (error) {
      console.error("Error adding record to database:", error);
      // Revertir transacción en caso de error
      if (db) {
        try {
          await db.execAsync('ROLLBACK');
          console.log("🔄 Transacción revertida debido al error");
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
      }
      Alert.alert("Error", "No se pudo agregar el registro a la base de datos");
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
  ): Promise<boolean> {
    setIsLoading(true)
    const accountsWithPercentage = accounts.filter(
      (account) => account.id !== "distribute" && account.percentage && account.percentage > 0
    )

    if (accountsWithPercentage.length === 0) {
      Alert.alert("Error", "No hay cuentas con porcentaje definido para la distribución")
      setIsLoading(false)
      return false
    }

    const totalPercentage = accountsWithPercentage.reduce(
      (sum, account) => sum + (account.percentage || 0), 0
    )

    if (Math.abs(totalPercentage - 100) > 0.01) {
      Alert.alert("Error", `Los porcentajes no suman 100%\nTotal: ${totalPercentage}%`)
      setIsLoading(false)
      return false
    }

    const totalCents = Math.round(baseRecord.amount * 100)
    const percentages = accountsWithPercentage.map(a => a.percentage || 0)
    const distributionCents = distributePercentages(totalCents, percentages)

    const totalDelta = accountsWithPercentage.reduce((sum, account, index) => {
      const amount = distributionCents[index] / 100
      return sum + (baseRecord.type === "income" ? amount : -amount)
    }, 0)

    console.log("totalDelta", totalDelta)

    let db: SQLite.SQLiteDatabase | null = null;
    const insertedRecords: Record[] = [];

    try {
      // Abrir la base de datos
      db = await SQLite.openDatabaseAsync("finanzas.db", { useNewConnection: true });

      // Iniciar transacción para operaciones atómicas
      await db.execAsync('BEGIN TRANSACTION');

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

        insertedRecords.push(insertedRecord);

        console.log(`Registro distribuido insertado para ${account.name}:`, insertedRecord);

        // Actualizar balance de la cuenta
        const delta = baseRecord.type === "income" ? amount : -amount
        const newBalance = account.balance + delta

        // Actualizar balance en la base de datos
          await db.runAsync(
            'UPDATE accounts SET balance = ? WHERE id = ?',
            [newBalance, account.id]
          );
      }

      // Confirmar transacción
      await db.execAsync('COMMIT');

      setTotalBalance(totalBalance + totalDelta)

      insertedRecords.forEach((insertedRecord, index) => {
        const account = accountsWithPercentage[index];
        const amount = distributionCents[index] / 100;
        const delta = baseRecord.type === "income" ? amount : -amount;
        const newBalance = account.balance + delta;

        // Agregar el registro al store con el ID real de la base de datos
        addRecordStore({
          id: insertedRecord.id.toString(),
          type: insertedRecord.type,
          amount: insertedRecord.amount,
          description: insertedRecord.description,
          date: insertedRecord.date,
          account: insertedRecord.account,
        });        

        updateAccountBalance(account.id, newBalance)
      })

      console.log("✅ Distribución automática completada exitosamente");
      return true;
    } catch (error) {
      console.error("Error in automatic distribution:", error);
      // Revertir transacción en caso de error
      if (db) {
        try {
          await db.execAsync('ROLLBACK');
          console.log("🔄 Transacción revertida debido al error");
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
      }
      Alert.alert("Error", "No se pudo distribuir el registro automáticamente");
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
  }

  async function deleteRecord(recordId: string) {
    setIsLoading(true)
    let db: SQLite.SQLiteDatabase | null = null;
    try {
      // Abrir la base de datos
      db = await SQLite.openDatabaseAsync("finanzas.db", { useNewConnection: true });

      // Iniciar transacción para operaciones atómicas
      await db.execAsync('BEGIN TRANSACTION');

      // Obtener el registro antes de eliminarlo para revertir balances
      const recordToDelete = await db.getFirstAsync(
        'SELECT * FROM records WHERE id = ?',
        [recordId]
      ) as Record;

      if (!recordToDelete) {
        Alert.alert("Error", "Registro no encontrado.");
        setIsLoading(false)
        return;
      }

      // Encontrar la cuenta afectada
      const account = accounts.find(acc => acc.id === recordToDelete.account);
      if (!account) {
        Alert.alert("Error", "Cuenta no encontrada.");
        setIsLoading(false)
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

      // Confirmar transacción
      await db.execAsync('COMMIT');

      // Actualizar balance en el store
      updateAccountBalance(account.id, newBalance);

      // Actualizar balance total
      setTotalBalance(totalBalance + revertDelta);

      // Eliminar el registro del store
      const updatedRecords = records.filter(record => record.id !== recordId);
      setRecords(updatedRecords);

      return true;
    } catch (error) {
      console.error("Error deleting record from database:", error);
      // Revertir transacción en caso de error
      if (db) {
        try {
          await db.execAsync('ROLLBACK');
          console.log("🔄 Transacción revertida debido al error");
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
      }
      Alert.alert("Error", "No se pudo eliminar el registro de la base de datos");
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
  }

  async function editRecord(recordId: string, newRecord: RecordDraft): Promise<boolean> {
    setIsLoading(true)
    let db: SQLite.SQLiteDatabase | null = null;

    try {
      // 1. Encontrar el registro original en el store
      const originalRecord = records.find(record => record.id === recordId);
      if (!originalRecord) {
        Alert.alert("Error", "Registro original no encontrado.");
        setIsLoading(false)
        return false;
      }

      // 2. Encontrar la cuenta original
      const originalAccount = accounts.find(acc => acc.id === originalRecord.account);
      if (!originalAccount) {
        Alert.alert("Error", "Cuenta original no encontrada.");
        setIsLoading(false)
        return false;
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
      db = await SQLite.openDatabaseAsync("finanzas.db", { useNewConnection: true });

      // Iniciar transacción para operaciones atómicas
      await db.execAsync('BEGIN TRANSACTION');

      await db.runAsync('DELETE FROM records WHERE id = ?', [recordId]);

      const insertedRecords: Record[] = [];
      let totalDeltaFinal = 0;

      // 6. Agregar el nuevo registro(s) al store Y a la DB
      if (newRecord.account === "distribute") {
        // DISTRIBUCIÓN AUTOMÁTICA
        const accountsWithPercentage = accounts.filter(
          (account) => account.id !== "distribute" && account.percentage && account.percentage > 0
        );

        if (accountsWithPercentage.length === 0) {
          Alert.alert("Error", "No hay cuentas con porcentaje definido para la distribución");
          setIsLoading(false)
          return false;
        }

        const totalPercentage = accountsWithPercentage.reduce(
          (sum, account) => sum + (account.percentage || 0), 0
        );

        if (Math.abs(totalPercentage - 100) > 0.01) {
          Alert.alert("Error", `Los porcentajes no suman 100%\nTotal: ${totalPercentage}%`);
          setIsLoading(false)
          return false;
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

          insertedRecords.push(insertedRecord);

          // Actualizar balance de la cuenta
          const delta = newRecord.type === "income" ? amount : -amount;

          // USAR EL BALANCE CORRECTO: Si es la misma cuenta que el registro original, usar el balance revertido
          let baseBalance = account.balance;
          if (account.id === originalAccount.id) {
            baseBalance = revertedBalance;
          }

          const newBalance = baseBalance + delta;

          // Actualizar balance en la base de datos
          await db.runAsync(
            'UPDATE accounts SET balance = ? WHERE id = ?',
            [newBalance, account.id]
          );
          
          totalDeltaFinal += delta;
        }

      } else {
        // REGISTRO INDIVIDUAL
        const account = accounts.find(acc => acc.id === newRecord.account);
        if (!account) {
          Alert.alert("Error", "Cuenta no encontrada.");
          setIsLoading(false)
          return false;
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

        insertedRecords.push(insertedRecord);

        // Actualizar balance de la cuenta
        const delta = newRecord.type === "income" ? newRecord.amount : -newRecord.amount;

        // USAR EL BALANCE CORRECTO: Si es la misma cuenta que el registro original, usar el balance revertido
        let baseBalance = account.balance;
        if (account.id === originalAccount.id) {
          baseBalance = revertedBalance;
        }

        const newBalance = baseBalance + delta;

        // Actualizar balance en la base de datos
        await db.runAsync(
          'UPDATE accounts SET balance = ? WHERE id = ?',
          [newBalance, account.id]
        );

        totalDeltaFinal += delta;
      }

      console.log("Record edited successfully:", newRecord);
      
      // Confirmar transacción
      await db.execAsync('COMMIT');

      if (newRecord.account === "distribute") {
        // DISTRIBUCIÓN AUTOMÁTICA - actualizar store
        const accountsWithPercentage = accounts.filter(
          (account) => account.id !== "distribute" && account.percentage && account.percentage > 0
        );
        const totalCents = Math.round(newRecord.amount * 100);
        const percentages = accountsWithPercentage.map(a => a.percentage || 0);
        const distributionCents = distributePercentages(totalCents, percentages);

        insertedRecords.forEach((insertedRecord, index) => {
          const account = accountsWithPercentage[index];
          const amount = distributionCents[index] / 100;
          const delta = newRecord.type === "income" ? amount : -amount;

          // Agregar al store con el ID real de la DB
          addRecordStore({
            id: insertedRecord.id.toString(),
            type: insertedRecord.type,
            amount: insertedRecord.amount,
            description: insertedRecord.description,
            date: insertedRecord.date,
            account: insertedRecord.account,
          });

          // USAR EL BALANCE CORRECTO: Si es la misma cuenta que el registro original, usar el balance revertido
          let baseBalance = account.balance;
          if (account.id === originalAccount.id) {
            baseBalance = revertedBalance;
          }

          const newBalance = baseBalance + delta;
          updateAccountBalance(account.id, newBalance);
        });

      } else {
        // REGISTRO INDIVIDUAL - actualizar store
        const account = accounts.find(acc => acc.id === newRecord.account);
        const insertedRecord = insertedRecords[0];
        const delta = newRecord.type === "income" ? newRecord.amount : -newRecord.amount;

        // Agregar el store con el ID real de la DB
        addRecordStore({
          id: insertedRecord.id.toString(),
          type: insertedRecord.type,
          amount: insertedRecord.amount,
          description: insertedRecord.description,
          date: insertedRecord.date,
          account: insertedRecord.account,
        });

        // USAR EL BALANCE CORRECTO: Si es la misma cuenta que el registro original, usar el balance revertido
        let baseBalance = account!.balance;
        if (account!.id === originalAccount.id) {
          baseBalance = revertedBalance;
        }

        const newBalance = baseBalance + delta;
        updateAccountBalance(account!.id, newBalance);
      }

      // Calcular totalBalance manualmente usando el balance revertido como base
      const newTotalBalance = revertedTotalBalance + totalDeltaFinal;
      setTotalBalance(newTotalBalance);

      return true;
    } catch (error) {
      console.error("Error editing record:", error);
      if (db) {
        try {
          await db.execAsync('ROLLBACK');
          console.log("🔄 Transacción revertida debido al error");
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
      }
      Alert.alert("Error", "No se pudo editar el registro");
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
  }

  async function loadRecordsByMonth(month: number, year: number) {
    const { setIsLoading } = useRecordStore.getState();
    setIsLoading(true);
    let db: SQLite.SQLiteDatabase | null = null;

    try {
      db = await SQLite.openDatabaseAsync("finanzas.db", {
        useNewConnection: true,
      });

      // Calculate month range for filtering
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const endDate = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-01`;

      // Load records for the specific month
      const records = (await db.getAllAsync(
        `SELECT *
        FROM records
        WHERE date >= ? AND date < ?
        ORDER BY date DESC, id DESC`,
        [startDate, endDate]
      )) as Record[];

      // Load transfers for the specific month
      const transfers = (await db.getAllAsync(
        `SELECT *
        FROM transfers
        WHERE date >= ? AND date < ?
        ORDER BY date DESC, id DESC`,
        [startDate, endDate]
      )) as any[];

      const { setRecords } = useRecordStore.getState();
      setRecords(records);
      
      // Update transfers store if needed
      const { setTransfers } = useTransferStore.getState();
      setTransfers(transfers);

      console.log(`Loaded ${records.length} records for ${month + 1}/${year}`);

    } catch (error) {
      console.error("Error loading records by month:", error);
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

  return {
    addRecord,
    handleAutomaticDistribution,
    deleteRecord,
    editRecord,
    loadRecordsByMonth,
  }
}
