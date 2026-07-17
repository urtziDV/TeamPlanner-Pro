import { prisma } from "@/lib/prisma";
import { IncidentsClient } from "./IncidentsClient";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  const incidentes = await prisma.incidentes.findMany({
    orderBy: { Fecha: 'desc' }
  });

  return <IncidentsClient incidentes={incidentes} />;
}
