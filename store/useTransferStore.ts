import { fechaLocal } from "@/helpers"
import { ValidationErrors } from "@/types"
import { create } from "zustand"

export type Transfer = {
  id: string
  date: string
  amount: number
  description: string
  origin: string
  destination: string
}

type TransferState = {
  // State
  currentTransfer: Transfer | null
  transfers: Transfer[]
  transferErrors: ValidationErrors

  // Actions
  setCurrentTransfer: (transfer: Transfer | null) => void
  setTransfers: (transfers: Transfer[]) => void
  setTransferErrors: (errors: ValidationErrors) => void
  setTransferField: <K extends keyof Transfer>(field: K, value: Transfer[K]) => void

  // Functions
  addTransfer: (transfer: Transfer) => void
  createEmptyTransfer: () => void
  clearTransferErrors: () => void

}

export const useTransferStore = create<TransferState>((set, get) => ({
  // Initial State
  currentTransfer: null,
  transfers: [],
  transferErrors: {},

  // Actions
  setCurrentTransfer: (transfer: Transfer | null) => {
    set({ currentTransfer: transfer })
  },
  setTransfers: (transfers: Transfer[]) => {
    set({ transfers })
  },
  setTransferErrors: (errors: ValidationErrors) => {
    set({ transferErrors: errors })
  },
  setTransferField: <K extends keyof Transfer>(field: K, value: Transfer[K]) =>
    set((state) => {
      if (!state.currentTransfer) return state
      return {
        ...state,
        currentTransfer: {
          ...state.currentTransfer,
          [field]: value,
        },
      }
    }),
  
  // Functions
  addTransfer: (transfer: Transfer) => {
    set({ transfers: [transfer, ...get().transfers] })
  },
  createEmptyTransfer: () => {
    set({ currentTransfer: {
      id: "",
      date: fechaLocal(), // YYYY-MM-DD
      amount: 0,
      description: "",
      origin: "",
      destination: ""
    }})
  },
  clearTransferErrors: () => {
    set({ transferErrors: {} })
  },

}))