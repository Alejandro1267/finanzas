import { ScrollView, StyleSheet, View } from "react-native";

import AccountModal from "@/components/finance/accounts/AccountModal";
import { AccountsList } from "@/components/finance/accounts/AccountsList";
import { Header } from "@/components/finance/accounts/Header";
import { TransferModal } from "@/components/finance/transfers/TransferModal";

export default function Accounts() {
  return (
    <>
      <View style={styles.headerContainer}>
        <Header />
      </View>
      <ScrollView>
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
    // padding: 32,
    paddingHorizontal: 32,
    gap: 16,
    overflow: "hidden",
  },
  headerContainer: {
    marginTop: 48,
    marginBottom: 8,
    paddingHorizontal: 32,
  },
});
