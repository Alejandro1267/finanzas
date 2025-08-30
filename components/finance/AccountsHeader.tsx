import { Colors } from "@/constants/Colors";
import { formatNumber$ } from "@/helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAccountStore } from "@/store/useAccountStore";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export function AccountsHeader() {
  const { accounts } = useAccountStore();

  const text = useThemeColor({}, "text");
  const cardBackground = useThemeColor({}, "backgroundCard");
  const incomeAmount = useThemeColor(
    { light: Colors.green, dark: Colors.greenT[300] },
    "text"
  );
  const expenseAmount = useThemeColor(
    { light: Colors.red, dark: Colors.redT[400] },
    "text"
  );

  const { positiveAccounts, negativeAccounts, totalBalance } = useMemo(() => {
    let positive = 0;
    let negative = 0;
    let total = 0;

    accounts.forEach((account) => {
      total += account.balance;

      if (account.balance > 0) {
        positive += account.balance;
      } else if (account.balance < 0) {
        negative += Math.abs(account.balance); // Show as positive number for display
      }
    });

    return {
      positiveAccounts: positive,
      negativeAccounts: negative,
      totalBalance: total,
    };
  }, [accounts]);

  return (
    <View style={[styles.container, { backgroundColor: cardBackground }]}>
      <View style={styles.columnsContainer}>
        <View style={styles.column}>
          <Text style={[styles.columnLabel, { color: text }]}>Disponible</Text>
          <Text style={[styles.columnValue, { color: incomeAmount }]}>
            {formatNumber$(positiveAccounts)}
          </Text>
        </View>

        <View style={styles.column}>
          <Text style={[styles.columnLabel, { color: text }]}>Deudas</Text>
          <Text style={[styles.columnValue, { color: expenseAmount }]}>
            {formatNumber$(negativeAccounts)}
          </Text>
        </View>

        <View style={styles.column}>
          <Text style={[styles.columnLabel, { color: text }]}>
            Balance Total
          </Text>
          <Text
            style={[
              styles.columnValue,
              { color: totalBalance >= 0 ? incomeAmount : expenseAmount },
            ]}
          >
            {formatNumber$(totalBalance)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 16,
  },
  columnsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  column: {
    alignItems: "center",
    flex: 1,
  },
  columnLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  columnValue: {
    fontSize: 16,
    fontWeight: "700",
  },
});
