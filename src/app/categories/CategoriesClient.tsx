"use client";

import { useState } from "react";
import { Wrench, Plus, Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConfirm, ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function CategoriesClient({ initialCategorias }: { initialCategorias: any[] }) {
  const [categorias, setCategorias] = useState(initialCategorias);
  const [open, setOpen] = useState(false);
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const [nombre, setNombre] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return;
    const newCat = await createCategoria({ Nombre: nombre });
    setCategorias((prev) => [...prev, newCat]);
    setNombre("");
    setOpen(false);
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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Categorías</h2>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Categoría</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la categoría</Label>
                <Input 
                  id="nombre" 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)} 
                  placeholder="Ej. Taladros"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <ConfirmDialog confirmState={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
      
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categorias.length === 0 ? (
          <div className="col-span-full p-8 text-center border rounded-xl bg-card text-muted-foreground">
            No hay categorías registradas.
          </div>
        ) : (
          categorias.map((c) => (
            <div key={c.ID} className="rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-md flex items-center justify-between p-4 group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold">{c.Nombre}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted">
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
          ))
        )}
      </div>
    </div>
  );
}
