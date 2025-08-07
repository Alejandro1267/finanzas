// import { useState } from "react";
// import { Text, TextInput, TouchableOpacity, View } from "react-native";

// export default function Index() {
//   const [name, setName] = useState("");
//   const [culo, setCulo] = useState(false);

//   return !culo ? (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <Text
//         style={{
//           fontSize: 20,
//           fontWeight: "bold",
//           marginBottom: 10
//         }}
//       >
//         Don cangrejo
//       </Text>
//       <TextInput
//         style={{
//           borderColor: "gray",
//           borderWidth: 1,
//           borderRadius: 10,
//           padding: 10,
//           width: "50%",
//         }}
//         placeholder="Ingresa tu nombre"
//         value={name}
//         onChangeText={(e) => {
//           setName(e);
//         }}
//       ></TextInput>
//       <TouchableOpacity
//         style={{
//           backgroundColor: "#0a7ea4",
//           padding: 10,
//           borderRadius: 10,
//           marginTop: 60,
//         }}
//         onPress={() => {
//           setCulo(true)
//         }}
//       >
//         <Text style={{ color: "white" }}>Guardar</Text>
//       </TouchableOpacity>
//     </View>
//   ) : (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <Text
//         style={{
//           fontSize: 30,
//         }}
//       >
//         Hola, {name ? name : "Pendejete"}
//       </Text>
//       <Text
//         style={{
//           fontSize: 30,
//           fontWeight: "bold",
//         }}
//       >
//         Te apesta el culo
//       </Text>
//       {/* <TouchableOpacity
//       style={{
//         backgroundColor: "#0a7ea4",
//         padding: 10,
//         borderRadius: 10,
//         marginTop: 60,
//       }}
//         onPress={() => {
//           // setName("");
//           setCulo(false)
//           setName("")
//         }}
//       >
//         <Text style={{ color: "white" }}>Guardar</Text>
//       </TouchableOpacity> */}
//     </View>
//   );
// }
