import { Colors } from "@/constants/Colors";
import { StyleSheet, Text, View } from "react-native";

export function Header() {
  // const getTotalBalance = useFinanceStore((state) => state.getTotalBalance);
  // const totalBalance = getTotalBalance();

  const totalBalance = 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finanzas Personales</Text>
      <Text style={styles.balance}>
        Balance Total: ${totalBalance.toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.slate[900],
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 8,
  },
  balance: {
    fontSize: 18,
    color: Colors.slate[200],
  },
});
