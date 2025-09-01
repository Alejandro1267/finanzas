import { Colors } from "@/constants/Colors";
import { formatNumber$ } from "@/helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAccountStore } from "@/store/useAccountStore";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function AccountsList() {
  const { accounts, setCurrentAccount, setShowAccountModal, setAccountMode } =
    useAccountStore();
  const text = useThemeColor({}, "text");
  const backgroundCard = useThemeColor({}, "backgroundCard");
  const detailText = useThemeColor({}, "detailText");

  return (
    <View style={styles.container}>
      {accounts.length > 0 ? (
        <>
          <Text style={[styles.title, { color: text }]}>Cuentas</Text>
          <Text style={[styles.titlePercentage, { color: text }]}>
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
          style={[styles.accountCard, { backgroundColor: backgroundCard }]}
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
            <Text style={[styles.accountName, { color: text }]}>
              {account.name}
            </Text>
            <View style={styles.accountDetailsContainer}>
              <Text style={[styles.accountDetails, { color: detailText }]}>
                {account.percentage}% •
              </Text>
              <Text
                style={
                  account.balance < 0
                    ? styles.accountBalance
                    : [styles.accountDetails, { color: detailText }]
                }
              >
                {formatNumber$(account.balance)}
              </Text>
            </View>
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
  },
  titlePercentage: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  accountDetails: {
    fontSize: 14,
    marginTop: 4,
  },
  accountBalance: {
    fontSize: 14,
    color: Colors.red,
    marginTop: 4,
  },
  accountDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
