import { Colors } from "@/constants/Colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type DateInputProps = {
  date?: string;
  onDateChange?: (date: string) => void;
  hasError?: boolean;
};

export function DateInput({
  date,
  onDateChange,
  hasError = false,
}: DateInputProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (date) {
      // Crear fecha en zona horaria local en lugar de UTC
      const [year, month, day] = date.split("-").map(Number);
      return new Date(year, month - 1, day); // month - 1 porque los meses van de 0-11
    }
    return new Date();
  });
  const [show, setShow] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === "ios"); // Mantener abierto en iOS
    if (selectedDate) {
      const onlyDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      setCurrentDate(onlyDate);
      onDateChange?.(onlyDate.toISOString().split("T")[0]);
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setShow(true)}
        style={[styles.input, hasError && styles.inputError]}
      >
        <Text style={styles.inputText}>
          {currentDate.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="default"
          is24Hour={true}
          onChange={onChange}
          minimumDate={new Date(2020, 0, 1)}
          maximumDate={new Date(2030, 11, 31)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: Colors.slate[200],
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: Colors.slate[800],
  },
  inputText: {
    fontSize: 16,
  },
  inputError: {
    borderColor: Colors.redT[500],
  },
});
