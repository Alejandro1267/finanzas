// import { Colors } from "@/constants/Colors";
// import { formatNumber$ } from "@/helpers";
// import { useThemeColor } from "@/hooks/useThemeColor";
// import { useTransfer } from "@/hooks/useTransfer";
// import { useAccountStore } from "@/store/useAccountStore";
// import { useRecordStore } from "@/store/useRecordStore";
// import { useTransferStore } from "@/store/useTransferStore";
// import { Transaction } from "@/types";
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// export function RecordsList() {
//   const { accounts } = useAccountStore();
//   const {
//     setCurrentRecord,
//     records,
//     setRecordMode,
//     setShowRecordModal,
//     setActiveTab,
//   } = useRecordStore();
//   const { transfers, setCurrentTransfer } = useTransferStore();
//   const { isTransfer } = useTransfer();

//   const text = useThemeColor({}, "text");
//   const background = useThemeColor({}, "backgroundCard");
//   const incomeAmount = useThemeColor({ light: Colors.green, dark: Colors.greenT[300]}, "text")
//   const expenseAmount = useThemeColor({ light: Colors.red, dark: Colors.redT[400]}, "text")
//   const transferAmount = useThemeColor({ light: Colors.blue, dark: Colors.blueT[300]}, "text")

//   // Combina y ordena las transacciones por fecha (más reciente primero)
//   const transactions: Transaction[] = [
//     ...records,
//     ...transfers.map((transfer) => ({
//       ...transfer,
//       type: "transfer" as const,
//     })),
//   ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

//   const handleTransactionPress = (transaction: Transaction) => {
//     if (isTransfer(transaction)) {
//       setRecordMode("edit");
//       setCurrentTransfer({
//         id: transaction.id,
//         date: transaction.date,
//         amount: transaction.amount,
//         description: transaction.description,
//         origin: transaction.origin,
//         destination: transaction.destination,
//       });
//       setActiveTab("transfer");
//       setShowRecordModal(true);
//     } else {
//       setRecordMode("edit");
//       setCurrentRecord(transaction);
//       setActiveTab(transaction.type);
//       setShowRecordModal(true);
//     }
//   };

//   const getTransactionDisplay = (transaction: Transaction) => {
//     if (isTransfer(transaction)) {
//       const originAccount = accounts.find(
//         (acc) => acc.id === transaction.origin
//       );
//       const destinationAccount = accounts.find(
//         (acc) => acc.id === transaction.destination
//       );

//       return {
//         description: transaction.description || "Transferencia",
//         accountInfo: `${originAccount?.name || "Cuenta"} → ${
//           destinationAccount?.name || "Cuenta"
//         }`,
//         amountStyle: { color: transferAmount },
//         amountText: `↔ ${formatNumber$(transaction.amount)}`,
//       };
//     } else {
//       const account = accounts.find((acc) => acc.id === transaction.account);

//       return {
//         description: transaction.description,
//         accountInfo: account?.name || "Cuenta",
//         amountStyle:
//           transaction.type === "income"
//             ? { color: incomeAmount }
//             : { color: expenseAmount },
//         amountText: `${
//           transaction.type === "income" ? "" : "- "
//         }${formatNumber$(transaction.amount)}`,
//       };
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {transactions.length > 0 ? (
//         <Text style={[styles.title, { color: text }]}>Registros</Text>
//       ) : (
//         <Text style={[styles.title, { color: text }]}>No hay registros</Text>
//       )}
//       {transactions.map((transaction) => {
//         const display = getTransactionDisplay(transaction);

//         return (
//           <TouchableOpacity
//             key={transaction.id}
//             activeOpacity={0.8}
//             style={[styles.recordCard, { backgroundColor: background }]}
//             onPress={() => handleTransactionPress(transaction)}
//           >
//             <View style={styles.recordInfo}>
//               <Text style={[styles.description, { color: text }]}>
//                 {display.description}
//               </Text>
//               <Text style={styles.date}>{transaction.date}</Text>
//               <Text style={[styles.account, { color: transferAmount }]}>{display.accountInfo}</Text>
//             </View>
//             <Text style={[styles.amount, display.amountStyle]}>
//               {display.amountText}
//             </Text>
//           </TouchableOpacity>
//         );
//       })}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 24,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 16,
//   },
//   recordCard: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     marginBottom: 12,
//     borderRadius: 8,
//     elevation: 2,
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   recordInfo: {
//     flex: 1,
//   },
//   description: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   date: {
//     fontSize: 12,
//     color: Colors.slate[500],
//     marginTop: 4,
//   },
//   amount: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   account: {
//     fontSize: 14,
//     marginTop: 4,
//     fontWeight: "500",
//   },
// });


//// VERSIÓN 1

// import { Colors } from "@/constants/Colors"
// import { formatNumber$ } from "@/helpers"
// import { useThemeColor } from "@/hooks/useThemeColor"
// import { useTransfer } from "@/hooks/useTransfer"
// import { useAccountStore } from "@/store/useAccountStore"
// import { useRecordStore } from "@/store/useRecordStore"
// import { useTransferStore } from "@/store/useTransferStore"
// import type { Transaction } from "@/types"
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

// export function RecordsList() {
//   const { accounts } = useAccountStore()
//   const { setCurrentRecord, records, setRecordMode, setShowRecordModal, setActiveTab } = useRecordStore()
//   const { transfers, setCurrentTransfer } = useTransferStore()
//   const { isTransfer } = useTransfer()

//   const text = useThemeColor({}, "text")
//   const background = useThemeColor({}, "backgroundCard")
//   const incomeAmount = useThemeColor({ light: Colors.green, dark: Colors.greenT[300] }, "text")
//   const expenseAmount = useThemeColor({ light: Colors.red, dark: Colors.redT[400] }, "text")
//   const transferAmount = useThemeColor({ light: Colors.blue, dark: Colors.blueT[300] }, "text")

//   // Combina y ordena las transacciones por fecha (más reciente primero)
//   const transactions: Transaction[] = [
//     ...records,
//     ...transfers.map((transfer) => ({
//       ...transfer,
//       type: "transfer" as const,
//     })),
//   ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

//   const groupedTransactions = transactions.reduce(
//     (groups, transaction) => {
//       const date = transaction.date
//       if (!groups[date]) {
//         groups[date] = []
//       }
//       groups[date].push(transaction)
//       return groups
//     },
//     {} as Record<string, Transaction[]>,
//   )

//   const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

//   const handleTransactionPress = (transaction: Transaction) => {
//     if (isTransfer(transaction)) {
//       setRecordMode("edit")
//       setCurrentTransfer({
//         id: transaction.id,
//         date: transaction.date,
//         amount: transaction.amount,
//         description: transaction.description,
//         origin: transaction.origin,
//         destination: transaction.destination,
//       })
//       setActiveTab("transfer")
//       setShowRecordModal(true)
//     } else {
//       setRecordMode("edit")
//       setCurrentRecord(transaction)
//       setActiveTab(transaction.type)
//       setShowRecordModal(true)
//     }
//   }

//   const getTransactionDisplay = (transaction: Transaction) => {
//     if (isTransfer(transaction)) {
//       const originAccount = accounts.find((acc) => acc.id === transaction.origin)
//       const destinationAccount = accounts.find((acc) => acc.id === transaction.destination)

//       return {
//         description: transaction.description || "Transferencia",
//         accountInfo: `${originAccount?.name || "Cuenta"} → ${destinationAccount?.name || "Cuenta"}`,
//         amountStyle: { color: transferAmount },
//         amountText: `↔ ${formatNumber$(transaction.amount)}`,
//       }
//     } else {
//       const account = accounts.find((acc) => acc.id === transaction.account)

//       return {
//         description: transaction.description,
//         accountInfo: account?.name || "Cuenta",
//         amountStyle: transaction.type === "income" ? { color: incomeAmount } : { color: expenseAmount },
//         amountText: `${transaction.type === "income" ? "" : "- "}${formatNumber$(transaction.amount)}`,
//       }
//     }
//   }

//   return (
//     <View style={styles.container}>
//       {transactions.length > 0 ? (
//         <Text style={[styles.title, { color: text }]}>Registros</Text>
//       ) : (
//         <Text style={[styles.title, { color: text }]}>No hay registros</Text>
//       )}

//       {sortedDates.map((date) => (
//         <View key={date} style={styles.dateGroup}>
//           {/* Date header */}
//           <Text style={[styles.dateHeader, { color: text }]}>{date}</Text>

//           {/* Date card containing all transactions for this date */}
//           <View style={[styles.dateCard, { backgroundColor: background }]}>
//             {groupedTransactions[date].map((transaction, index) => {
//               const display = getTransactionDisplay(transaction)
//               const isLastItem = index === groupedTransactions[date].length - 1

//               return (
//                 <TouchableOpacity
//                   key={transaction.id}
//                   activeOpacity={0.8}
//                   style={[styles.transactionItem, !isLastItem && styles.transactionItemBorder]}
//                   onPress={() => handleTransactionPress(transaction)}
//                 >
//                   <View style={styles.recordInfo}>
//                     <Text style={[styles.description, { color: text }]}>{display.description}</Text>
//                     <Text style={[styles.account, { color: transferAmount }]}>{display.accountInfo}</Text>
//                   </View>
//                   <Text style={[styles.amount, display.amountStyle]}>{display.amountText}</Text>
//                 </TouchableOpacity>
//               )
//             })}
//           </View>
//         </View>
//       ))}
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 24,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 16,
//   },
//   dateGroup: {
//     marginBottom: 16,
//   },
//   dateHeader: {
//     fontSize: 14,
//     fontWeight: "600",
//     marginBottom: 8,
//     marginLeft: 4,
//     color: Colors.slate[600],
//   },
//   dateCard: {
//     borderRadius: 8,
//     elevation: 2,
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   transactionItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//   },
//   transactionItemBorder: {
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.slate[200],
//   },
//   recordInfo: {
//     flex: 1,
//   },
//   description: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   amount: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   account: {
//     fontSize: 14,
//     marginTop: 4,
//     fontWeight: "500",
//   },
// })


//// VERSIÓN 2

import { Colors } from "@/constants/Colors"
import { formatNumber$, formatShortDate } from "@/helpers"
import { useThemeColor } from "@/hooks/useThemeColor"
import { useTransfer } from "@/hooks/useTransfer"
import { useAccountStore } from "@/store/useAccountStore"
import { useRecordStore } from "@/store/useRecordStore"
import { useTransferStore } from "@/store/useTransferStore"
import type { Transaction } from "@/types"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

export function RecordsList() {
  const { accounts } = useAccountStore()
  const { setCurrentRecord, records, setRecordMode, setShowRecordModal, setActiveTab } = useRecordStore()
  const { transfers, setCurrentTransfer } = useTransferStore()
  const { isTransfer } = useTransfer()

  const text = useThemeColor({}, "text")
  const background = useThemeColor({}, "backgroundCard")
  const bb = useThemeColor({ light: Colors.slate[200], dark: Colors.black }, "background")
  const incomeAmount = useThemeColor({ light: Colors.green, dark: Colors.greenT[300] }, "text")
  const expenseAmount = useThemeColor({ light: Colors.red, dark: Colors.redT[400] }, "text")
  const transferAmount = useThemeColor({ light: Colors.blue, dark: Colors.blueT[300] }, "text")

  // Combina y ordena las transacciones por fecha (más reciente primero)
  const transactions: Transaction[] = [
    ...records,
    ...transfers.map((transfer) => ({
      ...transfer,
      type: "transfer" as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const groupedTransactions = transactions.reduce(
    (groups, transaction) => {
      const date = transaction.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(transaction)
      return groups
    },
    {} as Record<string, Transaction[]>,
  )

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const handleTransactionPress = (transaction: Transaction) => {
    if (isTransfer(transaction)) {
      setRecordMode("edit")
      setCurrentTransfer({
        id: transaction.id,
        date: transaction.date,
        amount: transaction.amount,
        description: transaction.description,
        origin: transaction.origin,
        destination: transaction.destination,
      })
      setActiveTab("transfer")
      setShowRecordModal(true)
    } else {
      setRecordMode("edit")
      setCurrentRecord(transaction)
      setActiveTab(transaction.type)
      setShowRecordModal(true)
    }
  }

  const getTransactionDisplay = (transaction: Transaction) => {
    if (isTransfer(transaction)) {
      const originAccount = accounts.find((acc) => acc.id === transaction.origin)
      const destinationAccount = accounts.find((acc) => acc.id === transaction.destination)

      return {
        description: transaction.description || "Transferencia",
        accountInfo: `${originAccount?.name || "Cuenta"} → ${destinationAccount?.name || "Cuenta"}`,
        amountStyle: { color: transferAmount },
        amountText: `↔ ${formatNumber$(transaction.amount)}`,
      }
    } else {
      const account = accounts.find((acc) => acc.id === transaction.account)

      return {
        description: transaction.description,
        accountInfo: account?.name || "Cuenta",
        amountStyle: transaction.type === "income" ? { color: incomeAmount } : { color: expenseAmount },
        amountText: `${transaction.type === "income" ? "" : "- "}${formatNumber$(transaction.amount)}`,
      }
    }
  }

  const getDailyTotals = (transactions: Transaction[]) => {
    return transactions.reduce(
      (totals, transaction) => {
        if (isTransfer(transaction)) {
          totals.transfers += transaction.amount
        } else if (transaction.type === "income") {
          totals.income += transaction.amount
        } else {
          totals.expenses += transaction.amount
        }
        return totals
      },
      { income: 0, expenses: 0, transfers: 0 },
    )
  }

  return (
    <View style={styles.container}>
      {transactions.length > 0 ? (
        <Text style={[styles.title, { color: text }]}>Registros</Text>
      ) : (
        <Text style={[styles.title, { color: text }]}>No hay registros</Text>
      )}

      {sortedDates.map((date) => {
        const dailyTotals = getDailyTotals(groupedTransactions[date])

        return (
          <View key={date} style={[styles.dateCard, { backgroundColor: background }]}>
            <View style={[styles.dateHeader, { borderBottomColor: bb }]}>
              <Text style={[styles.dateText, { color: text }]}>{formatShortDate(date)}</Text>
              <View style={styles.totalsContainer}>
                {dailyTotals.income > 0 && (
                  <Text style={[styles.totalText, { color: incomeAmount }]}>{formatNumber$(dailyTotals.income)}</Text>
                )}
                {dailyTotals.expenses > 0 && (
                  <Text style={[styles.totalText, { color: expenseAmount }]}>
                    {formatNumber$(dailyTotals.expenses)}
                  </Text>
                )}
              </View>
            </View>

            {/* <View style={[styles.headerSeparator, { backgroundColor: bb }]} /> */}

            {/* Transactions list */}
            {groupedTransactions[date].map((transaction, index) => {
              const display = getTransactionDisplay(transaction)
              const isLastItem = index === groupedTransactions[date].length - 1

              return (
                <TouchableOpacity
                  key={transaction.id}
                  activeOpacity={0.8}
                  style={[styles.transactionItem, !isLastItem && styles.transactionItemBorder, { borderBottomColor: bb }]}
                  onPress={() => handleTransactionPress(transaction)}
                >
                  <View style={styles.recordInfo}>
                    <Text style={[styles.description, { color: text }]}>{display.description}</Text>
                    <Text style={[styles.account, { color: transferAmount }]}>{display.accountInfo}</Text>
                  </View>
                  <Text style={[styles.amount, display.amountStyle]}>{display.amountText}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )
      })}
    </View>
  )
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
    borderBottomWidth: 1,
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
  headerSeparator: {
    height: 1,
    marginHorizontal: 16,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  transactionItemBorder: {
    borderBottomWidth: 1,
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
})
