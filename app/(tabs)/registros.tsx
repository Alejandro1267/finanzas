import { AlertMessage } from "@/components/finance/AlertMessage";
import { RecordModal } from "@/components/finance/RecordModal";
import { RecordsList } from "@/components/finance/RecordsList";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
// import { useFinanceStore } from "@/store/FinanceStore";
import { StyleSheet } from "react-native";

export default function TabTwoScreen() {
  //   const { accounts, setShowAccountModal, createEmptyAccount } =
  //     useFinanceStore();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#C8E6C9", dark: "#237D32" }}
      headerImage={
        <IconSymbol
          size={310}
          color={Colors.green}
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <RecordsList />
      <RecordModal />
      <AlertMessage />
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
