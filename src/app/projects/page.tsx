import { prisma } from "@/lib/prisma";
import { ProjectsClient } from "./ProjectsClient";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const proyectos = await prisma.proyectos.findMany({
    orderBy: { Fecha_Inicio: 'desc' }
  });

  return <ProjectsClient initialProyectos={proyectos} />;
}
