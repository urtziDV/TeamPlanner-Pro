"use client";

import { useState } from "react";
import { Truck, MapPin, Plus, Trash2, Key, KeyRound, LayoutGrid, List, Search, Edit, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConfirm, ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createUbicacion, deleteUbicacion, updateUbicacion, updateVehicleAssignment, deleteVehicleHistory, updateVehicleHistory } from "@/app/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function VehiclesClient({ ubicaciones, history, users }: { ubicaciones: any[], history: any[], users: any[] }) {
  const getWeekInfo = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `Semana ${weekNo} - ${d.getUTCFullYear()}`;
  };

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [editHistoryOpen, setEditHistoryOpen] = useState(false);
  const [editingHistory, setEditingHistory] = useState<any>(null);
  
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  
  const defaultFormData = { Nombre: "", Tipo: "Vehiculo", Vehiculo_Marca: "", Vehiculo_Modelo: "", Vehiculo_Matricula: "", Imagen_URL: "" };
  const [formData, setFormData] = useState(defaultFormData);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Nombre) return;
    await createUbicacion(formData);
    setFormData(defaultFormData);
    setOpen(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    await updateUbicacion(selectedVehicle.ID, formData);
    setEditOpen(false);
  };

  const openEdit = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setFormData({
      Nombre: vehicle.Nombre || "",
      Tipo: vehicle.Tipo || "Vehiculo",
      Vehiculo_Marca: vehicle.Vehiculo_Marca || "",
      Vehiculo_Modelo: vehicle.Vehiculo_Modelo || "",
      Vehiculo_Matricula: vehicle.Vehiculo_Matricula || "",
      Imagen_URL: vehicle.Imagen_URL || ""
    });
    setEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar Registro",
      message: "¿Estás seguro de que quieres eliminar este registro?",
      variant: "destructive",
      confirmLabel: "Eliminar"
    });
    if (ok) {
      await deleteUbicacion(id);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar Reserva/Historial",
      message: "¿Estás seguro de que quieres eliminar este registro?",
      variant: "destructive",
      confirmLabel: "Eliminar"
    });
    if (ok) {
      await deleteVehicleHistory(id);
    }
  };

  const handleEditHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHistory) return;
    await updateVehicleHistory(editingHistory.ID, {
      usuario: editingHistory.Usuario_Nombre,
      fechaInicio: editingHistory.Fecha_Entrega,
      fechaFin: editingHistory.Fecha_Esperada_Devolucion || undefined
    });
    setEditHistoryOpen(false);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    const today = new Date().toISOString().split('T')[0];
    const start = fechaInicio || today;
    const end = fechaFin || '2099-12-31';

    const vehicleHistory = history.filter(h => h.Vehiculo_ID === selectedVehicle.ID && (h.Estado === 'Activa' || h.Estado === 'Reserva'));
    const overlaps = vehicleHistory.filter(h => {
      const hStart = h.Fecha_Entrega;
      const hEnd = h.Fecha_Esperada_Devolucion || '2099-12-31';
      return hStart <= end && hEnd >= start;
    });

    if (overlaps.length > 0) {
      const overlapUsers = overlaps.map(o => o.Usuario_Nombre).join(', ');
      const ok = await confirm({
        title: "Conflicto de Fechas",
        message: `¡Atención! Este vehículo ya está asignado o reservado en estas fechas para: ${overlapUsers}. ¿Deseas continuar y registrar esta reserva solapada?`,
        variant: "destructive",
        confirmLabel: "Sí, registrar de todos modos"
      });
      if (!ok) return;
    }

    await updateVehicleAssignment(selectedVehicle.ID, { 
      usuario: selectedUser, 
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      observaciones: descripcion || undefined
    });
    setAssignOpen(false);
    setSelectedVehicle(null);
    setSelectedUser("");
    setFechaInicio("");
    setFechaFin("");
    setDescripcion("");
  };

  const handleReturn = async (id: string) => {
    const ok = await confirm({
      title: "Devolver Vehículo",
      message: "¿Marcar vehículo como devuelto?",
      variant: "default",
      confirmLabel: "Marcar devuelto"
    });
    if (ok) {
      await updateVehicleAssignment(id, { usuario: "" });
    }
  };

  const filteredUbicaciones = ubicaciones.filter(u => 
    u.Nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.Vehiculo_Matricula && u.Vehiculo_Matricula.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const vehiculos = filteredUbicaciones.filter(u => u.Tipo === 'Vehiculo');

  const calendarDays = Array.from({length: 21}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + calendarOffset + i);
    return d;
  });

  const weeks: { title: string, count: number }[] = [];
  calendarDays.forEach(d => {
    const title = getWeekInfo(d);
    if (weeks.length === 0 || weeks[weeks.length - 1].title !== title) {
      weeks.push({ title, count: 1 });
    } else {
      weeks[weeks.length - 1].count++;
    }
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Vehículos</h2>
        
        <div className="flex items-center gap-2">
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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Vehículo
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Vehículo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nombre / Identificador</Label>
                  <Input 
                    value={formData.Nombre} 
                    onChange={(e) => setFormData({...formData, Nombre: e.target.value})} 
                    placeholder="Ej. Furgoneta 1"
                    required
                  />
                </div>
                
                {true && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Marca</Label>
                      <Input value={formData.Vehiculo_Marca} onChange={(e) => setFormData({...formData, Vehiculo_Marca: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Modelo</Label>
                      <Input value={formData.Vehiculo_Modelo} onChange={(e) => setFormData({...formData, Vehiculo_Modelo: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Matrícula</Label>
                      <Input value={formData.Vehiculo_Matricula} onChange={(e) => setFormData({...formData, Vehiculo_Matricula: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>URL de Imagen (Opcional)</Label>
                      <Input value={formData.Imagen_URL} onChange={(e) => setFormData({...formData, Imagen_URL: e.target.value})} placeholder="https://..." />
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit">Guardar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Modal Editar Registro */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Vehículo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEdit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nombre / Identificador</Label>
                  <Input 
                    value={formData.Nombre} 
                    onChange={(e) => setFormData({...formData, Nombre: e.target.value})} 
                    required
                  />
                </div>
                
                {formData.Tipo === "Vehiculo" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Marca</Label>
                      <Input value={formData.Vehiculo_Marca} onChange={(e) => setFormData({...formData, Vehiculo_Marca: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Modelo</Label>
                      <Input value={formData.Vehiculo_Modelo} onChange={(e) => setFormData({...formData, Vehiculo_Modelo: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Matrícula</Label>
                      <Input value={formData.Vehiculo_Matricula} onChange={(e) => setFormData({...formData, Vehiculo_Matricula: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>URL de Imagen (Opcional)</Label>
                      <Input value={formData.Imagen_URL} onChange={(e) => setFormData({...formData, Imagen_URL: e.target.value})} placeholder="https://..." />
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" type="button" onClick={() => setEditOpen(false)}>Cancelar</Button>
                  <Button type="submit">Guardar Cambios</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Modal Asignar Vehículo */}
          <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Asignar {selectedVehicle?.Nombre}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAssign} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Seleccionar Conductor</Label>
                  <select 
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Seleccionar empleado...</option>
                    {users.map(u => <option key={u.ID} value={u.Nombre}>{u.Nombre}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Desde (Inicio)</Label>
                    <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Dejar vacío para empezar hoy</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Hasta (Fin)</Label>
                    <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Opcional</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descripción / Observaciones</Label>
                  <Input 
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Motivo del viaje, destino..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" type="button" onClick={() => setAssignOpen(false)}>Cancelar</Button>
                  <Button type="submit">Confirmar Asignación</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="vehiculos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehiculos">Vehículos ({vehiculos.length})</TabsTrigger>
          <TabsTrigger value="calendario">Calendario de Reservas</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vehiculos" className="space-y-4">
          <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-2"}>
            {vehiculos.length === 0 ? (
              <div className="col-span-full p-8 text-center border rounded-xl bg-card text-muted-foreground">
                No hay vehículos registrados.
              </div>
            ) : vehiculos.map((v) => (
              viewMode === "grid" ? (
                <div key={v.ID} className="rounded-xl border bg-card text-card-foreground shadow flex flex-col justify-between group overflow-hidden relative glass-card">
                  {v.Imagen_URL && (
                    <div className="w-full h-48 bg-white border-b p-2">
                      <img src={v.Imagen_URL} alt={v.Nombre} className="w-full h-full object-contain" />
                    </div>
                  )}
                  
                  <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 ${v.Imagen_URL ? 'bg-background/90 backdrop-blur-sm p-1.5 rounded-lg border shadow-sm' : ''}`}>
                    <Button title="Editar" variant="ghost" size="icon" onClick={() => openEdit(v)} className="p-1.5 text-muted-foreground hover:text-blue-500 transition-colors rounded-md hover:bg-blue-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button title="Eliminar" variant="ghost" size="icon" onClick={() => handleDelete(v.ID)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="p-6 pb-4">
                    {!v.Imagen_URL && (
                      <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mb-4">
                        <Truck className="h-6 w-6 text-blue-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold leading-none tracking-tight text-lg mb-1">{v.Nombre}</h3>
                      <p className="text-sm text-muted-foreground flex gap-2">
                        {v.Vehiculo_Marca && <span>{v.Vehiculo_Marca}</span>}
                        {v.Vehiculo_Modelo && <span>{v.Vehiculo_Modelo}</span>}
                      </p>
                      {v.Vehiculo_Matricula && <p className="text-xs font-mono mt-2 bg-muted inline-block px-2 py-1 rounded border">{v.Vehiculo_Matricula}</p>}
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t bg-muted/20">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Estado:</span>
                      {v.Vehiculo_Asignado_A ? (
                        <div className="flex items-center gap-2 text-orange-600 font-medium">
                          <KeyRound className="h-3 w-3" />
                          {v.Vehiculo_Asignado_A}
                        </div>
                      ) : (
                        <span className="text-green-600 font-medium">Libre</span>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      {v.Vehiculo_Asignado_A && (
                        <Button variant="outline" size="sm" className="flex-1 w-full whitespace-nowrap text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleReturn(v.ID)}>
                          Devolver
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="flex-1 w-full whitespace-nowrap" onClick={() => { setSelectedVehicle(v); setAssignOpen(true); }}>
                        <Key className="h-4 w-4 mr-1 hidden sm:inline-block shrink-0" /> {v.Vehiculo_Asignado_A ? 'Reservar' : 'Asignar'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={v.ID} className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md flex items-center justify-between p-4 group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {v.Imagen_URL ? (
                        <img src={v.Imagen_URL} alt={v.Nombre} className="h-full w-full object-cover" />
                      ) : (
                        <Truck className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{v.Nombre}</h3>
                        {v.Vehiculo_Matricula && <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded border">{v.Vehiculo_Matricula}</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {v.Vehiculo_Marca && <span>{v.Vehiculo_Marca}</span>}
                        {v.Vehiculo_Modelo && <span> {v.Vehiculo_Modelo}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground">Estado</span>
                      {v.Vehiculo_Asignado_A ? (
                        <span className="text-sm text-orange-600 font-medium">{v.Vehiculo_Asignado_A}</span>
                      ) : (
                        <span className="text-sm text-green-600 font-medium">Libre</span>
                      )}
                    </div>
                    {v.Vehiculo_Asignado_A && (
                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleReturn(v.ID)}>
                          Devolver
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => { setSelectedVehicle(v); setAssignOpen(true); }}>
                        <Key className="h-4 w-4 mr-2" /> {v.Vehiculo_Asignado_A ? 'Reservar' : 'Asignar'}
                      </Button>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button title="Editar" variant="ghost" size="icon" onClick={() => openEdit(v)} className="p-2 text-muted-foreground hover:text-blue-500 transition-colors rounded-md hover:bg-blue-50">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button title="Eliminar" variant="ghost" size="icon" onClick={() => handleDelete(v.ID)} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </TabsContent>

        <TabsContent value="historial">
          <div className="rounded-md border bg-card">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/50">
                <tr>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Vehículo</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Conductor</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Inicio</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Fin</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Estado</th>
                  <th className="h-10 px-4 text-right font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.ID} className="border-b transition-colors hover:bg-muted/50 group">
                    <td className="p-4 align-middle font-medium flex items-center gap-2"><Truck className="h-4 w-4 text-muted-foreground" /> {h.Vehiculo_Nombre}</td>
                    <td className="p-4 align-middle">{h.Usuario_Nombre}</td>
                    <td className="p-4 align-middle">{h.Fecha_Entrega}</td>
                    <td className="p-4 align-middle">{h.Fecha_Esperada_Devolucion || h.Fecha_Devolucion || '-'}</td>
                    <td className="p-4 align-middle">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${h.Estado === 'Reserva' ? 'bg-blue-100 text-blue-700' : h.Estado === 'Activa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {h.Estado}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button title="Editar" variant="ghost" size="icon" onClick={() => { setEditingHistory(h); setEditHistoryOpen(true); }} className="p-2 text-muted-foreground hover:text-blue-500 transition-colors rounded-md hover:bg-blue-50">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button title="Eliminar" variant="ghost" size="icon" onClick={() => handleDeleteHistory(h.ID)} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="calendario" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => setCalendarOffset(prev => prev - 7)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Anterior Semana
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCalendarOffset(0)}>
              <CalendarIcon className="h-4 w-4 mr-1" /> Hoy
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCalendarOffset(prev => prev + 7)}>
              Siguiente Semana <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="rounded-md border bg-card overflow-x-auto">
            <table className="w-full caption-bottom text-sm border-collapse">
              <thead className="bg-muted/50">
                <tr>
                  <th rowSpan={2} className="h-10 px-4 text-left font-medium text-muted-foreground border-r border-b w-[200px] sticky left-0 bg-muted/50 z-10">Vehículo</th>
                  {weeks.map((w, i) => (
                    <th key={i} colSpan={w.count} className="h-8 px-2 text-center font-semibold text-foreground border-r border-b text-xs bg-muted/30">
                      {w.title}
                    </th>
                  ))}
                </tr>
                <tr>
                  {calendarDays.map((d, i) => {
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    return (
                      <th key={i} className={`h-10 px-1 text-center font-medium text-muted-foreground border-r border-b min-w-[50px] text-[10px] ${isWeekend ? 'bg-muted/80' : ''}`}>
                        {d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {vehiculos.map(v => {
                  const vehicleHistory = history.filter(h => h.Vehiculo_ID === v.ID && (h.Estado === 'Activa' || h.Estado === 'Reserva'));
                  return (
                    <tr key={v.ID} className="border-b">
                      <td className="p-2 border-r font-medium text-xs sticky left-0 bg-card z-10 truncate max-w-[200px]" title={v.Nombre}>{v.Nombre}</td>
                      {calendarDays.map((d, i) => {
                        const dateStr = d.toISOString().split('T')[0];
                        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                        
                        const overlaps = vehicleHistory.filter(h => {
                          const start = h.Fecha_Entrega;
                          const end = h.Fecha_Esperada_Devolucion || '2099-12-31'; // si no hay fin, se asume ocupado indefinidamente
                          return start <= dateStr && end >= dateStr;
                        });

                        let bgColor = isWeekend ? "bg-muted/30" : "bg-transparent";
                        let title = "";
                        if (overlaps.length === 1) {
                          bgColor = overlaps[0].Estado === 'Reserva' ? "bg-blue-200 dark:bg-blue-900/50" : "bg-green-200 dark:bg-green-900/50";
                          title = `${overlaps[0].Usuario_Nombre} (${overlaps[0].Estado})`;
                        } else if (overlaps.length > 1) {
                          bgColor = "bg-red-400 dark:bg-red-900";
                          title = `CONFLICTO: ${overlaps.map(o => o.Usuario_Nombre).join(', ')}`;
                        }

                        return (
                          <td key={i} className={`p-0 border-r border-b-0 h-10 ${bgColor}`} title={title}>
                            {overlaps.length > 1 && <div className="w-full h-full flex items-center justify-center text-white font-bold">!</div>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-200 dark:bg-green-900/50 rounded-sm"></div> Activa</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-200 dark:bg-blue-900/50 rounded-sm"></div> Reserva Futura</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 dark:bg-red-900 rounded-sm flex items-center justify-center text-[8px] text-white font-bold">!</div> Conflicto</div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={editHistoryOpen} onOpenChange={setEditHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Reserva / Asignación</DialogTitle>
          </DialogHeader>
          {editingHistory && (
            <form onSubmit={handleEditHistorySubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Conductor</Label>
                <select 
                  value={editingHistory.Usuario_Nombre}
                  onChange={(e) => setEditingHistory({...editingHistory, Usuario_Nombre: e.target.value})}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Selecciona conductor...</option>
                  {users.map(u => (
                    <option key={u.ID} value={u.Nombre}>{u.Nombre}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Inicio</Label>
                  <Input 
                    type="date" 
                    value={editingHistory.Fecha_Entrega} 
                    onChange={(e) => setEditingHistory({...editingHistory, Fecha_Entrega: e.target.value})} 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Fin (Opcional)</Label>
                  <Input 
                    type="date" 
                    value={editingHistory.Fecha_Esperada_Devolucion || ""} 
                    onChange={(e) => setEditingHistory({...editingHistory, Fecha_Esperada_Devolucion: e.target.value})} 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setEditHistoryOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar Cambios</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog confirmState={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}
