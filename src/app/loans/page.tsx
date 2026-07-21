import { prisma } from "@/lib/prisma";
import { LoansClient } from "./LoansClient";

export const dynamic = "force-dynamic";

export default async function LoansPage() {
  const activeLoans = await prisma.asignaciones.findMany({
    orderBy: { Fecha_Entrega: 'desc' }
  });

  const history = await prisma.historial_prestamos.findMany({
    orderBy: { Fecha_Devolucion: 'desc' },
    take: 50 // Limit to 50 for performance
  });

  const tools = await prisma.herramientas.findMany({
    orderBy: { Nombre: 'asc' }
  });

  const allTools = await prisma.herramientas.findMany({
    select: { ID: true, Nombre: true, Valor: true, Imagen_URL: true },
    orderBy: { Nombre: 'asc' }
  });

  const users = await prisma.usuarios.findMany({
    orderBy: { Nombre: 'asc' }
  });

  return <LoansClient activeLoans={activeLoans} history={history} tools={tools} allTools={allTools} users={users} />;
}
