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
    validationErrors,
    setValidationErrors,
  } = useFinanceStore();

  const clearFieldError = (fieldName: string) => {
    const { [fieldName]: removedError, ...remainingErrors } = validationErrors;
    setValidationErrors(remainingErrors);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.viewContainer}>
        <Text style={styles.selectAccountText}>Fecha:</Text>
        <DateInput
          date={currentRecord?.date}
          onDateChange={(date) => {
            setRecordField("date", date);
            clearFieldError("date");
          }}
          hasError={!!validationErrors.date}
        />
        {validationErrors.date && (
          <Text style={styles.errorText}>{validationErrors.date}</Text>
        )}
      </View>

      <View style={styles.viewContainer}>
        <Text style={styles.selectAccountText}>Importe:</Text>
        <TextInput
          style={[styles.input, validationErrors.amount && styles.inputError]}
          placeholder="Monto"
          value={currentRecord?.amount.toString() || ""}
          onChangeText={(value) => {
            console.log(value);
            setRecordField("amount", Number(value));
            clearFieldError("amount");
          }}
          keyboardType="numeric"
          placeholderTextColor={Colors.slate[400]}
        />
        {validationErrors.amount && (
          <Text style={styles.errorText}>{validationErrors.amount}</Text>
        )}
      </View>

      <View style={styles.viewContainer}>
        <Text style={styles.selectAccountText}>Descripción:</Text>
        <TextInput
          style={[
            styles.input,
            validationErrors.description && styles.inputError,
          ]}
          placeholder="Descripción"
          value={currentRecord?.description || ""}
          onChangeText={(value) => {
            console.log(value);
            setRecordField("description", value);
            clearFieldError("description");
          }}
          placeholderTextColor={Colors.slate[400]}
        />
        {validationErrors.description && (
          <Text style={styles.errorText}>{validationErrors.description}</Text>
        )}
      </View>

      <View>
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
          hasError={!!validationErrors.account}
        />
        {validationErrors.account && (
          <Text style={[styles.errorText, styles.viewContainer]}>
            {validationErrors.account}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // padding: 16,
    // gap: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.slate[200],
    padding: 12,
    borderRadius: 8,
    // marginBottom: 16,
    // marginTop: 16,
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
  errorText: {
    color: Colors.redT[500],
    fontSize: 16,
    marginTop: 4,
  },
  inputError: {
    borderColor: Colors.redT[500],
  },
  viewContainer: {
    marginBottom: 16,
  },
});
