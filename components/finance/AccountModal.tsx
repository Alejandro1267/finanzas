import { Colors } from "@/constants/Colors";
import { accountSchema } from "@/schemas";
import { useFinanceStore } from "@/store/FinanceStore";
import { ValidationErrors } from "@/types";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import CurrencyInput from "react-native-currency-input";
import { IconSymbol } from "../ui/IconSymbol";

export default function AccountModal() {
  const {
    showAccountModal,
    setShowAccountModal,
    currentAccount,
    setAccountField,
    addAccount,
    createEmptyAccount,
    clearAccountErrors,
    setAccountErrors,
    accountErrors,
    totalBalance,
    setTotalBalance,
  } = useFinanceStore();

  const handleAddAccount = () => {
    clearAccountErrors();

    const account = accountSchema.safeParse(currentAccount)

    if (!account.success) {
      const errors: ValidationErrors = {};
      account.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
    
      setAccountErrors(errors);
      console.log("Errores de validación:", errors);
      return;
    }

    addAccount({
      id: Date.now().toString(),
      name: account.data.name,
      percentage: account.data.percentage,
      balance: account.data.balance,
      color: account.data.color || Colors.blue,
    });
    setTotalBalance(totalBalance + account.data.balance)
    setShowAccountModal(false);
    clearAccountErrors();
  };

  const clearFieldError = (fieldName: string) => {
    const { [fieldName]: removedError, ...remainingErrors } = accountErrors;
    setAccountErrors(remainingErrors);
  };

  const COLOR_PALETTE = [
    Colors.blue,
    Colors.cyan,
    Colors.darkGreen,
    Colors.lightGreen,
    Colors.yellow,
    Colors.orange,
    Colors.red,
    Colors.pink,
    Colors.purple,
    Colors.brown,
    Colors.gray,
    Colors.navyBlue,
  ];

  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAccountModal}
        onRequestClose={() => setShowAccountModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Cuenta</Text>

            <View style={styles.viewContainer}>
              <Text style={styles.selectAccountText}>Nombre de la Cuenta</Text>
              <TextInput
                style={[styles.input, accountErrors.name && styles.inputError]}
                placeholder="Nombre"
                value={currentAccount?.name || ""}
                onChangeText={(value) => { setAccountField("name", value); clearFieldError("name") }}
              />
              {accountErrors.name && (
                <Text style={styles.errorText}>{accountErrors.name}</Text>
              )}
            </View>

            <View style={styles.viewContainer}>
              <Text style={styles.selectAccountText}>Porcentaje de Ingreso</Text>
              <TextInput
                style={[styles.input, accountErrors.percentage && styles.inputError]}
                placeholder="Porcentaje (%)"
                keyboardType="numeric"
                value={currentAccount?.percentage.toString() || "0"}
                onChangeText={(value) => { setAccountField("percentage", Number(value)); clearFieldError("percentage") }}
              />
              {accountErrors.percentage && (
                <Text style={styles.errorText}>{accountErrors.percentage}</Text>
              )}
            </View>

            <View style={styles.viewContainer}>
              <Text style={styles.selectAccountText}>Saldo Inicial</Text>
              {/* <TextInput
                style={[styles.input, accountErrors.balance && styles.inputError]}
                placeholder="Saldo inicial"
                keyboardType="numeric"
                value={currentAccount?.balance.toString() || "0"}
                onChangeText={(value) => { setAccountField("balance", Number(value)); clearFieldError("balance") }}
              /> */}
              <CurrencyInput
                value={currentAccount?.balance || 0}
                onChangeValue={(value: number) => {
                  setAccountField("balance", value || 0);
                  clearFieldError("balance");
                }}
                prefix="$"
                delimiter=","
                separator="."
                precision={2}
                style={[
                  styles.input,
                  accountErrors.balance && styles.inputError
                ]}
              />
              {accountErrors.balance && (
                <Text style={styles.errorText}>{accountErrors.balance}</Text>
               )}
            </View>

            <View style={styles.viewContainer}>
              <Text style={styles.selectAccountText}>
                Color de la cuenta
              </Text>
              <View>
                {/* Dividir los colores en filas de 6 */}
                {Array.from({
                  length: Math.ceil(COLOR_PALETTE.length / 6),
                }).map((_, rowIndex) => (
                  <View
                    key={rowIndex}
                    style={{ flexDirection: "row", marginBottom: 10 }}
                  >
                    {COLOR_PALETTE.slice(rowIndex * 6, (rowIndex + 1) * 6).map(
                      (color) => (
                        <TouchableOpacity
                          key={color}
                          onPress={() => { setAccountField("color", color); clearFieldError("color") }}
                          style={[
                            styles.colorCircle,
                            {
                              backgroundColor: color,
                              borderColor:
                                currentAccount?.color === color
                                  ? "#000"
                                  : "transparent",
                              borderWidth:
                                currentAccount?.color === color ? 2 : 0,
                              marginRight: 10,
                            },
                          ]}
                        />
                      )
                    )}
                  </View>
                ))}
                {accountErrors.color && (
                  <Text style={styles.errorText}>{accountErrors.color}</Text>
                )}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => { setShowAccountModal(false); clearAccountErrors() }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddAccount}
              >
                <Text style={styles.buttonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setShowAccountModal(true);
          createEmptyAccount();
        }}
      >
        <IconSymbol name="plus" size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.modalBackground,
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.slate[200],
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: Colors.slate[800],
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: Colors.red,
  },
  addButton: {
    backgroundColor: Colors.green,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.slate[200],
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: Colors.green,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
  selectAccountText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: Colors.slate[800],
  },
});
