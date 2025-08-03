import { Colors } from "@/constants/Colors";
import { RecordDraft, recordSchema } from "@/schemas";
import { Record, useFinanceStore } from "@/store/FinanceStore";
import { ValidationErrors } from "@/types";
import { useState } from "react";
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "../ui/IconSymbol";
import { ExpenseForm } from "./ExpenseForm";
import { IncomeForm } from "./IncomeForm";

type RecordType = "income" | "expense";

export function RecordModal() {
  const [activeTab, setActiveTab] = useState<RecordType>("income");

  const {
    showRecordModal,
    setShowRecordModal,
    currentRecord,
    addRecord,
    createEmptyRecord,
    setRecordErrors,
    clearRecordErrors,
    accounts,
  } = useFinanceStore();

  const handleSubmit = () => {
    clearRecordErrors();

    const record = recordSchema.safeParse({
      ...currentRecord,
      type: activeTab,
      ...(activeTab === "income" && currentRecord?.account === "" && { account: "1" }),
    });

    if (!record.success) {
      const errors: ValidationErrors = {};
      record.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          errors[issue.path[0] as string] = issue.message;
        }
      });

      setRecordErrors(errors);
      console.log("Errores de validación:", errors);
      return;
    }

    // Verificar si es distribución automática para ingresos
    if (activeTab === "income" && record.data.account === "1") {
      handleAutomaticDistribution(record.data)
    } else {
      // Registro normal
      addRecord({ ...record.data, id: Date.now().toString() })
      console.log("addedRecord", record.data)
    }

    handleClose();
  };  
  
  function distribuirPorcentajes(montoCentavos: number, porcentajes: number[]): number[] {
    const distribucion = porcentajes.map(p =>
      Math.floor((montoCentavos * p) / 100)
    )
  
    const totalDistribuido = distribucion.reduce((a, b) => a + b, 0)
    let diferencia = montoCentavos - totalDistribuido
  
    const residuos = porcentajes.map((p, i) => ({
      index: i,
      residuo: (montoCentavos * p) % 100,
    }))
  
    residuos.sort((a, b) => b.residuo - a.residuo)
  
    for (let i = 0; i < residuos.length && diferencia > 0; i++) {
      distribucion[residuos[i].index] += 1
      diferencia--
    }
  
    return distribucion
  }
  
  function handleAutomaticDistribution(
    baseRecord: RecordDraft,
  ) {
    const accountsWithPercentage = accounts.filter(
      (account) => account.id !== "1" && account.percentage && account.percentage > 0
    )
  
    if (accountsWithPercentage.length === 0) {
      Alert.alert("Error", "No hay cuentas con porcentaje definido para la distribución")
      return
    }
  
    const totalPercentage = accountsWithPercentage.reduce(
      (sum, account) => sum + (account.percentage || 0), 0
    )
  
    if (Math.abs(totalPercentage - 100) > 0.01) {
      Alert.alert("Error", `Los porcentajes no suman 100%\nTotal: ${totalPercentage}%`)
      return
    }
  
    const totalCentavos = Math.round(baseRecord.amount * 100)
    const porcentajes = accountsWithPercentage.map(a => a.percentage || 0)
    const distribucionCentavos = distribuirPorcentajes(totalCentavos, porcentajes)
  
    accountsWithPercentage.forEach((account, index) => {
      const amount = distribucionCentavos[index] / 100
  
      const newRecord: Record = {
        ...baseRecord,
        id: `${Date.now()}-${account.id}`,
        account: account.id,
        amount,
        description: `${baseRecord.description} (${account.percentage}% - ${account.name})`,
      }
  
      addRecord(newRecord)
      console.log(`Registro distribuido para ${account.name}:`, newRecord)
    })
  }

  const handleClose = () => {
    setShowRecordModal(false);
    setActiveTab("income");
    clearRecordErrors();
  };

  const renderTabButton = (type: RecordType, label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === type && styles.activeTabButton]}
      onPress={() => setActiveTab(type)}
    >
      <IconSymbol
        name={icon as any}
        size={20}
        color={activeTab === type ? Colors.white : Colors.slate[600]}
      />
      <Text
        style={[
          styles.tabButtonText,
          activeTab === type && styles.activeTabButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <Modal visible={showRecordModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <Text style={styles.title}>Nuevo Registro</Text>

            {/* Tabs */}
            <View style={styles.tabContainer}>
              {renderTabButton("income", "Ingreso", "plus")}
              {renderTabButton("expense", "Gasto", "circle")}
            </View>

            {/* Formulario dinámico */}
            {activeTab === "income" ? <IncomeForm /> : <ExpenseForm />}

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>
                  {activeTab === "income" ? "Agregar Ingreso" : "Agregar Gasto"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Trigger del Modal */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          createEmptyRecord();
          setShowRecordModal(true);
        }}
      >
        <IconSymbol name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalBackground,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: Colors.slate[800],
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.slate[100],
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: Colors.blue,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.slate[600],
  },
  activeTabButtonText: {
    color: "white",
  },

  // Buttons
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: Colors.red,
  },
  confirmButton: {
    backgroundColor: Colors.green,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: Colors.blue,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});