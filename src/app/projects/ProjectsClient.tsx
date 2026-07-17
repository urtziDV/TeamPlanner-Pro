"use client";

import { useState } from "react";
import { CheckSquare, Plus, Trash2, LayoutGrid, List, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConfirm, ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ProjectsClient({ initialProyectos }: { initialProyectos: any[] }) {
  const [proyectos, setProyectos] = useState(initialProyectos);
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const [formData, setFormData] = useState({ Nombre: "", Ubicacion: "", Estado: "Preparación" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Nombre) return;
    const newProj = await createProyecto(formData);
    setProyectos((prev) => [newProj, ...prev]);
    setFormData({ Nombre: "", Ubicacion: "", Estado: "Preparación" });
    setOpen(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const ok = await confirm({
      title: "Eliminar Proyecto",
      message: "¿Estás seguro de que quieres eliminar este proyecto?",
      variant: "destructive",
      confirmLabel: "Eliminar"
    });
    if (ok) {
      await deleteProyecto(id);
      setProyectos((prev) => prev.filter((p) => p.ID !== id));
    }
  };

  const filtered = proyectos.filter(p =>
    (p.Nombre?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (p.Ubicacion?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Proyectos en Curso</h2>

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
              Nuevo Proyecto
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Proyecto</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Proyecto</Label>
                  <Input
                    id="nombre"
                    value={formData.Nombre}
                    onChange={(e) => setFormData({...formData, Nombre: e.target.value})}
                    placeholder="Ej. Línea de Montaje B"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input
                    id="ubicacion"
                    value={formData.Ubicacion}
                    onChange={(e) => setFormData({...formData, Ubicacion: e.target.value})}
                    placeholder="Ej. Planta 2"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit">Guardar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-2"}>
        {filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center border rounded-xl bg-card text-muted-foreground">
            No hay proyectos encontrados.
          </div>
        ) : filtered.map((p) => viewMode === "grid" ? (
          <Link href={`/projects/${p.ID}`} key={p.ID}>
            <div className="rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between h-full">
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">{p.Nombre}</h3>
                    <p className="text-sm text-muted-foreground">{p.Ubicacion}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckSquare className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-muted-foreground">Fase: <span className="font-medium text-foreground">{p.Estado || "Preparación"}</span></span>
                </div>
                <button
                  onClick={(e) => handleDelete(p.ID, e)}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Link>
        ) : (
          <Link href={`/projects/${p.ID}`} key={p.ID}>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md cursor-pointer group flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{p.Nombre}</h3>
                  <p className="text-sm text-muted-foreground">{p.Ubicacion}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-sm text-muted-foreground">Fase: <span className="font-medium text-foreground">{p.Estado || "Preparación"}</span></span>
                </div>
                <button
                  onClick={(e) => handleDelete(p.ID, e)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <ConfirmDialog confirmState={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}
