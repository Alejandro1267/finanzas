import { useColorScheme } from "@/hooks/useColorScheme";
import { Account, Record, useFinanceStore } from "@/store/FinanceStore";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SQLite from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { setAccounts, setRecords, setTotalBalance } = useFinanceStore();

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const db = await SQLite.openDatabaseAsync("finanzas.db");
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            percentage REAL,
            balance REAL,
            color TEXT
          );
          CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            amount REAL,
            description TEXT,
            date TEXT,
            account TEXT
          );
        `);

        const accounts = (await db.getAllAsync(
          `SELECT * FROM accounts`
        )) as Account[];
        setAccounts(
          accounts.map((acc) => ({
            ...acc,
            id: acc.id.toString(),
          }))
        );
        console.log("accounts", accounts);

        const totalBalance = accounts.reduce(
          (sum, account) => sum + account.balance,
          0
        );
        setTotalBalance(totalBalance);
        console.log("Total balance calculated:", totalBalance);

        const records = (await db.getAllAsync(
          `SELECT * FROM records`
        )) as Record[];
        setRecords(records);
        console.log("records", records);
        console.log("Database initialized");
      } catch (error) {
        console.error("Error initializing database:", error);
      }
    };
    initializeDatabase();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
