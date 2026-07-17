import { prisma } from "@/lib/prisma";
import { InventoryClient } from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const herramientas = await prisma.herramientas.findMany({
    orderBy: { Nombre: 'asc' }
  });

  const categorias = await prisma.categorias.findMany({
    orderBy: { Nombre: 'asc' }
  });

  return <InventoryClient initialTools={herramientas} categorias={categorias} />;
}
