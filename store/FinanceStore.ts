import { ValidationErrors } from "@/types"
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
  recordErrors: ValidationErrors

  // Actions
  setCurrentAccount: (account: Account | null) => void
  setCurrentRecord: (record: Record | null) => void
  setShowAccountModal: (show: boolean) => void
  setShowRecordModal: (show: boolean) => void
  setAlertMessage: (message: string) => void
  setRecordErrors: (errors: ValidationErrors) => void

  // Functions
  addAccount: (account: Account) => void
  addRecord: (record: Record) => void
  // setField: <K extends keyof Account>(field: K, value: Account[K]) => void
  setAccountField: <K extends keyof Account>(field: K, value: Account[K]) => void
  setRecordField: <K extends keyof Record>(field: K, value: Record[K]) => void
  createEmptyAccount: () => void
  createEmptyRecord: () => void
  clearRecordErrors: () => void

}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  // Initial State
  currentAccount: null,
  currentRecord: null,
  accounts: [
    {
      id: "4",
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
      account: "2",
    },
  ],
  showAccountModal:  false,
  showRecordModal: false,
  alertMessage: "",
  recordErrors: {},

  // Actions
  setCurrentAccount: (account: Account | null) => {
    set({ currentAccount: account })
  },
  setCurrentRecord: (record: Record | null) => {
    set({ currentRecord: record })
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
  setRecordErrors: (errors: ValidationErrors) => {
    set({ recordErrors: errors })
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
  setAccountField: <K extends keyof Account>(field: K, value: Account[K]) =>
    set((state) => {
      if (!state.currentAccount) return state
      return {
        ...state,
        currentAccount: {
          ...state.currentAccount,
          [field]: value,
        },
      }
    }),
  setRecordField: <K extends keyof Record>(field: K, value: Record[K]) =>
    set((state) => {
      if (!state.currentRecord) return state
      return {
        ...state,
        currentRecord: {
          ...state.currentRecord,
          [field]: value,
        },
      }
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
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      account: ""
    }})
  },
  clearRecordErrors: () => {
    set({ recordErrors: {} })
  },


}))