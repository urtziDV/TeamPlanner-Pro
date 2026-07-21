import { prisma } from "@/lib/prisma";
import { VehiclesClient } from "./VehiclesClient";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const ubicaciones = await prisma.ubicaciones.findMany({
    where: { Tipo: 'Vehiculo' },
    orderBy: { Nombre: 'asc' }
  });

  const history = await prisma.historialVehiculos.findMany({
    orderBy: { Fecha_Entrega: 'desc' },
    take: 300
  });

  const users = await prisma.usuarios.findMany({
    orderBy: { Nombre: 'asc' }
  });

  return <VehiclesClient ubicaciones={ubicaciones} history={history} users={users} />;
}
