import { prisma } from "@/lib/prisma";
import { RequestsClient } from "./RequestsClient";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const solicitudes = await prisma.solicitudes.findMany({
    orderBy: { Fecha: 'desc' }
  });

  const tools = await prisma.herramientas.findMany({
    where: { Estado: { not: "Averiada" } }
  });

  const users = await prisma.usuarios.findMany();
  
  return <RequestsClient initialRequests={solicitudes} tools={tools} users={users} />;
}
