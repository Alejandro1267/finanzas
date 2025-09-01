// import { useAccountStore } from "@/store/useAccountStore";
import { Record } from "@/store/useRecordStore";
import { Transfer } from "@/store/useTransferStore";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SQLite from 'expo-sqlite';
import { Alert } from "react-native";
import * as XLSX from 'xlsx';

export function useExport() {
//   const { setIsLoading } = useAccountStore();

const exportToCSV = async () => {
    let db: SQLite.SQLiteDatabase | null = null;
    
    try {
      // Abrir la base de datos
      db = await SQLite.openDatabaseAsync("finanzas.db", {
        useNewConnection: true,
      });

      // Obtener todos los datos
      const accounts = await db.getAllAsync('SELECT * FROM accounts ORDER BY name') as any[];
      const records = await db.getAllAsync('SELECT * FROM records ORDER BY date DESC, id DESC') as Record[];
      const transfers = await db.getAllAsync('SELECT * FROM transfers ORDER BY date DESC, id DESC') as Transfer[];

      // Crear todas las transacciones unificadas
      const allTransactions = [
        ...records.map(record => {
          const account = accounts.find(acc => acc.id.toString() === record.account);
          return {
            fecha: record.date,
            tipo: record.type === 'income' ? 'Ingreso' : 'Gasto',
            monto: record.amount,
            descripcion: record.description,
            cuenta: account?.name || 'Cuenta no encontrada',
            cuenta_origen: '',
            cuenta_destino: '',
            id_original: record.id
          };
        }),
        ...transfers.map(transfer => {
          const originAccount = accounts.find(acc => acc.id.toString() === transfer.origin);
          const destinationAccount = accounts.find(acc => acc.id.toString() === transfer.destination);
          return {
            fecha: transfer.date,
            tipo: 'Transferencia',
            monto: transfer.amount,
            descripcion: transfer.description,
            cuenta: '',
            cuenta_origen: originAccount?.name || 'N/A',
            cuenta_destino: destinationAccount?.name || 'N/A',
            id_original: transfer.id
          };
        })
      ].sort((a, b) => b.fecha.localeCompare(a.fecha));

      // Convertir a CSV
      const csvHeaders = 'fecha,tipo,monto,descripcion,cuenta,cuenta_origen,cuenta_destino,id_original\n';
      const csvContent = allTransactions.map(transaction => 
        `"${transaction.fecha}","${transaction.tipo}",${transaction.monto},"${transaction.descripcion.replace(/"/g, '""')}","${transaction.cuenta}","${transaction.cuenta_origen}","${transaction.cuenta_destino}","${transaction.id_original}"`
      ).join('\n');

      const csvData = csvHeaders + csvContent;

      // Crear nombre del archivo con fecha y hora
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
      const fileName = `finanzas_backup_${dateStr}_${timeStr}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;

      // Guardar el archivo
      await FileSystem.writeAsStringAsync(fileUri, csvData, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log('Archivo CSV creado en:', fileUri);

      // Compartir el archivo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Exportar datos de finanzas (CSV)',
          UTI: 'public.comma-separated-values-text'
        });
      } else {
        Alert.alert(
          'Exportación completada', 
          `El archivo CSV se guardó como: ${fileName}\nUbicación: ${fileUri}`
        );
      }

      // Mostrar resumen de exportación
      const totalTransactions = records.length + transfers.length;
      Alert.alert(
        'Exportación CSV Exitosa', 
        `Datos exportados:\n• ${totalTransactions} transacciones totales\n• ${records.filter(r => r.type === 'income').length} ingresos\n• ${records.filter(r => r.type === 'expense').length} gastos\n• ${transfers.length} transferencias\n\nArchivo: ${fileName}`
      );

    } catch (error) {
      console.error('Error exporting CSV data:', error);
      Alert.alert(
        'Error de Exportación CSV', 
        'No se pudo exportar los datos a CSV. Por favor, inténtalo de nuevo.'
      );
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

  const exportToExcel = async () => {
    // setIsLoading(true);
    let db: SQLite.SQLiteDatabase | null = null;
    
    try {
      // Abrir la base de datos
      db = await SQLite.openDatabaseAsync("finanzas.db", {
        useNewConnection: true,
      });

      // Obtener todos los datos
      const accounts = await db.getAllAsync('SELECT * FROM accounts ORDER BY name') as any[];
      const records = await db.getAllAsync('SELECT * FROM records ORDER BY date DESC, id DESC') as Record[];
      const transfers = await db.getAllAsync('SELECT * FROM transfers ORDER BY date DESC, id DESC') as Transfer[];

      // Crear el workbook
      const workbook = XLSX.utils.book_new();

      // 1. Hoja de Cuentas
      const accountsData = accounts.map(account => ({
        'ID': account.id,
        'Nombre': account.name,
        'Porcentaje %': account.percentage,
        'Balance': account.balance,
        'Color': account.color
      }));

      const accountsSheet = XLSX.utils.json_to_sheet(accountsData);
      XLSX.utils.book_append_sheet(workbook, accountsSheet, 'Cuentas');

      // 2. Hoja de Ingresos
      const incomeRecords = records
        .filter(record => record.type === 'income')
        .map(record => {
          const account = accounts.find(acc => acc.id.toString() === record.account);
          return {
            'ID': record.id,
            'Fecha': record.date,
            'Monto': record.amount,
            'Descripción': record.description,
            'Cuenta': account?.name || 'Cuenta no encontrada'
          };
        });

      const incomeSheet = XLSX.utils.json_to_sheet(incomeRecords);
      XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Ingresos');

      // 3. Hoja de Gastos
      const expenseRecords = records
        .filter(record => record.type === 'expense')
        .map(record => {
          const account = accounts.find(acc => acc.id.toString() === record.account);
          return {
            'ID': record.id,
            'Fecha': record.date,
            'Monto': record.amount,
            'Descripción': record.description,
            'Cuenta': account?.name || 'Cuenta no encontrada'
          };
        });

      const expenseSheet = XLSX.utils.json_to_sheet(expenseRecords);
      XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Gastos');

      // 4. Hoja de Transferencias
      const transfersData = transfers.map(transfer => {
        const originAccount = accounts.find(acc => acc.id.toString() === transfer.origin);
        const destinationAccount = accounts.find(acc => acc.id.toString() === transfer.destination);
        return {
          'ID': transfer.id,
          'Fecha': transfer.date,
          'Monto': transfer.amount,
          'Descripción': transfer.description,
          'Cuenta Origen': originAccount?.name || 'Cuenta no encontrada',
          'Cuenta Destino': destinationAccount?.name || 'Cuenta no encontrada'
        };
      });

      const transfersSheet = XLSX.utils.json_to_sheet(transfersData);
      XLSX.utils.book_append_sheet(workbook, transfersSheet, 'Transferencias');

      // 5. Hoja de Todas las Transacciones
      const allTransactions = [
        ...records.map(record => {
          const account = accounts.find(acc => acc.id.toString() === record.account);
          return {
            'Fecha': record.date,
            'Tipo': record.type === 'income' ? 'Ingreso' : 'Gasto',
            'Monto': record.amount,
            'Descripción': record.description,
            'Cuenta': account?.name || 'Cuenta no encontrada'
          };
        }),
        ...transfers.map(transfer => {
          const originAccount = accounts.find(acc => acc.id.toString() === transfer.origin);
          const destinationAccount = accounts.find(acc => acc.id.toString() === transfer.destination);
          return {
            'Fecha': transfer.date,
            'Tipo': 'Transferencia',
            'Monto': transfer.amount,
            'Descripción': transfer.description,
            'Cuenta': `${originAccount?.name || 'N/A'} → ${destinationAccount?.name || 'N/A'}`
          };
        })
      ].sort((a, b) => b.Fecha.localeCompare(a.Fecha)); // Ordenar por fecha descendente

      const allTransactionsSheet = XLSX.utils.json_to_sheet(allTransactions);
      XLSX.utils.book_append_sheet(workbook, allTransactionsSheet, 'Todas las Transacciones');

      // 6. Hoja de Resumen
      const totalIncome = records
        .filter(record => record.type === 'income')
        .reduce((sum, record) => sum + record.amount, 0);

      const totalExpense = records
        .filter(record => record.type === 'expense')
        .reduce((sum, record) => sum + record.amount, 0);

      const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

      const totalTransfers = transfers.reduce((sum, transfer) => sum + transfer.amount, 0);

      // Obtener fechas de rango
      const allDates = [...records.map(r => r.date), ...transfers.map(t => t.date)];
      const minDate = allDates.length > 0 ? Math.min(...allDates.map(d => new Date(d).getTime())) : null;
      const maxDate = allDates.length > 0 ? Math.max(...allDates.map(d => new Date(d).getTime())) : null;

      const summaryData = [
        { 'Concepto': 'Total de Cuentas', 'Valor': accounts.length },
        { 'Concepto': 'Balance Total', 'Valor': totalBalance },
        { 'Concepto': '', 'Valor': '' }, // Fila vacía
        { 'Concepto': 'Total Ingresos', 'Valor': totalIncome },
        { 'Concepto': 'Cantidad de Ingresos', 'Valor': records.filter(r => r.type === 'income').length },
        { 'Concepto': '', 'Valor': '' }, // Fila vacía
        { 'Concepto': 'Total Gastos', 'Valor': totalExpense },
        { 'Concepto': 'Cantidad de Gastos', 'Valor': records.filter(r => r.type === 'expense').length },
        { 'Concepto': '', 'Valor': '' }, // Fila vacía
        { 'Concepto': 'Total en Transferencias', 'Valor': totalTransfers },
        { 'Concepto': 'Cantidad de Transferencias', 'Valor': transfers.length },
        { 'Concepto': '', 'Valor': '' }, // Fila vacía
        { 'Concepto': 'Fecha más antigua', 'Valor': minDate ? new Date(minDate).toLocaleDateString() : 'N/A' },
        { 'Concepto': 'Fecha más reciente', 'Valor': maxDate ? new Date(maxDate).toLocaleDateString() : 'N/A' },
        { 'Concepto': '', 'Valor': '' }, // Fila vacía
        { 'Concepto': 'Fecha de exportación', 'Valor': new Date().toLocaleDateString() },
        { 'Concepto': 'Hora de exportación', 'Valor': new Date().toLocaleTimeString() }
      ];

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

      // Generar el archivo Excel
      const excelBuffer = XLSX.write(workbook, { 
        type: 'base64', 
        bookType: 'xlsx' 
      });

      // Crear nombre del archivo con fecha y hora
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
      const fileName = `finanzas_backup_${dateStr}_${timeStr}.xlsx`;
      const fileUri = FileSystem.documentDirectory + fileName;

      // Guardar el archivo
      await FileSystem.writeAsStringAsync(fileUri, excelBuffer, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('Archivo Excel creado en:', fileUri);

      // Compartir el archivo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Exportar datos de finanzas',
          UTI: 'com.microsoft.excel.xlsx'
        });
      } else {
        Alert.alert(
          'Exportación completada', 
          `El archivo se guardó como: ${fileName}\nUbicación: ${fileUri}`
        );
      }

      // Mostrar resumen de exportación
      Alert.alert(
        'Exportación Exitosa', 
        `Datos exportados:\n• ${accounts.length} cuentas\n• ${records.filter(r => r.type === 'income').length} ingresos\n• ${records.filter(r => r.type === 'expense').length} gastos\n• ${transfers.length} transferencias\n\nArchivo: ${fileName}`
      );

    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert(
        'Error de Exportación', 
        'No se pudo exportar los datos. Por favor, inténtalo de nuevo.'
      );
    } finally {
    //   setIsLoading(false);
      if (db) {
        try {
          await db.closeAsync();
        } catch (closeError) {
          console.error('Error closing database:', closeError);
        }
      }
    }
  };

  return {
    exportToExcel,
    exportToCSV,
  };
}