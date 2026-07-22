import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const activeAssignments = await prisma.asignaciones.findMany({
    where: {
      OR: [{ Estado: 'Activa' }, { Estado: 'Activo' }, { Estado: null }, { Estado: '' }]
    }
  });

  const toolsWithSN = await prisma.herramientas.findMany({
    where: {
      NOT: [{ SN: null }, { SN: '' }]
    }
  });

  const toolNamesWithSN = new Set(toolsWithSN.map(t => t.Nombre));
  const toolIdsWithSN = new Set(toolsWithSN.map(t => t.ID));

  const missing = activeAssignments.filter(a => 
    (a.Herramienta_ID && toolIdsWithSN.has(a.Herramienta_ID)) ||
    (!a.Herramienta_ID && toolNamesWithSN.has(a.Herramienta)))
    .filter(a => !a.SN || a.SN.trim() === '');

  console.log(`\n🔍 Análisis completado: Se han encontrado ${missing.length} préstamos activos con Números de Serie faltantes.`);
  
  if (missing.length > 0) {
    console.log('\n--- LISTA DE PRÉSTAMOS QUE REQUIEREN REVISIÓN ---');
    missing.forEach(a => {
      console.log(`- Empleado: ${a.Usuario} | Herramienta: ${a.Herramienta} | Fecha Préstamo: ${a.Fecha_Entrega || a.Fecha || 'Desconocida'} | Identificador Viejo: ${a.Identificador || 'N/A'}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
