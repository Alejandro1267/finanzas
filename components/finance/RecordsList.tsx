import { MonthSelector } from "@/components/ui/MonthSelector";
import { Colors } from "@/constants/Colors";
import { formatNumber$, formatShortDate } from "@/helpers";
import { useRecord } from "@/hooks/useRecord";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTransfer } from "@/hooks/useTransfer";
import { useAccountStore } from "@/store/useAccountStore";
import { useRecordStore } from "@/store/useRecordStore";
import { useTransferStore } from "@/store/useTransferStore";
import type { Transaction } from "@/types";
import { useEffect, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RecordsHeader } from "../ui/RecordsHeader";
// import { GestureDetector } from "react-native-gesture-handler";

export function RecordsList() {
  const { accounts } = useAccountStore();
  const {
    setCurrentRecord,
    records,
    setRecordMode,
    setShowRecordModal,
    setActiveTab,
    selectedMonth,
    selectedYear,
    // navigateToNextMonth,
    // navigateToPreviousMonth,
    isLoading,
  } = useRecordStore();
  const { transfers, setCurrentTransfer } = useTransferStore();
  const { isTransfer } = useTransfer();
  const { loadRecordsByMonth } = useRecord();

  const text = useThemeColor({}, "text");
  const background = useThemeColor({}, "backgroundCard");
  const bb = useThemeColor(
    { light: Colors.slate[200], dark: Colors.black },
    "background"
  );
  const incomeAmount = useThemeColor(
    { light: Colors.green, dark: Colors.greenT[300] },
    "text"
  );
  const expenseAmount = useThemeColor(
    { light: Colors.red, dark: Colors.redT[400] },
    "text"
  );
  const transferAmount = useThemeColor(
    { light: Colors.blue, dark: Colors.blueT[300] },
    "text"
  );

  // Load records when month/year changes
  useEffect(() => {
    loadRecordsByMonth(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  // Memoize grouped transactions for better performance
  const groupedData = useMemo(() => {
    const transactions: Transaction[] = [
      ...records,
      ...transfers.map((transfer) => ({
        ...transfer,
        type: "transfer" as const,
      })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    const grouped = transactions.reduce((groups, transaction) => {
      const date = transaction.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);

    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    return sortedDates.map((date) => {
      const dayTransactions = grouped[date];
      const dailyTotals = dayTransactions.reduce(
        (totals, transaction) => {
          if (isTransfer(transaction)) {
            totals.transfers += transaction.amount;
          } else if (transaction.type === "income") {
            totals.income += transaction.amount;
          } else {
            totals.expenses += transaction.amount;
          }
          return totals;
        },
        { income: 0, expenses: 0, transfers: 0 }
      );

      return {
        date,
        transactions: dayTransactions,
        dailyTotals,
      };
    });
  }, [records, transfers, isTransfer]);

  const handleTransactionPress = (transaction: Transaction) => {
    if (isTransfer(transaction)) {
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
      setShowRecordModal(true);
    } else {
      setRecordMode("edit");
      setCurrentRecord(transaction);
      setActiveTab(transaction.type);
      setShowRecordModal(true);
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
        amountStyle: { color: transferAmount },
        amountText: `↔ ${formatNumber$(transaction.amount)}`,
      };
    } else {
      const account = accounts.find((acc) => acc.id === transaction.account);

      return {
        description: transaction.description,
        accountInfo: account?.name || "Cuenta",
        amountStyle:
          transaction.type === "income"
            ? { color: incomeAmount }
            : { color: expenseAmount },
        amountText: `${
          transaction.type === "income" ? "" : "- "
        }${formatNumber$(transaction.amount)}`,
      };
    }
  };

  // Swipe de navegación entre meses.
  // Esta comentado porque aún no funciona bien.
  // const panGesture = Gesture.Pan()
  //   .activeOffsetX([-30, 30]) // Only activate for horizontal movement
  //   .failOffsetY([-20, 20]) // Fail if vertical movement is too small
  //   .minDistance(30)
  //   .runOnJS(true)
  //   .onEnd((event) => {
  //     const { translationX, velocityX } = event;

  //     // Swipe threshold
  //     const swipeThreshold = 80;
  //     const velocityThreshold = 800;

  //     if (
  //       Math.abs(translationX) > swipeThreshold ||
  //       (Math.abs(velocityX) > velocityThreshold &&
  //         Math.abs(event.translationY) < 50)
  //     ) {
  //       if (translationX > 0 || velocityX > 0) {
  //         // Swipe right - previous month
  //         navigateToPreviousMonth();
  //       } else {
  //         // Swipe left - next month
  //         navigateToNextMonth();
  //       }
  //     }
  //   });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <MonthSelector />
        <RecordsHeader />
      </View>

      <ScrollView>
        <Text style={[styles.title, { color: text }]}>
          {isLoading
            ? "Cargando..."
            : groupedData.length > 0
            ? "Registros"
            : "No hay registros"}
        </Text>

        {/* <GestureDetector gesture={panGesture}> */}
        <View style={styles.swipeContainer}>
          {groupedData.map((item) => (
            <View
              key={item.date}
              style={[styles.dateCard, { backgroundColor: background }]}
            >
              <View style={[styles.dateHeader, { borderBottomColor: bb }]}>
                <Text style={[styles.dateText, { color: text }]}>
                  {formatShortDate(item.date)}
                </Text>
                <View style={styles.totalsContainer}>
                  {item.dailyTotals.income > 0 && (
                    <Text style={[styles.totalText, { color: incomeAmount }]}>
                      {formatNumber$(item.dailyTotals.income)}
                    </Text>
                  )}
                  {item.dailyTotals.expenses > 0 && (
                    <Text style={[styles.totalText, { color: expenseAmount }]}>
                      {formatNumber$(item.dailyTotals.expenses)}
                    </Text>
                  )}
                </View>
              </View>

              {item.transactions.map((transaction, index) => {
                const display = getTransactionDisplay(transaction);
                const isLastItem = index === item.transactions.length - 1;

                return (
                  <TouchableOpacity
                    key={transaction.id}
                    activeOpacity={0.8}
                    style={[
                      styles.transactionItem,
                      !isLastItem && styles.transactionItemBorder,
                      { borderBottomColor: bb },
                    ]}
                    onPress={() => handleTransactionPress(transaction)}
                  >
                    <View style={styles.recordInfo}>
                      <Text style={[styles.description, { color: text }]}>
                        {display.description}
                      </Text>
                      <Text style={[styles.account, { color: transferAmount }]}>
                        {display.accountInfo}
                      </Text>
                    </View>
                    <Text style={[styles.amount, display.amountStyle]}>
                      {display.amountText}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
        {/* </GestureDetector> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginBottom: 24,
  },
  headerContainer: {
    marginTop: 24,
    marginBottom: 8,
    flexDirection: "column",
    gap: 8,
    // justifyContent: "space-between",
    // alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  swipeContainer: {
    flex: 1,
  },
  dateCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "700",
  },
  totalsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  totalText: {
    fontSize: 14,
    fontWeight: "600",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  transactionItemBorder: {
    borderBottomWidth: 2,
  },
  recordInfo: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: "600",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  account: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
});
