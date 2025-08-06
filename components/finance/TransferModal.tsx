import { Colors } from "@/constants/Colors";
import { formatNumber$ } from "@/helpers";
import { useFinance } from "@/hooks/useFinance";
import { useFinanceStore } from "@/store/FinanceStore";
import { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../ui/IconSymbol";

export function TransferModal() {
  const {
    currentAccount,
    accounts,
    showTransferModal,
    setShowTransferModal,
    setShowAccountModal,
    clearAccountErrors,
  } = useFinanceStore();
  const { deleteAccount } = useFinance();
  const [selectedTransferAccountId, setSelectedTransferAccountId] = useState<
    string | null
  >(null);

  const confirmTransfer = async () => {
    if (currentAccount?.id && selectedTransferAccountId) {
      await deleteAccount(currentAccount.id, selectedTransferAccountId);
      setShowTransferModal(false);
      setShowAccountModal(false);
      setSelectedTransferAccountId("");
      clearAccountErrors();
    }
  };

  const cancelTransfer = () => {
    setShowTransferModal(false);
    setSelectedTransferAccountId("");
  };

  const otherAccounts = accounts.filter(
    (account) => account.id !== currentAccount?.id
  );
  const hasOtherAccounts = otherAccounts.length > 0;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showTransferModal}
      onRequestClose={cancelTransfer}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitleEdit}>Transferir Registros</Text>
          {!hasOtherAccounts ? (
            <Text style={styles.transferDescription}>
              No hay mas cuentas para transferir
            </Text>
          ) : (
            <Text style={styles.transferDescription}>
              Selecciona la cuenta a la que quieres transferir todos los
              registros de "{currentAccount?.name}":
            </Text>
          )}
          <FlatList
            data={accounts.filter(
              (account) => account.id !== currentAccount?.id
            )}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.accountItem,
                  selectedTransferAccountId === item.id &&
                    styles.selectedAccountItem,
                ]}
                onPress={() => setSelectedTransferAccountId(item.id)}
              >
                <View style={styles.accountItemContent}>
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: item.color, marginRight: 12 },
                    ]}
                  />
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{item.name}</Text>
                    <Text style={styles.accountBalance}>
                      {formatNumber$(item.balance)}
                    </Text>
                  </View>
                  {selectedTransferAccountId === item.id && (
                    <IconSymbol
                      name="checkmark"
                      size={20}
                      color={Colors.green}
                    />
                  )}
                </View>
              </TouchableOpacity>
            )}
            style={styles.accountsList}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={cancelTransfer}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                selectedTransferAccountId
                  ? styles.addButton
                  : styles.disabledButton,
              ]}
              onPress={confirmTransfer}
              disabled={!selectedTransferAccountId}
            >
              <Text style={styles.buttonText}>Transferir</Text>
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
  modalTitleNew: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: Colors.greenT[600],
  },
  modalTitleEdit: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: Colors.sky[600],
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
    color: Colors.slate[800],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  transferDescription: {
    fontSize: 16,
    marginBottom: 20,
    color: Colors.slate[600],
  },

  accountItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[200],
  },

  selectedAccountItem: {
    backgroundColor: Colors.sky[100],
  },

  accountItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  accountInfo: {
    flex: 1,
    marginLeft: 12,
  },

  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.slate[800],
  },

  accountBalance: {
    fontSize: 14,
    color: Colors.slate[600],
  },

  accountsList: {
    maxHeight: 200,
  },

  disabledButton: {
    backgroundColor: Colors.slate[200],
  },
});
