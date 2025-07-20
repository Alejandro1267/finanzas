"use client"

import { useFinanceStore } from "@/store/FinanceStore2"
import { useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"

export function ExpenseModal() {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [selectedAccountId, setSelectedAccountId] = useState("")

  const showExpenseModal = useFinanceStore((state) => state.showExpenseModal)
  const setShowExpenseModal = useFinanceStore((state) => state.setShowExpenseModal)
  const addExpense = useFinanceStore((state) => state.addExpense)
  const showAlert = useFinanceStore((state) => state.showAlert)
  const accounts = useFinanceStore((state) => state.accounts)

  const handleSubmit = () => {
    if (!amount || !description || !selectedAccountId) {
      showAlert("Por favor completa todos los campos")
      return
    }

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      showAlert("Ingresa un monto válido")
      return
    }

    addExpense(numAmount, description, selectedAccountId)
    setAmount("")
    setDescription("")
    setSelectedAccountId("")
  }

  const handleClose = () => {
    setShowExpenseModal(false)
    setAmount("")
    setDescription("")
    setSelectedAccountId("")
  }

  return (
    <Modal visible={showExpenseModal} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Registrar Gasto</Text>
          <TextInput
            style={styles.input}
            placeholder="Monto"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            style={styles.input}
            placeholder="Descripción"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.selectAccountText}>Seleccionar cuenta:</Text>
          <ScrollView style={styles.accountSelector} showsVerticalScrollIndicator={false}>
            {accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[styles.accountOption, selectedAccountId === account.id && styles.selectedAccount]}
                onPress={() => setSelectedAccountId(account.id)}
              >
                <View style={[styles.colorIndicator, { backgroundColor: account.color }]} />
                <Text style={styles.accountOptionText}>
                  {account.name} (${account.balance.toFixed(2)})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1e293b",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: "#1e293b",
  },
  selectAccountText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1e293b",
  },
  accountSelector: {
    maxHeight: 160,
    marginBottom: 20,
  },
  accountOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f8fafc",
  },
  selectedAccount: {
    backgroundColor: "#dbeafe",
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  accountOptionText: {
    fontSize: 16,
    color: "#1e293b",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#6b7280",
  },
  confirmButton: {
    backgroundColor: "#16a34a",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})
