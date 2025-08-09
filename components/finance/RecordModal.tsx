import { Colors } from "@/constants/Colors";
import { useRecord } from "@/hooks/useRecord";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTransfer } from "@/hooks/useTransfer";
import { recordSchema, transferSchema } from "@/schemas";
import { RecordType, useRecordStore } from "@/store/useRecordStore";
import { useTransferStore } from "@/store/useTransferStore";
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
import { TransferForm } from "./TransferForm";

export function RecordModal() {
  const {
    showRecordModal,
    setShowRecordModal,
    createEmptyRecord,
    setRecordErrors,
    clearRecordErrors,
    activeTab,
    setActiveTab,
    setRecordMode,
    recordMode,
    currentRecord,
  } = useRecordStore();
  const {
    createEmptyTransfer,
    setTransferErrors,
    clearTransferErrors,
    currentTransfer,
  } = useTransferStore();
  const { addRecord, handleAutomaticDistribution, editRecord, deleteRecord } =
    useRecord();
  const { addTransfer, editTransfer } = useTransfer();
  const background = useThemeColor({}, "backgroundCard");
  const titleNew = useThemeColor({}, "titleNew");
  const titleEdit = useThemeColor({}, "titleEdit");
  const tabBackground = useThemeColor(
    { light: Colors.slate[100], dark: Colors.zinc[700] },
    "text"
  );
  const activeTabButton = useThemeColor(
    { light: Colors.blue, dark: Colors.blueT[200] },
    "text"
  );
  const tabButtonText = useThemeColor(
    { light: Colors.slate[600], dark: Colors.slate[200] },
    "text"
  );
  const tabIconColorInactive = useThemeColor(
    { light: Colors.slate[600], dark: Colors.slate[300] },
    "text"
  );
  const tabIconColorActive = useThemeColor(
    { light: Colors.white, dark: Colors.slate[600] },
    "text"
  );
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

  const handleSubmit = () => {
    if (activeTab === "transfer") {
      // console.log("Guardar Transferencia");
      clearTransferErrors();

      const transfer = transferSchema.safeParse(currentTransfer);

      if (!transfer.success) {
        const errors: ValidationErrors = {};
        transfer.error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            errors[issue.path[0] as string] = issue.message;
          }
        });

        setTransferErrors(errors);
        console.log("Errores de validación:", errors);
        return;
      }

      if (recordMode === "edit") {
        if (currentTransfer?.id) {
          editTransfer(currentTransfer.id, transfer.data);
          console.log("Transfer edited:", transfer.data);
        }
        return;
      } else {
        addTransfer(transfer.data);
        console.log("addedTransfer", transfer.data);
      }
    } else {
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
        if (currentRecord?.id) {
          editRecord(currentRecord.id, record.data);
          console.log("Record edited:", record.data);
        }
      } else {
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
    }
    handleClose();
  };

  const handleClose = () => {
    setShowRecordModal(false);
    setActiveTab("expense");
    clearRecordErrors();
    clearTransferErrors();
  };

  const handleDelete = async () => {
    if (activeTab === "transfer") {
      console.log("Eliminar Transferencia");
    } else if (currentRecord?.id) {
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
      style={[
        styles.tabButton,
        activeTab === type && { backgroundColor: activeTabButton },
      ]}
      onPress={() => setActiveTab(type)}
    >
      <IconSymbol
        name={icon as any}
        size={18}
        // color={activeTab === type ? Colors.white : Colors.slate[600]}
        color={activeTab === type ? tabIconColorActive : tabIconColorInactive}
      />
      <Text
        style={[
          styles.tabButtonText,
          { color: tabButtonText },
          activeTab === type && { color: tabIconColorActive },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderForm = () => {
    switch (activeTab) {
      case "income":
        return <IncomeForm />;
      case "expense":
        return <ExpenseForm />;
      case "transfer":
        return <TransferForm />;
      default:
        return <ExpenseForm />;
    }
  };

  const getButtonText = () => {
    if (recordMode === "new") {
      switch (activeTab) {
        case "income":
          return "Agregar Ingreso";
        case "expense":
          return "Agregar Gasto";
        case "transfer":
          return "Transferir";
        default:
          return "Agregar";
      }
    } else {
      return "Guardar Cambios";
    }
  };

  return (
    <View>
      <Modal visible={showRecordModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={[styles.modalContent, { backgroundColor: background }]}>
            {/* Header */}
            {recordMode === "new" ? (
              <Text style={[styles.title, { color: titleNew }]}>
                Nuevo Registro
              </Text>
            ) : (
              <View style={styles.header}>
                <Text style={[styles.title, { color: titleEdit }]}>
                  Editar Registro
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

            {/* Tabs */}
            <View
              style={[styles.tabContainer, { backgroundColor: tabBackground }]}
            >
              {renderTabButton("income", "Ingreso", "plus")}
              {renderTabButton("expense", "Gasto", "creditcard.fill")}
              {renderTabButton(
                "transfer",
                "Transfer.",
                "arrow.right.arrow.left"
              )}
            </View>

            {/* Formulario dinámico */}
            {renderForm()}

            {/* Botones */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: cancelButton }]}
                onPress={handleClose}
              >
                <Text style={[styles.buttonText, { color: cancelText }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: confirmButton }]}
                onPress={handleSubmit}
              >
                <Text style={[styles.buttonText, { color: confirmText }]}>
                  {/* {recordMode === "new"
                    ? activeTab === "income"
                      ? "Agregar Ingreso"
                      : "Agregar Gasto"
                    : "Guardar Cambios"} */}
                  {getButtonText()}
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
          createEmptyTransfer();
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
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
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
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Buttons
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
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
    backgroundColor: Colors.green,
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
