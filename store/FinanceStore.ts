import { create } from "zustand"

export type Account = {
  id: string
  name: string
  percentage: number
  balance: number
  color: string
}

export type Record = {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  date: string
}

type FinanceState = {
  // State
  currentAccount: Account | null
  accounts: Account[]
  showAccountModal: boolean
  records: Record[]

  // Actions
  setCurrentAccount: (account: Account | null) => void
  setShowAccountModal: (show: boolean) => void

  // Functions
  addAccount: (account: Account) => void
  setField: <K extends keyof Account>(field: K, value: Account[K]) => void
  createEmptyAccount: () => void

}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  // Initial State
  currentAccount: null,
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
  showAccountModal:  false,
  records: [
    {
      id: "1",
      type: "income",
      amount: 100,
      description: "Regalo",
      date: "2025-07-28"
    },
    {
      id: "2",
      type: "expense",
      amount: 50,
      description: "Galletas",
      date: "2025-07-28"
    },
    {
      id: "3",
      type: "income",
      amount: 250,
      description: "Sueldo",
      date: "2025-07-28"
    },
  ],

  // Actions
  setCurrentAccount: (account: Account | null) => {
    set({ currentAccount: account })
  },
  setShowAccountModal: (show: boolean) => {
    set({ showAccountModal: show })
  },

  // Functions
  addAccount: (account: Account) => {
    set({ accounts: [...get().accounts, account] })
  },
  setField: <K extends keyof Account>(field: K, value: Account[K]) =>
    set((state) => {
      if (!state.currentAccount) return state;

      return {
        ...state,
        currentAccount: {
          ...state.currentAccount,
          [field]: value,
        },
      };
    }),
  createEmptyAccount: () => {
    set({ currentAccount: {
      id: "",
      name: "",
      percentage: 0,
      balance: 0,
      color: ""
    } })
  },


}))