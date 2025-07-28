import { StyleSheet } from "react-native";

import AccountModal from "@/components/finance/AccountModal";
import { AccountsList } from "@/components/finance/AccountsList";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function TabTwoScreen() {
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
