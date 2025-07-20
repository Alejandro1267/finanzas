"use client"

import { useFinanceStore } from "@/store/FinanceStore2"
import { useState } from "react"
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"

export function IncomeModal() {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")

  const showIncomeModal = useFinanceStore((state) => state.showIncomeModal)
  const setShowIncomeModal = useFinanceStore((state) => state.setShowIncomeModal)
  const addIncome = useFinanceStore((state) => state.addIncome)
  const showAlert = useFinanceStore((state) => state.showAlert)

  const handleSubmit = () => {
    if (!amount || !description) {
      showAlert("Por favor completa todos los campos")
      return
    }

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      showAlert("Ingresa un monto válido")
      return
    }

    addIncome(numAmount, description)
    setAmount("")
    setDescription("")
  }

  const handleClose = () => {
    setShowIncomeModal(false)
    setAmount("")
    setDescription("")
  }

  return (
    <Modal visible={showIncomeModal} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Registrar Ingreso</Text>
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
          <Text style={styles.distributionText}>Se distribuirá automáticamente según los porcentajes configurados</Text>
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
  distributionText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
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
