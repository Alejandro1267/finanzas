import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type PickerItem = {
  id: string;
  name: string;
  color?: string;
};

type PickerInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  placeholder?: string;
  hasError?: boolean;
};

export function PickerInput({
  value,
  onValueChange,
  items,
  placeholder = "Selecciona una Opción",
  hasError = false,
}: PickerInputProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find((item) => item.id === value);

  const renderItem = ({ item }: { item: PickerItem }) => (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={() => {
        onValueChange(item.id);
        setModalVisible(false);
      }}
    >
      {item.color && (
        <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
      )}
      <Text style={styles.optionText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.input, hasError && styles.inputError]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectedContainer}>
          {selectedItem?.color && (
            <View
              style={[
                styles.colorCircle,
                { backgroundColor: selectedItem.color },
              ]}
            />
          )}
          <Text
            style={[
              styles.selectedText,
              !selectedItem && styles.placeholderText,
            ]}
          >
            {selectedItem ? selectedItem.name : placeholder}
          </Text>
        </View>
        <View style={styles.arrow} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={styles.optionsList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: Colors.slate[200],
    borderRadius: 8,
    // marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
  },
  selectedContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedText: {
    fontSize: 16,
    color: Colors.slate[800],
  },
  placeholderText: {
    color: Colors.slate[400],
  },
  colorCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Colors.slate[400],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 8,
    maxHeight: 300,
    width: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  optionsList: {
    maxHeight: 250,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[100],
  },
  optionText: {
    fontSize: 16,
    color: Colors.slate[800],
  },
  inputError: {
    borderColor: Colors.redT[500],
  },
});
