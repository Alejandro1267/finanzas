import { useFinanceStore } from '@/store/FinanceStore';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';




// const handleAddAccount = () => {
//   console.log("handleAddAccount")
// }

export default function AccountModal() {
  const { showAccountModal, setShowAccountModal, currentAccount, setField, addAccount } = useFinanceStore();

  const handleAddAccount = () => {
    //   if (!accountName || !accountPercentage || !accountBalance) {
    //     Alert.alert('Error', 'Por favor completa todos los campos');
    //     return;
    //   }
    
      addAccount({
        id: "12",
        name: currentAccount?.name || "",
        percentage: currentAccount?.percentage || 0,
        balance: currentAccount?.balance || 0,
        color: "#FF6B6B",
      });
    
      // Limpiar el formulario
    //   setAccountName('');
    //   setAccountPercentage('');
    //   setAccountBalance('');
    //   setIsModalVisible(false);
    };

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

          <TextInput
            style={styles.input}
            placeholder="Nombre de la cuenta"
            value={currentAccount?.name || ""}
            onChangeText={(value) => setField("name", value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Porcentaje (%)"
            keyboardType="numeric"
            value={currentAccount?.percentage.toString() || "0"}
            onChangeText={(value) => setField("percentage", Number(value))}
          />

          <TextInput
            style={styles.input}
            placeholder="Saldo inicial"
            keyboardType="numeric"
            value={currentAccount?.balance.toString() || "0"}
            onChangeText={(value) => setField("balance", Number(value))}
          />
            
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
  )
}


const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
      },
      modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxWidth: 400,
      },
      modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
      },
      input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        fontSize: 16,
      },
      buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
      },
      cancelButton: {
        backgroundColor: '#f44336',
      },
      addButton: {
        backgroundColor: '#4CAF50',
      },
      buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
      },
      button: {
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
      },
})