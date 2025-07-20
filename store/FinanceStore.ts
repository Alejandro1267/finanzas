import { create } from "zustand"

export type Account = {
  id: string
  name: string
  percentage: number
  balance: number
  color: string
}

type FinanceState = {
  // State
  accounts: Account[]

  // Actions
  addAccount: (account: Account) => void
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  // Initial State
  accounts: [
    {
      id: "1",
      name: "Gastos Básicos",
      percentage: 50,
      balance: 0,
      color: "#FF6B6B"
    },
    {
      id: "2",
      name: "Ahorros",
      percentage: 30,
      balance: 0,
      color: "#4ECDC4"
    },
    {
      id: "3",
      name: "Galletas",
      percentage: 20,
      balance: 0,
      color: "#45B7D1"
    },
  ],

  // Actions
  addAccount: (account: Account) => {
    set({ accounts: [...get().accounts, account] })
  },


}))
