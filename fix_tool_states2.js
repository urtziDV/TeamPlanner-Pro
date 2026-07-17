const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allAssignments = await prisma.asignaciones.findMany();
  console.log('Unique Asignaciones states:', [...new Set(allAssignments.map(a => a.Estado))]);

  // If there are 'Activa' or 'Activo' or 'Pendiente' assignments, fix them
  const activeAssignments = allAssignments.filter(a => a.Estado !== 'Devuelto' && a.Estado !== 'Devuelta' && a.Estado !== 'Finalizado');
  console.log(`Found ${activeAssignments.length} active assignments.`);

  let updatedCount = 0;
  for (const assignment of activeAssignments) {
    if (!assignment.Herramienta_ID) continue;
    
    const tool = await prisma.herramientas.findUnique({
      where: { ID: assignment.Herramienta_ID }
    });

    if (tool && tool.Estado !== 'Prestada') {
      await prisma.herramientas.update({
        where: { ID: tool.ID },
        data: { Estado: 'Prestada' }
      });
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} tools to 'Prestada' state.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
