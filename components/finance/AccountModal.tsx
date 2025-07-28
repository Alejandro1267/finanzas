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

export default function AccountModal() {
  const {
    showAccountModal,
    setShowAccountModal,
    currentAccount,
    setField,
    addAccount,
  } = useFinanceStore();

  const handleAddAccount = () => {
    if (!currentAccount?.name || !currentAccount?.percentage) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    addAccount({
      id: "13",
      name: currentAccount?.name || "",
      percentage: currentAccount?.percentage || 0,
      balance: currentAccount?.balance || 0,
      color: currentAccount?.color || "#1E824C",
    });
    setShowAccountModal(false);
  };

  const COLOR_PALETTE = [
    "#1F3A93", // Azul
    "#4ECDC4", // Cian
    "#1E824C", // Verde Oscuro
    "#A3CB38", // Verde Claro
    "#F9BF3B", // Amarillo
    "#FF6F00", // Naranja
    // "#E63946", // Rojo
    "#F44336", // Rojo
    "#FF6B81", // Rosa
    "#8E44AD", // Morado
    "#6F4E37", // Café
    "#95A5A6", // Gris
    "#2C3E50", // Negro
  ];

  return (
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
              {Array.from({ length: Math.ceil(COLOR_PALETTE.length / 6) }).map(
                (_, rowIndex) => (
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
                )
              )}
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
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
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
    borderColor: "#ddd",
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
    backgroundColor: "#F44336",
  },
  addButton: {
    backgroundColor: "#4CAF50",
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
    borderColor: "#E0E0E0",
  },
});
