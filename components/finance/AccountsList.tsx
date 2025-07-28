import { useFinanceStore } from "@/store/FinanceStore";
import { StyleSheet, Text, View } from "react-native";

export function AccountsList() {
  const { accounts } = useFinanceStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cuentas</Text>
      {accounts.map((account) => (
        <View key={account.id} style={styles.accountCard}>
          <View
            style={[styles.colorIndicator, { backgroundColor: account.color }]}
          />
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountDetails}>
              {account.percentage}% • ${account.balance.toFixed(2)}
            </Text>
          </View>
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
  accountCard: {
    flexDirection: "row",
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
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  accountDetails: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
});
