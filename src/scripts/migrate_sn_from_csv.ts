import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

const CsvColumnMapping = [
  { colIndex: 5, dbToolName: "Portátil" },
  { colIndex: 6, dbToolName: "Móvil" },
  { colIndex: 7, dbToolName: "Pantalla ARZOPA" },
  { colIndex: 9, dbToolName: "TP-Link Wifi Extender" }, // Assuming Router Wifi TP-Link maps to TP-Link Wifi Extender
  { colIndex: 10, dbToolName: "Disco Duro Externo" }
];

function isRealSN(value: string): boolean {
  if (!value) return false;
  const upper = value.toUpperCase();
  if (upper === "SI" || upper === "NO" || upper === "0" || upper.includes("PERDIDO") || upper === "OPCIÓN 2") return false;
  // If it's too short, probably not an SN
  if (value.length < 5) return false;
  return true;
}

function cleanSN(value: string): string {
  // Take first word to avoid things like "223B532003348 (ES EL DE CARLOS...)"
  return value.split(" ")[0].trim();
}

async function main() {
  const content = fs.readFileSync('C:\\Users\\udelval\\Desktop\\Registro Material.csv', 'utf8');
  const lines = content.split('\n').filter(Boolean);

  let updatedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const columns = line.split('","').map(s => s.replace(/(^"|"$)/g, ''));
    
    const empleado = columns[0].trim();
    if (!empleado) continue;

    for (const mapping of CsvColumnMapping) {
      let csvValue = columns[mapping.colIndex]?.trim();
      if (!csvValue || !isRealSN(csvValue)) continue;

      const realSN = cleanSN(csvValue);

      // Find active assignment for this employee and tool
      // Use contains for employee name because sometimes they are partial (e.g. "Gorka Peña" vs "Gorka")
      const assignments = await prisma.asignaciones.findMany({
        where: {
          Usuario: {
            contains: empleado.split(" ")[0] // Match by first name to be safe
          },
          Herramienta: {
            contains: mapping.dbToolName
          },
          OR: [
            { Estado: 'Activa' },
            { Estado: 'Activo' },
            { Estado: null },
            { Estado: '' }
          ]
        }
      });

      if (assignments.length > 0) {
        // Find one that doesn't have a real SN yet
        const target = assignments.find(a => !a.SN);
        
        if (target) {
          console.log(`[MIGRATION] Empleado: ${empleado} | Herramienta: ${mapping.dbToolName} | Viejo Identificador: ${target.Identificador} | NUEVO SN: ${realSN}`);
          
          await prisma.asignaciones.update({
            where: { ID: target.ID },
            data: { SN: realSN }
          });
          updatedCount++;
        }
      }
    }
  }

  console.log(`\n✅ Migración completada. ${updatedCount} asignaciones actualizadas.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
