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
  description?: string
  date: string
  account: string
}

type FinanceState = {
  // State
  currentAccount: Account | null
  currentRecord: Record | null
  accounts: Account[]
  records: Record[]
  showAccountModal: boolean
  showRecordModal: boolean
  alertMessage: string

  // Actions
  setCurrentAccount: (account: Account | null) => void
  setShowAccountModal: (show: boolean) => void
  setShowRecordModal: (show: boolean) => void
  setAlertMessage: (message: string) => void

  // Functions
  addAccount: (account: Account) => void
  addRecord: (record: Record) => void
  // setField: <K extends keyof Account>(field: K, value: Account[K]) => void
  setField: <T extends Account | Record, K extends keyof T>(field: K, value: T[K]) => void
  createEmptyAccount: () => void
  createEmptyRecord: () => void

}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  // Initial State
  currentAccount: null,
  currentRecord: null,
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
  records: [
    {
      id: "1",
      type: "income",
      amount: 100,
      description: "Regalo",
      date: "2025-07-28",
      account: "3",
    },
    {
      id: "2",
      type: "expense",
      amount: 50,
      description: "Galletas",
      date: "2025-07-28",
      account: "3",
    },
    {
      id: "3",
      type: "income",
      amount: 250,
      description: "Sueldo",
      date: "2025-07-28",
      account: "1",
    },
  ],
  showAccountModal:  false,
  showRecordModal: false,
  alertMessage: "",

  // Actions
  setCurrentAccount: (account: Account | null) => {
    set({ currentAccount: account })
  },
  setShowAccountModal: (show: boolean) => {
    set({ showAccountModal: show })
  },
  setShowRecordModal: (show: boolean) => {
    set({ showRecordModal: show })
  },
  setAlertMessage: (message: string) => {
    set({ alertMessage: message })
    setTimeout(() => set({ alertMessage: "" }), 3000)
  },


  // Functions
  addAccount: (account: Account) => {
    set({ accounts: [...get().accounts, account] })
  },
  addRecord: (record: Record) => {
    set({ records: [...get().records, record] })
  },
  // setField: <K extends keyof Account>(field: K, value: Account[K]) =>
  //   set((state) => {
  //     if (!state.currentAccount) return state;

  //     return {
  //       ...state,
  //       currentAccount: {
  //         ...state.currentAccount,
  //         [field]: value,
  //       },
  //     };
  //   }),
  setField: <T extends Account | Record, K extends keyof T>(field: K, value: T[K]) =>
    set((state) => {
      // Si el campo existe en Account, actualiza currentAccount
      if (field in (state.currentAccount || {}) && state.currentAccount) {
        return {
          ...state,
          currentAccount: {
            ...state.currentAccount,
            [field]: value,
          },
        }
      }
      // Si el campo existe en Record, actualiza currentRecord
      if (field in (state.currentRecord || {}) && state.currentRecord) {
        return {
          ...state,
          currentRecord: {
            ...state.currentRecord,
            [field]: value,
          },
        }
      }
      return state
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
  createEmptyRecord: () => {
    set({ currentRecord: {
      id: "",
      type: "income",
      amount: 0,
      description: "",
      date: "",
      account: ""
    }})
  }

}))