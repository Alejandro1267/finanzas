import { RecordModal } from "@/components/finance/RecordModal";
import { RecordsList } from "@/components/finance/RecordsList";
import { ScrollView, StyleSheet } from "react-native";

export default function Registros() {
  return (
    <>
      <ScrollView style={styles.container}>
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
        <RecordsList />
        {/* </ParallaxScrollView> */}
      </ScrollView>
      <RecordModal />
    </>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  container: {
    flex: 1,
    marginTop: 36,
    padding: 32,
  },
});
