import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const todasHerramientas = await prisma.herramientas.findMany({
    select: { Cantidad_Total: true }
  });
  
  // True total: sum Cantidad_Total (or 1 if not set)
  let totalTools = 0;
  for (const tool of todasHerramientas) {
    totalTools += (tool.Cantidad_Total && tool.Cantidad_Total > 0) ? tool.Cantidad_Total : 1;
  }

  // Active loans = asignaciones with Estado 'Activa' (or any non-null)
  const loanedTools = await prisma.asignaciones.count({
    where: { Estado: 'Activa' }
  });

  const activeProjects = await prisma.proyectos.count({
    where: { Estado: { not: 'Finalizado' } }
  });
  const totalIncidents = await prisma.incidentes.count();

  const latestProjects = await prisma.proyectos.findMany({
    orderBy: { Fecha_Inicio: 'desc' },
    take: 4
  });

  const latestLoans = await prisma.asignaciones.findMany({
    where: { Estado: 'Activa' },
    orderBy: { Fecha: 'desc' },
    take: 5
  });

  // Chart: use row-level counts (42 tool types, not units)
  // Disponibles = tools with Estado Disponible, Prestadas = active loan count (asignaciones), Averiadas = tools with Estado Averiada
  const toolRowsDisponibles = await prisma.herramientas.count({ where: { Estado: 'Disponible' } });
  const toolRowsAveriadas = await prisma.herramientas.count({ where: { Estado: { in: ['Averiada', 'Rota', 'Roto - Baja', 'Baja', 'Pérdida'] } } });
  
  const inventoryStats = [
    { name: 'Herramientas', value: toolRowsDisponibles, color: '#22c55e' },
    { name: 'Préstamos activos', value: loanedTools, color: '#3b82f6' },
    { name: 'Averías/Bajas', value: toolRowsAveriadas, color: '#f97316' },
  ];


  return (
    <DashboardClient 
      totalTools={totalTools}
      loanedTools={loanedTools}
      activeProjects={activeProjects}
      totalIncidents={totalIncidents}
      latestProjects={latestProjects}
      latestLoans={latestLoans}
      inventoryStats={inventoryStats}
    />
  );
}
