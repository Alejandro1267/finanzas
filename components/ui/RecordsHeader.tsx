import { Colors } from "@/constants/Colors";
import { formatNumber$ } from "@/helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRecordStore } from "@/store/useRecordStore";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export function RecordsHeader() {
  const { records } = useRecordStore();

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

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    let income = 0;
    let expenses = 0;

    // Calculate from records (already filtered by month)
    records.forEach((record) => {
      if (record.type === "income") {
        income += record.amount;
      } else if (record.type === "expense") {
        expenses += record.amount;
      }
    });

    const balance = income - expenses;

    return { totalIncome: income, totalExpenses: expenses, balance };
  }, [records]);

  return (
    <View style={[styles.container, { backgroundColor: cardBackground }]}>
      <View style={styles.columnsContainer}>
        <View style={styles.column}>
          <Text style={[styles.columnLabel, { color: text }]}>Ingresos</Text>
          <Text style={[styles.columnValue, { color: incomeAmount }]}>
            {formatNumber$(totalIncome)}
          </Text>
        </View>

        <View style={styles.column}>
          <Text style={[styles.columnLabel, { color: text }]}>Egresos</Text>
          <Text style={[styles.columnValue, { color: expenseAmount }]}>
            {formatNumber$(totalExpenses)}
          </Text>
        </View>

        <View style={styles.column}>
          <Text style={[styles.columnLabel, { color: text }]}>Balance</Text>
          <Text
            style={[
              styles.columnValue,
              { color: text },
              //   { color: balance >= 0 ? incomeAmount : expenseAmount },
            ]}
          >
            {formatNumber$(balance)}
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
    // marginBottom: 16,
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
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  columnValue: {
    fontSize: 16,
    fontWeight: "700",
  },
});
