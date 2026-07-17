"use client";

import { useState } from "react";
import { Truck, MapPin, Plus, Trash2, Key, KeyRound, LayoutGrid, List, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConfirm, ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createUbicacion, deleteUbicacion, updateVehicleAssignment } from "@/app/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function VehiclesClient({ ubicaciones, history, users }: { ubicaciones: any[], history: any[], users: any[] }) {
  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  
  const [formData, setFormData] = useState({ Nombre: "", Tipo: "Vehiculo", Vehiculo_Marca: "", Vehiculo_Modelo: "", Vehiculo_Matricula: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Nombre) return;
    await createUbicacion(formData);
    setFormData({ Nombre: "", Tipo: "Vehiculo", Vehiculo_Marca: "", Vehiculo_Modelo: "", Vehiculo_Matricula: "" });
    setOpen(false);
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

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    await updateVehicleAssignment(selectedVehicle.ID, selectedUser);
    setAssignOpen(false);
    setSelectedVehicle(null);
    setSelectedUser("");
  };

  const handleReturn = async (id: string) => {
    const ok = await confirm({
      title: "Devolver Vehículo",
      message: "¿Marcar vehículo como devuelto?",
      variant: "default",
      confirmLabel: "Marcar devuelto"
    });
    if (ok) {
      await updateVehicleAssignment(id, "");
    }
  };

  const filteredUbicaciones = ubicaciones.filter(u => 
    u.Nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.Vehiculo_Matricula && u.Vehiculo_Matricula.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const vehiculos = filteredUbicaciones.filter(u => u.Tipo === 'Vehiculo');
  const otrasUbicaciones = filteredUbicaciones.filter(u => u.Tipo !== 'Vehiculo');

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Vehículos y Ubicaciones</h2>
        
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
              Añadir Registro
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Vehículo o Ubicación</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <select 
                    value={formData.Tipo}
                    onChange={(e) => setFormData({...formData, Tipo: e.target.value})}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Vehiculo">Vehículo</option>
                    <option value="Sitio">Sitio/Almacén</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Nombre / Identificador</Label>
                  <Input 
                    value={formData.Nombre} 
                    onChange={(e) => setFormData({...formData, Nombre: e.target.value})} 
                    placeholder={formData.Tipo === "Vehiculo" ? "Ej. Furgoneta 1" : "Ej. Almacén Central"}
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
                  </div>
                )}
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit">Guardar</Button>
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
          <TabsTrigger value="ubicaciones">Ubicaciones ({otrasUbicaciones.length})</TabsTrigger>
          <TabsTrigger value="historial">Historial Asignaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vehiculos" className="space-y-4">
          <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-2"}>
            {vehiculos.length === 0 ? (
              <div className="col-span-full p-8 text-center border rounded-xl bg-card text-muted-foreground">
                No hay vehículos registrados.
              </div>
            ) : vehiculos.map((v) => (
              viewMode === "grid" ? (
                <div key={v.ID} className="rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-md flex flex-col justify-between group">
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Truck className="h-6 w-6 text-blue-500" />
                      </div>
                      <button onClick={() => handleDelete(v.ID)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
                      {v.Vehiculo_Asignado_A ? (
                        <Button variant="outline" size="sm" className="w-full text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleReturn(v.ID)}>
                          Marcar Devuelto
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full" onClick={() => { setSelectedVehicle(v); setAssignOpen(true); }}>
                          <Key className="h-4 w-4 mr-2" /> Asignar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div key={v.ID} className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md flex items-center justify-between p-4 group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Truck className="h-5 w-5 text-blue-500" />
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
                    {v.Vehiculo_Asignado_A ? (
                      <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleReturn(v.ID)}>
                        Devolver
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => { setSelectedVehicle(v); setAssignOpen(true); }}>
                        Asignar
                      </Button>
                    )}
                    <button onClick={() => handleDelete(v.ID)} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 opacity-0 group-hover:opacity-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="ubicaciones" className="space-y-4">
          <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-2"}>
            {otrasUbicaciones.length === 0 ? (
              <div className="col-span-full p-8 text-center border rounded-xl bg-card text-muted-foreground">
                No hay ubicaciones registradas.
              </div>
            ) : otrasUbicaciones.map((u) => (
              viewMode === "grid" ? (
                <div key={u.ID} className="rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-md flex flex-col justify-between group">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-6 w-6 text-purple-500" />
                      </div>
                      <button onClick={() => handleDelete(u.ID)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <h3 className="font-semibold leading-none tracking-tight text-lg mb-1">{u.Nombre}</h3>
                    <p className="text-sm text-muted-foreground">{u.Tipo}</p>
                  </div>
                </div>
              ) : (
                <div key={u.ID} className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md flex items-center justify-between p-4 group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{u.Nombre}</h3>
                      <p className="text-sm text-muted-foreground">{u.Tipo}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(u.ID)} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
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
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Fecha Entrega</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Fecha Devolución</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.ID} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium flex items-center gap-2"><Truck className="h-4 w-4 text-muted-foreground" /> {h.Vehiculo_Nombre}</td>
                    <td className="p-4 align-middle">{h.Usuario_Nombre}</td>
                    <td className="p-4 align-middle">{h.Fecha_Entrega}</td>
                    <td className="p-4 align-middle">{h.Fecha_Devolucion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
