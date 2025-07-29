import { Colors } from "@/constants/Colors";
import { useFinanceStore } from "@/store/FinanceStore";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export function ExpenseForm() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const { setShowRecordModal, setAlertMessage, accounts } = useFinanceStore();

  //   const addExpense = useFinanceStore((state) => state.addExpense);

  const addExpense = () => {
    console.log("addExpense");
  };

  const handleSubmit = () => {
    if (!amount || !description || !selectedAccountId) {
      setAlertMessage("Por favor completa todos los campos");
      return;
    }

    const numAmount = Number.parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setAlertMessage("Ingresa un monto válido");
      return;
    }

    // addExpense(numAmount, description, selectedAccountId);
    addExpense();
    setAmount("");
    setDescription("");
    setSelectedAccountId("");
  };

  const handleClose = () => {
    setShowRecordModal(false);
    setAmount("");
    setDescription("");
    setSelectedAccountId("");
  };

  return (
    <View>
      {/* <Text style={styles.title}>Registrar Gasto</Text> */}
      <TextInput
        style={styles.input}
        placeholder="Monto"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholderTextColor="#9ca3af"
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholderTextColor="#9ca3af"
      />
      <Text style={styles.selectAccountText}>Seleccionar cuenta:</Text>
      <ScrollView
        style={styles.accountSelector}
        showsVerticalScrollIndicator={false}
      >
        {accounts.map((account) => (
          <TouchableOpacity
            key={account.id}
            style={[
              styles.accountOption,
              selectedAccountId === account.id && styles.selectedAccount,
            ]}
            onPress={() => setSelectedAccountId(account.id)}
          >
            <View
              style={[
                styles.colorIndicator,
                { backgroundColor: account.color },
              ]}
            />
            <Text style={styles.accountOptionText}>
              {account.name} (${account.balance.toFixed(2)})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalBackground,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: Colors.slate[800],
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.slate[200],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: Colors.slate[800],
  },
  selectAccountText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: Colors.slate[800],
  },
  accountSelector: {
    maxHeight: 160,
    marginBottom: 20,
  },
  accountOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f8fafc",
  },
  selectedAccount: {
    backgroundColor: "#dbeafe",
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  accountOptionText: {
    fontSize: 16,
    color: Colors.slate[800],
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: Colors.slate[500],
  },
  confirmButton: {
    backgroundColor: Colors.green,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  distributionText: {
    fontSize: 14,
    color: Colors.slate[500],
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.slate[100],
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: Colors.blue,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.slate[600],
  },
  activeTabButtonText: {
    color: "white",
  },

  // Form
  formContainer: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.slate[500],
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  //   accountSelector: {
  //     maxHeight: 120,
  //     marginBottom: 16,
  //   },
  //   accountOption: {
  //     flexDirection: "row",
  //     alignItems: "center",
  //     padding: 12,
  //     borderRadius: 8,
  //     marginBottom: 8,
  //     backgroundColor: Colors.slate[50],
  //   },
  //   selectedAccount: {
  //     backgroundColor: "#dbeafe",
  //     borderWidth: 2,
  //     borderColor: Colors.blue,
  //   },
  //   colorIndicator: {
  //     width: 20,
  //     height: 20,
  //     borderRadius: 10,
  //     marginRight: 12,
  //   },
  //   accountOptionText: {
  //     fontSize: 16,
  //     color: Colors.slate[800],
  //     flex: 1,
  //   },

  // Buttons
  //   buttonContainer: {
  //     flexDirection: "row",
  //     gap: 12,
  //   },
  //   button: {
  //     flex: 1,
  //     paddingVertical: 12,
  //     borderRadius: 8,
  //     alignItems: "center",
  //   },
  //   cancelButton: {
  //     backgroundColor: Colors.slate[500],
  //   },
  incomeButton: {
    backgroundColor: Colors.green,
  },
  expenseButton: {
    backgroundColor: Colors.red,
  },
  //   buttonText: {
  //     color: "white",
  //     fontWeight: "bold",
  //     fontSize: 16,
  //   },

  // FAB
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: Colors.blue,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
