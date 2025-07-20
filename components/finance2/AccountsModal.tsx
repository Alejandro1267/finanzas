import { useFinanceStore } from "@/store/FinanceStore2"
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"

export function AccountsModal() {
  const showAccountsModal = useFinanceStore((state) => state.showAccountsModal)
  const setShowAccountsModal = useFinanceStore((state) => state.setShowAccountsModal)
  const accounts = useFinanceStore((state) => state.accounts)
  const updateAccountPercentage = useFinanceStore((state) => state.updateAccountPercentage)
  const getTotalPercentage = useFinanceStore((state) => state.getTotalPercentage)

  const totalPercentage = getTotalPercentage()

  return (
    <Modal visible={showAccountsModal} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Configurar Cuentas</Text>
          <Text style={[styles.percentageWarning, totalPercentage !== 100 ? styles.errorText : styles.successText]}>
            Total: {totalPercentage}% {totalPercentage !== 100 && "(Debe ser 100%)"}
          </Text>
          <ScrollView style={styles.accountsConfig} showsVerticalScrollIndicator={false}>
            {accounts.map((account) => (
              <View key={account.id} style={styles.accountConfigItem}>
                <View style={styles.accountConfigInfo}>
                  <View style={[styles.colorIndicator, { backgroundColor: account.color }]} />
                  <Text style={styles.accountConfigName}>{account.name}</Text>
                </View>
                <View style={styles.percentageInputContainer}>
                  <TextInput
                    style={styles.percentageInput}
                    value={account.percentage.toString()}
                    onChangeText={(text) => {
                      const percentage = Number.parseInt(text) || 0
                      updateAccountPercentage(account.id, percentage)
                    }}
                    keyboardType="numeric"
                  />
                  <Text style={styles.percentageSymbol}>%</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowAccountsModal(false)}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#1e293b",
  },
  percentageWarning: {
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "#dc2626",
  },
  successText: {
    color: "#16a34a",
  },
  accountsConfig: {
    maxHeight: 300,
    marginBottom: 20,
  },
  accountConfigItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  accountConfigInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  accountConfigName: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  percentageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  percentageInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 8,
    borderRadius: 4,
    width: 60,
    textAlign: "center",
    marginRight: 8,
    fontSize: 16,
  },
  percentageSymbol: {
    fontSize: 16,
    color: "#1e293b",
  },
  closeButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})
