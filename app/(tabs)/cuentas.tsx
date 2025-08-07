import { ScrollView, StyleSheet, View } from "react-native";

import AccountModal from "@/components/finance/AccountModal";
import { AccountsList } from "@/components/finance/AccountsList";
import { Header } from "@/components/finance/Header";
import { TransferModal } from "@/components/finance/TransferModal";

export default function Cuentas() {
  return (
    <>
      <ScrollView>
        <Header />
        <View style={styles.content}>
          <AccountsList />
        </View>
      </ScrollView>
      <AccountModal />
      <TransferModal />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: "hidden",
  },
});
