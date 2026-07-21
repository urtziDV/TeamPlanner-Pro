import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

function parseCurrency(value: string | null | undefined): number {
  if (!value) return 0;
  const normalized = value.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

export default async function AnalyticsDashboardPage() {
  const herramientas = await prisma.herramientas.findMany();
  const asignaciones = await prisma.asignaciones.findMany({
    orderBy: { Fecha_Entrega: 'desc' }
  });
  const incidentes = await prisma.incidentes.findMany();

  let totalValue = 0;
  let totalLostValue = 0;
  let totalBrokenValue = 0;

  // Calculamos pérdidas y roturas desde los incidentes
  for (const inc of incidentes) {
    let coste = inc.Costo || 0;
    if (coste === 0) {
      const tool = herramientas.find(t => t.Nombre === inc.Herramienta);
      if (tool) coste = parseCurrency(tool.Valor);
    }

    if (inc.Tipo === 'Pérdida' || inc.Tipo === 'Robo' || inc.Tipo === 'Baja Definitiva') {
      totalLostValue += coste;
    } else if (inc.Tipo === 'Avería' || inc.Tipo === 'Rotura' || inc.Tipo === 'Roto') {
      totalBrokenValue += coste;
    }
  }

  const categoryDataMap: Record<string, number> = {};

  for (const tool of herramientas) {
    const qty = (tool.Cantidad_Total && tool.Cantidad_Total > 0) ? tool.Cantidad_Total : 1;
    const val = parseCurrency(tool.Valor);
    const totalToolVal = val * qty;
    
    totalValue += totalToolVal;

    const cat = tool.Categoria || "Sin Categoría";
    if (!categoryDataMap[cat]) categoryDataMap[cat] = 0;
    categoryDataMap[cat] += totalToolVal;
  }

  const categoryChartData = Object.keys(categoryDataMap).map(key => ({
    name: key,
    value: categoryDataMap[key]
  })).sort((a, b) => b.value - a.value);

  // Top users with lost tools
  const userLossesMap: Record<string, number> = {};
  
  // Buscar pérdidas en la tabla de incidentes
  for (const inc of incidentes) {
    if ((inc.Tipo === 'Pérdida' || inc.Tipo === 'Robo' || inc.Tipo === 'Avería' || inc.Tipo === 'Baja Definitiva' || inc.Tipo === 'Rotura' || inc.Tipo === 'Roto') && inc.Usuario) {
      let coste = inc.Costo || 0;
      if (coste === 0) {
        const tool = herramientas.find(t => t.Nombre === inc.Herramienta);
        if (tool) coste = parseCurrency(tool.Valor);
      }
      if (!userLossesMap[inc.Usuario]) userLossesMap[inc.Usuario] = 0;
      userLossesMap[inc.Usuario] += coste;
    }
  }

  const topLossUsersData = Object.keys(userLossesMap).map(key => ({
    name: key,
    value: userLossesMap[key]
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  return (
    <DashboardClient 
      totalValue={totalValue}
      totalLostValue={totalLostValue}
      totalBrokenValue={totalBrokenValue}
      categoryChartData={categoryChartData}
      topLossUsersData={topLossUsersData}
    />
  );
}
