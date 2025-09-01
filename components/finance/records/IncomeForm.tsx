import { Colors } from "@/constants/Colors";
import { formatNumber$ } from "@/helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAccountStore } from "@/store/useAccountStore";
import { useRecordStore } from "@/store/useRecordStore";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import CurrencyInput from "react-native-currency-input";
import { DateInput } from "../../ui/DateInput";
import { PickerInput } from "../../ui/PickerInput";

export function IncomeForm() {
  const { accounts } = useAccountStore();
  const { recordErrors, setRecordErrors, setRecordField, currentRecord } =
    useRecordStore();
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
            { color: text, borderColor: borderColor },
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
            { color: text, borderColor: borderColor },
            recordErrors.description && styles.inputError,
          ]}
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
        <Text style={[styles.selectAccountText, { color: text }]}>
          Seleccionar cuenta:
        </Text>
        <PickerInput
          value={currentRecord?.account || "distribute"}
          onValueChange={(value) => {
            setRecordField("account", value);
            clearFieldError("account");
          }}
          items={[
            {
              id: "distribute",
              name: "Distribuir Automáticamente",
            },
            ...accounts.map((account) => ({
              id: account.id,
              name: `${account.name} (${formatNumber$(account.balance)})`,
              color: account.color,
            })),
          ]}
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
    // borderColor: Colors.slate[200],
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    // color: Colors.slate[800],
  },
  selectAccountText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    // color: Colors.slate[800],
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
