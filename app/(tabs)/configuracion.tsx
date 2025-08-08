import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useThemeModeStore } from "@/store/ThemeModeStore";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ConfiguracionScreen() {
  const { setThemeMode } = useThemeModeStore();
  const text = useThemeColor({}, "text");
  const backgroundColor = useThemeColor(
    { light: Colors.grayT[200], dark: Colors.grayT[800] },
    "text"
  );
  const currentScheme = useColorScheme();

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
                <Text style={[styles.currentModeText, { color: text }]}>
                  Modo Oscuro
                </Text>
                <IconSymbol name="moon" color={text} />
              </View>
            ) : (
              <View style={styles.flexRow}>
                <Text style={[styles.currentModeText, { color: text }]}>
                  Modo Claro
                </Text>
                <IconSymbol name="sun.max" color={text} />
              </View>
            )}
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
    backgroundColor: Colors.red,
    marginBottom: 20,
  },
  currentModeText: {
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
