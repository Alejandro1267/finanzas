import { useFinanceStore } from "@/store/FinanceStore2"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

export function ActionButtons() {
  const setShowIncomeModal = useFinanceStore((state) => state.setShowIncomeModal)
  const setShowExpenseModal = useFinanceStore((state) => state.setShowExpenseModal)
  const setShowAccountsModal = useFinanceStore((state) => state.setShowAccountsModal)

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, styles.incomeButton]} onPress={() => setShowIncomeModal(true)}>
        <Text style={styles.buttonText}>+ Ingreso</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.expenseButton]} onPress={() => setShowExpenseModal(true)}>
        <Text style={styles.buttonText}>- Gasto</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.accountsButton]} onPress={() => setShowAccountsModal(true)}>
        <Text style={styles.buttonText}>Cuentas</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  incomeButton: {
    backgroundColor: "#16a34a",
  },
  expenseButton: {
    backgroundColor: "#dc2626",
  },
  accountsButton: {
    backgroundColor: "#2563eb",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})
