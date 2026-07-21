import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categorias = await prisma.categorias.findMany({
    orderBy: { Nombre: 'asc' }
  });

  const ubicaciones = await prisma.ubicaciones.findMany({
    where: { Tipo: 'Sitio' },
    orderBy: { Nombre: 'asc' }
  });

  return <CategoriesClient initialCategorias={categorias} initialUbicaciones={ubicaciones} />;
}
