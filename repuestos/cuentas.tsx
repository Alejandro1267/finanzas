// import { Text, View } from "react-native";

// export default function Cuentas() {
//     return (
//         <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//             <Text style={{ fontSize: 20, fontWeight: "bold" }}>Cuentas</Text>

//         </View>
//     )
// }

"use client"

import { AccountsList } from "@/components/finance/AccountsList"
import { AccountsModal } from "@/components/finance/AccountsModal"
import { ActionButtons } from "@/components/finance/ActionButtons"
import { AlertMessage } from "@/components/finance/AlertMessage"
import { ExpenseModal } from "@/components/finance/ExpenseModal"
import { Header } from "@/components/finance/Header"
import { IncomeModal } from "@/components/finance/IncomeModal"
import { TransactionsList } from "@/components/finance/TransactionsList"
import { useState } from "react"
import { View } from "react-native"

type Account = {
  id: string
  name: string
  percentage: number
  balance: number
  color: string
}

type Transaction = {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  date: string
  accountId?: string
  distribution?: { accountId: string; amount: number }[]
}

const INITIAL_ACCOUNTS: Account[] = [
  { id: "1", name: "Gastos Básicos", percentage: 50, balance: 0, color: "#FF6B6B" },
  { id: "2", name: "Ahorros", percentage: 30, balance: 0, color: "#4ECDC4" },
  { id: "3", name: "Entretenimiento", percentage: 15, balance: 0, color: "#45B7D1" },
  { id: "4", name: "Emergencias", percentage: 5, balance: 0, color: "#96CEB4" },
]

export default function FinanceApp() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showAccountsModal, setShowAccountsModal] = useState(false)
  const [incomeAmount, setIncomeAmount] = useState("")
  const [incomeDescription, setIncomeDescription] = useState("")
  const [expenseAmount, setExpenseAmount] = useState("")
  const [expenseDescription, setExpenseDescription] = useState("")
  const [selectedAccountId, setSelectedAccountId] = useState("")
  const [alertMessage, setAlertMessage] = useState("")

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  const showAlert = (message: string) => {
    setAlertMessage(message)
    setTimeout(() => setAlertMessage(""), 3000)
  }

  const addIncome = () => {
    if (!incomeAmount || !incomeDescription) {
      showAlert("Por favor completa todos los campos")
      return
    }

    const amount = Number.parseFloat(incomeAmount)
    if (isNaN(amount) || amount <= 0) {
      showAlert("Ingresa un monto válido")
      return
    }

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
      description: incomeDescription,
      date: new Date().toLocaleDateString(),
      distribution,
    }

    setAccounts(updatedAccounts)
    setTransactions([newTransaction, ...transactions])
    setIncomeAmount("")
    setIncomeDescription("")
    setShowIncomeModal(false)
    showAlert("Ingreso registrado exitosamente")
  }

  const addExpense = () => {
    if (!expenseAmount || !expenseDescription || !selectedAccountId) {
      showAlert("Por favor completa todos los campos")
      return
    }

    const amount = Number.parseFloat(expenseAmount)
    if (isNaN(amount) || amount <= 0) {
      showAlert("Ingresa un monto válido")
      return
    }

    const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId)
    if (!selectedAccount || selectedAccount.balance < amount) {
      showAlert("Saldo insuficiente en la cuenta seleccionada")
      return
    }

    const updatedAccounts = accounts.map((account) =>
      account.id === selectedAccountId ? { ...account, balance: account.balance - amount } : account,
    )

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: "expense",
      amount,
      description: expenseDescription,
      date: new Date().toLocaleDateString(),
      accountId: selectedAccountId,
    }

    setAccounts(updatedAccounts)
    setTransactions([newTransaction, ...transactions])
    setExpenseAmount("")
    setExpenseDescription("")
    setSelectedAccountId("")
    setShowExpenseModal(false)
    showAlert("Gasto registrado exitosamente")
  }

  const updateAccountPercentage = (accountId: string, newPercentage: number) => {
    const updatedAccounts = accounts.map((account) =>
      account.id === accountId ? { ...account, percentage: newPercentage } : account,
    )
    setAccounts(updatedAccounts)
  }

  const getTotalPercentage = () => {
    return accounts.reduce((sum, account) => sum + account.percentage, 0)
  }

  return (
    <View className="min-h-screen bg-gray-100">
      <AlertMessage />
      <Header />
      <ActionButtons
        // setShowIncomeModal={setShowIncomeModal}
        // setShowExpenseModal={setShowExpenseModal}
        // setShowAccountsModal={setShowAccountsModal}
      />

      <View className="max-w-4xl mx-auto px-4 pb-6">
        <AccountsList />
        <TransactionsList />
      </View>

      <IncomeModal
        // showIncomeModal={showIncomeModal}
        // setShowIncomeModal={setShowIncomeModal}
        // incomeAmount={incomeAmount}
        // setIncomeAmount={setIncomeAmount}
        // incomeDescription={incomeDescription}
        // setIncomeDescription={setIncomeDescription}
        // addIncome={addIncome}
      />
      <ExpenseModal
        // showExpenseModal={showExpenseModal}
        // setShowExpenseModal={setShowExpenseModal}
        // expenseAmount={expenseAmount}
        // setExpenseAmount={setExpenseAmount}
        // expenseDescription={expenseDescription}
        // setExpenseDescription={setExpenseDescription}
        // selectedAccountId={selectedAccountId}
        // setSelectedAccountId={setSelectedAccountId}
        // accounts={accounts}
        // addExpense={addExpense}
      />
      <AccountsModal
        // showAccountsModal={showAccountsModal}
        // setShowAccountsModal={setShowAccountsModal}
        // accounts={accounts}
        // updateAccountPercentage={updateAccountPercentage}
        // getTotalPercentage={getTotalPercentage}
      />
    </View>
  )
}
