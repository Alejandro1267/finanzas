import { Colors } from "@/constants/Colors";
import { useFinanceStore } from "@/store/FinanceStore";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../ui/IconSymbol";

export default function AccountModal() {
  const {
    showAccountModal,
    setShowAccountModal,
    currentAccount,
    setField,
    addAccount,
    createEmptyAccount,
  } = useFinanceStore();

  const handleAddAccount = () => {
    if (!currentAccount?.name || !currentAccount?.percentage) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    addAccount({
      id: "11",
      name: currentAccount?.name || "",
      percentage: currentAccount?.percentage || 0,
      balance: currentAccount?.balance || 0,
      color: currentAccount?.color || Colors.blue,
    });
    setShowAccountModal(false);
  };

  const COLOR_PALETTE = [
    Colors.blue, // Azul
    Colors.cyan, // Cian
    Colors.darkGreen, // Verde Oscuro
    Colors.lightGreen, // Verde Claro
    Colors.yellow, // Amarillo
    Colors.orange, // Naranja
    Colors.red, // Rojo
    Colors.pink, // Rosa
    Colors.purple, // Morado
    Colors.brown, // Café
    Colors.gray, // Gris
    Colors.navyBlue, // Negro
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

            <Text>Nombre de la Cuenta</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={currentAccount?.name || ""}
              onChangeText={(value) => setField("name", value)}
            />

            <Text>Porcentaje de Ingreso</Text>
            <TextInput
              style={styles.input}
              placeholder="Porcentaje (%)"
              keyboardType="numeric"
              value={currentAccount?.percentage.toString() || "0"}
              onChangeText={(value) => setField("percentage", Number(value))}
            />

            <Text>Saldo Inicial</Text>
            <TextInput
              style={styles.input}
              placeholder="Saldo inicial"
              keyboardType="numeric"
              value={currentAccount?.balance.toString() || "0"}
              onChangeText={(value) => setField("balance", Number(value))}
            />

            {/* <Text>Color</Text> */}
            <View style={{ marginBottom: 15 }}>
              <Text style={{ marginBottom: 10, fontWeight: "500" }}>
                Color de la cuenta
              </Text>
              <View>
                {/* Dividir los colores en filas de 5 */}
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
                          onPress={() => setField("color", color)}
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
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowAccountModal(false)}
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
    borderColor: Colors.slate[100],
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
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
});
