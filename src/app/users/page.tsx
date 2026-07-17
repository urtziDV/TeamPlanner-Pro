import { prisma } from "@/lib/prisma";
import { UsersClient } from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.usuarios.findMany({
    orderBy: { Nombre: 'asc' }
  });

  const departments = await prisma.departamentos.findMany({
    orderBy: { Nombre: 'asc' }
  });

  return <UsersClient initialUsers={users} departments={departments} />;
}
