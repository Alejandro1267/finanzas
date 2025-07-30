import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";
import DatePicker from "react-native-date-picker";

type DateInputProps = {
  value: Date;
  onChange: (date: Date) => void;
};

export function DateInput({ value, onChange }: DateInputProps) {
  // const [open, setOpen] = useState(false);

  //   return (
  //     <>
  //       <Button title={value.toDateString()} onPress={() => setOpen(true)} />
  //       <DatePicker
  //         mode="date"
  //         modal
  //         open={open}
  //         date={value}
  //         onConfirm={(date) => {
  //           setOpen(false);
  //           onChange(date);
  //         }}
  //         onCancel={() => {
  //           setOpen(false);
  //         }}
  //       />
  //     </>
  //   );

  return <DatePicker date={value} onDateChange={onChange} />;
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: Colors.blue[800],
  },
});
