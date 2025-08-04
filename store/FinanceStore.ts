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
  description: string
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
  accountErrors: ValidationErrors
  totalBalance: number
  recordMode: "edit" | "new"
  accountMode: "edit" | "new"
  activeTab: "income" | "expense"

  // Actions
  setCurrentAccount: (account: Account | null) => void
  setCurrentRecord: (record: Record | null) => void
  setAccounts: (accounts: Account[]) => void
  setRecords: (records: Record[]) => void
  setShowAccountModal: (show: boolean) => void
  setShowRecordModal: (show: boolean) => void
  setAlertMessage: (message: string) => void
  setRecordErrors: (errors: ValidationErrors) => void
  setAccountErrors: (errors: ValidationErrors) => void
  setAccountField: <K extends keyof Account>(field: K, value: Account[K]) => void
  setRecordField: <K extends keyof Record>(field: K, value: Record[K]) => void
  setTotalBalance: (balance: number) => void
  setRecordMode: (mode: "edit" | "new") => void
  setAccountMode: (mode: "edit" | "new") => void
  setActiveTab: (tab: "income" | "expense") => void

  // Functions
  addAccount: (account: Account) => void
  addRecord: (record: Record) => void
  createEmptyAccount: () => void
  createEmptyRecord: () => void
  clearRecordErrors: () => void
  clearAccountErrors: () => void
  updateAccountBalance: (account: string, newBalance: number) => void

}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  // Initial State
  currentAccount: null,
  currentRecord: null,
  accounts: [],
  records: [],
  showAccountModal:  false,
  showRecordModal: false,
  alertMessage: "",
  recordErrors: {},
  accountErrors: {},
  totalBalance: 0,
  recordMode: "new",
  accountMode: "new",
  activeTab: "income",

  // Actions
  setCurrentAccount: (account: Account | null) => {
    set({ currentAccount: account })
  },
  setCurrentRecord: (record: Record | null) => {
    set({ currentRecord: record })
  },
  setAccounts: (accounts: Account[]) => {
    set({ accounts })
  },
  setRecords: (records: Record[]) => {
    set({ records })
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
  setAccountErrors: (errors: ValidationErrors) => {
    set({ accountErrors: errors })
  },
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
  setTotalBalance: (balance: number) => {
    set({ totalBalance: balance })
  },
  setRecordMode: (mode: "edit" | "new") => {
    set({ recordMode: mode })
  },
  setAccountMode: (mode: "edit" | "new") => {
    set({ accountMode: mode })
  },
  setActiveTab: (tab: "income" | "expense") => {
    set({ activeTab: tab })
  },
  
  // Functions
  addAccount: (account: Account) => {
    set({ accounts: [...get().accounts, account] })
  },
  addRecord: (record: Record) => {
    set({ records: [...get().records, record] })
  },
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
  clearAccountErrors: () => {
    set({ accountErrors: {} })
  },
  updateAccountBalance: (account: string, newBalance: number) => {
    const updatedAccounts = get().accounts.map((acc) =>
      acc.id === account ? { ...acc, balance: newBalance } : acc
    )
    set({ accounts: updatedAccounts })
  },

}))