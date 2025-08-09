import { ValidationErrors } from "@/types"
import { create } from "zustand"

export type Account = {
  id: string
  name: string
  percentage: number
  balance: number
  color: string
}

type AccountState = {
  // State
  currentAccount: Account | null
  accounts: Account[]
  showAccountModal: boolean
  showTransferModal: boolean
  accountErrors: ValidationErrors
  totalBalance: number
  accountMode: "edit" | "new"

  // Actions
  setCurrentAccount: (account: Account | null) => void
  setAccounts: (accounts: Account[]) => void
  setShowAccountModal: (show: boolean) => void
  setShowTransferModal: (show: boolean) => void
  setAccountErrors: (errors: ValidationErrors) => void
  setAccountField: <K extends keyof Account>(field: K, value: Account[K]) => void
  setTotalBalance: (balance: number) => void
  setAccountMode: (mode: "edit" | "new") => void

  // Functions
  addAccount: (account: Account) => void
  createEmptyAccount: () => void
  clearAccountErrors: () => void
  updateAccountBalance: (account: string, newBalance: number) => void

}

export const useAccountStore = create<AccountState>((set, get) => ({
  // Initial State
  currentAccount: null,
  accounts: [],
  showAccountModal:  false,
  showTransferModal: false,
  accountErrors: {},
  totalBalance: 0,
  accountMode: "new",

  // Actions
  setCurrentAccount: (account: Account | null) => {
    set({ currentAccount: account })
  },
  setAccounts: (accounts: Account[]) => {
    set({ accounts })
  },
  setShowAccountModal: (show: boolean) => {
    set({ showAccountModal: show })
  },
  setShowTransferModal: (show: boolean) => {
    set({ showTransferModal: show })
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
  setTotalBalance: (balance: number) => {
    set({ totalBalance: balance })
  },
  setAccountMode: (mode: "edit" | "new") => {
    set({ accountMode: mode })
  },
  
  // Functions
  addAccount: (account: Account) => {
    set({ accounts: [...get().accounts, account] })
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