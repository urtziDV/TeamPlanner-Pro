import { prisma } from "@/lib/prisma";
import { IncidentsClient } from "./IncidentsClient";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  const incidentes = await prisma.incidentes.findMany({
    orderBy: { Fecha: 'desc' }
  });
  const usuarios = await prisma.usuarios.findMany();
  const herramientas = await prisma.herramientas.findMany();

  return <IncidentsClient incidentes={incidentes} usuarios={usuarios} herramientas={herramientas} />;
}
