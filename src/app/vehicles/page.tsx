import { prisma } from "@/lib/prisma";
import { VehiclesClient } from "./VehiclesClient";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const ubicaciones = await prisma.ubicaciones.findMany({
    orderBy: { Tipo: 'asc' }
  });

  const history = await prisma.historialVehiculos.findMany({
    orderBy: { Fecha_Devolucion: 'desc' },
    take: 50
  });

  const users = await prisma.usuarios.findMany({
    orderBy: { Nombre: 'asc' }
  });

  return <VehiclesClient ubicaciones={ubicaciones} history={history} users={users} />;
}
