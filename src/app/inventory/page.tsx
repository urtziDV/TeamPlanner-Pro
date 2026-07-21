import { prisma } from "@/lib/prisma";
import { InventoryClient } from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const herramientas = await prisma.herramientas.findMany({
    orderBy: { Nombre: 'asc' }
  });

  const activeAssignments = await prisma.asignaciones.findMany({
    where: {
      OR: [
        { Fecha_Devolucion: null },
        { Fecha_Devolucion: "" }
      ]
    }
  });

  const toolsWithAvailability = herramientas.map(tool => {
    const assignedCount = activeAssignments.filter(a => 
      a.Herramienta_ID === tool.ID || 
      (!a.Herramienta_ID && a.Herramienta === tool.Nombre)
    ).length;
    
    const sns = tool.SN ? tool.SN.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean) : [];
    const totalQty = Math.max(tool.Cantidad_Total || 0, sns.length);
    
    return {
      ...tool,
      _disponibles: totalQty ? Math.max(0, totalQty - assignedCount) : null,
      _asignadas: assignedCount
    };
  });

  const categorias = await prisma.categorias.findMany({
    orderBy: { Nombre: 'asc' }
  });

  return <InventoryClient initialTools={toolsWithAvailability} categorias={categorias} />;
}
