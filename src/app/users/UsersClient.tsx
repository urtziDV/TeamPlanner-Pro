"use client";

import { useState } from "react";
import { UsersRound, Plus, Trash2, Edit, LayoutGrid, List, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConfirm, ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createUsuario, deleteUsuario, updateUsuario } from "@/app/actions";

export function UsersClient({ initialUsers, departments }: { initialUsers: any[], departments: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const [formData, setFormData] = useState({ Nombre: "", Departamento: "", Email: "", Telefono: "", ID_Empleado: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Nombre) return;
    const newUser = await createUsuario(formData);
    setUsers((prev) => [newUser, ...prev]);
    setFormData({ Nombre: "", Departamento: "", Email: "", Telefono: "", ID_Empleado: "" });
    setOpen(false);
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
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Empleados</h2>
        
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
    </div>
      
      <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-2"}>
        {users.filter(u => 
          (u.Nombre?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
          (u.Departamento?.toLowerCase() || "").includes(searchQuery.toLowerCase())
        ).length === 0 ? (
          <div className="col-span-full p-8 text-center border rounded-xl bg-card text-muted-foreground">
            No hay empleados encontrados.
          </div>
        ) : (
          users.filter(u => 
            (u.Nombre?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
            (u.Departamento?.toLowerCase() || "").includes(searchQuery.toLowerCase())
          ).map((u) => (
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
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    onClick={() => openEdit(u)}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted opacity-0 group-hover:opacity-100"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(u.ID)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          ))
        )}
      </div>
    </div>
  );
}
