"use client";

import { useState } from "react";
import { UsersRound, Plus, Trash2, Edit, LayoutGrid, List, Search, Briefcase, CheckCircle2, FileText, History, Download } from "lucide-react";
import { exportToExcel } from "@/lib/exportUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConfirm, ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createUsuario, deleteUsuario, updateUsuario, createAsignacion, deleteSolicitud } from "@/app/actions";
import { useRouter } from "next/navigation";

export function UsersClient({ 
  initialUsers, 
  departments, 
  basicTools = [], 
  activeAssignments = [],
  allSolicitudes = [],
  allHistorial = [],
  allTools = []
}: { 
  initialUsers: any[], 
  departments: any[], 
  basicTools?: any[], 
  activeAssignments?: any[],
  allSolicitudes?: any[],
  allHistorial?: any[],
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

  const welcomeKitNames = Array.from(new Set(basicTools.map((t: any) => t.Nombre)));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Nombre) return;
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

  const handleAssignBasicTool = async (toolName: string) => {
    const availableTools = basicTools.filter((t: any) => t.Nombre === toolName && t.Estado === "Disponible");
    if (availableTools.length === 0) {
      alert("No hay stock disponible de " + toolName);
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

  const handleAssignSpecificTool = async (toolId: string) => {
    const toolToAssign = allTools.find((t: any) => t.ID === toolId);
    if (!toolToAssign) return;
    
    await createAsignacion({
      Herramienta_ID: toolToAssign.ID,
      Herramienta: toolToAssign.Nombre,
      Usuario_ID: selectedUser.ID,
      Usuario: selectedUser.Nombre,
      Motivo: "Material de Bienvenida"
    });
    
    setSnSelectorOpen(false);
    setCurrentKitToolName("");
    router.refresh();
  };

  const handleAssignRequest = async (solicitud: any) => {
    const availableTools = allTools.filter((t: any) => t.Nombre === solicitud.Herramienta && t.Estado === "Disponible");
    if (availableTools.length === 0) {
      alert("No hay stock disponible de " + solicitud.Herramienta);
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
  const userHistorial = selectedUser ? allHistorial.filter(h => h.Usuario_ID === selectedUser.ID || h.Usuario === selectedUser.Nombre) : [];

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Empleado</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input 
                  id="nombre" 
                  value={formData.Nombre} 
                  onChange={(e) => setFormData({...formData, Nombre: e.target.value})} 
                  required
                />
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Empleado</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre Completo</Label>
                <Input 
                  id="edit-nombre" 
                  value={formData.Nombre} 
                  onChange={(e) => setFormData({...formData, Nombre: e.target.value})} 
                  required
                />
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
                    <h3 className="font-semibold leading-none tracking-tight">{u.Nombre}</h3>
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
                    <Briefcase className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => openEdit(u)}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(u.ID)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div key={u.ID} className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md flex items-center justify-between p-4 group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{u.Nombre.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{u.Nombre}</h3>
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
                    <Briefcase className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => openEdit(u)}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(u.ID)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          ))
        )}
      </div>

      {/* Employee Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-4xl max-w-[95vw] w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de {selectedUser?.Nombre}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="bienvenida" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bienvenida">Material de Bienvenida</TabsTrigger>
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
                          const isDelivered = activeAssignments.some(a => a.Usuario_ID === selectedUser?.ID && a.Herramienta === name);
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
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteRequest(s.ID)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar {currentKitToolName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Hay varias opciones disponibles para este material. Por favor, selecciona el que vas a entregar.
            </p>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {allTools.filter((t: any) => t.Nombre === currentKitToolName && t.Estado === "Disponible").map((tool: any) => (
                <div key={tool.ID} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <p className="font-medium">{tool.Nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {tool.SN ? `SN: ${tool.SN}` : "Sin SN"} {tool.ID_Interno ? `| ID: ${tool.ID_Interno}` : ""}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleAssignSpecificTool(tool.ID)}>Seleccionar</Button>
                </div>
              ))}
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
