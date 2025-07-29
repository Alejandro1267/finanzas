import { useFinanceStore } from "@/store/FinanceStore";
import { StyleSheet, Text, View } from "react-native";

export function AlertMessage() {
  const { alertMessage } = useFinanceStore();

  if (!alertMessage) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{alertMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "#F44336",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  text: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
});
