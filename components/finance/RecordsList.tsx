import { Colors } from "@/constants/Colors";
import { useFinanceStore } from "@/store/FinanceStore";
import { StyleSheet, Text, View } from "react-native";

export function RecordsList() {
  const { records, accounts } = useFinanceStore();

  return (
    <View style={styles.container}>
      {records.length > 0 ? (
        <Text style={styles.title}>Registros</Text>
      ) : (
        <Text style={styles.title}>No hay registros</Text>
      )}
      {records.map((record) => (
        <View key={record.id} style={styles.recordCard}>
          <View style={styles.recordInfo}>
            <Text style={styles.description}>{record.description}</Text>
            <Text style={styles.date}>{record.date}</Text>
            <Text style={styles.account}>
              {accounts.find((account) => account.id === record.account)?.name}
            </Text>
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
    color: Colors.slate[800],
  },
  recordCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: Colors.black,
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
    color: Colors.slate[800],
  },
  date: {
    fontSize: 12,
    color: Colors.slate[500],
    marginTop: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  incomeAmount: {
    color: Colors.green,
  },
  expenseAmount: {
    color: Colors.red,
  },
  account: {
    fontSize: 14,
    color: Colors.blue,
    marginTop: 4,
    fontWeight: "500",
  },
});
