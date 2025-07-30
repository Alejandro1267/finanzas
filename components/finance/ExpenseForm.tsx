import { Colors } from "@/constants/Colors";
import { useFinanceStore } from "@/store/FinanceStore";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DateInput } from "../ui/DateInput";

export function ExpenseForm() {
  const { accounts, currentRecord, setRecordField } = useFinanceStore();

  return (
    <View>
      <DateInput
        value={currentRecord?.date || new Date()}
        onChange={(date) => setRecordField("date", date)}
      />
      <TextInput
        style={styles.input}
        placeholder="Monto"
        value={currentRecord?.amount.toString() || ""}
        onChangeText={(value) => {
          console.log(value);
          setRecordField("amount", Number(value));
        }}
        keyboardType="numeric"
        placeholderTextColor="#9ca3af"
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={currentRecord?.description || ""}
        onChangeText={(value) => {
          console.log(value);
          setRecordField("description", value);
        }}
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
              currentRecord?.account === account.id && styles.selectedAccount,
            ]}
            onPress={() => setRecordField("account", account.id)}
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
});
