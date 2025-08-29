import { fechaLocal } from "@/helpers";
import { ValidationErrors } from "@/types";
import { create } from "zustand";

export type RecordType = "income" | "expense" | "transfer";

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
  activeTab: RecordType
  isLoading: boolean
  
  // Month navigation state
  selectedMonth: number // 0-11 (January = 0)
  selectedYear: number
  showDatePicker: boolean

  // Actions
  setCurrentRecord: (record: Record | null) => void
  setRecords: (records: Record[]) => void
  setShowRecordModal: (show: boolean) => void
  setRecordErrors: (errors: ValidationErrors) => void
  setRecordField: <K extends keyof Record>(field: K, value: Record[K]) => void
  setRecordMode: (mode: "edit" | "new") => void
  setActiveTab: (tab: RecordType) => void
  setIsLoading: (loading: boolean) => void
  
  // Month navigation actions
  setSelectedMonth: (month: number) => void
  setSelectedYear: (year: number) => void
  setShowDatePicker: (show: boolean) => void
  navigateToNextMonth: () => void
  navigateToPreviousMonth: () => void
  navigateToCurrentMonth: () => void

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
  isLoading: false,
  
  // Month navigation initial state (current month)
  selectedMonth: new Date().getMonth(),
  selectedYear: new Date().getFullYear(),
  showDatePicker: false,

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
  setActiveTab: (tab: RecordType) => {
    set({ activeTab: tab })
  },
  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
  
  // Month navigation actions
  setSelectedMonth: (month: number) => {
    set({ selectedMonth: month })
  },
  setSelectedYear: (year: number) => {
    set({ selectedYear: year })
  },
  setShowDatePicker: (show: boolean) => {
    set({ showDatePicker: show })
  },
  navigateToNextMonth: () => {
    const { selectedMonth, selectedYear } = get()
    if (selectedMonth === 11) {
      set({ selectedMonth: 0, selectedYear: selectedYear + 1 })
    } else {
      set({ selectedMonth: selectedMonth + 1 })
    }
  },
  navigateToPreviousMonth: () => {
    const { selectedMonth, selectedYear } = get()
    if (selectedMonth === 0) {
      set({ selectedMonth: 11, selectedYear: selectedYear - 1 })
    } else {
      set({ selectedMonth: selectedMonth - 1 })
    }
  },
  navigateToCurrentMonth: () => {
    const now = new Date()
    set({ 
      selectedMonth: now.getMonth(), 
      selectedYear: now.getFullYear() 
    })
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
}));