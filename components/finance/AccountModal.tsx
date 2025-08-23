import { Colors } from "@/constants/Colors";
import { useAccount } from "@/hooks/useAccount";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAccountStore } from "@/store/useAccountStore";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CurrencyInput from "react-native-currency-input";
import { IconSymbol } from "../ui/IconSymbol";

export default function AccountModal() {
  const {
    showAccountModal,
    setShowAccountModal,
    currentAccount,
    setAccountField,
    createEmptyAccount,
    clearAccountErrors,
    setAccountErrors,
    accountErrors,
    accountMode,
    setAccountMode,
    setShowTransferModal,
    isLoading,
  } = useAccountStore();
  const { addAccount, deleteAccount, updateAccount } = useAccount();
  const text = useThemeColor({}, "text");
  const background = useThemeColor({}, "backgroundCard");
  const titleNew = useThemeColor({}, "titleNew");
  const titleEdit = useThemeColor({}, "titleEdit");
  const borderColor = useThemeColor({}, "borderColor");
  const cancelButton = useThemeColor(
    { light: Colors.red, dark: Colors.redT[200] },
    "text"
  );
  const confirmButton = useThemeColor(
    { light: Colors.green, dark: Colors.greenT[200] },
    "text"
  );
  const cancelText = useThemeColor(
    { light: Colors.white, dark: Colors.redT[700] },
    "text"
  );
  const confirmText = useThemeColor(
    { light: Colors.white, dark: Colors.greenT[700] },
    "text"
  );
  const blackWhite = useThemeColor(
    { light: Colors.black, dark: Colors.white },
    "text"
  );

  // Estado local para el valor del porcentaje en el TextInput
  const [displayPercentageValue, setDisplayPercentageValue] = useState(
    currentAccount?.percentage?.toString() || ""
  );

  useEffect(() => {
    if (accountMode === "new") {
      setDisplayPercentageValue("");
    }
    if (accountMode === "edit" && currentAccount?.percentage === 0) {
      setDisplayPercentageValue("0");
    } else {
      setDisplayPercentageValue("");
    }
  }, [showAccountModal]);

  // Sincronizar el estado local con el valor del store cuando currentAccount cambie
  useEffect(() => {
    const externalPercentage = currentAccount?.percentage;

    if (externalPercentage !== undefined && !isNaN(externalPercentage)) {
      // Asegurarse de que el valor externo también esté dentro del rango y sin decimales
      const clampedExternalPercentage = Math.max(
        0,
        Math.min(100, Math.floor(externalPercentage))
      );
      // Solo actualiza si el valor actual del display es diferente al valor externo clamped
      if (Number(displayPercentageValue) !== clampedExternalPercentage) {
        setDisplayPercentageValue(clampedExternalPercentage.toString());
      }
    } else {
      // Si currentAccount.percentage es undefined o NaN, o al abrir el modal para una nueva cuenta
      setDisplayPercentageValue(""); // Mostrar vacío para que el usuario escriba
      setAccountField("percentage", 0); // Asegurar que el valor subyacente sea 0
    }
  }, [currentAccount?.percentage, showAccountModal]);

  // Nueva función para manejar el cambio del input de porcentaje
  const handlePercentageChange = (text: string) => {
    // 1. Filtrar para permitir SOLO dígitos. Esto elimina negativos y decimales al escribir.
    const cleanedText = text.replace(/[^0-9]/g, "");

    // 2. Actualizar el estado local del display con el texto limpio.
    // Esto asegura que el TextInput solo muestre dígitos.
    setDisplayPercentageValue(cleanedText);

    // 3. Si el texto limpio está vacío, el valor numérico es 0.
    if (cleanedText === "") {
      setAccountField("percentage", 0);
      clearFieldError("percentage");
      return;
    }

    // 4. Convertir a número entero.
    let numValue = parseInt(cleanedText, 10);

    // 5. Si la conversión resulta en NaN (aunque con [^0-9] es menos probable),
    // o si no es un número finito, no actualizamos el campo real.
    if (isNaN(numValue) || !isFinite(numValue)) {
      return;
    }

    // 6. Clampar el valor entre 0 y 100.
    const clampedValue = Math.max(0, Math.min(100, numValue));

    // 7. Actualizar el campo 'percentage' en el store con el valor validado.
    setAccountField("percentage", clampedValue);
    clearFieldError("percentage");

    // 8. IMPORTANTE: Si el valor original (numValue) era diferente al valor clamped,
    // actualiza el displayPercentageValue para que el TextInput muestre el valor clamped.
    if (numValue !== clampedValue) {
      setDisplayPercentageValue(clampedValue.toString());
    }
  };

  const clearFieldError = (fieldName: string) => {
    const { [fieldName]: removedError, ...remainingErrors } = accountErrors;
    setAccountErrors(remainingErrors);
  };

  const handleDeleteOnly = async () => {
    if (currentAccount?.id) {
      await deleteAccount(currentAccount.id);
      setShowAccountModal(false);
      clearAccountErrors();
    }
  };

  const handleDelete = async () => {
    if (currentAccount?.id) {
      Alert.alert(
        "Eliminar Cuenta",
        "¿Quieres eliminar los registros de esta cuenta o transferirlos a otra cuenta?",
        [
          {
            text: "Transferir",
            style: "default",
            onPress: () => setShowTransferModal(true),
          },
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: handleDeleteOnly,
          },
        ]
      );
    }
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
          <View style={[styles.modalContent, { backgroundColor: background }]}>
            {accountMode === "new" ? (
              <Text style={[styles.modalTitleNew, { color: titleNew }]}>
                Nueva Cuenta
              </Text>
            ) : (
              <View style={styles.header}>
                <Text style={[styles.modalTitleEdit, { color: titleEdit }]}>
                  Editar Cuenta
                </Text>
                <TouchableOpacity onPress={handleDelete}>
                  <IconSymbol
                    name="trash"
                    style={styles.deleteButton}
                    color={Colors.red}
                  />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.viewContainer}>
              <Text style={[styles.selectAccountText, { color: text }]}>
                Nombre de la Cuenta
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: borderColor, color: text },
                  accountErrors.name && styles.inputError,
                ]}
                placeholder="Nombre"
                placeholderTextColor={Colors.gray}
                value={currentAccount?.name || ""}
                onChangeText={(value) => {
                  setAccountField("name", value);
                  clearFieldError("name");
                }}
              />
              {accountErrors.name && (
                <Text style={styles.errorText}>{accountErrors.name}</Text>
              )}
            </View>

            <View style={styles.viewContainer}>
              <Text style={[styles.selectAccountText, { color: text }]}>
                Porcentaje de Ingreso
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: borderColor, color: text },
                  accountErrors.percentage && styles.inputError,
                ]}
                placeholder="Porcentaje (%)"
                keyboardType="numeric"
                value={displayPercentageValue} // Usa el estado local para el display
                onChangeText={handlePercentageChange} // Usa la función de manejo
                placeholderTextColor={Colors.gray}
              />
              {accountErrors.percentage && (
                <Text style={styles.errorText}>{accountErrors.percentage}</Text>
              )}
            </View>

            {accountMode === "edit" ? (
              <></>
            ) : (
              <View style={styles.viewContainer}>
                <Text style={[styles.selectAccountText, { color: text }]}>
                  Saldo Inicial
                </Text>
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
                    { borderColor: borderColor, color: text },
                    accountErrors.balance && styles.inputError,
                  ]}
                />
                {accountErrors.balance && (
                  <Text style={styles.errorText}>{accountErrors.balance}</Text>
                )}
              </View>
            )}

            <View style={styles.viewContainer}>
              <Text style={[styles.selectAccountText, { color: text }]}>
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
                          onPress={() => {
                            setAccountField("color", color);
                            clearFieldError("color");
                          }}
                          style={[
                            styles.colorCircle,
                            {
                              backgroundColor: color,
                              borderColor:
                                currentAccount?.color === color
                                  ? blackWhite
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
                style={[styles.button, { backgroundColor: cancelButton }]}
                onPress={() => {
                  setShowAccountModal(false);
                  clearAccountErrors();
                }}
              >
                <Text style={[styles.buttonText, { color: cancelText }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              {accountMode === "new" ? (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: confirmButton }]}
                  onPress={addAccount}
                  disabled={isLoading}
                >
                  <Text style={[styles.buttonText, { color: confirmText }]}>
                    Agregar Cuenta
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: confirmButton }]}
                  onPress={updateAccount}
                  disabled={isLoading}
                >
                  <Text style={[styles.buttonText, { color: confirmText }]}>
                    Guardar Cambios
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setShowAccountModal(true);
          createEmptyAccount();
          setAccountMode("new");
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
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitleNew: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalTitleEdit: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
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
  deleteButton: {
    marginBottom: 20,
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
});
