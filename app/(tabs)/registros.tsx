import { RecordsList } from "@/components/finance/RecordsList";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { IconSymbol } from "@/components/ui/IconSymbol";
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
          color="#4CAF50"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <RecordsList />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 32,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  list: {
    flexDirection: "column",
    // gap: 24,
  },
  listItem: {
    // backgroundColor: "#FF6F00",
    padding: 8,
  },
});
