import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "./CategoriesClient";
import { getKits } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categorias = await prisma.categorias.findMany({
    orderBy: { Nombre: 'asc' }
  });

  const ubicaciones = await prisma.ubicaciones.findMany({
    where: { Tipo: 'Sitio' },
    orderBy: { Nombre: 'asc' }
  });

  const departamentos = await prisma.departamentos.findMany({
    orderBy: { Nombre: 'asc' }
  });

  const tiposRecordatorios = await prisma.tiposRecordatorios.findMany({
    orderBy: { Nombre: 'asc' }
  });

  const kits = await getKits();
  const allHerramientas = await prisma.herramientas.findMany({ select: { Nombre: true } });
  const toolNames = Array.from(new Set(allHerramientas.map(h => h.Nombre).filter(Boolean))) as string[];
  toolNames.sort();

  return <CategoriesClient 
    initialCategorias={categorias} 
    initialUbicaciones={ubicaciones} 
    initialDepartamentos={departamentos}
    initialTiposRecordatorios={tiposRecordatorios}
    initialKits={kits}
    toolNames={toolNames}
  />;
}
