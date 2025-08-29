import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRecordStore } from "@/store/useRecordStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function MonthSelector() {
  const {
    selectedMonth,
    selectedYear,
    showDatePicker,
    setShowDatePicker,
    navigateToNextMonth,
    navigateToPreviousMonth,
    setSelectedMonth,
    setSelectedYear,
    navigateToCurrentMonth,
  } = useRecordStore();

  const text = useThemeColor({}, "text");
  const background = useThemeColor({}, "backgroundCard");
  const tint = useThemeColor({}, "tint");

  const today = new Date();
  const currentDate = new Date(selectedYear, selectedMonth, 1);
  const isCurrentMonth =
    selectedMonth === today.getMonth() && selectedYear === today.getFullYear();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");

    if (selectedDate) {
      setSelectedMonth(selectedDate.getMonth());
      setSelectedYear(selectedDate.getFullYear());
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={navigateToPreviousMonth}
      >
        <IconSymbol name="chevron.left" size={24} color={text} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.monthButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={[styles.monthText, { color: text }]}>
          {MONTHS[selectedMonth]} {selectedYear}
        </Text>
        <IconSymbol name="calendar" size={16} color={text} />
      </TouchableOpacity>

      {!isCurrentMonth && (
        <TouchableOpacity
          style={[styles.todayButton, { borderColor: tint }]}
          onPress={navigateToCurrentMonth}
        >
          <Text style={[styles.todayText, { color: tint }]}>Hoy</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.arrowButton}
        onPress={navigateToNextMonth}
      >
        <IconSymbol name="chevron.right" size={24} color={text} />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  arrowButton: {
    padding: 8,
    borderRadius: 8,
  },
  monthButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  todayText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
