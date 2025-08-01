import { Colors } from "@/constants/Colors";
import { formatNumber$ } from "@/helpers";
import { useFinanceStore } from "@/store/FinanceStore";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { DateInput } from "../ui/DateInput";
import { PickerInput } from "../ui/PickerInput";

export function ExpenseForm() {
  const {
    accounts,
    currentRecord,
    setRecordField,
    recordErrors,
    setRecordErrors,
  } = useFinanceStore();

  const clearFieldError = (fieldName: string) => {
    const { [fieldName]: removedError, ...remainingErrors } = recordErrors;
    setRecordErrors(remainingErrors);
  };

  return (
    <ScrollView>
      <View style={styles.viewContainer}>
        <Text style={styles.selectAccountText}>Fecha:</Text>
        <DateInput
          date={currentRecord?.date}
          onDateChange={(date) => {
            setRecordField("date", date);
            clearFieldError("date");
          }}
          hasError={!!recordErrors.date}
        />
        {recordErrors.date && (
          <Text style={styles.errorText}>{recordErrors.date}</Text>
        )}
      </View>

      <View style={styles.viewContainer}>
        <Text style={styles.selectAccountText}>Importe:</Text>
        <TextInput
          style={[styles.input, recordErrors.amount && styles.inputError]}
          placeholder="Monto"
          value={currentRecord?.amount.toString() || ""}
          onChangeText={(value) => {
            setRecordField("amount", Number(value));
            clearFieldError("amount");
          }}
          keyboardType="numeric"
          placeholderTextColor={Colors.slate[400]}
        />
        {recordErrors.amount && (
          <Text style={styles.errorText}>{recordErrors.amount}</Text>
        )}
      </View>

      <View style={styles.viewContainer}>
        <Text style={styles.selectAccountText}>Descripción:</Text>
        <TextInput
          style={[styles.input, recordErrors.description && styles.inputError]}
          placeholder="Descripción"
          value={currentRecord?.description || ""}
          onChangeText={(value) => {
            setRecordField("description", value);
            clearFieldError("description");
          }}
          placeholderTextColor={Colors.slate[400]}
        />
        {recordErrors.description && (
          <Text style={styles.errorText}>{recordErrors.description}</Text>
        )}
      </View>

      <View style={styles.viewContainer}>
        <Text style={styles.selectAccountText}>Seleccionar cuenta:</Text>
        <PickerInput
          value={currentRecord?.account || ""}
          onValueChange={(value) => {
            setRecordField("account", value);
            clearFieldError("account");
          }}
          items={accounts.map((account) => ({
            id: account.id,
            name: `${account.name} (${formatNumber$(account.balance)})`,
            color: account.color,
          }))}
          hasError={!!recordErrors.account}
        />
        {recordErrors.account && (
          <Text style={[styles.errorText, styles.viewContainer]}>
            {recordErrors.account}
          </Text>
        )}
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
    fontSize: 16,
    color: Colors.slate[800],
  },
  selectAccountText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: Colors.slate[800],
  },
  viewContainer: {
    marginBottom: 16,
  },
  errorText: {
    color: Colors.redT[500],
    fontSize: 16,
    marginTop: 4,
  },
  inputError: {
    borderColor: Colors.redT[500],
  },
});
