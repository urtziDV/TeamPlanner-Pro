"use client";

import { useState } from "react";
import { Handshake, Plus, Undo2, History, AlertTriangle, Trash2, Search, LayoutGrid, List, Download } from "lucide-react";
import { exportToExcel } from "@/lib/exportUtils";
import { QRScanner } from "@/components/QRScanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConfirm, ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createAsignacion, deleteAsignacion, deleteHistorialPrestamo } from "@/app/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function LoansClient({ activeLoans, history, tools, allTools, users }: { activeLoans: any[], history: any[], tools: any[], allTools: any[], users: any[] }) {
  const [open, setOpen] = useState(false);
  const [incOpen, setIncOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [selectedToolValor, setSelectedToolValor] = useState<number>(0);
  const [incData, setIncData] = useState({ Tipo: "Avería", Costo: 0, Observaciones: "" });
  const [formData, setFormData] = useState({ Herramienta_ID: "", Usuario_ID: "", Motivo: "", Fecha_Limite: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<"name_asc" | "name_desc" | "user_asc" | "date_desc">("date_desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

  const sortLoans = (a: any, b: any) => {
    if (sortMode === "name_asc") return (a.Herramienta || "").localeCompare(b.Herramienta || "");
    if (sortMode === "name_desc") return (b.Herramienta || "").localeCompare(a.Herramienta || "");
    if (sortMode === "user_asc") return (a.Usuario || "").localeCompare(b.Usuario || "");
    if (sortMode === "date_desc") {
      const d1 = new Date(b.Fecha_Entrega || b.Fecha_Devolucion || "").getTime();
      const d2 = new Date(a.Fecha_Entrega || a.Fecha_Devolucion || "").getTime();
      return d1 - d2 || 0;
    }
    return 0;
  };

  const filteredActiveLoans = [...activeLoans].filter(loan => 
    (loan.Herramienta?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    (loan.Usuario?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  ).sort(sortLoans);
  
  const filteredHistory = [...history].filter(h => 
    (h.Herramienta?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    (h.Usuario?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  ).sort(sortLoans);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Herramienta_ID || !formData.Usuario_ID) return;
    
    const herramienta = tools.find(t => t.ID === formData.Herramienta_ID);
    const usuario = users.find(u => u.ID === formData.Usuario_ID);
    
    await createAsignacion({
      ...formData,
      Herramienta: herramienta?.Nombre || "Desconocida",
      Usuario: usuario?.Nombre || "Desconocido"
    });
    setFormData({ Herramienta_ID: "", Usuario_ID: "", Motivo: "", Fecha_Limite: "" });
    setOpen(false);
  };

  const handleReturn = async (id: string, herramientaId: string, status: string) => {
    const ok = await confirm({
      title: "Confirmar Devolución",
      message: `¿Marcar como ${status}?`,
      variant: "default"
    });
    if (ok) {
      await deleteAsignacion(id, herramientaId, status);
    }
  };

  const openIncidentReturn = (loan: any) => {
    setSelectedLoan(loan);
    const tool = allTools.find(t => t.ID === loan.Herramienta_ID);
    const valor = tool?.Valor ? parseFloat(tool.Valor) : 0;
    setSelectedToolValor(valor);
    setIncData({ Tipo: "Avería", Costo: 0, Observaciones: "" });
    setIncOpen(true);
  };

  const handleTipoChange = (tipo: string) => {
    let costo = 0;
    if (tipo === "Pérdida" || tipo === "Robo") costo = selectedToolValor;
    setIncData(prev => ({ ...prev, Tipo: tipo, Costo: costo }));
  };

  const handleReturnWithIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;
    await deleteAsignacion(selectedLoan.ID, selectedLoan.Herramienta_ID, incData.Tipo, incData);
    setIncOpen(false);
    setSelectedLoan(null);
  };

  const handleDeleteHistory = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar Historial",
      message: "¿Eliminar este registro del historial?",
      variant: "destructive"
    });
    if (ok) {
      await deleteHistorialPrestamo(id);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Préstamos y Asignaciones</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          <QRScanner onScan={(text) => setSearchQuery(text)} />
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[250px]" 
            />
          </div>
          <Button variant="outline" onClick={() => exportToExcel(filteredActiveLoans, 'Prestamos_Activos')} title="Exportar Activos a Excel">
            <Download className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Exportar</span>
          </Button>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Handshake className="h-4 w-4 mr-2" />
            Nueva Asignación
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Asignar Herramienta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Herramienta Disponible</Label>
                <select 
                  value={formData.Herramienta_ID}
                  onChange={(e) => setFormData({...formData, Herramienta_ID: e.target.value})}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  required
                >
                  <option value="">Seleccionar herramienta...</option>
                  {tools.map(t => <option key={t.ID} value={t.ID}>{t.Nombre} {t.SN ? `(SN: ${t.SN})` : ''}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Empleado</Label>
                <select 
                  value={formData.Usuario_ID}
                  onChange={(e) => setFormData({...formData, Usuario_ID: e.target.value})}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  required
                >
                  <option value="">Seleccionar empleado...</option>
                  {users.map(u => <option key={u.ID} value={u.ID}>{u.Nombre}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Motivo / Observaciones</Label>
                <Input 
                  value={formData.Motivo} 
                  onChange={(e) => setFormData({...formData, Motivo: e.target.value})} 
                  placeholder="Ej. Tareas de mantenimiento planta 1"
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha Límite (Opcional)</Label>
                <Popover>
                  <PopoverTrigger render={
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.Fecha_Limite && "text-muted-foreground"
                      )}
                    />
                  }>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.Fecha_Limite ? format(new Date(formData.Fecha_Limite + "T12:00:00Z"), "PPP", { locale: es }) : <span>Selecciona una fecha...</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.Fecha_Limite ? new Date(formData.Fecha_Limite + "T12:00:00Z") : undefined}
                      onSelect={(d) => setFormData({...formData, Fecha_Limite: d ? format(d, 'yyyy-MM-dd') : ""})}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Asignar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="activos" className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="activos">Préstamos Activos</TabsTrigger>
            <TabsTrigger value="historial">Historial de Devoluciones</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-4 overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline">Ordenar:</span>
              <select 
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as any)}
                className="h-9 w-[150px] rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="date_desc">Más Recientes</option>
                <option value="name_asc">Herramienta (A-Z)</option>
                <option value="name_desc">Herramienta (Z-A)</option>
                <option value="user_asc">Usuario</option>
              </select>
            </div>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg shrink-0">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <TabsContent value="activos" className="space-y-4">
          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredActiveLoans.length === 0 ? (
                <div className="col-span-full p-8 text-center border rounded-xl bg-card text-muted-foreground">
                  No hay herramientas prestadas actualmente.
                </div>
              ) : (
                filteredActiveLoans.map((loan) => {
                  const toolDetails = allTools.find(t => t.ID === loan.Herramienta_ID);
                  return (
                  <div key={loan.ID} className="rounded-xl border bg-card text-card-foreground shadow flex flex-col justify-between overflow-hidden">
                    <div className="p-6 pb-4 flex items-start gap-4">
                      <div className="h-16 w-16 rounded-lg bg-white border flex items-center justify-center shrink-0 overflow-hidden p-1">
                        {toolDetails?.Imagen_URL ? (
                          <img src={toolDetails.Imagen_URL} alt={loan.Herramienta} className="h-full w-full object-contain" />
                        ) : (
                          <Handshake className="h-6 w-6 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold leading-none tracking-tight">{loan.Herramienta}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Asignado a: <span className="font-medium text-foreground">{loan.Usuario}</span></p>
                        {loan.Fecha_Entrega && <p className="text-xs text-muted-foreground mt-2">Desde: {loan.Fecha_Entrega}</p>}
                      </div>
                    </div>
                    <div className="px-6 py-3 border-t bg-muted/20 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleReturn(loan.ID, loan.Herramienta_ID, "Devuelto OK")}>
                        <Undo2 className="h-4 w-4 mr-2" /> Devolver OK
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => openIncidentReturn(loan)}>
                        <AlertTriangle className="h-4 w-4 mr-2" /> Incidente
                      </Button>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="rounded-md border bg-card overflow-hidden">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Herramienta</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Asignado A</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Desde</th>
                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActiveLoans.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">No hay herramientas prestadas.</td>
                    </tr>
                  ) : (
                    filteredActiveLoans.map((loan) => {
                      const toolDetails = allTools.find(t => t.ID === loan.Herramienta_ID);
                      return (
                      <tr key={loan.ID} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle font-medium flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md bg-white border flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                            {toolDetails?.Imagen_URL ? (
                              <img src={toolDetails.Imagen_URL} alt={loan.Herramienta} className="h-full w-full object-contain" />
                            ) : (
                              <Handshake className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          {loan.Herramienta}
                        </td>
                        <td className="p-4 align-middle">{loan.Usuario}</td>
                        <td className="p-4 align-middle text-muted-foreground">{loan.Fecha_Entrega}</td>
                        <td className="p-4 align-middle text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleReturn(loan.ID, loan.Herramienta_ID, "Devuelto OK")}>
                              <Undo2 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => openIncidentReturn(loan)}>
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="historial">
          <div className="rounded-md border bg-card">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/50">
                <tr>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Herramienta</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Usuario</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Devolución</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Estado Final</th>
                  <th className="h-10 px-4 text-right font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((h) => (
                  <tr key={h.ID} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{h.Herramienta}</td>
                    <td className="p-4 align-middle">{h.Usuario}</td>
                    <td className="p-4 align-middle">{h.Fecha_Devolucion}</td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold
                        ${h.Estado_Final === 'Devuelto OK' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {h.Estado_Final}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <button 
                        onClick={() => handleDeleteHistory(h.ID)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={incOpen} onOpenChange={setIncOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Devolver con Incidente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReturnWithIncident} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Tipo de Incidente</Label>
              <select 
                value={incData.Tipo}
                onChange={(e) => handleTipoChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Avería">Avería</option>
                <option value="Pérdida">Pérdida</option>
                <option value="Robo">Robo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            {incData.Tipo === "Avería" && (
              <div className="space-y-2">
                <Label>Costo Estimado (€)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={incData.Costo} 
                  onChange={(e) => setIncData({...incData, Costo: parseFloat(e.target.value)})} 
                />
              </div>
            )}
            {(incData.Tipo === "Pérdida" || incData.Tipo === "Robo") && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
                <p className="font-medium text-amber-700 dark:text-amber-400">Coste aplicado automáticamente</p>
                <p className="text-muted-foreground mt-0.5">
                  Se registrará el valor declarado de la herramienta:{" "}
                  <span className="font-semibold text-foreground">{selectedToolValor > 0 ? `${selectedToolValor} €` : "Sin valor declarado"}</span>
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Observaciones / Detalles</Label>
              <Input 
                value={incData.Observaciones} 
                onChange={(e) => setIncData({...incData, Observaciones: e.target.value})} 
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setIncOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="destructive">Confirmar Devolución</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog confirmState={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}
