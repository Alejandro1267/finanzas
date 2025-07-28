import { useFinanceStore } from "@/store/FinanceStore";
import { StyleSheet, Text, View } from "react-native";

export function RecordsList() {
  const { records } = useFinanceStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registros Recientes</Text>
      {records.slice(0, 10).map((record) => (
        <View key={record.id} style={styles.recordCard}>
          <View style={styles.recordInfo}>
            <Text style={styles.description}>{record.description}</Text>
            <Text style={styles.date}>{record.date}</Text>
          </View>
          <Text
            style={[
              styles.amount,
              record.type === "income"
                ? styles.incomeAmount
                : styles.expenseAmount,
            ]}
          >
            {record.type === "income" ? "" : "- "}${record.amount.toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );
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
  recordCard: {
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
  recordInfo: {
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
});
