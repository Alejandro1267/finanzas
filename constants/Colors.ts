/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const ThemeColors = {
  light: {
    // text: "#11181C",
    text: "#1D293D",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    // text: "#ECEDEE",
    text: "#E2E8F0",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const Colors = {
  // primary: "#",
  white: "#FFF",
  black: "#000",
  // green: "#4CAF50",
  green: "#16A34A",
  modalBackground: "rgba(0, 0, 0, 0.5)",

  // Accounts Colors
  blue: "#1F3A93", // Azul
  cyan: "#4ECDC4", // Cian
  darkGreen: "#1E824C", // Verde Oscuro
  lightGreen: "#A3CB38", // Verde Claro
  yellow: "#F9BF3B", // Amarillo
  orange: "#FF6F00", // Naranja
  // red: "#F44336", // Rojo
  red: "#DC2626", // Rojo
  pink: "#FF6B81", // Rosa
  purple: "#8E44AD", // Morado
  brown: "#6F4E37", // Café
  gray: "#95A5A6", // Gris
  navyBlue: "#2C3E50", // Azul Marino

  // Tailwind CSS Colors
  redT: {
    50: "#FEF2F2",
    100: "#FFE2E2",
    200: "#FFC9C9",
    300: "#FFA2A2",
    400: "#FF6467",
    500: "#FB2C36",
    600: "#E7180B",
    700: "#C11007",
    800: "#9F0712",
    900: "#82181A",
    950: "#460809"
  },
  orangeT: {
    50: "#FFF7ED",
    100: "#FFEDD4",
    200: "#FFD6A7",
    300: "#FFB86A",
    400: "#FF8904",
    500: "#FF692A",
    600: "#F54927",
    700: "#CA3519",
    800: "#9F2D01",
    900: "#7E2A0C",
    950: "#441306"
  },
  amber: {
    50: "#FFFBEB",
    100: "#FEF3C6",
    200: "#FEE685",
    300: "#FFD230",
    400: "#FFB93B",
    500: "#FE9A37",
    600: "#E1712B",
    700: "#BB4D1A",
    800: "#973C08",
    900: "#7B3306",
    950: "#461901"
  },
  yellowT: {
    50: "#FEFCE8",
    100: "#FEF9C2",
    200: "#FFF085",
    300: "#FFDF20",
    400: "#FDC745",
    500: "#F0B13B",
    600: "#D0872E",
    700: "#A65F1B",
    800: "#894B0A",
    900: "#733E0A",
    950: "#432004"
  },
  lime: {
    50: "#F7FEE7",
    100: "#ECFCCA",
    200: "#D8F999",
    300: "#BBF451",
    400: "#9AE630",
    500: "#7CCF35",
    600: "#5EA529",
    700: "#497D15",
    800: "#3C6301",
    900: "#35530E",
    950: "#192E03"
  },
  greenT: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#B9F8CF",
    300: "#7BF1A8",
    400: "#05DF72",
    500: "#31C950",
    600: "#2AA63E",
    700: "#178236",
    800: "#016630",
    900: "#0D542B",
    950: "#032E15"
  },
  emerald: {
    50: "#ECFDF5",
    100: "#D0FAE5",
    200: "#A4F4CF",
    300: "#5EE9B5",
    400: "#31D492",
    500: "#37BC7D",
    600: "#2D9966",
    700: "#1F7A55",
    800: "#116045",
    900: "#034F3B",
    950: "#012C22"
  },
  teal: {
    50: "#F0FDFA",
    100: "#CBFBF1",
    200: "#96F7E4",
    300: "#46ECD5",
    400: "#38D5BE",
    500: "#36BBA7",
    600: "#2A9689",
    700: "#18786F",
    800: "#075F5A",
    900: "#0B4F4A",
    950: "#022F2E"
  },
  cyanT: {
    50: "#F0FDFA",
    100: "#CBFBF1",
    200: "#96F7E4",
    300: "#46ECD5",
    400: "#38D5BE",
    500: "#36BBA7",
    600: "#2A9689",
    700: "#18786F",
    800: "#075F5A",
    900: "#0B4F4A",
    950: "#022F2E"
  },
  sky: {
    50: "#F0F9FF",
    100: "#DFF2FE",
    200: "#B8E6FE",
    300: "#74D4FF",
    400: "#21BCFF",
    500: "#34A6F4",
    600: "#2984D1",
    700: "#1C69A8",
    800: "#10598A",
    900: "#024A70",
    950: "#052F4A"
  },
  blueT: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BEDBFF",
    300: "#8EC5FF",
    400: "#51A2FF",
    500: "#2B7FFF",
    600: "#155DFC",
    700: "#1447E6",
    800: "#193CB8",
    900: "#1C398E",
    950: "#162456"
  },
  indigoT: {
    50: "#EEF2FF",
    100: "#E0E7FF",
    200: "#C6D2FF",
    300: "#A3B3FF",
    400: "#7C86FF",
    500: "#615FFF",
    600: "#4F39F6",
    700: "#432DD7",
    800: "#372AAC",
    900: "#312C85",
    950: "#1E1A4D"
  },
  violet: {
    50: "#F5F3FF",
    100: "#EDE9FE",
    200: "#DDD6FF",
    300: "#C4B4FF",
    400: "#A684FF",
    500: "#8E51FF",
    600: "#7F22FE",
    700: "#7008E7",
    800: "#5D0EC0",
    900: "#4D179A",
    950: "#2F0D68"
  },
  purpleT: {
    50: "#FAF5FF",
    100: "#F3E8FF",
    200: "#E9D4FF",
    300: "#DAB2FF",
    400: "#C27AFF",
    500: "#AD46FF",
    600: "#9810FA",
    700: "#8207DB",
    800: "#6E11B0",
    900: "#59168B",
    950: "#3C0366"
  },
  fuchsia: {
    50: "#FDF4FF",
    100: "#FAE8FF",
    200: "#F6CFFF",
    300: "#F4A8FF",
    400: "#ED6AFF",
    500: "#E12AFB",
    600: "#C81CDE",
    700: "#A813B7",
    800: "#8A0194",
    900: "#721378",
    950: "#4B004F"
  },
  pinkT: {
    50: "#FDF2F8",
    100: "#FCE7F3",
    200: "#FCCEE8",
    300: "#FDA5D5",
    400: "#FB64B6",
    500: "#F6339A",
    600: "#E61876",
    700: "#C6185C",
    800: "#A3044C",
    900: "#861043",
    950: "#510424"
  },
  rose: {
    50: "#FFF1F2",
    100: "#FFE4E6",
    200: "#FFCCD3",
    300: "#FFA1AD",
    400: "#FF637E",
    500: "#FF2056",
    600: "#EC253F",
    700: "#C71D36",
    800: "#A50C36",
    900: "#8B0836",
    950: "#4D0218"
  },
  slate: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CAD5E2",
    400: "#90A1B9",
    500: "#62748E",
    600: "#45556C",
    700: "#314158",
    800: "#1D293D",
    900: "#0F172B",
    950: "#020618"
  },
  grayT: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DC",
    400: "#99A1AF",
    500: "#6A7282",
    600: "#4A5565",
    700: "#364153",
    800: "#1E2939",
    900: "#101828",
    950: "#030712"
  },
  zinc: {
    50: "#FAFAFA",
    100: "#F4F4F5",
    200: "#E4E4E7",
    300: "#D4D4D8",
    400: "#9F9FA9",
    500: "#71717B",
    600: "#52525C",
    700: "#3F3F46",
    800: "#27272A",
    900: "#18181B",
    950: "#09090B"
  },
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#E5E5E5",
    300: "#D4D4D4",
    400: "#A1A1A1",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0A0A0A"
  },
  stone: {
    50: "#FAFAF9",
    100: "#F5F5F4",
    200: "#E7E5E4",
    300: "#D6D3D1",
    400: "#A6A09B",
    500: "#79716B",
    600: "#57534D",
    700: "#44403B",
    800: "#292524",
    900: "#1C1917",
    950: "#0C0A09"
  },
}