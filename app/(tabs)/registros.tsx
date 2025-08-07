import { RecordModal } from "@/components/finance/RecordModal";
import { RecordsList } from "@/components/finance/RecordsList";
import { ScrollView, StyleSheet } from "react-native";

export default function Registros() {
  return (
    <>
      <ScrollView style={styles.container}>
        <RecordsList />
      </ScrollView>
      <RecordModal />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 36,
    padding: 32,
  },
});
