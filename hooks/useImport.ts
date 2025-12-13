import { Account } from "@/store/useAccountStore";
import { Record } from "@/store/useRecordStore";
import { Transfer } from "@/store/useTransferStore";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { Alert } from "react-native";

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
}

export type ImportResult = {
  success: boolean;
  message: string;
  imported: {
    accounts: number;
    records: number;
    transfers: number;
  };
}

export function useImport() {
  
  const pickImportFile = async (): Promise<string | null> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0].uri;
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
      return null;
    }
  };

  const parseCSVContent = (csvContent: string): any[] => {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('El archivo CSV debe tener al menos una fila de encabezados y una fila de datos');
    }

    const headers = lines[0].split(',').map(header => 
      header.replace(/"/g, '').trim()
    );

    const data = lines.slice(1).map(line => {
      // Handle CSV parsing with quoted fields
      const values: string[] = [];
      let current = '';
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
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Add last value

      // Create object from headers and values
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      return row;
    });

    return data;
  };

  const validateCSVStructure = (data: any[]): void => {
    if (data.length === 0) {
      throw new Error('El archivo CSV está vacío');
    }

    const requiredHeaders = ['fecha', 'tipo', 'monto', 'descripcion'];
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
        const descripcion = row.descripcion?.trim() || '';

        if (!fecha || !tipo || monto <= 0) {
          console.warn(`Fila ${index + 2} ignorada: datos incompletos`);
          return;
        }

        if (tipo === 'Transferencia') {
          const cuentaOrigen = row.cuenta_origen?.trim();
          const cuentaDestino = row.cuenta_destino?.trim();

          if (!cuentaOrigen || !cuentaDestino) {
            console.warn(`Transferencia en fila ${index + 2} ignorada: cuentas faltantes`);
            return;
          }

          // Create accounts if they don't exist
          if (!accounts.has(cuentaOrigen)) {
            accounts.set(cuentaOrigen, {
              id: (accountIdCounter++).toString(),
              name: cuentaOrigen,
              balance: 0,
              percentage: 0,
              color: '#3B82F6' // Default blue
            });
          }

          if (!accounts.has(cuentaDestino)) {
            accounts.set(cuentaDestino, {
              id: (accountIdCounter++).toString(),
              name: cuentaDestino,
              balance: 0,
              percentage: 0,
              color: '#10B981' // Default green
            });
          }

          transfers.push({
            id: row.id_original || `transfer_${transfers.length + 1}`,
            date: fecha,
            amount: monto,
            description: descripcion,
            origin: accounts.get(cuentaOrigen)!.id,
            destination: accounts.get(cuentaDestino)!.id
          });

        } else if (tipo === 'Ingreso' || tipo === 'Gasto') {
          const cuenta = row.cuenta?.trim();

          if (!cuenta) {
            console.warn(`Registro en fila ${index + 2} ignorado: cuenta faltante`);
            return;
          }

          // Create account if it doesn't exist
          if (!accounts.has(cuenta)) {
            accounts.set(cuenta, {
              id: (accountIdCounter++).toString(),
              name: cuenta,
              balance: 0,
              percentage: 0,
              color: tipo === 'Ingreso' ? '#10B981' : '#EF4444' // Green for income, red for expense
            });
          }

          records.push({
            id: row.id_original || `record_${records.length + 1}`,
            type: tipo === 'Ingreso' ? 'income' : 'expense',
            amount: monto,
            description: descripcion,
            date: fecha,
            account: accounts.get(cuenta)!.id
          });
        }
      } catch (error) {
        console.warn(`Error procesando fila ${index + 2}:`, error);
      }
    });

    const accountsArray = Array.from(accounts.values());
    const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);

    return {
      accounts: accountsArray,
      records,
      transfers,
      summary: {
        totalAccounts: accountsArray.length,
        totalRecords: records.length,
        totalTransfers: transfers.length,
        totalIncome,
        totalExpenses
      }
    };
  };

  const previewImportFromCSV = async (fileUri: string): Promise<ImportPreviewData> => {
    try {
      const csvContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: "utf8",
      });

      const data = parseCSVContent(csvContent);
      validateCSVStructure(data);
      
      return transformCSVToImportData(data);
    } catch (error) {
      console.error('Error previewing CSV:', error);
      throw new Error(`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const executeImport = async (importData: ImportPreviewData, replaceExisting: boolean = true): Promise<ImportResult> => {
    let db: SQLite.SQLiteDatabase | null = null;
    
    try {
      db = await SQLite.openDatabaseAsync("finanzas.db", {
        useNewConnection: true,
      });

      await db.execAsync('BEGIN TRANSACTION');

      if (replaceExisting) {
        // Clear existing data
        await db.execAsync('DELETE FROM transfers');
        await db.execAsync('DELETE FROM records');
        await db.execAsync('DELETE FROM accounts');
      }

      // Import accounts first
      for (const account of importData.accounts) {
        await db.runAsync(
          'INSERT OR REPLACE INTO accounts (id, name, balance, percentage, color) VALUES (?, ?, ?, ?, ?)',
          [account.id, account.name, account.balance, account.percentage, account.color]
        );
      }

      // Import records
      for (const record of importData.records) {
        await db.runAsync(
          'INSERT OR REPLACE INTO records (id, type, amount, description, date, account) VALUES (?, ?, ?, ?, ?, ?)',
          [record.id, record.type, record.amount, record.description, record.date, record.account]
        );
      }

      // Import transfers
      for (const transfer of importData.transfers) {
        await db.runAsync(
          'INSERT OR REPLACE INTO transfers (id, amount, description, date, origin, destination) VALUES (?, ?, ?, ?, ?, ?)',
          [transfer.id, transfer.amount, transfer.description, transfer.date, transfer.origin, transfer.destination]
        );
      }

      await db.execAsync('COMMIT');

      return {
        success: true,
        message: 'Importación completada exitosamente',
        imported: {
          accounts: importData.accounts.length,
          records: importData.records.length,
          transfers: importData.transfers.length
        }
      };

    } catch (error) {
      console.error('Error during import:', error);
      
      if (db) {
        try {
          await db.execAsync('ROLLBACK');
        } catch (rollbackError) {
          console.error('Error during rollback:', rollbackError);
        }
      }

      return {
        success: false,
        message: `Error durante la importación: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        imported: {
          accounts: 0,
          records: 0,
          transfers: 0
        }
      };
    } finally {
      if (db) {
        try {
          await db.closeAsync();
        } catch (closeError) {
          console.error('Error closing database:', closeError);
        }
      }
    }
  };

  const importFromCSV = async (replaceExisting: boolean = true): Promise<ImportResult> => {
    try {
      // Step 1: Pick file
      const fileUri = await pickImportFile();
      if (!fileUri) {
        return {
          success: false,
          message: 'No se seleccionó ningún archivo',
          imported: { accounts: 0, records: 0, transfers: 0 }
        };
      }

      // Step 2: Preview data
      const previewData = await previewImportFromCSV(fileUri);

      // Step 3: Show confirmation
      return new Promise((resolve) => {
        Alert.alert(
          'Confirmar Importación',
          `Se importarán:\n• ${previewData.summary.totalAccounts} cuentas\n• ${previewData.summary.totalRecords} registros\n• ${previewData.summary.totalTransfers} transferencias\n\n${replaceExisting ? 'ADVERTENCIA: Esto eliminará todos los datos existentes.' : 'Los datos se agregarán a los existentes.'}`,
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => resolve({
                success: false,
                message: 'Importación cancelada',
                imported: { accounts: 0, records: 0, transfers: 0 }
              })
            },
            {
              text: replaceExisting ? 'Reemplazar Todo' : 'Importar',
              style: replaceExisting ? 'destructive' : 'default',
              onPress: async () => {
                const result = await executeImport(previewData, replaceExisting);
                resolve(result);
              }
            }
          ]
        );
      });

    } catch (error) {
      console.error('Error in CSV import:', error);
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        imported: { accounts: 0, records: 0, transfers: 0 }
      };
    }
  };

  return {
    importFromCSV,
    previewImportFromCSV,
    pickImportFile,
  };
}