import { Colors } from "@/constants/Colors";
import { formatNumber$ } from "@/helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAccountStore } from "@/store/useAccountStore";
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
import { useAccount } from "@/hooks/useAccount";

export function TransferModal() {
  const {
    currentAccount,
    accounts,
    showTransferModal,
    setShowTransferModal,
    setShowAccountModal,
    clearAccountErrors,
  } = useAccountStore();
  const { deleteAccount } = useAccount();
  const [selectedTransferAccountId, setSelectedTransferAccountId] = useState<
    string | null
  >(null);
  const text = useThemeColor({}, "text");
  const background = useThemeColor({}, "backgroundCard");
  const titleEdit = useThemeColor({}, "titleEdit");
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
  const transferDescription = useThemeColor(
    { light: Colors.slate[600], dark: Colors.slate[400] },
    "text"
  );
  const borderBottomColor = useThemeColor(
    { light: Colors.slate[200], dark: Colors.slate[600] },
    "borderColor"
  );
  const selectedAccountItem = useThemeColor(
    { light: Colors.sky[100], dark: Colors.sky[900] },
    "backgroundCard"
  );
  const disabledButton = useThemeColor(
    { light: Colors.white, dark: Colors.slate[700] },
    "backgroundCard"
  );

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
        <View style={[styles.modalContent, { backgroundColor: background }]}>
          <Text style={[styles.modalTitleEdit, { color: titleEdit }]}>
            Transferir Registros
          </Text>
          {!hasOtherAccounts ? (
            <Text
              style={[
                styles.transferDescription,
                { color: transferDescription },
              ]}
            >
              No hay mas cuentas para transferir
            </Text>
          ) : (
            <Text
              style={[
                styles.transferDescription,
                { color: transferDescription },
              ]}
            >
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
                  { borderBottomColor: borderBottomColor },
                  selectedTransferAccountId === item.id && {
                    backgroundColor: selectedAccountItem,
                  },
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
                    <Text style={[styles.accountName, { color: text }]}>
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.accountBalance,
                        { color: transferDescription },
                      ]}
                    >
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
              style={[styles.button, { backgroundColor: cancelButton }]}
              onPress={cancelTransfer}
            >
              <Text style={[styles.buttonText, { color: cancelText }]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                selectedTransferAccountId
                  ? { backgroundColor: confirmButton }
                  : styles.disabledButton,
              ]}
              onPress={confirmTransfer}
              disabled={!selectedTransferAccountId}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedTransferAccountId
                    ? { color: confirmText }
                    : { color: disabledButton },
                ]}
              >
                Transferir
              </Text>
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
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitleEdit: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  buttonText: {
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
  transferDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  accountItem: {
    padding: 12,
    borderBottomWidth: 1,
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
  },
  accountBalance: {
    fontSize: 14,
  },
  accountsList: {
    maxHeight: 200,
  },
  disabledButton: {
    backgroundColor: Colors.slate[200],
  },
});
