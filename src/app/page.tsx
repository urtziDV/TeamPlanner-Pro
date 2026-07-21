import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";
import { getMaintenanceAlerts } from "./actions";

export const dynamic = "force-dynamic";

function parseCurrency(value: string | null | undefined): number {
  if (!value) return 0;
  const normalized = value.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

export default async function DashboardPage() {
  const todasHerramientas = await prisma.herramientas.findMany({
    select: { Cantidad_Total: true, Valor: true }
  });
  
  let totalTools = 0;
  let totalInvested = 0;
  
  for (const tool of todasHerramientas) {
    const qty = (tool.Cantidad_Total && tool.Cantidad_Total > 0) ? tool.Cantidad_Total : 1;
    totalTools += qty;
    totalInvested += parseCurrency(tool.Valor) * qty;
  }

  // Active loans = asignaciones with Estado 'Activa' (or any non-null)
  const allActiveLoans = await prisma.asignaciones.findMany({
    where: { Estado: 'Activa' },
    select: { Usuario: true, Fecha: true, Motivo: true, Herramienta: true, Fecha_Entrega: true, ID: true }
  });
  
  const loanedTools = allActiveLoans.length;

  const activeProjects = await prisma.proyectos.count({
    where: { Estado: { not: 'Finalizado' } }
  });
  
  const totalIncidents = await prisma.incidentes.count();
  
  const allIncidentes = await prisma.incidentes.findMany({ select: { Costo: true } });
  let totalCostBroken = 0;
  for (const inc of allIncidentes) {
    if (inc.Costo) totalCostBroken += inc.Costo;
  }

  const totalRequests = await prisma.solicitudes.count();
  
  const activeVehicles = await prisma.ubicaciones.count({
    where: { 
      Tipo: 'Vehiculo', 
      Vehiculo_Asignado_A: { not: null } 
    }
  });

  const latestProjects = await prisma.proyectos.findMany({
    orderBy: { Fecha_Inicio: 'desc' },
    take: 4
  });

  const latestLoans = [...allActiveLoans]
    .sort((a, b) => new Date(b.Fecha || 0).getTime() - new Date(a.Fecha || 0).getTime())
    .slice(0, 5);

  const latestIncidents = await prisma.incidentes.findMany({
    orderBy: { Fecha: 'desc' },
    take: 4
  });

  // Top users by active loans
  const userCountMap = new Map<string, number>();
  for (const loan of allActiveLoans) {
    if (loan.Usuario) {
      userCountMap.set(loan.Usuario, (userCountMap.get(loan.Usuario) || 0) + 1);
    }
  }
  
  const topUsers = Array.from(userCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([Usuario, count]) => ({ Usuario, count }));

  // Chart: use row-level counts (42 tool types, not units)
  // Disponibles = tools with Estado Disponible, Prestadas = active loan count (asignaciones), Averiadas = tools with Estado Averiada
  const toolRowsDisponibles = await prisma.herramientas.count({ where: { Estado: 'Disponible' } });
  const toolRowsAveriadas = await prisma.herramientas.count({ where: { Estado: { in: ['Averiada', 'Rota', 'Roto - Baja', 'Baja', 'Pérdida'] } } });
  
  const inventoryStats = [
    { name: 'Herramientas', value: toolRowsDisponibles, color: '#22c55e' },
    { name: 'Préstamos activos', value: loanedTools, color: '#3b82f6' },
    { name: 'Averías/Bajas', value: toolRowsAveriadas, color: '#f97316' },
  ];


  const maintenanceAlerts = await getMaintenanceAlerts();

  return (
    <DashboardClient 
      totalTools={totalTools}
      loanedTools={loanedTools}
      activeProjects={activeProjects}
      totalIncidents={totalIncidents}
      totalRequests={totalRequests}
      activeVehicles={activeVehicles}
      totalInvested={totalInvested}
      totalCostBroken={totalCostBroken}
      latestProjects={latestProjects}
      latestLoans={latestLoans}
      latestIncidents={latestIncidents}
      topUsers={topUsers}
      inventoryStats={inventoryStats}
      maintenanceAlerts={maintenanceAlerts}
    />
  );
}
