import { Colors } from "@/constants/Colors";
import { formatNumber$ } from "@/helpers";
import { useFinanceStore } from "@/store/FinanceStore";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function AccountsList() {
  const { accounts, setCurrentAccount, setShowAccountModal, setAccountMode } =
    useFinanceStore();

  return (
    <View style={styles.container}>
      {accounts.length > 0 ? (
        <>
          <Text style={styles.title}>Cuentas</Text>
          <Text style={styles.titlePercentage}>
            Porcentaje Total:{" "}
            {accounts.reduce((acc, account) => acc + account.percentage, 0)}%
          </Text>
        </>
      ) : (
        <Text style={styles.title}>No hay cuentas</Text>
      )}
      {accounts.map((account) => (
        <TouchableOpacity
          key={account.id}
          style={styles.accountCard}
          onPress={() => {
            setAccountMode("edit");
            setCurrentAccount(account);
            setShowAccountModal(true);
          }}
        >
          <View
            style={[styles.colorIndicator, { backgroundColor: account.color }]}
          />
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountDetails}>
              {account.percentage}% • {formatNumber$(account.balance)}
            </Text>
          </View>
        </TouchableOpacity>
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
    marginBottom: 12,
    color: Colors.slate[800],
  },
  titlePercentage: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: Colors.slate[800],
  },
  accountCard: {
    flexDirection: "row",
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
    color: Colors.slate[800],
  },
  accountDetails: {
    fontSize: 14,
    color: Colors.slate[600],
    marginTop: 4,
  },
});
