import { useFinanceStore } from "@/store/FinanceStore2"
import { StyleSheet, Text, View } from "react-native"

export function TransactionsList() {
  const transactions = useFinanceStore((state) => state.transactions)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transacciones Recientes</Text>
      {transactions.slice(0, 10).map((transaction) => (
        <View key={transaction.id} style={styles.transactionCard}>
          <View style={styles.transactionInfo}>
            <Text style={styles.description}>{transaction.description}</Text>
            <Text style={styles.date}>{transaction.date}</Text>
          </View>
          <Text style={[styles.amount, transaction.type === "income" ? styles.incomeAmount : styles.expenseAmount]}>
            {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1e293b",
  },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionInfo: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  date: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  incomeAmount: {
    color: "#16a34a",
  },
  expenseAmount: {
    color: "#dc2626",
  },
})
