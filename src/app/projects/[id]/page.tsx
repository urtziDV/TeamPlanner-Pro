import { prisma } from "@/lib/prisma";
import { ProjectDetailClient } from "./ProjectDetailClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const project = await prisma.proyectos.findUnique({
    where: { ID: id }
  });

  if (!project) {
    return notFound();
  }

  const checklist = await prisma.proyecto_Herramientas.findMany({
    where: { Proyecto_ID: id }
  });

  const allTools = await prisma.herramientas.findMany({
    where: { Estado: "Disponible" },
    select: { ID: true, Nombre: true, Categoria: true, SN: true }
  });

  return (
    <ProjectDetailClient 
      project={project} 
      initialChecklist={checklist} 
      availableTools={allTools} 
    />
  );
}
