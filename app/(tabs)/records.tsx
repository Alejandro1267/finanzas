import { RecordModal } from "@/components/finance/RecordModal";
import { RecordsList } from "@/components/finance/RecordsList";
import { StyleSheet, View } from "react-native";

export default function Records() {
  return (
    <>
      <View style={styles.container}>
        <RecordsList />
      </View>
      <RecordModal />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 36,
    // padding: 32,
    paddingHorizontal: 32,
  },
});
