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

        // Actualizar balance de la cuenta (sin updateTotal para evitar duplicar)
        await addRecord({
          type: baseRecord.type,
          amount: amount,
          description: insertedRecord.description,
          date: baseRecord.date,
          account: account.id
        }, false);
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

  return { addRecord, handleAutomaticDistribution, addAccount }
}
