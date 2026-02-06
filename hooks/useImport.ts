import { Colors } from "@/constants/Colors";
import { Account, useAccountStore } from "@/store/useAccountStore";
import { Record, useRecordStore } from "@/store/useRecordStore";
import { Transfer, useTransferStore } from "@/store/useTransferStore";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { File } from "expo-file-system/next";
import * as SQLite from "expo-sqlite";
import { Alert } from "react-native";
import * as XLSX from "xlsx";

export type ImportPreviewData = {
  accounts: Account[];
  records: Record[];
  transfers: Transfer[];
  summary: {
    totalAccounts: number;
    totalRecords: number;
    totalTransfers: number;
    totalIncome: number;
    totalExpenses: number;
  };
};

export type ImportResult = {
  success: boolean;
  message: string;
  imported: {
    accounts: number;
    records: number;
    transfers: number;
  };
};

export function useImport() {
  const pickImportFile = async (): Promise<string | null> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0].uri;
    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert("Error", "No se pudo seleccionar el archivo");
      return null;
    }
  };

  const parseCSVContent = (csvContent: string): any[] => {
    const lines = csvContent.trim().split("\n");
    if (lines.length < 2) {
      throw new Error(
        "El archivo CSV debe tener al menos una fila de encabezados y una fila de datos",
      );
    }

    const headers = lines[0]
      .split(",")
      .map((header) => header.replace(/"/g, "").trim());

    const data = lines.slice(1).map((line) => {
      // Handle CSV parsing with quoted fields
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            // Handle escaped quotes
            current += '"';
            i++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Add last value

      // Create object from headers and values
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      return row;
    });

    return data;
  };

  const validateCSVStructure = (data: any[]): void => {
    if (data.length === 0) {
      throw new Error("El archivo CSV está vacío");
    }

    const requiredHeaders = ["fecha", "tipo", "monto", "descripcion"];
    const firstRow = data[0];

    for (const header of requiredHeaders) {
      if (!(header in firstRow)) {
        throw new Error(`Falta el encabezado requerido: ${header}`);
      }
    }
  };

  const transformCSVToImportData = (data: any[]): ImportPreviewData => {
    const accounts = new Map<string, Account>();
    const records: Record[] = [];
    const transfers: Transfer[] = [];

    let accountIdCounter = 1;

    data.forEach((row, index) => {
      try {
        const fecha = row.fecha?.trim();
        const tipo = row.tipo?.trim();
        const monto = parseFloat(row.monto) || 0;
        const descripcion = row.descripcion?.trim() || "";

        if (!fecha || !tipo || monto <= 0) {
          console.warn(`Fila ${index + 2} ignorada: datos incompletos`);
          return;
        }

        if (tipo === "Transferencia") {
          const cuentaOrigen = row.cuenta_origen?.trim();
          const cuentaDestino = row.cuenta_destino?.trim();

          if (!cuentaOrigen || !cuentaDestino) {
            console.warn(
              `Transferencia en fila ${index + 2} ignorada: cuentas faltantes`,
            );
            return;
          }

          // Create accounts if they don't exist
          if (!accounts.has(cuentaOrigen)) {
            accounts.set(cuentaOrigen, {
              id: (accountIdCounter++).toString(),
              name: cuentaOrigen,
              balance: 0,
              percentage: 0,
              color: Colors.blue,
            });
          }

          if (!accounts.has(cuentaDestino)) {
            accounts.set(cuentaDestino, {
              id: (accountIdCounter++).toString(),
              name: cuentaDestino,
              balance: 0,
              percentage: 0,
              color: Colors.green,
            });
          }

          transfers.push({
            id: row.id_original || `transfer_${transfers.length + 1}`,
            date: fecha,
            amount: monto,
            description: descripcion,
            origin: accounts.get(cuentaOrigen)!.id,
            destination: accounts.get(cuentaDestino)!.id,
          });
        } else if (tipo === "Ingreso" || tipo === "Gasto") {
          const cuenta = row.cuenta?.trim();

          if (!cuenta) {
            console.warn(
              `Registro en fila ${index + 2} ignorado: cuenta faltante`,
            );
            return;
          }

          // Create account if it doesn't exist
          if (!accounts.has(cuenta)) {
            accounts.set(cuenta, {
              id: (accountIdCounter++).toString(),
              name: cuenta,
              balance: 0,
              percentage: 0,
              color: tipo === "Ingreso" ? "#10B981" : "#EF4444", // Green for income, red for expense
            });
          }

          records.push({
            id: row.id_original || `record_${records.length + 1}`,
            type: tipo === "Ingreso" ? "income" : "expense",
            amount: monto,
            description: descripcion,
            date: fecha,
            account: accounts.get(cuenta)!.id,
          });
        }
      } catch (error) {
        console.warn(`Error procesando fila ${index + 2}:`, error);
      }
    });

    const accountsArray = Array.from(accounts.values());
    const totalIncome = records
      .filter((r) => r.type === "income")
      .reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = records
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      accounts: accountsArray,
      records,
      transfers,
      summary: {
        totalAccounts: accountsArray.length,
        totalRecords: records.length,
        totalTransfers: transfers.length,
        totalIncome,
        totalExpenses,
      },
    };
  };

  const previewImportFromCSV = async (
    fileUri: string,
  ): Promise<ImportPreviewData> => {
    try {
      const csvContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: "utf8",
      });

      const data = parseCSVContent(csvContent);
      validateCSVStructure(data);

      return transformCSVToImportData(data);
    } catch (error) {
      console.error("Error previewing CSV:", error);
      throw new Error(
        `Error al procesar el archivo: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    }
  };

  const executeImport = async (
    importData: ImportPreviewData,
    replaceExisting: boolean = true,
  ): Promise<ImportResult> => {
    let db: SQLite.SQLiteDatabase | null = null;

    try {
      db = await SQLite.openDatabaseAsync("finanzas.db", {
        useNewConnection: true,
      });

      await db.execAsync("BEGIN TRANSACTION");

      if (replaceExisting) {
        // Clear existing data
        await db.execAsync("DELETE FROM transfers");
        await db.execAsync("DELETE FROM records");
        await db.execAsync("DELETE FROM accounts");
      }

      // Import accounts first
      for (const account of importData.accounts) {
        await db.runAsync(
          "INSERT OR REPLACE INTO accounts (id, name, balance, percentage, color) VALUES (?, ?, ?, ?, ?)",
          [
            parseInt(account.id),
            account.name,
            account.balance,
            account.percentage,
            account.color,
          ],
        );
      }

      // Import records
      for (const record of importData.records) {
        await db.runAsync(
          "INSERT OR REPLACE INTO records (type, amount, description, date, account) VALUES (?, ?, ?, ?, ?)",
          [
            record.type,
            record.amount,
            record.description,
            record.date,
            record.account,
          ],
        );
      }

      // Import transfers
      for (const transfer of importData.transfers) {
        await db.runAsync(
          "INSERT OR REPLACE INTO transfers (amount, description, date, origin, destination) VALUES (?, ?, ?, ?, ?)",
          [
            transfer.amount,
            transfer.description,
            transfer.date,
            transfer.origin,
            transfer.destination,
          ],
        );
      }

      await db.execAsync("COMMIT");

      // Reload stores from DB after succesful import
      const { setAccounts, setTotalBalance } = useAccountStore.getState();
      const { setRecords, selectedMonth, selectedYear } =
        useRecordStore.getState();
      const { setTransfers } = useTransferStore.getState();

      // Reload accounts
      const dbAccounts = (await db.getAllAsync(
        "SELECT * FROM accounts",
      )) as Account[];
      setAccounts(dbAccounts.map((acc) => ({ ...acc, id: acc.id.toString() })));
      setTotalBalance(dbAccounts.reduce((sum, acc) => sum + acc.balance, 0));

      // Reload records and transfers for current month
      const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
      const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
      const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
      const endDate = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-01`;

      const dbRecords = (await db.getAllAsync(
        "SELECT * FROM records WHERE date >= ? AND date < ? ORDER BY date DESC, id DESC",
        [startDate, endDate],
      )) as Record[];
      setRecords(dbRecords);

      const dbTransfers = (await db.getAllAsync(
        "SELECT * FROM transfers WHERE date >= ? AND date < ? ORDER BY date DESC, id DESC",
        [startDate, endDate],
      )) as Transfer[];
      setTransfers(dbTransfers);

      return {
        success: true,
        message: "Importación completada exitosamente",
        imported: {
          accounts: importData.accounts.length,
          records: importData.records.length,
          transfers: importData.transfers.length,
        },
      };
    } catch (error) {
      console.error("Error during import:", error);

      if (db) {
        try {
          await db.execAsync("ROLLBACK");
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
      }

      return {
        success: false,
        message: `Error durante la importación: ${error instanceof Error ? error.message : "Error desconocido"}`,
        imported: {
          accounts: 0,
          records: 0,
          transfers: 0,
        },
      };
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

  const importFromCSV = async (
    replaceExisting: boolean = true,
  ): Promise<ImportResult> => {
    try {
      // Step 1: Pick file
      const fileUri = await pickImportFile();
      if (!fileUri) {
        return {
          success: false,
          message: "No se seleccionó ningún archivo",
          imported: { accounts: 0, records: 0, transfers: 0 },
        };
      }

      // Step 2: Preview data
      const previewData = await previewImportFromCSV(fileUri);

      // Step 3: Show confirmation
      return new Promise((resolve) => {
        Alert.alert(
          "Confirmar Importación",
          `Se importarán:\n• ${previewData.summary.totalAccounts} cuentas\n• ${previewData.summary.totalRecords} registros\n• ${previewData.summary.totalTransfers} transferencias\n\n${replaceExisting ? "ADVERTENCIA: Esto eliminará todos los datos existentes." : "Los datos se agregarán a los existentes."}`,
          [
            {
              text: "Cancelar",
              style: "cancel",
              onPress: () =>
                resolve({
                  success: false,
                  message: "Importación cancelada",
                  imported: { accounts: 0, records: 0, transfers: 0 },
                }),
            },
            {
              text: replaceExisting ? "Reemplazar Todo" : "Importar",
              style: replaceExisting ? "destructive" : "default",
              onPress: async () => {
                const result = await executeImport(
                  previewData,
                  replaceExisting,
                );
                resolve(result);
              },
            },
          ],
        );
      });
    } catch (error) {
      console.error("Error in CSV import:", error);
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
        imported: { accounts: 0, records: 0, transfers: 0 },
      };
    }
  };

  const pickExcelFile = async (): Promise<string | null> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0].uri;
    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert("Error", "No se pudo seleccionar el archivo");
      return null;
    }
  };

  const parseExcelToImportData = (fileContent: string): ImportPreviewData => {
    const workbook = XLSX.read(fileContent, { type: "base64" });

    // 1. Parse "Cuentas" sheet
    const accountsSheet = workbook.Sheets["Cuentas"];
    if (!accountsSheet) {
      throw new Error('El archivo Excel no contiene la hoja "Cuentas"');
    }

    const accountsData = XLSX.utils.sheet_to_json<any>(accountsSheet);
    const accounts: Account[] = accountsData.map((row: any) => ({
      id: row.ID?.toString() || "",
      name: row.Nombre || "",
      percentage: parseFloat(row["Porcentaje %"]) || 0,
      balance: parseFloat(row.Balance) || 0,
      color: row.Color || Colors.blue,
    }));

    // Build name-to-id map for transaction matching
    const accountNameToId = new Map<string, string>();
    accounts.forEach((acc) => {
      accountNameToId.set(acc.name, acc.id);
    });

    // 2. Parse "Transacciones" sheet
    const transactionsSheet = workbook.Sheets["Transacciones"];
    if (!transactionsSheet) {
      throw new Error('El archivo Excel no contiene la hoja "Transacciones"');
    }

    const transactionsData = XLSX.utils.sheet_to_json<any>(transactionsSheet);
    const records: Record[] = [];
    const transfers: Transfer[] = [];

    transactionsData.forEach((row: any, index: number) => {
      try {
        const date = row.Fecha?.toString().trim();
        const type = row.Tipo?.toString().trim();
        const amount = parseFloat(row.Monto) || 0;
        const description = row["Descripción"]?.toString().trim() || "";
        const account = row.Cuenta?.toString().trim() || "";

        if (!date || !type || amount <= 0) {
          console.warn(`Fila ${index + 2} ignorada: datos incompletos`);
          return;
        }

        if (type === "Transferencia") {
          // Parse "Origin → Destination" format"
          const parts = account.split("→").map((s: string) => s.trim());
          if (parts.length !== 2) {
            console.warn(
              `Transferencia en fila ${index + 2} ignorada: formato de cuenta inválido`,
            );
            return;
          }

          const originId = accountNameToId.get(parts[0]);
          const destinationId = accountNameToId.get(parts[1]);

          if (!originId || !destinationId) {
            console.warn(
              `Transferencia en fila ${index + 2} ingnorada: cuenta no encontrada`,
            );
            return;
          }

          transfers.push({
            id: `transfer_${transfers.length + 1}`,
            date,
            amount,
            description,
            origin: originId,
            destination: destinationId,
          });
        } else if (type === "Ingreso" || type === "Gasto") {
          const accountId = accountNameToId.get(account);

          if (!accountId) {
            console.warn(
              `Registro en fila ${index + 2} ignorado: cuenta "${account}" no encontrada`,
            );
            return;
          }

          records.push({
            id: `record_${records.length + 1}`,
            type: type === "Ingreso" ? "income" : "expense",
            amount,
            description,
            date,
            account: accountId,
          });
        }
      } catch (error) {
        console.warn(`Error procesando fila ${index + 2}:`, error);
      }
    });

    const totalIncome = records
      .filter((r) => r.type === "income")
      .reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = records
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      accounts,
      records,
      transfers,
      summary: {
        totalAccounts: accounts.length,
        totalRecords: records.length,
        totalTransfers: transfers.length,
        totalIncome,
        totalExpenses,
      },
    };
  };

  const importFromExcel = async (
    replaceExisting: boolean = true,
  ): Promise<ImportResult> => {
    try {
      const fileUri = await pickExcelFile();
      if (!fileUri) {
        return {
          success: false,
          message: "No se seleccionó ningún archivo",
          imported: { accounts: 0, records: 0, transfers: 0 },
        };
      }

      const file = new File(fileUri);
      const fileContent = await file.base64();

      const previewData = parseExcelToImportData(fileContent);

      return new Promise((resolve) => {
        Alert.alert(
          "Confirmar Importación Excel",
          `Se importarán: \n• ${previewData.summary.totalAccounts} cuentas\n• ${previewData.summary.totalRecords} registros\n• ${previewData.summary.totalTransfers} transferencias\n\n${replaceExisting ? "ADVERTENCIA: Esto eliminará todos los datos existentes." : "Los datos se agregarán a los existentes."}`,
          [
            {
              text: "Cancelar",
              style: "cancel",
              onPress: () =>
                resolve({
                  success: false,
                  message: "Importación cancelada",
                  imported: { accounts: 0, records: 0, transfers: 0 },
                }),
            },
            {
              text: replaceExisting ? "Reemplazar Todo" : "Importar",
              style: replaceExisting ? "destructive" : "default",
              onPress: async () => {
                const result = await executeImport(
                  previewData,
                  replaceExisting,
                );
                resolve(result);
              },
            },
          ],
        );
      });
    } catch (error) {
      console.error("Error in Excel import:", error);
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
        imported: { accounts: 0, records: 0, transfers: 0 },
      };
    }
  };

  return {
    importFromCSV,
    importFromExcel,
    previewImportFromCSV,
    pickImportFile,
  };
}
