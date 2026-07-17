"use client";

import { useState } from "react";
import { ArrowLeft, Plus, AlertTriangle, XCircle, CheckCircle2, Send, Pencil } from "lucide-react";
import { addHerramientaToProject, updateHerramientaProjectStatus, editHerramientaProject, updateProyectoEstado } from "@/app/actions";
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
  const [formData, setFormData] = useState({ Nombre_Generico: "", Cantidad_Requerida: 1, Es_Consumible: false });

  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ ID: "", Nombre_Generico: "", Cantidad_Requerida: 1, Es_Consumible: false });

  const isSent = project.Estado === "Enviado" || project.Estado === "Completado";

  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Nombre_Generico) return;
    const newItem = await addHerramientaToProject({
      Proyecto_ID: project.ID,
      Nombre_Generico: formData.Nombre_Generico,
      Cantidad_Requerida: Number(formData.Cantidad_Requerida),
      Es_Consumible: formData.Es_Consumible
    });
    setChecklist((prev: any[]) => [...prev, newItem]);
    setFormData({ Nombre_Generico: "", Cantidad_Requerida: 1, Es_Consumible: false });
    setOpen(false);
  };

  const handleEditRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData.Nombre_Generico) return;
    const updatedItem = await editHerramientaProject(editData.ID, project.ID, {
      Nombre_Generico: editData.Nombre_Generico,
      Cantidad_Requerida: Number(editData.Cantidad_Requerida),
      Es_Consumible: editData.Es_Consumible
    });
    setChecklist((prev: any[]) => prev.map(item => item.ID === updatedItem.ID ? updatedItem : item));
    setEditOpen(false);
  };

  const handleSendProject = async () => {
    await updateProyectoEstado(project.ID, "Enviado");
    router.refresh();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic update
    setChecklist(prev => prev.map(item => item.ID === id ? { ...item, Estado: newStatus } : item));
    await updateHerramientaProjectStatus(id, project.ID, newStatus);
    router.refresh();
  };

  const exportPDF = (type: 'empty' | 'digital') => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Checklist de Proyecto: ${project.Nombre}`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Ubicación: ${project.Ubicacion || "N/A"}`, 14, 32);
    
    let tableColumn: string[] = [];
    let tableRows: any[] = [];

    if (type === 'empty') {
      tableColumn = ["Requisito", "Cant. Req.", "Cant. Entregada", "Referencia / SN", "Notas"];
      tableRows = checklist.map(item => [
        item.Nombre_Generico,
        item.Cantidad_Requerida.toString(),
        "",
        "",
        ""
      ]);
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: { minCellHeight: 12 },
      });
    } else {
      tableColumn = ["Requisito", "Cantidad", "Estado"];
      tableRows = checklist.map(item => [
        item.Nombre_Generico,
        `${item.Cantidad_Llevada} / ${item.Cantidad_Requerida}`,
        item.Estado
      ]);
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
      });
    }

    doc.save(`${project.Nombre}_Checklist_${type === 'empty' ? 'Vacio' : 'Digital'}.pdf`);
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
        
        <div className="flex gap-2">
          {!isSent && checklist.length > 0 && (
            <Button variant="default" size="sm" onClick={handleSendProject} className="bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4 mr-2" />
              Marcar como Enviado
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => exportPDF('empty')} title="Para rellenar a mano">
            PDF (Vacío)
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportPDF('digital')} title="Con datos del sistema">
            PDF (Digital)
          </Button>
          {!isSent && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger render={<Button size="sm" />}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Requisito
              </DialogTrigger>
              <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Herramienta al Checklist</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRequirement} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_generico">Nombre (Genérico o Específico)</Label>
                <Input 
                  id="nombre_generico" 
                  list="tools-list"
                  value={formData.Nombre_Generico} 
                  onChange={(e) => setFormData({...formData, Nombre_Generico: e.target.value})} 
                  placeholder="Ej. Taladro, Amoladora 115mm..."
                  required
                />
                <datalist id="tools-list">
                  {availableTools.map(t => (
                    <option key={t.ID} value={`${t.Nombre} ${t.ID_Interno ? `[SN: ${t.ID_Interno}]` : ''}`.trim()} />
                  ))}
                </datalist>
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
              <div className="space-y-2 flex items-center gap-2 mt-4">
                <input 
                  type="checkbox" 
                  id="es_consumible" 
                  checked={formData.Es_Consumible}
                  onChange={(e) => setFormData({...formData, Es_Consumible: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="es_consumible" className="font-normal cursor-pointer">
                  Es material consumible (no retornable)
                </Label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Añadir</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        )}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Herramienta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditRequirement} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit_nombre_generico">Nombre (Genérico o Específico)</Label>
                <Input 
                  id="edit_nombre_generico" 
                  list="tools-list-edit"
                  value={editData.Nombre_Generico} 
                  onChange={(e) => setEditData({...editData, Nombre_Generico: e.target.value})} 
                  placeholder="Ej. Taladro, Amoladora 115mm..."
                  required
                />
                <datalist id="tools-list-edit">
                  {availableTools.map(t => (
                    <option key={t.ID} value={`${t.Nombre} ${t.ID_Interno ? `[SN: ${t.ID_Interno}]` : ''}`.trim()} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_cantidad">Cantidad Requerida</Label>
                <Input 
                  id="edit_cantidad" 
                  type="number"
                  min="1"
                  value={editData.Cantidad_Requerida} 
                  onChange={(e) => setEditData({...editData, Cantidad_Requerida: parseInt(e.target.value)})} 
                  required
                />
              </div>
              <div className="space-y-2 flex items-center gap-2 mt-4">
                <input 
                  type="checkbox" 
                  id="edit_es_consumible" 
                  checked={editData.Es_Consumible}
                  onChange={(e) => setEditData({...editData, Es_Consumible: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="edit_es_consumible" className="font-normal cursor-pointer">
                  Es material consumible (no retornable)
                </Label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setEditOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar Cambios</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
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
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold
                          ${item.Estado === 'Completado' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                            item.Estado === 'Roto' || item.Estado === 'Averiado' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                            item.Estado === 'Perdido' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                            'bg-muted text-muted-foreground'}`}>
                          {item.Estado}
                        </span>
                        {item.Es_Consumible === 1 && (
                          <span className="inline-flex items-center rounded-md border bg-blue-500/10 text-blue-600 border-blue-500/20 px-2.5 py-0.5 text-[10px] font-semibold">
                            Consumible
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isSent ? (
                          <Button variant="ghost" size="sm" onClick={() => {
                            setEditData({
                              ID: item.ID,
                              Nombre_Generico: item.Nombre_Generico,
                              Cantidad_Requerida: item.Cantidad_Requerida,
                              Es_Consumible: item.Es_Consumible === 1
                            });
                            setEditOpen(true);
                          }} className="h-8 px-2 text-muted-foreground hover:text-foreground">
                            <Pencil className="h-4 w-4 mr-1" /> Editar
                          </Button>
                        ) : (
                          item.Es_Consumible === 1 ? (
                            <span className="text-xs text-muted-foreground italic">No retornable</span>
                          ) : (
                            <>
                              <Button variant="outline" size="sm" onClick={() => handleStatusChange(item.ID, "Completado")} className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50">
                                <CheckCircle2 className="h-4 w-4 mr-1" /> OK
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleStatusChange(item.ID, "Roto")} className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                                <AlertTriangle className="h-4 w-4 mr-1" /> Roto
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleStatusChange(item.ID, "Perdido")} className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                                <XCircle className="h-4 w-4 mr-1" /> Perdido
                              </Button>
                            </>
                          )
                        )}
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
