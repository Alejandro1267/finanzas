import { Colors } from "@/constants/Colors";
import { useFinance } from "@/hooks/useFinance";
import { recordSchema } from "@/schemas";
import { useFinanceStore } from "@/store/FinanceStore";
import { ValidationErrors } from "@/types";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../ui/IconSymbol";
import { ExpenseForm } from "./ExpenseForm";
import { IncomeForm } from "./IncomeForm";

type RecordType = "income" | "expense";

export function RecordModal() {
  const {
    showRecordModal,
    setShowRecordModal,
    currentRecord,
    createEmptyRecord,
    setRecordErrors,
    clearRecordErrors,
    activeTab,
    setActiveTab,
    setRecordMode,
    recordMode,
  } = useFinanceStore();
  const { addRecord, handleAutomaticDistribution, editRecord, deleteRecord } =
    useFinance();

  const handleSubmit = () => {
    clearRecordErrors();

    const record = recordSchema.safeParse({
      ...currentRecord,
      type: activeTab,
      ...(activeTab === "income" &&
        currentRecord?.account === "" && { account: "distribute" }),
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

    if (recordMode === "edit") {
      // Modo edición: usar delete + insert
      if (currentRecord?.id) {
        editRecord(currentRecord.id, record.data);
        console.log("Record edited:", record.data);
      }
    } else {
      // Modo nuevo: crear registro
      // Verificar si es distribución automática para ingresos
      if (activeTab === "income" && record.data.account === "distribute") {
        if (record.data.amount < 1) {
          Alert.alert(
            "Error",
            "El importe para distribuir automáticamente debe ser al menos 1"
          );
          return;
        }
        handleAutomaticDistribution(record.data);
      } else {
        // Registro normal
        addRecord(record.data);
        console.log("addedRecord", record.data);
      }
    }
    handleClose();
  };

  const handleClose = () => {
    setShowRecordModal(false);
    setActiveTab("income");
    clearRecordErrors();
  };

  const handleDelete = async () => {
    if (currentRecord?.id) {
      Alert.alert(
        "Eliminar Registro",
        "¿Estás seguro de que quieres eliminar este registro?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              await deleteRecord(currentRecord.id);
              handleClose();
            },
          },
        ]
      );
    }
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
            {recordMode === "new" ? (
              <Text style={styles.titleNew}>Nuevo Registro</Text>
            ) : (
              <View style={styles.header}>
                <Text style={styles.titleEdit}>Editar Registro</Text>
                <TouchableOpacity onPress={handleDelete}>
                  <IconSymbol
                    name="trash"
                    style={styles.deleteButton}
                    color={Colors.red}
                  />
                </TouchableOpacity>
              </View>
            )}

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
                  {recordMode === "new"
                    ? activeTab === "income"
                      ? "Agregar Ingreso"
                      : "Agregar Gasto"
                    : "Guardar Cambios"}
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
          setRecordMode("new");
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
  titleNew: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: Colors.greenT[600],
  },
  titleEdit: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: Colors.sky[600],
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
  deleteButton: {
    marginBottom: 20,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
});
