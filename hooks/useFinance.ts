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

  function addRecord(record: Record, updateTotal: boolean = true) {
    const account = accounts.find(acc => acc.id === record.account)
    if (!account) {
      alert("Cuenta no encontrada.")
      return
    }

    const delta = record.type === "income" ? record.amount : -record.amount
    const newBalance = account.balance + delta

    addRecordStore(record)
    updateAccountBalance(account.id, newBalance)
  
    if (updateTotal) {
      setTotalBalance(totalBalance + delta)
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
    
  function handleAutomaticDistribution(
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
  
    accountsWithPercentage.forEach((account, index) => {
      const amount = distributionCents[index] / 100
  
      const newRecord: Record = {
        ...baseRecord,
        id: `${Date.now()}-${account.id}`,
        account: account.id,
        amount,
        description: `${baseRecord.description} (${account.percentage}%)`,
      }
  
      addRecord(newRecord, false)
      console.log(`Registro distribuido para ${account.name}:`, newRecord)
    })
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

    // addAccountStore({
    //   id: Date.now().toString(),
    //   name: account.data.name,
    //   percentage: account.data.percentage,
    //   balance: account.data.balance,
    //   color: account.data.color || Colors.blue,
    // });
    // setTotalBalance(totalBalance + account.data.balance)
    // setShowAccountModal(false);
    // clearAccountErrors();


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
