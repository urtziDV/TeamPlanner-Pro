"use client";

import { useState } from "react";
import { ArrowLeft, CheckSquare, Plus, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { addHerramientaToProject, updateHerramientaProjectStatus } from "@/app/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function ProjectDetailClient({ project, initialChecklist, availableTools }: { project: any, initialChecklist: any[], availableTools: any[] }) {
  const router = useRouter();
  const [checklist, setChecklist] = useState(initialChecklist);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ Nombre_Generico: "", Cantidad_Requerida: 1 });

  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Nombre_Generico) return;
    const newItem = await addHerramientaToProject({
      Proyecto_ID: project.ID,
      Nombre_Generico: formData.Nombre_Generico,
      Cantidad_Requerida: Number(formData.Cantidad_Requerida)
    });
    setChecklist((prev) => [...prev, newItem]);
    setFormData({ Nombre_Generico: "", Cantidad_Requerida: 1 });
    setOpen(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic update
    setChecklist(prev => prev.map(item => item.ID === id ? { ...item, Estado: newStatus } : item));
    await updateHerramientaProjectStatus(id, project.ID, newStatus);
    router.refresh();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Checklist de Proyecto: ${project.Nombre}`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Ubicación: ${project.Ubicacion || "N/A"}`, 14, 32);
    
    const tableColumn = ["Requisito", "Cantidad", "Estado"];
    const tableRows = checklist.map(item => [
      item.Nombre_Generico,
      `${item.Cantidad_Llevada} / ${item.Cantidad_Requerida}`,
      item.Estado
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
    });

    doc.save(`${project.Nombre}_Checklist.pdf`);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
      <div className="flex items-center space-x-4 mb-4">
        <Link href="/projects">
          <Button variant="ghost" className="px-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{project.Nombre}</h2>
          <p className="text-muted-foreground">{project.Ubicacion} • Fase: {project.Estado || "Preparación"}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between space-y-2 mt-8">
        <h3 className="text-xl font-semibold">Checklist de Herramientas</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportPDF}>
              Imprimir PDF
            </Button>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Requisito
            </DialogTrigger>
          </div>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Herramienta al Checklist</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRequirement} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_generico">Nombre (Genérico o Específico)</Label>
                <Input 
                  id="nombre_generico" 
                  value={formData.Nombre_Generico} 
                  onChange={(e) => setFormData({...formData, Nombre_Generico: e.target.value})} 
                  placeholder="Ej. Taladro, Amoladora 115mm..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad Requerida</Label>
                <Input 
                  id="cantidad" 
                  type="number"
                  min="1"
                  value={formData.Cantidad_Requerida} 
                  onChange={(e) => setFormData({...formData, Cantidad_Requerida: parseInt(e.target.value)})} 
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Añadir</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Requisito</th>
                <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Cantidad</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Acciones (Marcar como)</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {checklist.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">No hay herramientas asignadas al checklist.</td>
                </tr>
              ) : (
                checklist.map((item) => (
                  <tr key={item.ID} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{item.Nombre_Generico}</td>
                    <td className="p-4 align-middle text-center">{item.Cantidad_Llevada} / {item.Cantidad_Requerida}</td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold
                        ${item.Estado === 'Completado' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          item.Estado === 'Roto' || item.Estado === 'Averiado' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                          item.Estado === 'Perdido' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                          'bg-muted text-muted-foreground'}`}>
                        {item.Estado}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleStatusChange(item.ID, "Completado")} className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50">
                          <CheckCircle2 className="h-4 w-4 mr-1" /> OK
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleStatusChange(item.ID, "Roto")} className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <AlertTriangle className="h-4 w-4 mr-1" /> Roto
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleStatusChange(item.ID, "Perdido")} className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                          <XCircle className="h-4 w-4 mr-1" /> Perdido
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
