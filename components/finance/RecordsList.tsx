import { Colors } from "@/constants/Colors";
import { formatNumber$ } from "@/helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFinanceStore } from "@/store/FinanceStore";
import { useRecordStore } from "@/store/useRecordStore";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function RecordsList() {
  const { accounts } = useFinanceStore();
  const {
    setCurrentRecord,
    records,
    setRecordMode,
    setShowRecordModal,
    setActiveTab,
  } = useRecordStore();
  const text = useThemeColor({}, "text");
  const background = useThemeColor({}, "backgroundCard");

  return (
    <View style={styles.container}>
      {records.length > 0 ? (
        <Text style={[styles.title, { color: text }]}>Registros</Text>
      ) : (
        <Text style={[styles.title, { color: text }]}>No hay registros</Text>
      )}
      {records.map((record) => (
        <TouchableOpacity
          key={record.id}
          activeOpacity={0.8}
          style={[styles.recordCard, { backgroundColor: background }]}
          onPress={() => {
            setRecordMode("edit");
            setCurrentRecord(record);
            setShowRecordModal(true);
            setActiveTab(record.type);
          }}
        >
          <View style={styles.recordInfo}>
            <Text style={[styles.description, { color: text }]}>
              {record.description}
            </Text>
            <Text style={styles.date}>{record.date}</Text>
            <Text style={[styles.account]}>
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
            {record.type === "income" ? "" : "- "}
            {formatNumber$(record.amount)}
          </Text>
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
    marginBottom: 16,
  },
  recordCard: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  recordInfo: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: "600",
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
    marginTop: 4,
    fontWeight: "500",
    color: Colors.blue,
  },
});
