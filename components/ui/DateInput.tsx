import { Colors } from "@/constants/Colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Button,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export function DateInput() {
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState<"date" | "time">("date");
  const [show, setShow] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === "ios"); // Mantener abierto en iOS
    if (selectedDate) {
      const onlyDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      setDate(onlyDate);
    }
  };

  const showPicker = (currentMode: "date" | "time") => {
    setMode(currentMode);
    setShow(true);
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Text style={{ fontSize: 20, marginBottom: 20 }}>
          Seleccionado: {date.toLocaleString()}
        </Text>
        <Button title="Seleccionar fecha" onPress={() => showPicker("date")} />
        <Button title="Seleccionar hora" onPress={() => showPicker("time")} />
        {show && (
          <DateTimePicker
            value={date}
            mode={mode}
            display="default"
            is24Hour={true}
            onChange={onChange}
            minimumDate={new Date(2020, 0, 1)}
            maximumDate={new Date(2030, 11, 31)}
          />
        )}
      </SafeAreaView>
      <TouchableOpacity onPress={() => setShow(true)} style={styles.input}>
        <Text style={styles.inputText}>
          {date.toLocaleString("es-MX", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.slate[200],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: Colors.slate[800],
  },
  inputText: {
    fontSize: 16,
  },
});
