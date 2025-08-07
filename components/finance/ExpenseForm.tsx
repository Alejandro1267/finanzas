import { Colors } from "@/constants/Colors";
import { formatNumber$ } from "@/helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFinanceStore } from "@/store/FinanceStore";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import CurrencyInput from "react-native-currency-input";
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
  const text = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borderColor");

  const clearFieldError = (fieldName: string) => {
    const { [fieldName]: removedError, ...remainingErrors } = recordErrors;
    setRecordErrors(remainingErrors);
  };

  return (
    <ScrollView>
      <View style={styles.viewContainer}>
        <Text style={[styles.selectAccountText, { color: text }]}>Fecha:</Text>
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
        <Text style={[styles.selectAccountText, { color: text }]}>
          Importe:
        </Text>
        <CurrencyInput
          value={currentRecord?.amount || 0}
          onChangeValue={(value: number) => {
            setRecordField("amount", value || 0);
            clearFieldError("amount");
          }}
          prefix="$"
          delimiter=","
          separator="."
          precision={2}
          minValue={0}
          style={[
            styles.input,
            { borderColor: borderColor, color: text },
            recordErrors.amount && styles.inputError,
          ]}
        />
        {recordErrors.amount && (
          <Text style={styles.errorText}>{recordErrors.amount}</Text>
        )}
      </View>

      <View style={styles.viewContainer}>
        <Text style={[styles.selectAccountText, { color: text }]}>
          Descripción:
        </Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: borderColor, color: text },
            recordErrors.description && styles.inputError,
          ]}
          placeholder="Descripción"
          value={currentRecord?.description || ""}
          onChangeText={(value) => {
            setRecordField("description", value);
            clearFieldError("description");
          }}
          placeholderTextColor={Colors.gray}
        />
        {recordErrors.description && (
          <Text style={styles.errorText}>{recordErrors.description}</Text>
        )}
      </View>

      <View style={styles.viewContainer}>
        <Text style={[styles.selectAccountText, { color: text }]}>
          Seleccionar cuenta:
        </Text>
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
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  selectAccountText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
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
