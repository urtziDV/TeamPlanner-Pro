"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import { Jimp } from "jimp";

const execAsync = promisify(exec);

export async function createCategoria(data: { Nombre: string, Color?: string, Icono?: string }) {
  const newCat = await prisma.categorias.create({
    data: {
      ID: crypto.randomUUID(),
      Nombre: data.Nombre,
      Color: data.Color,
      Icono: data.Icono
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

export async function updateCategoria(id: string, data: { Nombre: string, Color?: string, Icono?: string }) {
  const updated = await prisma.categorias.update({
    where: { ID: id },
    data: {
      Nombre: data.Nombre,
      Color: data.Color,
      Icono: data.Icono
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
      Cantidad_Total: parseInt(data.Cantidad_Total) || 1,
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
      Cantidad_Total: parseInt(data.Cantidad_Total) || 1,
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

export async function updateProyectoEstado(id: string, nuevoEstado: string) {
  const updated = await prisma.proyectos.update({
    where: { ID: id },
    data: { Estado: nuevoEstado }
  });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return updated;
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

export async function getCompanyConfigs() {
  const configs = await prisma.config.findMany({
    where: { key: { in: ['companyName', 'companyCif', 'companyLogoPath'] } }
  });
  
  const getVal = (k: string) => configs.find((c: any) => c.key === k)?.value || "";
  
  return {
    companyName: getVal('companyName'),
    companyCif: getVal('companyCif'),
    companyLogoPath: getVal('companyLogoPath')
  };
}

export async function addHerramientaToProject(data: { Proyecto_ID: string, Nombre_Generico: string, Cantidad_Requerida: number, Es_Consumible?: boolean }) {
  const newItem = await prisma.proyecto_Herramientas.create({
    data: {
      ID: crypto.randomUUID(),
      Proyecto_ID: data.Proyecto_ID,
      Nombre_Generico: data.Nombre_Generico,
      Cantidad_Requerida: data.Cantidad_Requerida,
      Es_Consumible: data.Es_Consumible ? 1 : 0,
      Cantidad_Llevada: 0,
      Estado: "Pendiente"
    }
  });
  revalidatePath(`/projects/${data.Proyecto_ID}`);
  return newItem;
}

export async function editHerramientaProject(id: string, projectId: string, data: { Nombre_Generico: string, Cantidad_Requerida: number, Es_Consumible?: boolean }) {
  const updated = await prisma.proyecto_Herramientas.update({
    where: { ID: id },
    data: {
      Nombre_Generico: data.Nombre_Generico,
      Cantidad_Requerida: data.Cantidad_Requerida,
      Es_Consumible: data.Es_Consumible ? 1 : 0
    }
  });
  revalidatePath(`/projects/${projectId}`);
  return updated;
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
  revalidatePath("/");
  revalidatePath("/incidents");
}

export async function createSolicitud(data: { Herramienta: string, Usuario: string }) {
  const newSol = await prisma.solicitudes.create({
    data: {
      ID: crypto.randomUUID(),
      Herramienta: data.Herramienta,
      Usuario: data.Usuario,
      Fecha: new Date().toISOString()
    }
  });
  revalidatePath("/requests");
  revalidatePath("/");
  return newSol;
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

export async function createAsignacion(data: { Herramienta_ID: string, Herramienta: string, Usuario_ID: string, Usuario: string, Motivo?: string, Fecha_Limite?: string, Fecha_Entrega?: string, SN?: string }) {
  const newLoan = await prisma.asignaciones.create({
    data: {
      ID: crypto.randomUUID(),
      Herramienta_ID: data.Herramienta_ID,
      Herramienta: data.Herramienta,
      Usuario_ID: data.Usuario_ID,
      Usuario: data.Usuario,
      Fecha: new Date().toISOString(),
      Fecha_Entrega: data.Fecha_Entrega || new Date().toISOString().split('T')[0],
      Estado: "Activo",
      Motivo: data.Motivo,
      Fecha_Limite: data.Fecha_Limite,
      SN: data.SN
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

export async function updateUbicacion(id: string, data: { Nombre: string, Vehiculo_Marca?: string, Vehiculo_Modelo?: string, Vehiculo_Matricula?: string, Imagen_URL?: string }) {
  const updated = await prisma.ubicaciones.update({
    where: { ID: id },
    data: {
      Nombre: data.Nombre,
      Vehiculo_Marca: data.Vehiculo_Marca,
      Vehiculo_Modelo: data.Vehiculo_Modelo,
      Vehiculo_Matricula: data.Vehiculo_Matricula,
      Imagen_URL: data.Imagen_URL
    }
  });
  revalidatePath("/vehicles");
  return updated;
}

export async function updateVehicleAssignment(id: string, data: { usuario: string, fechaInicio?: string, fechaFin?: string, observaciones?: string }) {
  const ubicacion = await prisma.ubicaciones.findUnique({ where: { ID: id } });
  const today = new Date().toISOString().split('T')[0];
  
  if (!data.usuario) {
    // Devolvemos el vehículo actual
    if (ubicacion?.Vehiculo_Asignado_A) {
      const active = await prisma.historialVehiculos.findFirst({
        where: { Vehiculo_ID: id, Estado: 'Activa' }
      });
      if (active) {
        await prisma.historialVehiculos.update({
          where: { ID: active.ID },
          data: {
            Fecha_Devolucion: today,
            Estado: 'Completada'
          }
        });
      } else {
        await prisma.historialVehiculos.create({
          data: {
            ID: crypto.randomUUID(),
            Vehiculo_ID: id,
            Vehiculo_Nombre: ubicacion.Nombre,
            Usuario_Nombre: ubicacion.Vehiculo_Asignado_A,
            Fecha_Entrega: ubicacion.Vehiculo_Fecha_Asignacion,
            Fecha_Devolucion: today,
            Estado: 'Completada'
          }
        });
      }
    }
    const updated = await prisma.ubicaciones.update({
      where: { ID: id },
      data: {
        Vehiculo_Asignado_A: null,
        Vehiculo_Fecha_Asignacion: null
      }
    });
    revalidatePath("/vehicles");
    return updated;
  }

  // Asignamos o reservamos
  const start = data.fechaInicio || today;
  const isCurrent = start <= today;

  await prisma.historialVehiculos.create({
    data: {
      ID: crypto.randomUUID(),
      Vehiculo_ID: id,
      Vehiculo_Nombre: ubicacion?.Nombre || "",
      Usuario_Nombre: data.usuario,
      Fecha_Entrega: start,
      Fecha_Esperada_Devolucion: data.fechaFin || null,
      Estado: isCurrent ? 'Activa' : 'Reserva',
      Observaciones: data.observaciones
    }
  });

  let updated = ubicacion;
  if (isCurrent) {
    // Update current assignment
    updated = await prisma.ubicaciones.update({
      where: { ID: id },
      data: {
        Vehiculo_Asignado_A: data.usuario,
        Vehiculo_Fecha_Asignacion: start
      }
    });
  }

  revalidatePath("/vehicles");
  return updated;
}

export async function deleteVehicleHistory(id: string) {
  await prisma.historialVehiculos.delete({
    where: { ID: id }
  });
  revalidatePath("/vehicles");
}

export async function updateVehicleHistory(id: string, data: { usuario: string, fechaInicio: string, fechaFin?: string }) {
  const today = new Date().toISOString().split('T')[0];
  const isCurrent = data.fechaInicio <= today && (!data.fechaFin || data.fechaFin >= today);
  
  await prisma.historialVehiculos.update({
    where: { ID: id },
    data: {
      Usuario_Nombre: data.usuario,
      Fecha_Entrega: data.fechaInicio,
      Fecha_Esperada_Devolucion: data.fechaFin || null,
      Estado: isCurrent ? 'Activa' : (data.fechaInicio > today ? 'Reserva' : 'Completada')
    }
  });
  revalidatePath("/vehicles");
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

export async function openFolderPicker(): Promise<string | null> {
  try {
    const script = `
      Add-Type -AssemblyName System.Windows.Forms;
      $f = New-Object System.Windows.Forms.FolderBrowserDialog;
      $f.Description = 'Selecciona la carpeta';
      $f.ShowNewFolderButton = $true;
      $result = $f.ShowDialog();
      if ($result -eq 'OK') { Write-Output $f.SelectedPath }
    `;
    const { stdout } = await execAsync(`powershell -Command "${script.replace(/\n/g, ' ')}"`);
    return stdout.trim() || null;
  } catch (e) {
    console.error("Error opening folder picker:", e);
    return null;
  }
}

export async function openFilePicker(): Promise<string | null> {
  try {
    const script = `
      Add-Type -AssemblyName System.Windows.Forms;
      $f = New-Object System.Windows.Forms.OpenFileDialog;
      $f.Filter = 'SQLite Database (*.db)|*.db|All Files (*.*)|*.*';
      $f.Title = 'Selecciona el archivo de la base de datos';
      $result = $f.ShowDialog();
      if ($result -eq 'OK') { Write-Output $f.FileName }
    `;
    const { stdout } = await execAsync(`powershell -Command "${script.replace(/\n/g, ' ')}"`);
    return stdout.trim() || null;
  } catch (e) {
    console.error("Error opening file picker:", e);
    return null;
  }
}

export async function openImagePicker(): Promise<string | null> {
  try {
    const script = `
      Add-Type -AssemblyName System.Windows.Forms;
      $f = New-Object System.Windows.Forms.OpenFileDialog;
      $f.Filter = 'Imagenes (*.png;*.jpg;*.jpeg;*.webp)|*.png;*.jpg;*.jpeg;*.webp|Todos los archivos (*.*)|*.*';
      $f.Title = 'Selecciona el logo de la empresa';
      $result = $f.ShowDialog();
      if ($result -eq 'OK') { Write-Output $f.FileName }
    `;
    const { stdout } = await execAsync(`powershell -Command "${script.replace(/\n/g, ' ')}"`);
    return stdout.trim() || null;
  } catch (e) {
    console.error("Error opening image picker:", e);
    return null;
  }
}

export async function processAndSaveLogo(sourcePath: string): Promise<{success: boolean, message?: string}> {
  try {
    const destPath = path.join(process.cwd(), 'prisma', 'company_logo.png');
    
    // Leer, redimensionar y guardar la imagen
    const image = await Jimp.read(sourcePath);
    image.scaleToFit({ w: 300, h: 100 });
    await image.write(destPath as `${string}.${string}`);
    
    // Guardar la ruta destino en la configuración
    await updateConfigs([{ key: "companyLogoPath", value: destPath }]);
    
    return { success: true };
  } catch (e: any) {
    console.error("Error procesando logo:", e);
    return { success: false, message: e.message };
  }
}

export async function exportBackupAction(isManual: boolean = false): Promise<{success: boolean, message: string}> {
  try {
    const configs = await prisma.config.findMany({
      where: { key: { in: ['backupPath', 'cloudBackupPath', 'backupCopies'] } }
    });
    
    const getVal = (k: string) => configs.find((c: any) => c.key === k)?.value || "";
    const localPath = getVal('backupPath');
    const cloudPath = getVal('cloudBackupPath');
    const copiesStr = getVal('backupCopies');
    const backupCopies = parseInt(copiesStr, 10) || 30;

    if (!localPath && !cloudPath) {
      return { success: false, message: "No se han configurado rutas de copia de seguridad en los Ajustes." };
    }

    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    if (!fs.existsSync(dbPath)) return { success: false, message: "No se encuentra dev.db" };

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = isManual ? `_${now.toTimeString().split(' ')[0].replace(/:/g, '-')}` : '';
    const filename = `ToolTracker_Backup_${dateStr}${timeStr}.db`;

    let successMsg = "Copia realizada en:\n";
    let madeBackup = false;

    const manageBackupsInFolder = (folderPath: string) => {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      const targetFile = path.join(folderPath, filename);
      fs.copyFileSync(dbPath, targetFile);
      
      const files = fs.readdirSync(folderPath)
        .filter(f => f.startsWith('ToolTracker_Backup_') && f.endsWith('.db'))
        .map(f => {
          const fp = path.join(folderPath, f);
          return { name: f, path: fp, stat: fs.statSync(fp) };
        })
        .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());

      if (files.length > backupCopies) {
        const toDelete = files.slice(backupCopies);
        toDelete.forEach(file => {
          try { fs.unlinkSync(file.path); } catch (e) {}
        });
      }
    };

    if (localPath) {
      manageBackupsInFolder(localPath);
      successMsg += `- Local\n`;
      madeBackup = true;
    }
    
    if (cloudPath) {
      manageBackupsInFolder(cloudPath);
      successMsg += `- Nube\n`;
      madeBackup = true;
    }

    return { success: true, message: madeBackup ? successMsg.trim() : "No se pudo realizar ninguna copia." };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function importBackupAction(): Promise<{success: boolean, message: string}> {
  try {
    const script = `
      Add-Type -AssemblyName System.Windows.Forms;
      $f = New-Object System.Windows.Forms.OpenFileDialog;
      $f.Filter = "SQLite Database (*.db)|*.db|All Files (*.*)|*.*";
      $f.Title = "Selecciona la copia de seguridad a restaurar";
      $result = $f.ShowDialog();
      if ($result -eq 'OK') { Write-Output $f.FileName }
    `;
    const { stdout } = await execAsync(`powershell -Command "${script.replace(/\n/g, ' ')}"`);
    const sourceFile = stdout.trim();
    if (!sourceFile) return { success: false, message: "Operación cancelada" };

    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    fs.copyFileSync(sourceFile, dbPath);
    return { success: true, message: "Copia de seguridad restaurada correctamente" };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function getMaintenanceAlerts() {
  const tools = await prisma.herramientas.findMany({
    where: {
      OR: [
        { Calibracion_Requerida: 1 },
        { Mantenimiento_Requerido: 1 }
      ]
    }
  });

  const alerts: any[] = [];
  const now = new Date();

  for (const t of tools) {
    if (t.Calibracion_Requerida === 1 && t.Calibracion_Ultima && t.Calibracion_Frecuencia) {
      const lastCal = new Date(t.Calibracion_Ultima);
      const nextCal = new Date(lastCal.setMonth(lastCal.getMonth() + t.Calibracion_Frecuencia));
      const diffDays = Math.ceil((nextCal.getTime() - now.getTime()) / (1000 * 3600 * 24));
      if (diffDays <= 30) {
        alerts.push({
          toolId: t.ID,
          toolName: t.Nombre,
          type: 'Calibración',
          dueDate: nextCal.toISOString().split('T')[0],
          daysRemaining: diffDays,
          isOverdue: diffDays < 0
        });
      }
    }

    if (t.Mantenimiento_Requerido === 1 && t.Mantenimiento_Ultimo && t.Mantenimiento_Frecuencia) {
      const lastMaint = new Date(t.Mantenimiento_Ultimo);
      const nextMaint = new Date(lastMaint.setMonth(lastMaint.getMonth() + t.Mantenimiento_Frecuencia));
      const diffDays = Math.ceil((nextMaint.getTime() - now.getTime()) / (1000 * 3600 * 24));
      if (diffDays <= 30) {
        alerts.push({
          toolId: t.ID,
          toolName: t.Nombre,
          type: 'Mantenimiento',
          dueDate: nextMaint.toISOString().split('T')[0],
          daysRemaining: diffDays,
          isOverdue: diffDays < 0
        });
      }
    }
  }

  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export async function logReminderAction(data: { Herramienta: string, Usuario: string, Tipo: string, Via: string, Mensaje?: string }) {
  await prisma.historialRecordatorios.create({
    data: {
      ID: crypto.randomUUID(),
      Fecha: new Date().toISOString(),
      Empleado: data.Usuario,
      Tipo: data.Tipo,
      Via: data.Via,
      Mensaje: data.Mensaje || ""
    }
  });
}

export async function sendEmailAction(to: string, subject: string, text: string): Promise<
  | { success: true; message: string; useOutlook?: false }
  | { success: false; useOutlook: true; message: string; to: string; subject: string; text: string }
  | { success: false; useOutlook?: false; message: string }
> {
  const configs = await prisma.config.findMany();
  const getConf = (k: string) => configs.find(c => c.key === k)?.value || "";
  
  const host = getConf("smtpHost");
  const port = parseInt(getConf("smtpPort") || "587");
  const user = getConf("smtpUser");
  const pass = getConf("smtpPass");
  const from = getConf("smtpFrom") || user;

  // No SMTP configured → signal the client to fall back to Outlook
  if (!host || !user || !pass) {
    return { success: false, useOutlook: true, message: "Sin SMTP configurado. Se abrirá Outlook con el borrador listo.", to, subject, text };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      text
    });

    return { success: true, message: "Correo enviado correctamente." };
  } catch (err: any) {
    console.error("Email error:", err);
    return { success: false, message: "Error al enviar correo: " + err.message };
  }
}

/**
 * Opens the system default mail client (Outlook 365) with a pre-filled draft.
 * Uses the mailto: protocol + Windows `start` command so no SMTP credentials are needed.
 */
export async function openOutlookAction(
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Build mailto URL — encodeURIComponent handles special chars & line breaks
    const mailtoUrl =
      `mailto:${encodeURIComponent(to)}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    // `start "" <url>` opens the protocol handler registered in Windows (Outlook if default)
    await execAsync(`start "" "${mailtoUrl}"`);
    return { success: true, message: "Outlook abierto con el borrador listo para enviar." };
  } catch (err: any) {
    console.error("openOutlookAction error:", err);
    return { success: false, message: "No se pudo abrir Outlook: " + err.message };
  }
}

export async function getChangelog() {
  try {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const content = fs.readFileSync(changelogPath, 'utf8');
    return { success: true, content };
  } catch (err: any) {
    return { success: false, message: "No se pudo leer el Changelog: " + err.message };
  }
}

// Departamentos
export async function createDepartamento(data: { Nombre: string, Icono?: string }) {
  return prisma.departamentos.create({
    data: {
      ID: crypto.randomUUID(),
      Nombre: data.Nombre,
      Icono: data.Icono
    }
  });
}

export async function updateDepartamento(id: string, data: { Nombre?: string, Icono?: string }) {
  return prisma.departamentos.update({
    where: { ID: id },
    data
  });
}

export async function deleteDepartamento(id: string) {
  return prisma.departamentos.delete({ where: { ID: id } });
}

// TiposRecordatorios (Plantillas)
export async function createTipoRecordatorio(data: { Nombre: string, Plantilla: string }) {
  return prisma.tiposRecordatorios.create({
    data: {
      ID: crypto.randomUUID(),
      Nombre: data.Nombre,
      Plantilla: data.Plantilla
    }
  });
}

export async function updateTipoRecordatorio(id: string, data: { Nombre?: string, Plantilla?: string }) {
  return prisma.tiposRecordatorios.update({
    where: { ID: id },
    data
  });
}

export async function deleteTipoRecordatorio(id: string) {
  return prisma.tiposRecordatorios.delete({ where: { ID: id } });
}

// Kits Predefinidos
export async function getKits() {
  const conf = await prisma.config.findUnique({ where: { key: 'kits_predefinidos' } });
  if (conf?.value) return JSON.parse(conf.value);
  return [];
}

export async function saveKits(kits: any[]) {
  await prisma.config.upsert({
    where: { key: 'kits_predefinidos' },
    update: { value: JSON.stringify(kits) },
    create: { key: 'kits_predefinidos', value: JSON.stringify(kits) }
  });
  revalidatePath('/categories');
  revalidatePath('/users');
}

export async function assignKitToUser(userId: string, userName: string, kitTools: string[]) {
  const allTools = await prisma.herramientas.findMany();
  const activeAssignments = await prisma.asignaciones.findMany({
    where: { Fecha_Devolucion: null }
  });
  
  const assigned: string[] = [];
  const missing: string[] = [];
  const usedIds = new Set<string>();

  for (const toolName of kitTools) {
    const availableTool = allTools.find(t => {
      if (t.Nombre !== toolName || usedIds.has(t.ID)) return false;
      
      const sns = t.SN ? t.SN.split(/[\n,]/).filter(Boolean) : [];
      const totalQty = Math.max(t.Cantidad_Total || 0, sns.length);
      
      if (totalQty <= 1) return t.Estado === "Disponible";
      
      const assignedCount = activeAssignments.filter(a => a.Herramienta_ID === t.ID || (!a.Herramienta_ID && a.Herramienta === t.Nombre)).length;
      return (totalQty - assignedCount) > 0;
    });
    
    if (availableTool) {
      usedIds.add(availableTool.ID);
      await createAsignacion({
        Herramienta_ID: availableTool.ID,
        Herramienta: availableTool.Nombre || "Desconocida",
        Usuario_ID: userId,
        Usuario: userName,
        Motivo: "Material Predefinido (Kit)"
      });
      assigned.push(toolName);
    } else {
      missing.push(toolName);
    }
  }
  
  revalidatePath('/users');
  revalidatePath('/inventory');
  return { success: true, assigned, missing };
}

// Scanner Bulk Actions
export async function bulkAssignTools(userId: string, userName: string, toolIds: string[]) {
  let assignedCount = 0;
  for (const id of toolIds) {
    const tool = await prisma.herramientas.findUnique({ where: { ID: id } });
    if (tool && tool.Estado === 'Disponible') {
      await createAsignacion({
        Herramienta_ID: tool.ID,
        Herramienta: tool.Nombre || "Desconocida",
        Usuario_ID: userId,
        Usuario: userName,
        Motivo: "Asignación Masiva (Escáner)"
      });
      assignedCount++;
    }
  }
  revalidatePath('/inventory');
  revalidatePath('/users');
  return { success: true, count: assignedCount };
}

export async function bulkReturnTools(toolIds: string[]) {
  let returnCount = 0;
  for (const id of toolIds) {
    const tool = await prisma.herramientas.findUnique({ where: { ID: id } });
    if (tool && tool.Estado === 'Prestada') {
      // Find active assignment
      const asignaciones = await prisma.asignaciones.findMany({
        where: { Herramienta_ID: id },
        orderBy: { Fecha_Entrega: 'desc' },
        take: 1
      });
      
      if (asignaciones.length > 0) {
        // Use the existing deleteAsignacion function which handles history creation and state change
        await deleteAsignacion(asignaciones[0].ID, id, "Devuelto OK");
        returnCount++;
      }
    }
  }
  revalidatePath('/inventory');
  revalidatePath('/users');
  return { success: true, count: returnCount };
}

export async function sendActaEmail(employeeEmail: string, base64Pdf: string, fileName: string) {
  try {
    const smtpHost = await prisma.config.findUnique({ where: { key: "smtpHost" } });
    const smtpPort = await prisma.config.findUnique({ where: { key: "smtpPort" } });
    const smtpUser = await prisma.config.findUnique({ where: { key: "smtpUser" } });
    const smtpPass = await prisma.config.findUnique({ where: { key: "smtpPass" } });

    if (!smtpHost?.value || !smtpPort?.value || !smtpUser?.value || !smtpPass?.value) {
      return { success: false, error: "La configuración SMTP no está completa en Ajustes." };
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost.value,
      port: parseInt(smtpPort.value),
      secure: parseInt(smtpPort.value) === 465,
      auth: {
        user: smtpUser.value,
        pass: smtpPass.value,
      },
    });

    const buffer = Buffer.from(base64Pdf.split('base64,')[1], 'base64');

    const mailOptions = {
      from: smtpUser.value,
      to: employeeEmail,
      subject: "Acta de Herramientas - " + fileName,
      text: "Hola,\n\nAdjunto encontrarás el acta de herramientas en formato PDF.\n\nUn saludo.",
      attachments: [
        {
          filename: fileName,
          content: buffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending acta email:", error);
    return { success: false, error: error.message || "Error desconocido al enviar el email." };
  }
}

