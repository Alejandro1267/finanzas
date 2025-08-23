import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useAccount } from "@/hooks/useAccount";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useThemeModeStore } from "@/store/useThemeModeStore";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ConfiguracionScreen() {
  const { setThemeMode } = useThemeModeStore();
  const { reconcileBalances } = useAccount();
  const [isReconciling, setIsReconciling] = useState(false);
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
            setIsReconciling(true);
            try {
              await reconcileBalances();
            } finally {
              setIsReconciling(false);
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
        <View style={[styles.currentModeInfo, { backgroundColor }]}>
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

        <View style={[styles.currentModeInfo, { backgroundColor }]}>
          <TouchableOpacity
            onPress={handleReconcileBalances}
            disabled={isReconciling}
          >
            <View style={styles.flexRow}>
              <Text style={[styles.buttonText, { color: text }]}>
                {isReconciling ? "Reconciliando..." : "Reconciliar Balances"}
              </Text>
              <IconSymbol name="arrow.clockwise" color={text} />
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
  currentModeInfo: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
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
