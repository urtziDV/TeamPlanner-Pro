"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategoria(data: { Nombre: string }) {
  const newCat = await prisma.categorias.create({
    data: {
      ID: crypto.randomUUID(),
      Nombre: data.Nombre,
    }
  });
  revalidatePath("/categories");
  return newCat;
}

export async function deleteCategoria(id: string) {
  await prisma.categorias.delete({
    where: { ID: id }
  });
  revalidatePath("/categories");
}

export async function updateCategoria(id: string, data: { Nombre: string, Color: string }) {
  const updated = await prisma.categorias.update({
    where: { ID: id },
    data: {
      Nombre: data.Nombre,
      Color: data.Color
    }
  });
  revalidatePath("/categories");
  return updated;
}

export async function createHerramienta(data: any) {
  const newTool = await prisma.herramientas.create({
    data: {
      ID: crypto.randomUUID(),
      Nombre: data.Nombre,
      Categoria: data.Categoria,
      Estado: data.Estado || "Disponible",
      SN: data.SN,
      Ubicacion: data.Ubicacion,
      Imagen_URL: data.Imagen_URL || null,
      Valor: data.Valor?.toString() || null,
      Observaciones: data.Observaciones || null,
      Es_Generica: data.Es_Generica ? 1 : 0,
      Es_Basica: data.Es_Basica ? 1 : 0,
      Apto_Proyecto: data.Apto_Proyecto ? 1 : 0,
    }
  });
  revalidatePath("/inventory");
  revalidatePath("/");
  return newTool;
}

export async function deleteHerramienta(id: string) {
  await prisma.herramientas.delete({
    where: { ID: id }
  });
  revalidatePath("/inventory");
  revalidatePath("/");
}

export async function updateHerramienta(id: string, data: any) {
  const updated = await prisma.herramientas.update({
    where: { ID: id },
    data: {
      Nombre: data.Nombre,
      Categoria: data.Categoria,
      Estado: data.Estado,
      SN: data.SN,
      Ubicacion: data.Ubicacion,
      Imagen_URL: data.Imagen_URL || null,
      Valor: data.Valor?.toString() || null,
      Observaciones: data.Observaciones || null,
      Es_Generica: data.Es_Generica ? 1 : 0,
      Es_Basica: data.Es_Basica ? 1 : 0,
      Apto_Proyecto: data.Apto_Proyecto ? 1 : 0,
    }
  });
  revalidatePath("/inventory");
  revalidatePath("/");
  return updated;
}

export async function createProyecto(data: { Nombre: string, Ubicacion: string, Estado: string }) {
  const newProj = await prisma.proyectos.create({
    data: {
      ID: crypto.randomUUID(),
      Nombre: data.Nombre,
      Ubicacion: data.Ubicacion,
      Estado: data.Estado,
      Fecha_Inicio: new Date().toISOString().split('T')[0]
    }
  });
  revalidatePath("/projects");
  revalidatePath("/");
  return newProj;
}

export async function deleteProyecto(id: string) {
  await prisma.proyectos.delete({
    where: { ID: id }
  });
  revalidatePath("/projects");
  revalidatePath("/");
}

export async function updateHerramientaEstado(id: string, nuevoEstado: string) {
  const updated = await prisma.herramientas.update({
    where: { ID: id },
    data: { Estado: nuevoEstado }
  });
  revalidatePath("/inventory");
  revalidatePath("/projects");
  return updated;
}

export async function addHerramientaToProject(data: { Proyecto_ID: string, Nombre_Generico: string, Cantidad_Requerida: number }) {
  const newItem = await prisma.proyecto_Herramientas.create({
    data: {
      ID: crypto.randomUUID(),
      Proyecto_ID: data.Proyecto_ID,
      Nombre_Generico: data.Nombre_Generico,
      Cantidad_Requerida: data.Cantidad_Requerida,
      Cantidad_Llevada: 0,
      Estado: "Pendiente"
    }
  });
  revalidatePath(`/projects/${data.Proyecto_ID}`);
  return newItem;
}

export async function updateHerramientaProjectStatus(id: string, projectId: string, nuevoEstado: string, sn?: string) {
  const updated = await prisma.proyecto_Herramientas.update({
    where: { ID: id },
    data: { 
      Estado: nuevoEstado,
      SNs_Llevados: sn || undefined
    }
  });
  revalidatePath(`/projects/${projectId}`);
  return updated;
}

export async function deleteSolicitud(id: string) {
  await prisma.solicitudes.delete({
    where: { ID: id }
  });
  revalidatePath("/requests");
  revalidatePath("/incidents");
}

export async function createUsuario(data: { Nombre: string, Departamento: string, Email?: string, Telefono?: string, ID_Empleado?: string }) {
  const newUser = await prisma.usuarios.create({
    data: {
      ID: crypto.randomUUID(),
      Nombre: data.Nombre,
      Departamento: data.Departamento,
      Email: data.Email,
      Telefono: data.Telefono,
      ID_Empleado: data.ID_Empleado
    }
  });
  revalidatePath("/users");
  return newUser;
}

export async function deleteUsuario(id: string) {
  await prisma.usuarios.delete({
    where: { ID: id }
  });
  revalidatePath("/users");
}

export async function updateUsuario(id: string, data: { Nombre: string, Departamento: string, Email?: string, Telefono?: string, ID_Empleado?: string }) {
  const updated = await prisma.usuarios.update({
    where: { ID: id },
    data: {
      Nombre: data.Nombre,
      Departamento: data.Departamento,
      Email: data.Email,
      Telefono: data.Telefono,
      ID_Empleado: data.ID_Empleado
    }
  });
  revalidatePath("/users");
  return updated;
}

export async function createAsignacion(data: { Herramienta_ID: string, Herramienta: string, Usuario_ID: string, Usuario: string, Motivo?: string, Fecha_Limite?: string }) {
  const newLoan = await prisma.asignaciones.create({
    data: {
      ID: crypto.randomUUID(),
      Herramienta_ID: data.Herramienta_ID,
      Herramienta: data.Herramienta,
      Usuario_ID: data.Usuario_ID,
      Usuario: data.Usuario,
      Fecha: new Date().toISOString(),
      Fecha_Entrega: new Date().toISOString().split('T')[0],
      Estado: "Activo",
      Motivo: data.Motivo,
      Fecha_Limite: data.Fecha_Limite
    }
  });
  
  // Update tool state
  await prisma.herramientas.update({
    where: { ID: data.Herramienta_ID },
    data: { Estado: "Prestada" }
  });

  revalidatePath("/loans");
  revalidatePath("/inventory");
  return newLoan;
}

export async function deleteAsignacion(
  id: string, 
  herramientaId: string, 
  returnStatus: string,
  incidenteInfo?: { Tipo: string, Costo: number, Observaciones: string }
) {
  // Move to history
  const asignacion = await prisma.asignaciones.findUnique({ where: { ID: id } });
  if (asignacion) {
    await prisma.historial_prestamos.create({
      data: {
        ID: crypto.randomUUID(),
        Herramienta_ID: asignacion.Herramienta_ID,
        Herramienta: asignacion.Herramienta,
        Usuario_ID: asignacion.Usuario_ID,
        Usuario: asignacion.Usuario,
        Fecha_Entrega: asignacion.Fecha_Entrega,
        Fecha_Devolucion: new Date().toISOString().split('T')[0],
        Estado_Final: returnStatus,
        Motivo: asignacion.Motivo,
        Observaciones: incidenteInfo ? incidenteInfo.Observaciones : asignacion.Observaciones
      }
    });

    if (incidenteInfo && returnStatus !== "Devuelto OK") {
      await prisma.incidentes.create({
        data: {
          ID: crypto.randomUUID(),
          Herramienta: asignacion.Herramienta,
          Usuario: asignacion.Usuario,
          Tipo: incidenteInfo.Tipo,
          Costo: incidenteInfo.Costo,
          Fecha: new Date().toISOString(),
          Observaciones: incidenteInfo.Observaciones
        }
      });
    }
  }

  // Delete active loan
  await prisma.asignaciones.delete({
    where: { ID: id }
  });

  // Update tool state
  const finalStatus = returnStatus === "Devuelto OK" ? "Disponible" : returnStatus;
  await prisma.herramientas.update({
    where: { ID: herramientaId },
    data: { Estado: finalStatus }
  });

  revalidatePath("/loans");
  revalidatePath("/inventory");
  revalidatePath("/incidents");
}

export async function deleteHistorialPrestamo(id: string) {
  await prisma.historial_prestamos.delete({
    where: { ID: id }
  });
  revalidatePath("/loans");
}

export async function createUbicacion(data: { Nombre: string, Tipo: string, Vehiculo_Marca?: string, Vehiculo_Modelo?: string, Vehiculo_Matricula?: string }) {
  const newUbicacion = await prisma.ubicaciones.create({
    data: {
      ID: crypto.randomUUID(),
      Nombre: data.Nombre,
      Tipo: data.Tipo,
      Vehiculo_Marca: data.Vehiculo_Marca,
      Vehiculo_Modelo: data.Vehiculo_Modelo,
      Vehiculo_Matricula: data.Vehiculo_Matricula
    }
  });
  revalidatePath("/vehicles");
  return newUbicacion;
}

export async function deleteUbicacion(id: string) {
  await prisma.ubicaciones.delete({
    where: { ID: id }
  });
  revalidatePath("/vehicles");
}

export async function updateUbicacion(id: string, data: { Nombre: string, Vehiculo_Marca?: string, Vehiculo_Modelo?: string, Vehiculo_Matricula?: string }) {
  const updated = await prisma.ubicaciones.update({
    where: { ID: id },
    data: {
      Nombre: data.Nombre,
      Vehiculo_Marca: data.Vehiculo_Marca,
      Vehiculo_Modelo: data.Vehiculo_Modelo,
      Vehiculo_Matricula: data.Vehiculo_Matricula
    }
  });
  revalidatePath("/vehicles");
  return updated;
}

export async function updateVehicleAssignment(id: string, usuario: string) {
  const ubicacion = await prisma.ubicaciones.findUnique({ where: { ID: id } });
  
  // If it was assigned before, log it to history
  if (ubicacion?.Vehiculo_Asignado_A) {
    await prisma.historialVehiculos.create({
      data: {
        ID: crypto.randomUUID(),
        Vehiculo_ID: id,
        Vehiculo_Nombre: ubicacion.Nombre,
        Usuario_Nombre: ubicacion.Vehiculo_Asignado_A,
        Fecha_Entrega: ubicacion.Vehiculo_Fecha_Asignacion,
        Fecha_Devolucion: new Date().toISOString().split('T')[0],
      }
    });
  }

  // Update current assignment
  const updated = await prisma.ubicaciones.update({
    where: { ID: id },
    data: {
      Vehiculo_Asignado_A: usuario || null,
      Vehiculo_Fecha_Asignacion: usuario ? new Date().toISOString().split('T')[0] : null
    }
  });

  revalidatePath("/vehicles");
  return updated;
}

export async function createIncidente(data: { Herramienta: string, Usuario: string, Tipo: string, Costo: number }) {
  const newIncidente = await prisma.incidentes.create({
    data: {
      ID: crypto.randomUUID(),
      Herramienta: data.Herramienta,
      Usuario: data.Usuario,
      Tipo: data.Tipo,
      Costo: data.Costo,
      Fecha: new Date().toISOString().split('T')[0]
    }
  });
  revalidatePath("/incidents");
  return newIncidente;
}

export async function deleteIncidente(id: string) {
  await prisma.incidentes.delete({
    where: { ID: id }
  });
  revalidatePath("/incidents");
}

export async function createSolicitud(data: { Herramienta: string, Usuario: string }) {
  const newReq = await prisma.solicitudes.create({
    data: {
      ID: crypto.randomUUID(),
      Herramienta: data.Herramienta,
      Usuario: data.Usuario,
      Fecha: new Date().toISOString().split('T')[0]
    }
  });
  revalidatePath("/incidents");
  return newReq;
}

export async function updateConfigs(configs: {key: string, value: string}[]) {
  for (const c of configs) {
    await prisma.config.upsert({
      where: { key: c.key },
      update: { value: c.value },
      create: { key: c.key, value: c.value }
    });
  }
  revalidatePath("/settings");
}
