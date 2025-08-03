import { RecordDraft } from "@/schemas"
import { Record, useFinanceStore } from "@/store/FinanceStore"
import { Alert } from "react-native"

export function useFinance() {
  const { addRecord: addRecordStore, updateAccountBalance, accounts, setTotalBalance, totalBalance } = useFinanceStore()

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
        (account) => account.id !== "1" && account.percentage && account.percentage > 0
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

  return { addRecord, handleAutomaticDistribution }
}
