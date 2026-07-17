const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const [
    totalRows,
    disponibles,
    prestadas,
    averiadas,
    asignaciones,
    sumCantidad,
    sampleTools
  ] = await Promise.all([
    p.herramientas.count(),
    p.herramientas.count({ where: { Estado: 'Disponible' } }),
    p.herramientas.count({ where: { Estado: 'Prestada' } }),
    p.herramientas.count({ where: { Estado: 'Averiada' } }),
    p.asignaciones.count(),
    p.herramientas.aggregate({ _sum: { Cantidad_Total: true } }),
    p.herramientas.findMany({ take: 5, select: { Nombre: true, Estado: true, Cantidad_Total: true, Es_Generica: true } })
  ]);

  console.log('=== DATABASE AUDIT ===');
  console.log('Total filas herramientas:', totalRows);
  console.log('Suma de Cantidad_Total:', sumCantidad._sum.Cantidad_Total);
  console.log('Estado Disponible:', disponibles);
  console.log('Estado Prestada:', prestadas);
  console.log('Estado Averiada:', averiadas);
  console.log('Asignaciones activas:', asignaciones);
  console.log('\nSample tools:');
  console.log(JSON.stringify(sampleTools, null, 2));

  // Simulate dashboard totalTools calculation
  const allTools = await p.herramientas.findMany({ select: { Cantidad_Total: true } });
  let totalTools = 0;
  for (const tool of allTools) {
    if (tool.Cantidad_Total && tool.Cantidad_Total > 0) {
      totalTools += tool.Cantidad_Total;
    } else {
      totalTools += 1;
    }
  }
  console.log('\nDashboard totalTools (simulated):', totalTools);
}

main().finally(() => p.$disconnect());
