import { Colors } from "@/constants/Colors";
import { formatNumber$ } from "@/helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAccountStore } from "@/store/useAccountStore";
import { useTransferStore } from "@/store/useTransferStore";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import CurrencyInput from "react-native-currency-input";
import { DateInput } from "../ui/DateInput";
import { PickerInput } from "../ui/PickerInput";

export function TransferForm() {
  const { accounts } = useAccountStore();
  const {
    currentTransfer,
    setTransferField,
    transferErrors,
    setTransferErrors,
  } = useTransferStore();
  const text = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borderColor");

  const clearFieldError = (fieldName: string) => {
    const { [fieldName]: removedError, ...remainingErrors } = transferErrors;
    setTransferErrors(remainingErrors);
  };

  // Create account items with disabled state for conflicting accounts
  const getOriginAccountItems = () => {
    return accounts.map((account) => ({
      id: account.id,
      name: `${account.name} (${formatNumber$(account.balance)})`,
      color: account.color,
      disabled: account.id === currentTransfer?.destinationAccount,
    }));
  };

  const getDestinationAccountItems = () => {
    return accounts.map((account) => ({
      id: account.id,
      name: `${account.name} (${formatNumber$(account.balance)})`,
      color: account.color,
      disabled: account.id === currentTransfer?.originAccount,
    }));
  };

  return (
    <ScrollView>
      <View style={styles.viewContainer}>
        <Text style={[styles.selectAccountText, { color: text }]}>Fecha:</Text>
        <DateInput
          date={currentTransfer?.date}
          onDateChange={(date) => {
            setTransferField("date", date);
            clearFieldError("date");
          }}
          hasError={!!transferErrors.date}
        />
        {transferErrors.date && (
          <Text style={styles.errorText}>{transferErrors.date}</Text>
        )}
      </View>

      <View style={styles.viewContainer}>
        <Text style={[styles.selectAccountText, { color: text }]}>
          Importe:
        </Text>
        <CurrencyInput
          value={currentTransfer?.amount || 0}
          onChangeValue={(value: number) => {
            setTransferField("amount", value || 0);
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
            transferErrors.amount && styles.inputError,
          ]}
        />
        {transferErrors.amount && (
          <Text style={styles.errorText}>{transferErrors.amount}</Text>
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
            transferErrors.description && styles.inputError,
          ]}
          placeholder="Descripción"
          value={currentTransfer?.description || ""}
          onChangeText={(value) => {
            setTransferField("description", value);
            clearFieldError("description");
          }}
          placeholderTextColor={Colors.gray}
        />
        {transferErrors.description && (
          <Text style={styles.errorText}>{transferErrors.description}</Text>
        )}
      </View>

      <View style={styles.viewContainer}>
        <Text style={[styles.selectAccountText, { color: text }]}>
          Cuenta Origen:
        </Text>
        <PickerInput
          value={currentTransfer?.originAccount || ""}
          onValueChange={(value) => {
            setTransferField("originAccount", value);
            clearFieldError("originAccount");
            // Clear destination if it's the same as the new origin
            if (currentTransfer?.destinationAccount === value) {
              setTransferField("destinationAccount", "");
            }
          }}
          items={getOriginAccountItems()}
          hasError={!!transferErrors.originAccount}
        />
        {transferErrors.originAccount && (
          <Text style={[styles.errorText, styles.viewContainer]}>
            {transferErrors.originAccount}
          </Text>
        )}
      </View>

      <View style={styles.viewContainer}>
        <Text style={[styles.selectAccountText, { color: text }]}>
          Cuenta Destino:
        </Text>
        <PickerInput
          value={currentTransfer?.destinationAccount || ""}
          onValueChange={(value) => {
            setTransferField("destinationAccount", value);
            clearFieldError("destinationAccount");
            // Clear origin if it's the same as the new destination
            if (currentTransfer?.originAccount === value) {
              setTransferField("originAccount", "");
            }
          }}
          items={getDestinationAccountItems()}
          hasError={!!transferErrors.destinationAccount}
        />
        {transferErrors.destinationAccount && (
          <Text style={[styles.errorText, styles.viewContainer]}>
            {transferErrors.destinationAccount}
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
