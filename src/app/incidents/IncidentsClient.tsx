"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConfirm, ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createIncidente, deleteIncidente } from "@/app/actions";

export function IncidentsClient({ incidentes, usuarios = [], herramientas = [] }: { incidentes: any[], usuarios?: any[], herramientas?: any[] }) {
  const [incOpen, setIncOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const [incData, setIncData] = useState({ Herramienta: "", Usuario: "", Tipo: "Avería", Costo: 0 });

  const filteredIncidentes = incidentes.filter(i => 
    (i.Herramienta?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    (i.Usuario?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleCreateInc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incData.Herramienta) return;
    await createIncidente(incData);
    setIncData({ Herramienta: "", Usuario: "", Tipo: "Avería", Costo: 0 });
    setIncOpen(false);
  };

  const handleDelInc = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar Incidente",
      message: "¿Eliminar este registro de incidente?",
      variant: "destructive",
      confirmLabel: "Eliminar"
    });
    if (ok) {
      await deleteIncidente(id);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Incidentes</h2>
        
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
          <Dialog open={incOpen} onOpenChange={setIncOpen}>
            <DialogTrigger render={<Button variant="destructive" />}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Registrar Incidente
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Rotura o Pérdida</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateInc} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Usuario Responsable</Label>
                  <select
                    value={incData.Usuario}
                    onChange={(e) => setIncData({ ...incData, Usuario: e.target.value, Herramienta: "" })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">-- Ninguno / Seleccionar --</option>
                    {usuarios.map(u => (
                      <option key={u.ID} value={u.Nombre}>{u.Nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Herramienta</Label>
                  <select
                    value={incData.Herramienta}
                    onChange={(e) => setIncData({ ...incData, Herramienta: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">-- Seleccionar herramienta --</option>
                    {herramientas.map(h => (
                      <option key={h.ID} value={h.Nombre}>{h.Nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <select 
                      value={incData.Tipo}
                      onChange={(e) => setIncData({...incData, Tipo: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="Avería">Avería</option>
                      <option value="Pérdida">Pérdida</option>
                      <option value="Robo">Robo</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Costo Estimado (€)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={incData.Costo} 
                      onChange={(e) => setIncData({...incData, Costo: parseFloat(e.target.value)})} 
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" type="button" onClick={() => setIncOpen(false)}>Cancelar</Button>
                  <Button type="submit" variant="destructive">Registrar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <ConfirmDialog confirmState={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b bg-muted/50">
            <tr>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Herramienta</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Responsable</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Tipo</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Fecha</th>
              <th className="h-10 px-4 text-right font-medium text-muted-foreground">Costo</th>
              <th className="h-10 px-4 text-right font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidentes.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No hay incidentes encontrados.</td></tr>
            ) : filteredIncidentes.map((i) => (
              <tr key={i.ID} className="border-b transition-colors hover:bg-muted/50 group">
                <td className="p-4 align-middle font-medium flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${i.Tipo === 'Pérdida' ? 'text-orange-500' : 'text-red-500'}`} /> 
                  {i.Herramienta}
                </td>
                <td className="p-4 align-middle">{i.Usuario}</td>
                <td className="p-4 align-middle">{i.Tipo}</td>
                <td className="p-4 align-middle">{i.Fecha}</td>
                <td className="p-4 align-middle text-right font-mono">{i.Costo ? `${i.Costo} €` : 'N/A'}</td>
                <td className="p-4 align-middle text-right">
                  <Button title="Eliminar" variant="ghost" size="icon" onClick={() => handleDelInc(i.ID)} className="p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
