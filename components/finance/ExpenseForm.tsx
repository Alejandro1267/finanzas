import { Colors } from "@/constants/Colors";
import { formatNumber$ } from "@/helpers";
import { useFinanceStore } from "@/store/FinanceStore";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { DateInput } from "../ui/DateInput";
import { PickerInput } from "../ui/PickerInput";

export function ExpenseForm() {
  const { accounts, currentRecord, setRecordField } = useFinanceStore();

  return (
    <ScrollView>
      <View>
        <Text style={styles.selectAccountText}>Fecha:</Text>
        <DateInput
          date={currentRecord?.date}
          onDateChange={(date) => setRecordField("date", date)}
        />
      </View>

      <View>
        <Text style={styles.selectAccountText}>Importe:</Text>
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
      </View>

      <View>
        <Text style={styles.selectAccountText}>Descripción:</Text>
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
      </View>

      <View>
        <Text style={styles.selectAccountText}>Seleccionar cuenta:</Text>
        <PickerInput
          value={currentRecord?.account || ""}
          onValueChange={(value) => setRecordField("account", value)}
          items={accounts.map((account) => ({
            id: account.id,
            name: `${account.name} (${formatNumber$(account.balance)})`,
            color: account.color,
          }))}
        />
      </View>
    </ScrollView>
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
