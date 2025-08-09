import { fechaLocal } from "@/helpers"
import { ValidationErrors } from "@/types"
import { create } from "zustand"

export type Record = {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  date: string
  account: string
}

type RecordState = {
  // State
  currentRecord: Record | null
  records: Record[]
  showRecordModal: boolean
  recordErrors: ValidationErrors
  recordMode: "edit" | "new"
  activeTab: "income" | "expense"

  // Actions
  setCurrentRecord: (record: Record | null) => void
  setRecords: (records: Record[]) => void
  setShowRecordModal: (show: boolean) => void
  setRecordErrors: (errors: ValidationErrors) => void
  setRecordField: <K extends keyof Record>(field: K, value: Record[K]) => void
  setRecordMode: (mode: "edit" | "new") => void
  setActiveTab: (tab: "income" | "expense") => void

  // Functions
  addRecord: (record: Record) => void
  createEmptyRecord: () => void
  clearRecordErrors: () => void

}

export const useRecordStore = create<RecordState>((set, get) => ({
  // Initial State
  currentRecord: null,
  records: [],
  showRecordModal: false,
  recordErrors: {},
  recordMode: "new",
  activeTab: "expense",

  // Actions
  setCurrentRecord: (record: Record | null) => {
    set({ currentRecord: record })
  },
  setRecords: (records: Record[]) => {
    set({ records })
  },
  setShowRecordModal: (show: boolean) => {
    set({ showRecordModal: show })
  },
  setRecordErrors: (errors: ValidationErrors) => {
    set({ recordErrors: errors })
  },
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
  setRecordMode: (mode: "edit" | "new") => {
    set({ recordMode: mode })
  },
  setActiveTab: (tab: "income" | "expense") => {
    set({ activeTab: tab })
  },
  
  // Functions
  addRecord: (record: Record) => {
    set({ records: [record, ...get().records] })
  },
  createEmptyRecord: () => {
    set({ currentRecord: {
      id: "",
      type: "income",
      amount: 0,
      description: "",
      date: fechaLocal(), // YYYY-MM-DD
      account: ""
    }})
  },
  clearRecordErrors: () => {
    set({ recordErrors: {} })
  },

}))