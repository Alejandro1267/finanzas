import { StyleSheet, Text, TouchableOpacity } from "react-native";

import AccountModal from "@/components/finance/AccountModal";
import { AccountsList } from "@/components/finance/AccountsList";
import { AlertMessage } from "@/components/finance2/AlertMessage";
import { Header } from "@/components/finance2/Header";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFinanceStore } from "@/store/FinanceStore";

export default function TabTwoScreen() {
  const { setAlertMessage } = useFinanceStore();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#C8E6C9", dark: "#237D32" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#4CAF50"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <AlertMessage />
      <TouchableOpacity onPress={() => setAlertMessage("Hello")}>
        <Text>Mostrar Alerta</Text>
      </TouchableOpacity>
      <Header />
      <AccountsList />
      <AccountModal />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    left: -35,
    position: "absolute",
  },
});
