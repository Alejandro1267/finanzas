import { RecordModal } from "@/components/finance/records/RecordModal";
import { RecordsList } from "@/components/finance/records/RecordsList";
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
    // marginTop: 36,
    marginTop: 24,
    // padding: 32,
    paddingHorizontal: 32,
  },
});
