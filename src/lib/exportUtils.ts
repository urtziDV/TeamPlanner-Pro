import * as XLSX from 'xlsx';

export function exportToExcel(data: any[], filename: string, sheetName: string = "Hoja1") {
  // Crear el libro de trabajo
  const wb = XLSX.utils.book_new();
  
  // Convertir JSON a hoja de cálculo
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Añadir la hoja al libro
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Generar el archivo y forzar descarga
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
