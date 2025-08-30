import { ScrollView, StyleSheet, View } from "react-native";

import AccountModal from "@/components/finance/AccountModal";
import { AccountsHeader } from "@/components/finance/AccountsHeader";
import { AccountsList } from "@/components/finance/AccountsList";
import { TransferModal } from "@/components/finance/TransferModal";

export default function Accounts() {
  return (
    <>
      <ScrollView>
        {/* <Header /> */}
        <View style={styles.headerContainer}>
          <AccountsHeader />
        </View>
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
