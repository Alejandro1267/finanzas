import { useColorScheme } from "@/hooks/useColorScheme";
import { Account, useAccountStore } from "@/store/useAccountStore";
import { Record, useRecordStore } from "@/store/useRecordStore";
import { Transfer, useTransferStore } from "@/store/useTransferStore";
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { setAccounts, setTotalBalance } = useAccountStore();
  const { setRecords } = useRecordStore();
  const { setTransfers } = useTransferStore();

  useEffect(() => {
    const initializeDatabase = async () => {
      let db: SQLite.SQLiteDatabase | null = null;
      try {
        db = await SQLite.openDatabaseAsync("finanzas.db", {
          useNewConnection: true,
        });
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
          CREATE TABLE IF NOT EXISTS transfers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            amount REAL NOT NULL,
            description TEXT,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            FOREIGN KEY (origin) REFERENCES accounts (id) ON DELETE RESTRICT,
            FOREIGN KEY (destination) REFERENCES accounts (id) ON DELETE RESTRICT
          );
        `);

        const accounts = (await db.getAllAsync(
          `SELECT *
          FROM accounts`
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

        const records = (await db.getAllAsync(
          `SELECT *
          FROM records
          ORDER BY
            date DESC,
            id DESC`
        )) as Record[];
        setRecords(records);
        console.log("records", records);

        const transfers = (await db.getAllAsync(
          `SELECT *
          FROM transfers
          ORDER BY
            date DESC,
            id DESC`
        )) as Transfer[];
        setTransfers(transfers);
        console.log("transfers", transfers);
        console.log("Database initialized");
      } catch (error) {
        console.error("Error initializing database:", error);
      } finally {
        if (db) {
          try {
            await db.closeAsync();
          } catch (closeError) {
            console.error("Error closing database:", closeError);
          }
        }
      }
    };
    initializeDatabase();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
