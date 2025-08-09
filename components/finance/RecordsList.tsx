import { Colors } from "@/constants/Colors";
import { formatNumber$ } from "@/helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTransfer } from "@/hooks/useTransfer";
import { useAccountStore } from "@/store/useAccountStore";
import { useRecordStore } from "@/store/useRecordStore";
import { useTransferStore } from "@/store/useTransferStore";
import { Transaction } from "@/types";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function RecordsList() {
  const { accounts } = useAccountStore();
  const {
    setCurrentRecord,
    records,
    setRecordMode,
    setShowRecordModal,
    setActiveTab,
  } = useRecordStore();
  const { transfers, setCurrentTransfer } = useTransferStore();
  const { isTransfer } = useTransfer();

  const text = useThemeColor({}, "text");
  const background = useThemeColor({}, "backgroundCard");

  // Combine and sort transactions by date (newest first)
  const transactions: Transaction[] = [
    ...records,
    ...transfers.map((transfer) => ({
      ...transfer,
      type: "transfer" as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleTransactionPress = (transaction: Transaction) => {
    if (isTransfer(transaction)) {
      // Handle transfer press - open unified modal in transfer mode
      // setTransferMode("edit");
      setRecordMode("edit");
      setCurrentTransfer({
        id: transaction.id,
        date: transaction.date,
        amount: transaction.amount,
        description: transaction.description,
        origin: transaction.origin,
        destination: transaction.destination,
      });
      setActiveTab("transfer");
      setShowRecordModal(true); // Use unified modal
    } else {
      // Handle record press - open unified modal in record mode
      setRecordMode("edit");
      setCurrentRecord(transaction);
      setActiveTab(transaction.type);
      setShowRecordModal(true); // Use unified modal
    }
  };

  const getTransactionDisplay = (transaction: Transaction) => {
    if (isTransfer(transaction)) {
      const originAccount = accounts.find(
        (acc) => acc.id === transaction.origin
      );
      const destinationAccount = accounts.find(
        (acc) => acc.id === transaction.destination
      );

      return {
        description: transaction.description || "Transferencia",
        accountInfo: `${originAccount?.name || "Cuenta"} → ${
          destinationAccount?.name || "Cuenta"
        }`,
        amountStyle: styles.transferAmount,
        amountText: `↔ ${formatNumber$(transaction.amount)}`,
      };
    } else {
      const account = accounts.find((acc) => acc.id === transaction.account);

      return {
        description: transaction.description,
        accountInfo: account?.name || "Cuenta",
        amountStyle:
          transaction.type === "income"
            ? styles.incomeAmount
            : styles.expenseAmount,
        amountText: `${
          transaction.type === "income" ? "" : "- "
        }${formatNumber$(transaction.amount)}`,
      };
    }
  };

  return (
    <View style={styles.container}>
      {transactions.length > 0 ? (
        <Text style={[styles.title, { color: text }]}>Registros</Text>
      ) : (
        <Text style={[styles.title, { color: text }]}>No hay registros</Text>
      )}
      {transactions.map((transaction) => {
        const display = getTransactionDisplay(transaction);

        return (
          <TouchableOpacity
            key={transaction.id}
            activeOpacity={0.8}
            style={[styles.recordCard, { backgroundColor: background }]}
            onPress={() => {
              // setRecordMode("edit");
              // setCurrentRecord(record);
              // setShowRecordModal(true);
              // setActiveTab(record.type);
              handleTransactionPress(transaction);
            }}
          >
            <View style={styles.recordInfo}>
              <Text style={[styles.description, { color: text }]}>
                {display.description}
              </Text>
              <Text style={styles.date}>{transaction.date}</Text>
              <Text style={[styles.account]}>{display.accountInfo}</Text>
            </View>
            <Text style={[styles.amount, display.amountStyle]}>
              {display.amountText}
            </Text>
          </TouchableOpacity>
        );
      })}
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
  transferAmount: {
    color: Colors.blue,
  },
  account: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
    color: Colors.blueT[200],
  },
});
