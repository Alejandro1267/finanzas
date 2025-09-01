import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useAccount } from "@/hooks/useAccount";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useExport } from "@/hooks/useExport";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAccountStore } from "@/store/useAccountStore";
import { useThemeModeStore } from "@/store/useThemeModeStore";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Configuracion() {
  const { setThemeMode } = useThemeModeStore();
  const { reconcileBalances } = useAccount();
  const { exportToExcel, exportToCSV } = useExport();
  const { isLoading, setIsLoading } = useAccountStore();
  const [isExporting, setIsExporting] = React.useState(false);
  const text = useThemeColor({}, "text");
  const backgroundColor = useThemeColor(
    { light: Colors.grayT[200], dark: Colors.grayT[800] },
    "text"
  );
  const currentScheme = useColorScheme();

  const handleReconcileBalances = async () => {
    Alert.alert(
      "Reconciliar Balances",
      "Esta acción recalculará todos los balances de las cuentas basándose en los registros y transferencias. ¿Continuar?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Reconciliar",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await reconcileBalances();
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    Alert.alert(
      "Exportar Datos",
      "Selecciona el formato de exportación:",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excel (.xlsx)",
          style: "default",
          onPress: async () => {
            setIsExporting(true);
            try {
            await exportToExcel();
            } finally {
              setIsExporting(false)
            }
          },
        },
        {
          text: "CSV",
          style: "default",
          onPress: async () => {
            setIsExporting(true);
            try {
            await exportToCSV();
            } finally {
              setIsExporting(false)
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: text }]}>Configuración</Text>
      </View>

      <View style={styles.section}>
        <View style={[styles.configItem, { backgroundColor }]}>
          <TouchableOpacity
            onPress={() =>
              setThemeMode(currentScheme === "dark" ? "light" : "dark")
            }
          >
            {currentScheme === "light" ? (
              <View style={styles.flexRow}>
                <Text style={[styles.buttonText, { color: text }]}>
                  Modo Oscuro
                </Text>
                <IconSymbol name="moon" color={text} />
              </View>
            ) : (
              <View style={styles.flexRow}>
                <Text style={[styles.buttonText, { color: text }]}>
                  Modo Claro
                </Text>
                <IconSymbol name="sun.max" color={text} />
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={[styles.configItem, { backgroundColor }]}>
          <TouchableOpacity
            onPress={handleExportData}
            disabled={isExporting}
          >
            <View style={styles.flexRow}>
              <Text style={[styles.buttonText, { color: text }]}>
                {isExporting ? "Exportando..." : "Exportar Datos"}
              </Text>
              {isExporting ? (
                <></>
              ) : (
              <IconSymbol 
                name={"square.and.arrow.up"} 
                color={text} 
              />
            )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.configItem, { backgroundColor }]}>
          <TouchableOpacity
            onPress={handleReconcileBalances}
            disabled={isLoading}
          >
            <View style={styles.flexRow}>
              <Text style={[styles.buttonText, { color: text }]}>
                {isLoading ? "Reconciliando..." : "Reconciliar Balances"}
              </Text>
              {/* <IconSymbol name="arrow.clockwise" color={text} /> */}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 8,
  },
  section: {
    marginBottom: 30,
  },
  // currentModeInfo: {
  //   padding: 12,
  //   borderRadius: 8,
  //   marginBottom: 20,
  // },
  configItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 1,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
});