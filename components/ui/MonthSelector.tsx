import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRecordStore } from "@/store/useRecordStore";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

const MONTHS_SHORT = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEPT",
  "OCT",
  "NOV",
  "DIC",
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
  const selectedText = useThemeColor(
    { light: Colors.white, dark: Colors.black },
    "text"
  );

  const today = new Date();
  const isCurrentMonth =
    selectedMonth === today.getMonth() && selectedYear === today.getFullYear();

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setSelectedYear(selectedYear);
    setShowDatePicker(false);
  };

  const handleYearPrevious = () => {
    setSelectedYear(selectedYear - 1);
  };

  const handleYearNext = () => {
    setSelectedYear(selectedYear + 1);
  };

  const handleCancel = () => {
    setShowDatePicker(false);
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

      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCancel}
        >
          <TouchableOpacity
            style={[styles.modalContent, { backgroundColor: background }]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: text }]}>Fecha</Text>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={20} color={text} />
              </TouchableOpacity>
            </View>

            {/* Year navigation */}
            <View style={styles.yearNavigation}>
              <TouchableOpacity
                onPress={handleYearPrevious}
                style={styles.yearArrow}
              >
                <IconSymbol name="chevron.left" size={20} color={text} />
              </TouchableOpacity>

              <Text style={[styles.yearText, { color: text }]}>
                {selectedYear}
              </Text>

              <TouchableOpacity
                onPress={handleYearNext}
                style={styles.yearArrow}
              >
                <IconSymbol name="chevron.right" size={20} color={text} />
              </TouchableOpacity>
            </View>

            {/* Months grid */}
            <View style={styles.monthsGrid}>
              {MONTHS_SHORT.map((month, index) => {
                const isSelected = index === selectedMonth;
                const isCurrentMonthYear =
                  index === today.getMonth() &&
                  selectedYear === today.getFullYear();

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.monthGridItem,
                      isSelected && { backgroundColor: tint },
                      isCurrentMonthYear &&
                        !isSelected && { borderColor: tint, borderWidth: 1 },
                    ]}
                    onPress={() => handleMonthSelect(index)}
                  >
                    <Text
                      style={[
                        styles.monthGridText,
                        {
                          color: isSelected
                            ? selectedText
                            : isCurrentMonthYear
                            ? tint
                            : text,
                        },
                      ]}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Cancel button */}
            <View style={styles.cancelButtonContainer}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: text }]}
                onPress={handleCancel}
              >
                <Text style={[styles.cancelButtonText, { color: text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "85%",
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    elevation: 5,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  currentSelection: {
    alignItems: "center",
    marginBottom: 24,
  },
  currentSelectionText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  yearNavigation: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    gap: 24,
  },
  yearArrow: {
    padding: 8,
  },
  yearText: {
    fontSize: 24,
    fontWeight: "600",
    minWidth: 80,
    textAlign: "center",
  },
  monthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  monthGridItem: {
    width: "22%",
    aspectRatio: 1.5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  monthGridText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  cancelButtonContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
