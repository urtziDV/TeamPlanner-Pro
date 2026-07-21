"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, Wrench, Hammer, Zap, Shield, Star, Box, Package, Folder, Tag, Settings, PenTool, Truck, Briefcase, Activity, Compass } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConfirm, ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createCategoria, deleteCategoria, updateCategoria, createUbicacion, deleteUbicacion, updateUbicacion } from "@/app/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Wrench, Hammer, Zap, Shield, Star, Box, Package, Folder, Tag, Settings, PenTool, Truck, Briefcase, Activity, Compass
};

export function CategoriesClient({ initialCategorias, initialUbicaciones }: { initialCategorias: any[], initialUbicaciones: any[] }) {
  const [categorias, setCategorias] = useState(initialCategorias);
  const [ubicaciones, setUbicaciones] = useState(initialUbicaciones);
  const [open, setOpen] = useState(false);
  const [openUbi, setOpenUbi] = useState(false);
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [icono, setIcono] = useState("Wrench");

  const resetForm = () => {
    setEditingId(null);
    setNombre("");
    setColor("#3b82f6");
    setIcono("Wrench");
  };

  const handleOpenNew = () => {
    resetForm();
    setOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingId(c.ID);
    setNombre(c.Nombre || "");
    setColor(c.Color || "#3b82f6");
    setIcono(c.Icono || "Wrench");
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return;

    if (editingId) {
      const updated = await updateCategoria(editingId, { Nombre: nombre, Color: color, Icono: icono });
      setCategorias(prev => prev.map(c => c.ID === editingId ? updated : c));
    } else {
      const newCat = await createCategoria({ Nombre: nombre, Color: color, Icono: icono });
      setCategorias(prev => [...prev, newCat]);
    }
    
    setOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar Categoría",
      message: "¿Estás seguro de que quieres eliminar esta categoría?",
      variant: "destructive",
      confirmLabel: "Eliminar"
    });
    if (ok) {
      await deleteCategoria(id);
      setCategorias((prev) => prev.filter((c) => c.ID !== id));
    }
  };
  // ---- Ubicaciones Logic ----
  const [ubiEditingId, setUbiEditingId] = useState<string | null>(null);
  const [ubiNombre, setUbiNombre] = useState("");

  const handleOpenNewUbi = () => { setUbiEditingId(null); setUbiNombre(""); setOpenUbi(true); };
  const handleOpenEditUbi = (u: any) => { setUbiEditingId(u.ID); setUbiNombre(u.Nombre); setOpenUbi(true); };

  const handleSaveUbi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ubiNombre) return;
    if (ubiEditingId) {
      await updateUbicacion(ubiEditingId, { Nombre: ubiNombre });
      setUbicaciones(prev => prev.map(u => u.ID === ubiEditingId ? { ...u, Nombre: ubiNombre } : u));
    } else {
      const newUbi = await createUbicacion({ Nombre: ubiNombre, Tipo: "Sitio" });
      setUbicaciones(prev => [...prev, newUbi]);
    }
    setOpenUbi(false);
  };

  const handleDeleteUbi = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar Ubicación",
      message: "¿Estás seguro de que quieres eliminar esta ubicación?",
      variant: "destructive",
      confirmLabel: "Eliminar"
    });
    if (ok) {
      await deleteUbicacion(id);
      setUbicaciones(prev => prev.filter(u => u.ID !== id));
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categorías y Ubicaciones</h2>
        
        <div className="flex gap-2">
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) resetForm();
        }}>
          <DialogTrigger render={<Button onClick={handleOpenNew} />}>
            <Plus className="h-4 w-4 mr-2" />
            Categoría
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Categoría" : "Añadir Categoría"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la categoría</Label>
                <Input 
                  id="nombre" 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)} 
                  placeholder="Ej. Taladros"
                  autoFocus
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color Representativo</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    id="color" 
                    type="color"
                    value={color} 
                    onChange={(e) => setColor(e.target.value)} 
                    className="h-10 w-20 p-1 cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">{color}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Icono</Label>
                <div className="grid grid-cols-5 gap-2 border p-3 rounded-md max-h-48 overflow-y-auto">
                  {Object.keys(ICON_MAP).map(key => {
                    const IconComp = ICON_MAP[key];
                    const isSelected = icono === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setIcono(key)}
                        className={`p-2 flex items-center justify-center rounded-md transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                        title={key}
                      >
                        <IconComp className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={openUbi} onOpenChange={setOpenUbi}>
          <DialogTrigger render={<Button variant="outline" onClick={handleOpenNewUbi} />}>
            <Plus className="h-4 w-4 mr-2" />
            Ubicación
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{ubiEditingId ? "Editar Ubicación" : "Añadir Ubicación"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveUbi} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nombre de la ubicación</Label>
                <Input value={ubiNombre} onChange={(e) => setUbiNombre(e.target.value)} placeholder="Ej. Almacén Central" autoFocus required />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" type="button" onClick={() => setOpenUbi(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>
      <ConfirmDialog confirmState={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
      
      <Tabs defaultValue="categorias" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categorias">Categorías ({categorias.length})</TabsTrigger>
          <TabsTrigger value="ubicaciones">Ubicaciones / Sitios ({ubicaciones.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categorias" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categorias.length === 0 ? (
          <div className="col-span-full p-8 text-center border rounded-xl bg-card text-muted-foreground">
            No hay categorías registradas.
          </div>
        ) : (
          categorias.map((c) => {
            const IconComp = ICON_MAP[c.Icono] || Wrench;
            return (
              <div key={c.ID} className="rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-md flex items-center justify-between p-4 group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.Color || '#3b82f6'}20` }}>
                    <IconComp className="h-5 w-5" style={{ color: c.Color || '#3b82f6' }} />
                  </div>
                  <span className="font-semibold">{c.Nombre}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenEdit(c)}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(c.ID)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
          </div>
        </TabsContent>
        
        <TabsContent value="ubicaciones" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {ubicaciones.length === 0 ? (
              <div className="col-span-full p-8 text-center border rounded-xl bg-card text-muted-foreground">
                No hay ubicaciones registradas.
              </div>
            ) : (
              ubicaciones.map((u) => (
                <div key={u.ID} className="rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-md flex items-center justify-between p-4 group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-500/10 text-green-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="font-semibold">{u.Nombre}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenEditUbi(u)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUbi(u.ID)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
