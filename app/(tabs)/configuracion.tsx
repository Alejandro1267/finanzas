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
  const textColor = useThemeColor({}, "text");
  const currentScheme = useColorScheme();

  return (
    <ScrollView
      style={[styles.container]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Configuración</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.currentModeInfo}>
          <TouchableOpacity
            onPress={() =>
              setThemeMode(currentScheme === "dark" ? "light" : "dark")
            }
          >
            <Text
              style={[
                styles.currentModeText,
                { color: textColor, opacity: 0.8 },
              ]}
            >
              Modo actual: {currentScheme === "dark" ? "Oscuro 🌙" : "Claro ☀️"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.themesContainer}></View>
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
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginBottom: 20,
  },
  currentModeText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  themesContainer: {
    gap: 12,
  },
});
