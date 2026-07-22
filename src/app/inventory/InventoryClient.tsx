"use client";

import { useState } from "react";
import { Wrench, Plus, Search, Trash2, Edit, Box, Layers, CheckCircle, LayoutGrid, List, Download, ImagePlus, Zap, ScanLine, AlertTriangle } from "lucide-react";
import { exportToExcel } from "@/lib/exportUtils";
import { QRGenerator } from "@/components/QRGenerator";
import { QRScanner } from "@/components/QRScanner";
import { createHerramienta, deleteHerramienta, updateHerramienta } from "@/app/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConfirm, ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function InventoryClient({ initialTools, categorias, usuarios = [], ubicaciones = [] }: { initialTools: any[], categorias: any[], usuarios?: any[], ubicaciones?: any[] }) {
  const [tools, setTools] = useState(initialTools);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [genericWarningOpen, setGenericWarningOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortMode, setSortMode] = useState<"name_asc" | "name_desc" | "cat_asc" | "status_asc">("name_asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();



  const filteredTools = tools.filter(t => {
    const matchesSearch = (t.Nombre?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                          (t.Categoria?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                          (t.SN?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== "all") {
      if (statusFilter === "Prestada") {
        matchesStatus = t.Estado === "Prestada" || (t._asignadas && t._asignadas > 0);
      } else if (statusFilter === "Averiada") {
        matchesStatus = t.Estado === "Averiada" || t.Estado === "Rota" || (t._averiadas && t._averiadas > 0);
      } else if (statusFilter === "Pérdida" || statusFilter === "Roto - Baja") {
        matchesStatus = t.Estado === statusFilter || (t._perdidas && t._perdidas > 0);
      } else {
        matchesStatus = t.Estado === statusFilter;
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  const sortedAndFilteredTools = [...filteredTools].sort((a, b) => {
    if (sortMode === "name_asc") return (a.Nombre || "").localeCompare(b.Nombre || "");
    if (sortMode === "name_desc") return (b.Nombre || "").localeCompare(a.Nombre || "");
    if (sortMode === "cat_asc") return (a.Categoria || "").localeCompare(b.Categoria || "");
    if (sortMode === "status_asc") return (a.Estado || "").localeCompare(b.Estado || "");
    return 0;
  });
  
  const defaultForm = { 
    Nombre: "", Categoria: "", Estado: "Disponible", SN: [] as string[], Ubicacion: "",
    Valor: "", Observaciones: "", Es_Generica: false, Es_Basica: false, Apto_Proyecto: false, Imagen_URL: "",
    Cantidad_Total: 1,
    Calibracion_Requerida: false, Calibracion_Ultima: "", Calibracion_Frecuencia: 12,
    Mantenimiento_Requerido: false, Mantenimiento_Ultimo: "", Mantenimiento_Frecuencia: 12
  };
  const [formData, setFormData] = useState(defaultForm);
  const [snInput, setSnInput] = useState("");

  const handleAddSn = () => {
    if (snInput.trim()) {
      const newSns = snInput.split(/[\s,]+/).filter(Boolean);
      const uniqueNewSns = newSns.filter(sn => !formData.SN.includes(sn));
      if (uniqueNewSns.length > 0) {
        setFormData({...formData, SN: [...formData.SN, ...uniqueNewSns]});
      }
      setSnInput("");
    }
  };

  const handleRemoveSn = (snToRemove: string) => {
    setFormData({...formData, SN: formData.SN.filter(sn => sn !== snToRemove)});
  };

  const handleGenericaToggle = () => {
    if (!formData.Es_Generica && formData.SN.length > 0) {
      setGenericWarningOpen(true);
    } else {
      setFormData({...formData, Es_Generica: !formData.Es_Generica});
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Nombre) return;
    const payload = { ...formData, SN: formData.SN.join(", "), Calibracion_Requerida: formData.Calibracion_Requerida ? 1 : 0, Mantenimiento_Requerido: formData.Mantenimiento_Requerido ? 1 : 0 };
    const newTool = await createHerramienta(payload);
    setTools((prev) => [newTool, ...prev]);
    setFormData(defaultForm);
    setSnInput("");
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar Herramienta",
      message: "¿Estás seguro de que quieres eliminar esta herramienta? Esta acción no se puede deshacer.",
      variant: "destructive",
      confirmLabel: "Eliminar"
    });
    if (ok) {
      await deleteHerramienta(id);
      setTools((prev) => prev.filter((t) => t.ID !== id));
    }
  };

  const openEdit = (tool: any) => {
    setSelectedTool(tool);
    setFormData({
      Nombre: tool.Nombre || "",
      Categoria: tool.Categoria || "",
      Estado: tool.Estado || "Disponible",
      SN: tool.SN ? tool.SN.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean) : [],
      Ubicacion: tool.Ubicacion || "",
      Valor: tool.Valor || "",
      Observaciones: tool.Observaciones || "",
      Es_Generica: tool.Es_Generica === 1,
      Es_Basica: tool.Es_Basica === 1,
      Apto_Proyecto: tool.Apto_Proyecto === 1,
      Imagen_URL: tool.Imagen_URL || "",
      Cantidad_Total: tool.Cantidad_Total || 1,
      Calibracion_Requerida: tool.Calibracion_Requerida === 1,
      Calibracion_Ultima: tool.Calibracion_Ultima || "",
      Calibracion_Frecuencia: tool.Calibracion_Frecuencia || 12,
      Mantenimiento_Requerido: tool.Mantenimiento_Requerido === 1,
      Mantenimiento_Ultimo: tool.Mantenimiento_Ultimo || "",
      Mantenimiento_Frecuencia: tool.Mantenimiento_Frecuencia || 12
    });
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTool) return;
    const payload = { ...formData, SN: formData.SN.join(", "), Calibracion_Requerida: formData.Calibracion_Requerida ? 1 : 0, Mantenimiento_Requerido: formData.Mantenimiento_Requerido ? 1 : 0 };
    const updatedTool = await updateHerramienta(selectedTool.ID, payload);
    setTools(tools.map(t => t.ID === selectedTool.ID ? { ...t, ...payload } : t));
    setEditOpen(false);
    setSnInput("");
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Inventario</h2>
        
        <div className="flex flex-wrap items-center gap-3">


          <QRScanner onScan={(text) => setSearchQuery(text)} />
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, categoría o SN..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-9 w-[200px] lg:w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-8"
            />
          </div>
          <Button variant="outline" onClick={() => exportToExcel(sortedAndFilteredTools, 'Inventario_Herramientas')} title="Exportar a Excel">
            <Download className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Exportar</span>
          </Button>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Herramienta
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Añadir Herramienta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input 
                  id="nombre" 
                  value={formData.Nombre} 
                  onChange={(e) => setFormData({...formData, Nombre: e.target.value})} 
                  placeholder="Ej. Taladro Percutor Bosch"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <select 
                    id="categoria"
                    value={formData.Categoria}
                    onChange={(e) => setFormData({...formData, Categoria: e.target.value})}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Selecciona...</option>
                    {categorias.map(c => <option key={c.ID} value={c.Nombre}>{c.Nombre}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Números de Serie (SN) {formData.SN.length > 0 && <span className="ml-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{formData.SN.length}</span>}</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={snInput} 
                      onChange={(e) => setSnInput(e.target.value)} 
                      onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddSn(); } }}
                      placeholder="Escribe y pulsa +"
                    />
                    <QRScanner 
                      triggerButton={<Button type="button" variant="outline" size="icon" title="Escanear con cámara"><ScanLine className="h-4 w-4" /></Button>}
                      onScan={(text) => {
                        if (text && !formData.SN.includes(text)) {
                          setFormData({...formData, SN: [...formData.SN, text]});
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddSn} variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
                  </div>
                  {formData.SN.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto border rounded-md p-2 bg-muted/10">
                      {formData.SN.map(sn => (
                        <div key={sn} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs">
                          {sn}
                          <Button title="Eliminar" variant="ghost" size="icon" type="button" onClick={() => handleRemoveSn(sn)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imagen_url">URL de Imagen</Label>
                  <Input 
                    id="imagen_url" 
                    value={formData.Imagen_URL} 
                    onChange={(e) => setFormData({...formData, Imagen_URL: e.target.value})} 
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  {formData.Imagen_URL && (
                    <div className="mt-2 h-20 w-20 rounded border bg-muted overflow-hidden flex items-center justify-center">
                      <img src={formData.Imagen_URL} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <select 
                    id="estado"
                    value={formData.Estado}
                    onChange={(e) => setFormData({...formData, Estado: e.target.value})}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="En Uso">En Uso</option>
                    <option value="En Mantenimiento">En Mantenimiento</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad Física Total</Label>
                <Input 
                  id="cantidad" 
                  type="number"
                  min={1}
                  value={formData.Cantidad_Total} 
                  onChange={(e) => setFormData({...formData, Cantidad_Total: parseInt(e.target.value) || 1})} 
                />
                <p className="text-xs text-muted-foreground">
                  Define cuántas herramientas físicas hay. Si introduces menos que el número de SNs guardados, el sistema contará la cantidad mayor para proteger el stock.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor Estimado (€)</Label>
                  <Input 
                    id="valor" 
                    type="number"
                    step="0.01"
                    value={formData.Valor} 
                    onChange={(e) => setFormData({...formData, Valor: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <select 
                    id="ubicacion" 
                    value={formData.Ubicacion || ""} 
                    onChange={(e) => setFormData({...formData, Ubicacion: e.target.value})}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Sin ubicación</option>
                    {ubicaciones.map(u => (
                      <option key={u.ID} value={u.Nombre}>{u.Nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="obs">Observaciones</Label>
                <Input 
                  id="obs" 
                  value={formData.Observaciones} 
                  onChange={(e) => setFormData({...formData, Observaciones: e.target.value})} 
                />
              </div>
              <div className="flex flex-wrap gap-4 mt-2">
                <button 
                  type="button"
                  title="Material consumible o genérico. Se presta indicando la cantidad, sin necesidad de rastrear el Número de Serie exacto."
                  onClick={handleGenericaToggle}
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${formData.Es_Generica ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-background hover:bg-muted text-muted-foreground'}`}
                >
                  <Box className="w-4 h-4" /> Es Genérica
                </button>
                <button 
                  type="button"
                  title="EPIs o material de dotación básica. Se pueden asignar en bloque a nuevos empleados desde la configuración."
                  onClick={() => setFormData({...formData, Es_Basica: !formData.Es_Basica})}
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${formData.Es_Basica ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-500' : 'bg-background hover:bg-muted text-muted-foreground'}`}
                >
                  <Layers className="w-4 h-4" /> Es Básica
                </button>
                <button 
                  type="button"
                  title="Herramientas pesadas o grandes lotes que se asignan directamente a un Proyecto en lugar de a un empleado."
                  onClick={() => setFormData({...formData, Apto_Proyecto: !formData.Apto_Proyecto})}
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${formData.Apto_Proyecto ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-500' : 'bg-background hover:bg-muted text-muted-foreground'}`}
                >
                  <CheckCircle className="w-4 h-4" /> Apto Proyecto
                </button>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={genericWarningOpen} onOpenChange={setGenericWarningOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-500">
                <AlertTriangle className="h-5 w-5" />
                Conversión a Genérica
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 text-sm text-muted-foreground">
              <p>Esta herramienta tiene <strong>{formData.SN.length} Números de Serie</strong> registrados.</p>
              <p>Si la conviertes en Genérica manteniendo los SNs, el sistema ignorará la conversión y te seguirá obligando a elegir un SN exacto al prestarla por motivos de seguridad.</p>
              <p>Para que funcione como una genérica real (prestar solo por cantidad sin rastreo de SN), debes vaciar la lista de Números de Serie.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end mt-4">
              <Button variant="outline" onClick={() => setGenericWarningOpen(false)}>
                Cancelar
              </Button>
              <Button variant="secondary" onClick={() => { setFormData({...formData, Es_Generica: true}); setGenericWarningOpen(false); }}>
                Mantener SNs
              </Button>
              <Button variant="default" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => { setFormData({...formData, Es_Generica: true, SN: []}); setGenericWarningOpen(false); }}>
                Borrar SNs y Continuar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
      
      <div className="rounded-md border bg-card">
        <div className="relative w-full overflow-auto p-4">
          <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 w-[160px] rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">Todos los Estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Prestada">Prestada</option>
            <option value="Averiada">Averiada / Rota</option>
            <option value="Roto - Baja">Baja Definitiva</option>
            <option value="Pérdida">Pérdida</option>
          </select>
        </div>
        <div className="flex items-center gap-4 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline">Ordenar:</span>
            <select 
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as any)}
              className="h-9 w-[150px] rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="name_asc">Nombre (A-Z)</option>
              <option value="name_desc">Nombre (Z-A)</option>
              <option value="cat_asc">Categoría</option>
              <option value="status_asc">Estado</option>
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

          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedAndFilteredTools.length === 0 ? (
                <div className="col-span-full p-8 text-center text-muted-foreground border rounded-xl bg-muted/20">
                  No hay herramientas encontradas.
                </div>
              ) : (
                sortedAndFilteredTools.map((h) => (
                  <div key={h.ID} className="relative rounded-xl border bg-card text-card-foreground shadow overflow-hidden group glass-card">
                    <div className="p-4 flex items-start gap-4">
                      <div className="h-16 w-16 rounded-lg bg-white border flex items-center justify-center shrink-0 overflow-hidden p-1">
                        {h.Imagen_URL ? (
                          <img src={h.Imagen_URL} alt={h.Nombre || ""} className="h-full w-full object-contain" />
                        ) : (
                          <Wrench className="h-8 w-8 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-16">
                        <h3 className="font-semibold leading-none tracking-tight truncate" title={h.Nombre}>{h.Nombre}</h3>
                        <p className="text-sm text-muted-foreground mt-1 truncate">{h.Categoria}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(() => {
                            const sns = h.SN ? h.SN.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean) : [];
                            const hasMultiple = sns.length > 1 || (h.Cantidad_Total && h.Cantidad_Total > 1);
                            
                            const badges = [];

                            if (hasMultiple && h._disponibles !== undefined && h._disponibles !== null) {
                              badges.push(
                                <span key="disp" className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${h._disponibles > 0 ? 'border-green-500/20 bg-green-500/10 text-green-500' : 'border-orange-500/20 bg-orange-500/10 text-orange-500'}`}>
                                  {h._disponibles} {h._disponibles === 1 ? 'Disponible' : 'Disponibles'}
                                </span>
                              );
                            }
                            if (h._averiadas && h._averiadas > 0) {
                              badges.push(
                                <span key="averiada" className="inline-flex items-center rounded-md border border-orange-500/30 bg-orange-500/10 text-orange-600 px-2 py-0.5 text-[10px] font-semibold">
                                  {h._averiadas} {h._averiadas === 1 ? 'Averiada' : 'Averiadas'}
                                </span>
                              );
                            }
                            if (h._perdidas && h._perdidas > 0) {
                              badges.push(
                                <span key="perdida" className="inline-flex items-center rounded-md border border-red-500/30 bg-red-500/10 text-red-600 px-2 py-0.5 text-[10px] font-semibold">
                                  {h._perdidas} {h._perdidas === 1 ? 'Pérdida' : 'Pérdidas'}
                                </span>
                              );
                            }
                            if (badges.length > 0) return <>{badges}</>;
                            
                            return h.Estado === "Disponible" ? (
                              <span className="inline-flex items-center rounded-md border border-green-500/20 bg-green-500/10 text-green-500 px-2 py-0.5 text-[10px] font-semibold">
                                Disponible
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold">
                                {h.Estado}
                              </span>
                            );
                          })()}
                          {h.SN && (() => {
                            const sns = h.SN.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
                            if (sns.length > 0) {
                              return (
                                <span className="inline-flex items-center rounded-md border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold">
                                  {sns.length} SN(s)
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <QRGenerator toolId={h.ID} snString={h.SN} cantidadTotal={h.Cantidad_Total} title={h.Nombre} />
                      <Button title="Editar" variant="ghost" size="icon" onClick={() => openEdit(h)} className="p-1.5 bg-background border shadow-sm rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button title="Eliminar" variant="ghost" size="icon" onClick={() => handleDelete(h.ID)} className="p-1.5 bg-background border shadow-sm rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <table className="w-full caption-bottom text-sm mt-0">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Herramienta</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Categoría</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {sortedAndFilteredTools.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">No hay herramientas encontradas.</td>
                </tr>
              ) : (
                sortedAndFilteredTools.map((h) => (
                  <tr key={h.ID} className="border-b transition-colors hover:bg-muted/50 group">
                    <td className="p-4 align-middle font-medium flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                        {h.Imagen_URL ? (
                          <img src={h.Imagen_URL} alt={h.Nombre || ""} className="h-full w-full object-cover rounded" />
                        ) : (
                          <Wrench className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span>{h.Nombre}</span>
                        {h.SN && (() => {
                          const sns = h.SN.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
                          if (sns.length === 0) return null;
                          return (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              SN: <span className="font-mono">{sns[0]}</span>
                              {sns.length > 1 && (
                                <span className="ml-1 inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                  +{sns.length - 1}
                                </span>
                              )}
                            </span>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">
                        {h.Categoria}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      {(() => {
                        const sns = h.SN ? h.SN.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean) : [];
                        const hasMultiple = sns.length > 1 || (h.Cantidad_Total && h.Cantidad_Total > 1);
                        
                        if (hasMultiple && h._disponibles !== undefined && h._disponibles !== null) {
                          return (
                            <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${h._disponibles > 0 ? 'border-green-500/20 bg-green-500/10 text-green-500' : 'border-orange-500/20 bg-orange-500/10 text-orange-500'}`}>
                              {h._disponibles} {h._disponibles === 1 ? 'Disponible' : 'Disponibles'}
                            </span>
                          );
                        }
                        
                        return h.Estado === "Disponible" ? (
                          <span className="inline-flex items-center rounded-md border border-green-500/20 bg-green-500/10 text-green-500 px-2.5 py-0.5 text-xs font-semibold">
                            Disponible
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">
                            {h.Estado}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <QRGenerator toolId={h.ID} snString={h.SN} cantidadTotal={h.Cantidad_Total} title={h.Nombre} />
                        <Button title="Editar" variant="ghost" size="icon" 
                          onClick={() => openEdit(h)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button title="Eliminar" variant="ghost" size="icon" 
                          onClick={() => handleDelete(h.ID)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Herramienta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="pt-4">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image Preview Side */}
              <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 overflow-hidden flex items-center justify-center relative group">
                  {formData.Imagen_URL ? (
                    <img src={formData.Imagen_URL} alt="Preview" className="w-full h-full object-contain bg-white p-2" />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <ImagePlus className="h-10 w-10 mb-2 opacity-50" />
                      <span className="text-xs font-medium">Sin imagen</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-imagen_url" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">URL de Imagen</Label>
                  <Input 
                    id="edit-imagen_url" 
                    value={formData.Imagen_URL} 
                    onChange={(e) => setFormData({...formData, Imagen_URL: e.target.value})} 
                    placeholder="https://..."
                    className="h-8 text-xs"
                  />
                </div>
                
                {/* Toggles */}
                <div className="flex flex-col gap-2 mt-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Atributos Especiales</Label>
                  <button 
                    type="button"
                    title="Material consumible o genérico. Se presta indicando la cantidad, sin necesidad de rastrear el Número de Serie exacto."
                    onClick={handleGenericaToggle}
                    className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${formData.Es_Generica ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-background hover:bg-muted text-muted-foreground'}`}
                  >
                    <Box className="w-4 h-4" /> Es Genérica
                  </button>
                  <button 
                    type="button"
                    title="EPIs o material de dotación básica. Se pueden asignar en bloque a nuevos empleados desde la configuración."
                    onClick={() => setFormData({...formData, Es_Basica: !formData.Es_Basica})}
                    className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${formData.Es_Basica ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-500' : 'bg-background hover:bg-muted text-muted-foreground'}`}
                  >
                    <Layers className="w-4 h-4" /> Es Básica
                  </button>
                  <button 
                    type="button"
                    title="Herramientas pesadas o grandes lotes que se asignan directamente a un Proyecto en lugar de a un empleado."
                    onClick={() => setFormData({...formData, Apto_Proyecto: !formData.Apto_Proyecto})}
                    className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${formData.Apto_Proyecto ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-500' : 'bg-background hover:bg-muted text-muted-foreground'}`}
                  >
                    <CheckCircle className="w-4 h-4" /> Apto Proyecto
                  </button>
                </div>
              </div>

              {/* Form Side */}
              <div className="w-full md:w-2/3 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-nombre">Nombre</Label>
                    <Input id="edit-nombre" value={formData.Nombre} onChange={(e) => setFormData({...formData, Nombre: e.target.value})} required />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-categoria">Categoría</Label>
                      <select 
                        id="edit-categoria"
                        value={formData.Categoria}
                        onChange={(e) => setFormData({...formData, Categoria: e.target.value})}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Selecciona...</option>
                        {categorias.map(c => <option key={c.ID} value={c.Nombre}>{c.Nombre}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-estado">Estado</Label>
                      <select 
                        id="edit-estado"
                        value={formData.Estado}
                        onChange={(e) => setFormData({...formData, Estado: e.target.value})}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="Disponible">Disponible</option>
                        <option value="Prestada">Prestada</option>
                        <option value="Averiada">Averiada</option>
                        <option value="Pérdida">Pérdida</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-cantidad">Cantidad Física Total</Label>
                    <Input 
                      id="edit-cantidad" 
                      type="number"
                      min={1}
                      value={formData.Cantidad_Total} 
                      onChange={(e) => setFormData({...formData, Cantidad_Total: parseInt(e.target.value) || 1})} 
                    />
                    <p className="text-xs text-muted-foreground">
                      Define cuántas herramientas físicas hay. Si introduces menos que el número de SNs guardados, el sistema contará la cantidad mayor para proteger el stock.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Números de Serie (SN) {formData.SN.length > 0 && <span className="ml-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{formData.SN.length}</span>}</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={snInput} 
                          onChange={(e) => setSnInput(e.target.value)} 
                          onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddSn(); } }}
                          placeholder="Escribe y pulsa +"
                        />
                        <QRScanner 
                          triggerButton={<Button type="button" variant="outline" size="icon" title="Escanear con cámara"><ScanLine className="h-4 w-4" /></Button>}
                          onScan={(text) => {
                            if (text && !formData.SN.includes(text)) {
                              setFormData({...formData, SN: [...formData.SN, text]});
                            }
                          }}
                        />
                        <Button type="button" onClick={handleAddSn} variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
                      </div>
                      {formData.SN.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto border rounded-md p-2 bg-muted/10">
                          {formData.SN.map(sn => (
                            <div key={sn} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs">
                              {sn}
                              <Button title="Eliminar" variant="ghost" size="icon" type="button" onClick={() => handleRemoveSn(sn)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-valor">Valor (€)</Label>
                      <Input id="edit-valor" type="number" step="0.01" value={formData.Valor} onChange={(e) => setFormData({...formData, Valor: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-ubicacion">Ubicación</Label>
                      <select 
                        id="edit-ubicacion" 
                        value={formData.Ubicacion || ""} 
                        onChange={(e) => setFormData({...formData, Ubicacion: e.target.value})}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Sin ubicación</option>
                        {ubicaciones.map(u => (
                          <option key={u.ID} value={u.Nombre}>{u.Nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-obs">Observaciones</Label>
                      <Input id="edit-obs" value={formData.Observaciones} onChange={(e) => setFormData({...formData, Observaciones: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                  <Button variant="outline" type="button" onClick={() => setEditOpen(false)}>Cancelar</Button>
                  <Button type="submit">Actualizar</Button>
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <ConfirmDialog confirmState={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}
