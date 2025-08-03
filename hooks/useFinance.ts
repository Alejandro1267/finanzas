import { Record, useFinanceStore } from "@/store/FinanceStore"

export function useFinance() {
  const { addRecord: addRecordStore, updateAccountBalance, accounts } = useFinanceStore()

  function addRecord(record: Record) {
    const account = accounts.find(acc => acc.id === record.account)
    if (!account) {
      alert("Cuenta no encontrada.")
      return
    }

    const delta = record.type === "income" ? record.amount : -record.amount
    const newBalance = account.balance + delta

    addRecordStore(record)
    updateAccountBalance(account.id, newBalance)
  }

  return { addRecord }
}
