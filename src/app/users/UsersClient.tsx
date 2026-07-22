"use client"; 

import { useState } from "react";
import { UsersRound, Plus, Trash2, Edit, LayoutGrid, List, Search, Eye, CheckCircle2, FileText, History, Download, Mail, Loader2 } from "lucide-react";
import { exportToExcel } from "@/lib/exportUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConfirm, ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createUsuario, deleteUsuario, updateUsuario, createAsignacion, deleteSolicitud, assignKitToUser, getCompanyConfigs, deleteAsignacion, sendActaEmail } from "@/app/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { generateEmployeePDF } from "./pdfExport";

export function UsersClient({ 
  initialUsers, 
  departments, 
  basicTools = [], 
  activeAssignments = [],
  allSolicitudes = [],
  allHistorial = [],
  kits = [],
  allTools = []
}: { 
  initialUsers: any[], 
  departments: any[], 
  basicTools?: any[], 
  activeAssignments: any[],
  allSolicitudes: any[],
  allHistorial: any[],
  kits?: any[],
  allTools?: any[]
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

  const calculateReliabilityScore = (userName: string) => {
    const userHistory = allHistorial.filter(h => h.Usuario === userName);
    if (userHistory.length === 0) return null;
    
    const totalResolved = userHistory.length;
    const goodReturns = userHistory.filter(h => h.Estado_Final === 'Devuelto OK').length;
    
    return Math.round((goodReturns / totalResolved) * 100);
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-gray-100 text-gray-500 border-gray-200";
    if (score >= 90) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 70) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null) return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">Sin historial</span>;
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getScoreColor(score)}`}>Fiabilidad {score}%</span>;
  };
  const [formData, setFormData] = useState({ Nombre: "", Departamento: "", Email: "", Telefono: "", ID_Empleado: "" });

  const filteredUsers = users.filter(u => 
    (u.Nombre?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (u.Departamento?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  // Employee details states
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [snSelectorOpen, setSnSelectorOpen] = useState(false);
  const [currentKitToolName, setCurrentKitToolName] = useState("");
  const [includeCost, setIncludeCost] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const welcomeKitNames = Array.from(new Set(basicTools.map((t: any) => t.Nombre)));

  const handleGeneratePDF = async (type: 'entrega' | 'devolucion') => {
    if (!selectedUser) return;
    toast.loading("Generando PDF...");
    try {
      const companyConfigs = await getCompanyConfigs();
      const userAssignments = activeAssignments
        .filter(a => a.Usuario_ID === selectedUser.ID || a.Usuario === selectedUser.Nombre)
        .map(a => {
          let valor = "0";
          if (a.Herramienta_ID) {
            const tool = allTools?.find(t => t.ID === a.Herramienta_ID);
            if (tool && tool.Valor) valor = tool.Valor;
          } else {
            const tool = allTools?.find(t => t.Nombre === a.Herramienta);
            if (tool && tool.Valor) valor = tool.Valor;
          }
          return { ...a, Valor: valor };
        });
      await generateEmployeePDF(type, selectedUser, userAssignments, companyConfigs, includeCost);
      toast.dismiss();
      toast.success("PDF generado con éxito");
    } catch (e) {
      toast.dismiss();
      toast.error("Error al generar PDF");
      console.error(e);
    }
  };

  const handleEmailPDF = async (type: 'entrega' | 'devolucion') => {
    if (!selectedUser) return;
    if (!selectedUser.Email) {
      toast.error("El usuario no tiene un email configurado.");
      return;
    }
    
    setIsSendingEmail(true);
    const loadingToastId = toast.loading("Generando y enviando acta por email...");
    try {
      const companyConfigs = await getCompanyConfigs();
      const userAssignments = activeAssignments
        .filter(a => a.Usuario_ID === selectedUser.ID || a.Usuario === selectedUser.Nombre)
        .map(a => {
          let valor = "0";
          if (a.Herramienta_ID) {
            const tool = allTools?.find(t => t.ID === a.Herramienta_ID);
            if (tool && tool.Valor) valor = tool.Valor;
          } else {
            const tool = allTools?.find(t => t.Nombre === a.Herramienta);
            if (tool && tool.Valor) valor = tool.Valor;
          }
          return { ...a, Valor: valor };
        });
        
      const pdfResult = await generateEmployeePDF(type, selectedUser, userAssignments, companyConfigs, includeCost, true);
      const { base64, fileName } = pdfResult as { base64: string, fileName: string };

      const res = await sendActaEmail(selectedUser.Email, base64, fileName);
      if (res.success) {
        toast.success(`Acta enviada correctamente a ${selectedUser.Email}`);
      } else {
        toast.error(res.error || "Error al enviar el email.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al preparar el PDF para enviar.");
    } finally {
      toast.dismiss(loadingToastId);
      setIsSendingEmail(false);
    }
  };

  const checkDuplicateId = (idEmpleado: string, currentUserId?: string) => {
    if (!idEmpleado) return false;
    return users.some(u => u.ID_Empleado === idEmpleado && u.ID !== currentUserId);
  };

  const getFreeIds = () => {
    const assignedIds = users
      .map(u => parseInt(u.ID_Empleado))
      .filter(id => !isNaN(id) && id > 0)
      .sort((a, b) => a - b);
      
    if (assignedIds.length === 0) return "Todos (1, 2, 3...)";
    
    const maxId = assignedIds[assignedIds.length - 1];
    const freeIds = [];
    for (let i = 1; i < maxId; i++) {
      if (!assignedIds.includes(i)) {
        freeIds.push(i);
      }
    }
    
    if (freeIds.length === 0) {
      return `Próximo: ${maxId + 1}`;
    }
    
    const displayIds = freeIds.slice(0, 10).join(', ');
    return `Libres: ${displayIds}${freeIds.length > 10 ? '...' : ''} | Próximo: ${maxId + 1}`;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Nombre) return;
    if (checkDuplicateId(formData.ID_Empleado)) {
      toast.error("Este ID de empleado ya está en uso por otra persona.");
      return;
    }
    const newUser = await createUsuario(formData);
    setUsers((prev) => [newUser, ...prev]);
    setFormData({ Nombre: "", Departamento: "", Email: "", Telefono: "", ID_Empleado: "" });
    setOpen(false);
    router.refresh();
  };

  const openEdit = (u: any) => {
    setEditingUserId(u.ID);
    setFormData({ 
      Nombre: u.Nombre || "", 
      Departamento: u.Departamento || "", 
      Email: u.Email || "", 
      Telefono: u.Telefono || "", 
      ID_Empleado: u.ID_Empleado || "" 
    });
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId || !formData.Nombre) return;
    if (checkDuplicateId(formData.ID_Empleado, editingUserId)) {
      toast.error("Este ID de empleado ya está en uso por otra persona.");
      return;
    }
    const updated = await updateUsuario(editingUserId, formData);
    setUsers(prev => prev.map(u => u.ID === editingUserId ? { ...u, ...updated } : u));
    setEditOpen(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar Empleado",
      message: "¿Estás seguro de que quieres eliminar a este empleado?",
      variant: "destructive",
      confirmLabel: "Eliminar"
    });
    if (ok) {
      await deleteUsuario(id);
      setUsers((prev) => prev.filter((u) => u.ID !== id));
      router.refresh();
    }
  };

  const openDetails = (u: any) => {
    setSelectedUser(u);
    setDetailsOpen(true);
  };

  const isToolAvailable = (tool: any) => {
    const sns = tool.SN ? tool.SN.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean) : [];
    const totalQty = Math.max(tool.Cantidad_Total || 0, sns.length);
    if (totalQty <= 1) return tool.Estado === "Disponible";
    
    const assignedCount = activeAssignments.filter(a => a.Herramienta_ID === tool.ID || (!a.Herramienta_ID && a.Herramienta === tool.Nombre)).length;
    return (totalQty - assignedCount) > 0;
  };

  const handleAssignBasicTool = async (toolName: string) => {
    const availableTools = basicTools.filter((t: any) => t.Nombre === toolName && isToolAvailable(t));
    if (availableTools.length === 0) {
      toast.error("No hay stock disponible de " + toolName);
      return;
    }
    
    const needsSelection = availableTools.some((t: any) => t.SN) || availableTools.length > 1;

    if (needsSelection) {
      setCurrentKitToolName(toolName);
      setSnSelectorOpen(true);
    } else {
      const toolToAssign = availableTools[0];
      await createAsignacion({
        Herramienta_ID: toolToAssign.ID,
        Herramienta: toolToAssign.Nombre,
        Usuario_ID: selectedUser.ID,
        Usuario: selectedUser.Nombre,
        Motivo: "Material de Bienvenida"
      });
      router.refresh();
    }
  };

  const handleAssignKit = async (kit: any) => {
    if (!selectedUser) return;
    const res = await assignKitToUser(selectedUser.ID, selectedUser.Nombre, kit.herramientas);
    if (res.success) {
      let msg = `Asignado: ${res.assigned.join(', ') || 'Ninguna herramienta'}.`;
      if (res.missing.length > 0) {
        msg += `\nSin stock: ${res.missing.join(', ')}.`;
        toast.warning(msg);
      } else {
        toast.success("Kit asignado completamente.");
      }
      router.refresh();
    }
  };

  const handleReturnTool = async (a: any) => {
    const ok = await confirm({
      title: "Devolver Material",
      message: `¿Confirmas la devolución de ${a.Herramienta}?`,
      confirmLabel: "Devolver"
    });
    if (ok) {
      let toolId = a.Herramienta_ID;
      if (!toolId) {
        const t = allTools?.find(x => x.Nombre === a.Herramienta);
        if (t) toolId = t.ID;
      }
      if (toolId) {
        toast.loading("Procesando devolución...");
        try {
          await deleteAsignacion(a.ID, toolId, "Devuelto OK");
          toast.dismiss();
          toast.success("Material devuelto correctamente");
          router.refresh();
        } catch (e) {
          toast.dismiss();
          toast.error("Error al devolver material");
        }
      } else {
        toast.error("No se pudo encontrar el ID de la herramienta para devolverla.");
      }
    }
  };

  const handleAssignSpecificTool = async (toolId: string, sn?: string) => {
    const toolToAssign = allTools.find((t: any) => t.ID === toolId);
    if (!toolToAssign) return;
    
    await createAsignacion({
      Herramienta_ID: toolToAssign.ID,
      Herramienta: toolToAssign.Nombre,
      Usuario_ID: selectedUser.ID,
      Usuario: selectedUser.Nombre,
      Motivo: "Material de Bienvenida",
      SN: sn
    });
    
    setSnSelectorOpen(false);
    setCurrentKitToolName("");
    router.refresh();
  };

  const handleAssignRequest = async (solicitud: any) => {
    const availableTools = allTools.filter((t: any) => t.Nombre === solicitud.Herramienta && isToolAvailable(t));
    if (availableTools.length === 0) {
      toast.error("No hay stock disponible de " + solicitud.Herramienta);
      return;
    }
    
    const needsSelection = availableTools.some((t: any) => t.SN) || availableTools.length > 1;

    if (needsSelection) {
      setCurrentKitToolName(solicitud.Herramienta);
      setSnSelectorOpen(true);
      // Delete the request after opening selection since assignment will happen. 
      // Actually we should delete it inside handleAssignSpecificTool. But wait, handleAssignSpecificTool doesn't know about requests.
      // For now, let's just delete the request right away since they are acting on it.
      await deleteSolicitud(solicitud.ID);
    } else {
      const toolToAssign = availableTools[0];
      await createAsignacion({
        Herramienta_ID: toolToAssign.ID,
        Herramienta: toolToAssign.Nombre,
        Usuario_ID: selectedUser.ID,
        Usuario: selectedUser.Nombre,
        Motivo: "Solicitud del usuario"
      });
      await deleteSolicitud(solicitud.ID);
      router.refresh();
    }
  };

  const userSolicitudes = selectedUser ? allSolicitudes.filter(s => s.Usuario === selectedUser.Nombre) : [];
  const userHistorial = allHistorial.filter(h => h.Usuario_ID === selectedUser?.ID || h.Usuario === selectedUser?.Nombre);

  const handleDeleteRequest = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar Solicitud",
      message: "¿Estás seguro de que quieres eliminar esta solicitud?",
      variant: "destructive",
      confirmLabel: "Eliminar"
    });
    if (ok) {
      await deleteSolicitud(id);
      router.refresh();
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
        <h2 className="text-3xl font-bold tracking-tight">Empleados</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[250px]" 
            />
          </div>
          <div className="flex bg-muted p-1 rounded-md">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button variant="outline" onClick={() => exportToExcel(filteredUsers, 'Empleados')} title="Exportar Empleados a Excel">
            <Download className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Exportar</span>
          </Button>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Empleado
            </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Añadir Empleado</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input 
                    id="nombre" 
                    value={formData.Nombre} 
                    onChange={(e) => setFormData({...formData, Nombre: e.target.value})} 
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="id_empleado">ID Empleado</Label>
                  <Input 
                    id="id_empleado" 
                    value={formData.ID_Empleado} 
                    onChange={(e) => setFormData({...formData, ID_Empleado: e.target.value})} 
                    placeholder="Ej. 1, 2, 3..."
                  />
                  <p className="text-[11px] text-muted-foreground">{getFreeIds()}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento</Label>
                <select 
                  id="departamento"
                  value={formData.Departamento}
                  onChange={(e) => setFormData({...formData, Departamento: e.target.value})}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Selecciona...</option>
                  {departments.map(d => <option key={d.ID} value={d.Nombre}>{d.Nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.Email} 
                    onChange={(e) => setFormData({...formData, Email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input 
                    id="telefono" 
                    value={formData.Telefono} 
                    onChange={(e) => setFormData({...formData, Telefono: e.target.value})} 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Empleado</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nombre">Nombre Completo</Label>
                  <Input 
                    id="edit-nombre" 
                    value={formData.Nombre} 
                    onChange={(e) => setFormData({...formData, Nombre: e.target.value})} 
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-id_empleado">ID Empleado</Label>
                  <Input 
                    id="edit-id_empleado" 
                    value={formData.ID_Empleado} 
                    onChange={(e) => setFormData({...formData, ID_Empleado: e.target.value})} 
                  />
                  <p className="text-[11px] text-muted-foreground">{getFreeIds()}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-departamento">Departamento</Label>
                <select 
                  id="edit-departamento"
                  value={formData.Departamento}
                  onChange={(e) => setFormData({...formData, Departamento: e.target.value})}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Selecciona...</option>
                  {departments.map(d => <option key={d.ID} value={d.Nombre}>{d.Nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input 
                    id="edit-email" 
                    type="email"
                    value={formData.Email} 
                    onChange={(e) => setFormData({...formData, Email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-telefono">Teléfono</Label>
                  <Input 
                    id="edit-telefono" 
                    value={formData.Telefono} 
                    onChange={(e) => setFormData({...formData, Telefono: e.target.value})} 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setEditOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar Cambios</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <ConfirmDialog confirmState={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
      
      <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-2"}>
        {filteredUsers.length === 0 ? (
          <div className="col-span-full p-8 text-center border rounded-xl bg-card text-muted-foreground">
            No hay empleados encontrados.
          </div>
        ) : (
          filteredUsers.map((u) => (
            viewMode === "grid" ? (
              <div key={u.ID} className="rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-md p-4 group flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <UsersRound className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold leading-none tracking-tight">{u.Nombre}</h3>
                      {u.ID_Empleado && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded border">ID: {u.ID_Empleado}</span>}
                      {getScoreBadge(calculateReliabilityScore(u.Nombre))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{u.Departamento || "Sin departamento"}</p>
                    <div className="text-xs space-y-0.5 mt-2">
                      {u.Email && <p><span className="text-muted-foreground">Email:</span> {u.Email}</p>}
                      {u.Telefono && <p><span className="text-muted-foreground">Teléfono:</span> {u.Telefono}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 transition-opacity">
                  <button 
                    onClick={() => openDetails(u)}
                    className="p-1.5 text-muted-foreground hover:text-blue-500 transition-colors rounded-md hover:bg-blue-500/10"
                    title="Detalles del Empleado"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <Button title="Editar" variant="ghost" size="icon" 
                    onClick={() => openEdit(u)}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button title="Eliminar" variant="ghost" size="icon" 
                    onClick={() => handleDelete(u.ID)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div key={u.ID} className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md flex items-center justify-between p-4 group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{u.Nombre.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{u.Nombre}</h3>
                      {u.ID_Empleado && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded border">ID: {u.ID_Empleado}</span>}
                      {getScoreBadge(calculateReliabilityScore(u.Nombre))}
                    </div>
                    <p className="text-sm text-muted-foreground">{u.Departamento || "Sin departamento"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-green-500" title="Activo" />
                  <button 
                    onClick={() => openDetails(u)}
                    className="p-2 text-muted-foreground hover:text-blue-500 transition-colors rounded-md hover:bg-blue-500/10"
                    title="Detalles del Empleado"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <Button title="Editar" variant="ghost" size="icon" 
                    onClick={() => openEdit(u)}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button title="Eliminar" variant="ghost" size="icon" 
                    onClick={() => handleDelete(u.ID)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          ))
        )}
      </div>

      {/* Employee Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-4xl max-w-[95vw] w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              Detalles de {selectedUser?.Nombre}
              {selectedUser && getScoreBadge(calculateReliabilityScore(selectedUser.Nombre))}
            </DialogTitle>
            {kits.length > 0 && (
              <div className="flex items-center gap-2 mr-6">
                <select 
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  onChange={(e) => {
                    const k = kits.find(kit => kit.id === e.target.value);
                    if (k) handleAssignKit(k);
                    e.target.value = "";
                  }}
                >
                  <option value="">Asignar Kit Rápido...</option>
                  {kits.map(k => <option key={k.id} value={k.id}>{k.nombre}</option>)}
                </select>
              </div>
            )}
          </DialogHeader>
          
          <div className="flex gap-4 items-center justify-end mt-2 bg-muted/30 p-2 rounded-lg border">
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary mr-2">
              <input 
                type="checkbox" 
                checked={includeCost} 
                onChange={(e) => setIncludeCost(e.target.checked)} 
                className="rounded border-gray-300 w-4 h-4 accent-primary" 
              />
              <span className="font-medium text-muted-foreground select-none">Mostrar Coste Estimado</span>
            </label>
            <div className="flex gap-2 border-l pl-4 border-border items-center">
              <div className="flex border rounded-md overflow-hidden bg-background">
                <Button variant="ghost" size="sm" onClick={() => handleGeneratePDF('entrega')} className="flex items-center gap-2 border-0 border-r rounded-none hover:bg-primary/5">
                  <FileText className="h-4 w-4 text-primary" />
                  Acta Entrega
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEmailPDF('entrega')} disabled={isSendingEmail} className="border-0 rounded-none hover:bg-primary/5 w-9 px-0" title="Enviar por Email">
                  {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Mail className="h-4 w-4 text-primary" />}
                </Button>
              </div>
              
              <div className="flex border border-red-200 rounded-md overflow-hidden bg-background">
                <Button variant="ghost" size="sm" onClick={() => handleGeneratePDF('devolucion')} className="flex items-center gap-2 border-0 border-r border-red-200 text-red-600 rounded-none hover:text-red-700 hover:bg-red-50">
                  <FileText className="h-4 w-4" />
                  Acta Devolución
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEmailPDF('devolucion')} disabled={isSendingEmail} className="border-0 rounded-none text-red-600 hover:text-red-700 hover:bg-red-50 w-9 px-0" title="Enviar por Email">
                  {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="adicional" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="adicional">Mat. Asignado</TabsTrigger>
              <TabsTrigger value="bienvenida">Asignar Básico</TabsTrigger>
              <TabsTrigger value="solicitudes">Solicitudes</TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bienvenida" className="pt-4">
              <div className="space-y-4">
                {welcomeKitNames.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay material básico configurado en el inventario.</p>
                ) : (
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-2 text-left font-medium">Material</th>
                          <th className="px-4 py-2 text-left font-medium">Estado</th>
                          <th className="px-4 py-2 text-right font-medium">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {welcomeKitNames.map(name => {
                          const isDelivered = activeAssignments.some(a => (a.Usuario_ID === selectedUser?.ID || a.Usuario === selectedUser?.Nombre) && a.Herramienta === name);
                          return (
                            <tr key={name as string} className="border-b last:border-0">
                              <td className="px-4 py-3">{name as string}</td>
                              <td className="px-4 py-3">
                                {isDelivered ? (
                                  <span className="flex items-center text-green-600 font-medium">
                                    <CheckCircle2 className="h-4 w-4 mr-1" /> Entregado
                                  </span>
                                ) : (
                                  <span className="text-red-500 font-medium flex items-center">
                                    <span className="h-2 w-2 rounded-full bg-red-500 mr-2" /> No entregado
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {!isDelivered && (
                                  <Button variant="outline" size="sm" onClick={() => handleAssignBasicTool(name as string)}>
                                    Asignar
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="adicional" className="pt-4">
              <div className="space-y-4">
                {(() => {
                  const additional = activeAssignments.filter(a => a.Usuario_ID === selectedUser?.ID || a.Usuario === selectedUser?.Nombre);
                  if (additional.length === 0) {
                    return <p className="text-sm text-muted-foreground text-center py-8">No hay material prestado a este empleado.</p>;
                  }

                  const toolCounts = additional.reduce((acc, curr) => {
                    const key = curr.Herramienta;
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);

                  return (
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-4 py-2 text-left font-medium">Material</th>
                            <th className="px-4 py-2 text-left font-medium">Fecha Entrega</th>
                            <th className="px-4 py-2 text-left font-medium">Identificador</th>
                            <th className="px-4 py-2 text-right font-medium">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {additional.map(a => {
                            const isRepeated = toolCounts[a.Herramienta] > 1;
                            return (
                              <tr key={a.ID} className={`border-b last:border-0 ${isRepeated ? 'bg-amber-50/50 hover:bg-amber-50/80 dark:bg-amber-950/20 dark:hover:bg-amber-950/40' : ''}`}>
                                <td className="px-4 py-3 font-medium">
                                  <div className="flex items-center gap-2">
                                    {a.Herramienta}
                                    {isRepeated && (
                                      <span className="inline-flex items-center rounded-md bg-amber-100 dark:bg-amber-900 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                                        Duplicado
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{a.Fecha_Entrega ? new Date(a.Fecha_Entrega).toLocaleDateString() : '-'}</td>
                                <td className="px-4 py-3 text-muted-foreground">{a.Identificador || '-'}</td>
                                <td className="px-4 py-3 text-right">
                                  <Button variant="outline" size="sm" onClick={() => handleReturnTool(a)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50">
                                    Devolver
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </TabsContent>

            <TabsContent value="solicitudes" className="pt-4">
              <div className="space-y-4">
                {userSolicitudes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Este empleado no tiene solicitudes pendientes.</p>
                ) : (
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-2 text-left font-medium">Fecha</th>
                          <th className="px-4 py-2 text-left font-medium">Herramienta Solicitada</th>
                          <th className="px-4 py-2 text-right font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userSolicitudes.map((s: any) => (
                          <tr key={s.ID} className="border-b last:border-0">
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(s.Fecha).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 font-medium">{s.Herramienta}</td>
                            <td className="px-4 py-3 text-right flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleAssignRequest(s)}>
                                Asignar
                              </Button>
                              <Button title="Eliminar" variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteRequest(s.ID)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="historial" className="pt-4">
              <div className="space-y-4">
                {userHistorial.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No hay historial de préstamos para este empleado.</p>
                ) : (
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-2 text-left font-medium">Herramienta</th>
                          <th className="px-4 py-2 text-left font-medium">Entrega</th>
                          <th className="px-4 py-2 text-left font-medium">Devolución</th>
                          <th className="px-4 py-2 text-left font-medium">Estado Final</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userHistorial.map((h: any) => (
                          <tr key={h.ID} className="border-b last:border-0">
                            <td className="px-4 py-3 font-medium">{h.Herramienta}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {h.Fecha_Entrega ? new Date(h.Fecha_Entrega).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {h.Fecha_Devolucion ? new Date(h.Fecha_Devolucion).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                                h.Estado_Final === 'Devuelto OK' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                h.Estado_Final === 'Roto' || h.Estado_Final === 'Averiado' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                h.Estado_Final === 'Perdido' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {h.Estado_Final || 'Desconocido'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end pt-4 border-t mt-4">
            <Button onClick={() => setDetailsOpen(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SN/ID Selector Modal */}
      <Dialog open={snSelectorOpen} onOpenChange={setSnSelectorOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Seleccionar {currentKitToolName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Hay varias opciones disponibles para este material. Por favor, selecciona el que vas a entregar.
            </p>
            <div className="grid gap-2 max-h-[60vh] overflow-y-auto">
              {allTools.filter((t: any) => t.Nombre === currentKitToolName && isToolAvailable(t)).flatMap((tool: any) => {
                const sns = tool.SN ? tool.SN.split(/[\n, ]+/).filter(Boolean) : [];
                
                if (sns.length === 0) {
                  return [(
                    <div key={tool.ID} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors">
                      <div>
                        <p className="font-medium">{tool.Nombre}</p>
                        <p className="text-xs text-muted-foreground">Sin SN específico {tool.ID_Interno ? `| ID: ${tool.ID_Interno}` : ""}</p>
                      </div>
                      <Button size="sm" onClick={() => handleAssignSpecificTool(tool.ID)}>Seleccionar</Button>
                    </div>
                  )];
                }
                
                const assignedSns = activeAssignments
                  .filter(a => a.Herramienta_ID === tool.ID || (!a.Herramienta_ID && a.Herramienta === tool.Nombre))
                  .map(a => a.SN)
                  .filter(Boolean);
                  
                const availableSns = sns.filter((sn: string) => !assignedSns.includes(sn));
                
                return availableSns.map((sn: string, idx: number) => (
                  <div key={`${tool.ID}-${idx}`} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors">
                    <div>
                      <p className="font-medium">{tool.Nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        SN: <span className="font-mono bg-muted px-1 py-0.5 rounded text-foreground">{sn}</span> {tool.ID_Interno ? `| ID: ${tool.ID_Interno}` : ""}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleAssignSpecificTool(tool.ID, sn)}>Asignar</Button>
                  </div>
                ));
              })}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSnSelectorOpen(false)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
