import { useFinanceStore } from "@/store/FinanceStore2"
import { StyleSheet, Text, View } from "react-native"

export function Header() {
  const getTotalBalance = useFinanceStore((state) => state.getTotalBalance)
  const totalBalance = getTotalBalance()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finanzas Personales</Text>
      <Text style={styles.balance}>Balance Total: ${totalBalance.toFixed(2)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e293b",
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  balance: {
    fontSize: 18,
    color: "#e2e8f0",
  },
})
