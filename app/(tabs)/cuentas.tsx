import { ScrollView, StyleSheet, View } from "react-native";

import AccountModal from "@/components/finance/AccountModal";
import { AccountsList } from "@/components/finance/AccountsList";
import { Header } from "@/components/finance/Header";
import { useFinanceStore } from "@/store/FinanceStore";

export default function Cuentas() {
  const { setShowAccountModal, createEmptyAccount } = useFinanceStore();
  return (
    <>
      <ScrollView>
        <Header />
        <View style={styles.content}>
        {/* <ParallaxScrollView
          headerBackgroundColor={{ light: "#C8E6C9", dark: "#237D32" }}
          headerImage={
            <IconSymbol
              size={310}
              color={Colors.green}
              name="chevron.left.forwardslash.chevron.right"
              style={styles.headerImage}
            />
          }
        > */}
          <AccountsList />
        </View>
        {/* </ParallaxScrollView> */}
      </ScrollView>
      <AccountModal />
    </>
  );
}

const styles = StyleSheet.create({
  // headerImage: {
    // bottom: -90,
    // left: -35,
    // position: "absolute",
  // },
  header: {
    position: "absolute",
    top: -100,
    left: 10,
    right: 10,
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});
