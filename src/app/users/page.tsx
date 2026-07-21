import { prisma } from "@/lib/prisma";
import { UsersClient } from "./UsersClient";
import { getKits } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.usuarios.findMany({
    orderBy: { Nombre: 'asc' }
  });

  const departments = await prisma.departamentos.findMany({
    orderBy: { Nombre: 'asc' }
  });

  const allBasicTools = await prisma.herramientas.findMany({
    where: { Es_Basica: 1 }
  });

  const allTools = await prisma.herramientas.findMany();

  const activeAssignments = await prisma.asignaciones.findMany({
    where: {
      OR: [
        { Estado: 'Activa' },
        { Estado: 'Activo' },
        { Estado: null },
        { Estado: '' }
      ]
    }
  });

  const allSolicitudes = await prisma.solicitudes.findMany();
  
  const allHistorial = await prisma.historial_prestamos.findMany({
    orderBy: { Fecha_Entrega: 'desc' }
  });

  const kits = await getKits();

  return <UsersClient 
    initialUsers={users} 
    departments={departments} 
    kits={kits}
    basicTools={allBasicTools} 
    activeAssignments={activeAssignments} 
    allSolicitudes={allSolicitudes}
    allHistorial={allHistorial}
    allTools={allTools}
  />;
}
