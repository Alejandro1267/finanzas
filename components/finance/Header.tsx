import { Colors } from "@/constants/Colors";
import { formatNumber$ } from "@/helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFinanceStore } from "@/store/FinanceStore";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export function Header() {
  const { records, totalBalance } = useFinanceStore();
  const text = useThemeColor({}, "text");
  const backgroundColor = useThemeColor(
    { light: Colors.slate[200], dark: Colors.slate[700] },
    "text"
  );

  const { totalIncome, totalExpenses } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    records.forEach((record) => {
      if (record.type === "income") {
        income += record.amount;
      } else if (record.type === "expense") {
        expenses += record.amount;
      }
    });
    return { totalIncome: income, totalExpenses: expenses };
  }, [records]);

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <View style={styles.columnsContainer}>
        <View style={styles.column}>
          <Text style={[styles.columnLabel, { color: text }]}>Ingresos</Text>
          <Text style={[styles.columnValue, styles.incomeValue]}>
            {formatNumber$(totalIncome)}
          </Text>
        </View>
        <View style={styles.column}>
          <Text style={[styles.columnLabel, { color: text }]}>Egresos</Text>
          <Text style={[styles.columnValue, styles.expenseValue]}>
            {formatNumber$(totalExpenses)}
          </Text>
        </View>
        <View style={styles.column}>
          <Text style={[styles.columnLabel, { color: text }]}>
            Balance Total
          </Text>
          <Text style={[styles.columnValue, { color: text }]}>
            {formatNumber$(totalBalance)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  columnsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 24,
  },
  column: {
    alignItems: "center",
    flex: 1,
  },
  columnLabel: {
    fontSize: 18,
    marginBottom: 4,
    fontWeight: "bold",
  },
  columnValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  incomeValue: {
    color: Colors.greenT[600],
  },
  expenseValue: {
    color: Colors.redT[600],
  },
});
