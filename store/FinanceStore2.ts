import { create } from "zustand"

export type Account = {
  id: string
  name: string
  percentage: number
  balance: number
  color: string
}

export type Transaction = {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  date: string
  accountId?: string
  distribution?: { accountId: string; amount: number }[]
}

type FinanceState = {
  // State
  accounts: Account[]
  transactions: Transaction[]
  showIncomeModal: boolean
  showExpenseModal: boolean
  showAccountsModal: boolean
  alertMessage: string

  // Actions
  addIncome: (amount: number, description: string) => void
  addExpense: (amount: number, description: string, accountId: string) => void
  updateAccountPercentage: (accountId: string, percentage: number) => void
  setShowIncomeModal: (show: boolean) => void
  setShowExpenseModal: (show: boolean) => void
  setShowAccountsModal: (show: boolean) => void
  showAlert: (message: string) => void
  clearAlert: () => void
  getTotalBalance: () => number
  getTotalPercentage: () => number
}

const INITIAL_ACCOUNTS: Account[] = [
  { id: "1", name: "Gastos Básicos", percentage: 50, balance: 0, color: "#FF6B6B" },
  { id: "2", name: "Ahorros", percentage: 30, balance: 0, color: "#4ECDC4" },
  { id: "3", name: "Entretenimiento", percentage: 15, balance: 0, color: "#45B7D1" },
  { id: "4", name: "Emergencias", percentage: 5, balance: 0, color: "#96CEB4" },
]

export const useFinanceStore = create<FinanceState>((set, get) => ({
  // Initial State
  accounts: INITIAL_ACCOUNTS,
  transactions: [],
  showIncomeModal: false,
  showExpenseModal: false,
  showAccountsModal: false,
  alertMessage: "",

  // Actions
  addIncome: (amount: number, description: string) => {
    const { accounts, transactions } = get()

    // Distribuir el ingreso según los porcentajes
    const distribution: { accountId: string; amount: number }[] = []
    const updatedAccounts = accounts.map((account) => {
      const distributedAmount = (amount * account.percentage) / 100
      distribution.push({ accountId: account.id, amount: distributedAmount })
      return {
        ...account,
        balance: account.balance + distributedAmount,
      }
    })

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: "income",
      amount,
      description,
      date: new Date().toLocaleDateString(),
      distribution,
    }

    set({
      accounts: updatedAccounts,
      transactions: [newTransaction, ...transactions],
      showIncomeModal: false,
    })

    get().showAlert("Ingreso registrado exitosamente")
  },

  addExpense: (amount: number, description: string, accountId: string) => {
    const { accounts, transactions } = get()

    const selectedAccount = accounts.find((acc) => acc.id === accountId)
    if (!selectedAccount || selectedAccount.balance < amount) {
      get().showAlert("Saldo insuficiente en la cuenta seleccionada")
      return
    }

    const updatedAccounts = accounts.map((account) =>
      account.id === accountId ? { ...account, balance: account.balance - amount } : account,
    )

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: "expense",
      amount,
      description,
      date: new Date().toLocaleDateString(),
      accountId,
    }

    set({
      accounts: updatedAccounts,
      transactions: [newTransaction, ...transactions],
      showExpenseModal: false,
    })

    get().showAlert("Gasto registrado exitosamente")
  },

  updateAccountPercentage: (accountId: string, percentage: number) => {
    const { accounts } = get()
    const updatedAccounts = accounts.map((account) => (account.id === accountId ? { ...account, percentage } : account))
    set({ accounts: updatedAccounts })
  },

  setShowIncomeModal: (show: boolean) => set({ showIncomeModal: show }),
  setShowExpenseModal: (show: boolean) => set({ showExpenseModal: show }),
  setShowAccountsModal: (show: boolean) => set({ showAccountsModal: show }),

  showAlert: (message: string) => {
    set({ alertMessage: message })
    setTimeout(() => get().clearAlert(), 3000)
  },

  clearAlert: () => set({ alertMessage: "" }),

  getTotalBalance: () => {
    const { accounts } = get()
    return accounts.reduce((sum, account) => sum + account.balance, 0)
  },

  getTotalPercentage: () => {
    const { accounts } = get()
    return accounts.reduce((sum, account) => sum + account.percentage, 0)
  },
}))
