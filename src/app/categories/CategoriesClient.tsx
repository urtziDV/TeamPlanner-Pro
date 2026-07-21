"use client";

import { useState } from "react";
import { saveKits } from "@/app/actions";
import { Plus, Trash2, Edit, Wrench, Hammer, Zap, Shield, Star, Box, Package, Folder, Tag, Settings, PenTool, Truck, Briefcase, Activity, Compass, MapPin, Users, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConfirm, ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  createCategoria, deleteCategoria, updateCategoria, 
  createUbicacion, deleteUbicacion, updateUbicacion,
  createDepartamento, deleteDepartamento, updateDepartamento,
  createTipoRecordatorio, deleteTipoRecordatorio, updateTipoRecordatorio
} from "@/app/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const ICON_MAP: Record<string, any> = {
  Wrench, Hammer, Zap, Shield, Star, Box, Package, Folder, Tag, Settings, PenTool, Truck, Briefcase, Activity, Compass, Users, MessageSquare
};

export function CategoriesClient({ 
  initialCategorias, 
  initialUbicaciones,
  initialDepartamentos = [],
  initialTiposRecordatorios = [],
  initialKits = [],
  toolNames = []
}: { 
  initialCategorias: any[], 
  initialUbicaciones: any[],
  initialDepartamentos?: any[],
  initialTiposRecordatorios?: any[],
  initialKits?: any[],
  toolNames?: string[]
}) {
  const [categorias, setCategorias] = useState(initialCategorias);
  const [ubicaciones, setUbicaciones] = useState(initialUbicaciones);
  const [departamentos, setDepartamentos] = useState(initialDepartamentos);
  const [tiposRecordatorios, setTiposRecordatorios] = useState(initialTiposRecordatorios);
  
  const [open, setOpen] = useState(false);
  const [openUbi, setOpenUbi] = useState(false);
  const [openDep, setOpenDep] = useState(false);
  const [openTip, setOpenTip] = useState(false);

  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  
  // -- Categorías Logic --
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [icono, setIcono] = useState("Wrench");

  const resetForm = () => { setEditingId(null); setNombre(""); setColor("#3b82f6"); setIcono("Wrench"); };
  const handleOpenNew = () => { resetForm(); setOpen(true); };
  const handleOpenEdit = (c: any) => { setEditingId(c.ID); setNombre(c.Nombre || ""); setColor(c.Color || "#3b82f6"); setIcono(c.Icono || "Wrench"); setOpen(true); };

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
    const ok = await confirm({ title: "Eliminar Categoría", message: "¿Estás seguro de que quieres eliminar esta categoría?", variant: "destructive", confirmLabel: "Eliminar" });
    if (ok) { await deleteCategoria(id); setCategorias((prev) => prev.filter((c) => c.ID !== id)); }
  };

  // -- Ubicaciones Logic --
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
    const ok = await confirm({ title: "Eliminar Ubicación", message: "¿Estás seguro de que quieres eliminar esta ubicación?", variant: "destructive", confirmLabel: "Eliminar" });
    if (ok) { await deleteUbicacion(id); setUbicaciones(prev => prev.filter(u => u.ID !== id)); }
  };

  // -- Departamentos Logic --
  const [depEditingId, setDepEditingId] = useState<string | null>(null);
  const [depNombre, setDepNombre] = useState("");
  const [depIcono, setDepIcono] = useState("Users");

  const handleOpenNewDep = () => { setDepEditingId(null); setDepNombre(""); setDepIcono("Users"); setOpenDep(true); };
  const handleOpenEditDep = (d: any) => { setDepEditingId(d.ID); setDepNombre(d.Nombre); setDepIcono(d.Icono || "Users"); setOpenDep(true); };

  const handleSaveDep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depNombre) return;
    if (depEditingId) {
      const updated = await updateDepartamento(depEditingId, { Nombre: depNombre, Icono: depIcono });
      setDepartamentos(prev => prev.map(d => d.ID === depEditingId ? updated : d));
    } else {
      const newDep = await createDepartamento({ Nombre: depNombre, Icono: depIcono });
      setDepartamentos(prev => [...prev, newDep]);
    }
    setOpenDep(false);
  };

  const handleDeleteDep = async (id: string) => {
    const ok = await confirm({ title: "Eliminar Departamento", message: "¿Estás seguro de que quieres eliminar este departamento?", variant: "destructive", confirmLabel: "Eliminar" });
    if (ok) { await deleteDepartamento(id); setDepartamentos(prev => prev.filter(d => d.ID !== id)); }
  };

  // -- TiposRecordatorios (Plantillas) Logic --
  const [tipEditingId, setTipEditingId] = useState<string | null>(null);
  const [tipNombre, setTipNombre] = useState("");
  const [tipPlantilla, setTipPlantilla] = useState("");

  const [kits, setKits] = useState(initialKits);
  const [openKit, setOpenKit] = useState(false);
  const [kitEditingId, setKitEditingId] = useState<string | null>(null);
  const [kitNombre, setKitNombre] = useState("");
  const [kitTools, setKitTools] = useState<string[]>([]);

  const handleOpenNewTip = () => { setTipEditingId(null); setTipNombre(""); setTipPlantilla("Hola {Usuario}, tienes pendiente de devolver la herramienta {Herramienta}."); setOpenTip(true); };
  const handleOpenEditTip = (t: any) => { setTipEditingId(t.ID); setTipNombre(t.Nombre); setTipPlantilla(t.Plantilla); setOpenTip(true); };

  const handleSaveTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipNombre || !tipPlantilla) return;
    if (tipEditingId) {
      const updated = await updateTipoRecordatorio(tipEditingId, { Nombre: tipNombre, Plantilla: tipPlantilla });
      setTiposRecordatorios(prev => prev.map(t => t.ID === tipEditingId ? updated : t));
    } else {
      const newTip = await createTipoRecordatorio({ Nombre: tipNombre, Plantilla: tipPlantilla });
      setTiposRecordatorios(prev => [...prev, newTip]);
    }
    setOpenTip(false);
  };

  const handleDeleteTip = async (id: string) => {
    const ok = await confirm({ title: "Eliminar Plantilla", message: "¿Estás seguro de que quieres eliminar esta plantilla?", variant: "destructive", confirmLabel: "Eliminar" });
    if (ok) { await deleteTipoRecordatorio(id); setTiposRecordatorios(prev => prev.filter(t => t.ID !== id)); }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Categorías y Ajustes</h2>
        
        <div className="flex flex-wrap gap-2">
          {/* Categoría Modal */}
          <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger render={<Button onClick={handleOpenNew} />}>
              <Plus className="h-4 w-4 mr-2" /> Categoría
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? "Editar Categoría" : "Añadir Categoría"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-20 p-1" />
                </div>
                <div className="space-y-2">
                  <Label>Icono</Label>
                  <div className="grid grid-cols-5 gap-2 border p-3 rounded-md max-h-48 overflow-y-auto">
                    {Object.keys(ICON_MAP).map(key => {
                      const IconComp = ICON_MAP[key];
                      const isSelected = icono === key;
                      return (
                        <button key={key} type="button" onClick={() => setIcono(key)} className={`p-2 flex items-center justify-center rounded-md ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}><IconComp className="h-5 w-5" /></button>
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

          {/* Ubicación Modal */}
          <Dialog open={openUbi} onOpenChange={setOpenUbi}>
            <DialogTrigger render={<Button variant="outline" onClick={handleOpenNewUbi} />}>
              <Plus className="h-4 w-4 mr-2" /> Ubicación
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{ubiEditingId ? "Editar Ubicación" : "Añadir Ubicación"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSaveUbi} className="space-y-4 pt-4">
                <div className="space-y-2"><Label>Nombre</Label><Input value={ubiNombre} onChange={(e) => setUbiNombre(e.target.value)} required /></div>
                <div className="flex justify-end gap-2 pt-4"><Button variant="outline" type="button" onClick={() => setOpenUbi(false)}>Cancelar</Button><Button type="submit">Guardar</Button></div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Departamento Modal */}
          <Dialog open={openDep} onOpenChange={setOpenDep}>
            <DialogTrigger render={<Button variant="outline" onClick={handleOpenNewDep} />}>
              <Plus className="h-4 w-4 mr-2" /> Departamento
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{depEditingId ? "Editar Departamento" : "Añadir Departamento"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSaveDep} className="space-y-4 pt-4">
                <div className="space-y-2"><Label>Nombre</Label><Input value={depNombre} onChange={(e) => setDepNombre(e.target.value)} required /></div>
                <div className="space-y-2">
                  <Label>Icono</Label>
                  <div className="grid grid-cols-5 gap-2 border p-3 rounded-md max-h-48 overflow-y-auto">
                    {Object.keys(ICON_MAP).map(key => {
                      const IconComp = ICON_MAP[key];
                      const isSelected = depIcono === key;
                      return (
                        <button key={key} type="button" onClick={() => setDepIcono(key)} className={`p-2 flex items-center justify-center rounded-md ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}><IconComp className="h-5 w-5" /></button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4"><Button variant="outline" type="button" onClick={() => setOpenDep(false)}>Cancelar</Button><Button type="submit">Guardar</Button></div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Plantilla Modal */}
          <Dialog open={openTip} onOpenChange={setOpenTip}>
            <DialogTrigger render={<Button variant="outline" onClick={handleOpenNewTip} />}>
              <Plus className="h-4 w-4 mr-2" /> Plantilla
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{tipEditingId ? "Editar Plantilla" : "Añadir Plantilla"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSaveTip} className="space-y-4 pt-4">
                <div className="space-y-2"><Label>Nombre (Asunto/Motivo)</Label><Input value={tipNombre} onChange={(e) => setTipNombre(e.target.value)} placeholder="Ej. Aviso de Devolución" required /></div>
                <div className="space-y-2">
                  <Label>Plantilla de Mensaje</Label>
                  <Textarea value={tipPlantilla} onChange={(e) => setTipPlantilla(e.target.value)} rows={5} placeholder="Hola {Usuario}, por favor devuelve {Herramienta}." required />
                  <p className="text-xs text-muted-foreground">Variables permitidas: {'{Usuario}'}, {'{Herramienta}'}</p>
                </div>
                <div className="flex justify-end gap-2 pt-4"><Button variant="outline" type="button" onClick={() => setOpenTip(false)}>Cancelar</Button><Button type="submit">Guardar</Button></div>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </div>
      <ConfirmDialog confirmState={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
      
      <Tabs defaultValue="categorias" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 overflow-x-auto">
          <TabsTrigger value="categorias">Categorías</TabsTrigger>
          <TabsTrigger value="ubicaciones">Ubicaciones</TabsTrigger>
          <TabsTrigger value="departamentos">Departamentos</TabsTrigger>
          <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
          <TabsTrigger value="kits">Kits</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categorias" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categorias.length === 0 ? <div className="col-span-full p-8 text-center border rounded-xl bg-card text-muted-foreground">No hay categorías.</div> : categorias.map((c) => {
              const IconComp = ICON_MAP[c.Icono] || Wrench;
              return (
                <div key={c.ID} className="rounded-xl border bg-card shadow hover:shadow-md flex items-center justify-between p-4 group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.Color || '#3b82f6'}20` }}><IconComp className="h-5 w-5" style={{ color: c.Color || '#3b82f6' }} /></div>
                    <span className="font-semibold">{c.Nombre}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button title="Editar" variant="ghost" size="icon" onClick={() => handleOpenEdit(c)} className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"><Edit className="h-4 w-4" /></Button>
                    <Button title="Eliminar" variant="ghost" size="icon" onClick={() => handleDelete(c.ID)} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="ubicaciones" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {ubicaciones.length === 0 ? <div className="col-span-full p-8 text-center border rounded-xl bg-card text-muted-foreground">No hay ubicaciones.</div> : ubicaciones.map((u) => (
              <div key={u.ID} className="rounded-xl border bg-card shadow hover:shadow-md flex items-center justify-between p-4 group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-500/10 text-green-600"><MapPin className="h-5 w-5" /></div>
                  <span className="font-semibold">{u.Nombre}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button title="Editar" variant="ghost" size="icon" onClick={() => handleOpenEditUbi(u)} className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"><Edit className="h-4 w-4" /></Button>
                  <Button title="Eliminar" variant="ghost" size="icon" onClick={() => handleDeleteUbi(u.ID)} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="departamentos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {departamentos.length === 0 ? <div className="col-span-full p-8 text-center border rounded-xl bg-card text-muted-foreground">No hay departamentos.</div> : departamentos.map((d) => {
              const IconComp = ICON_MAP[d.Icono] || Users;
              return (
                <div key={d.ID} className="rounded-xl border bg-card shadow hover:shadow-md flex items-center justify-between p-4 group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-600"><IconComp className="h-5 w-5" /></div>
                    <span className="font-semibold">{d.Nombre}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button title="Editar" variant="ghost" size="icon" onClick={() => handleOpenEditDep(d)} className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"><Edit className="h-4 w-4" /></Button>
                    <Button title="Eliminar" variant="ghost" size="icon" onClick={() => handleDeleteDep(d.ID)} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="plantillas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tiposRecordatorios.length === 0 ? <div className="col-span-full p-8 text-center border rounded-xl bg-card text-muted-foreground">No hay plantillas.</div> : tiposRecordatorios.map((t) => (
              <div key={t.ID} className="rounded-xl border bg-card shadow hover:shadow-md flex flex-col p-4 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-orange-500/10 text-orange-600"><MessageSquare className="h-4 w-4" /></div>
                    <span className="font-semibold text-sm">{t.Nombre}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button title="Editar" variant="ghost" size="icon" onClick={() => handleOpenEditTip(t)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"><Edit className="h-3 w-3" /></Button>
                    <Button title="Eliminar" variant="ghost" size="icon" onClick={() => handleDeleteTip(t.ID)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md italic line-clamp-3">
                  "{t.Plantilla}"
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kits" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold">Kits Predefinidos</h2>
              <p className="text-sm text-muted-foreground">Grupos de herramientas para asignar en bloque.</p>
            </div>
            <Dialog open={openKit} onOpenChange={setOpenKit}>
              <DialogTrigger render={
                <Button onClick={() => {
                  setKitEditingId(null);
                  setKitNombre("");
                  setKitTools([]);
                }}>
                  <Plus className="h-4 w-4 mr-2" /> Nuevo Kit
                </Button>
              } />
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader><DialogTitle>{kitEditingId ? "Editar Kit" : "Añadir Kit"}</DialogTitle></DialogHeader>
                <form onSubmit={handleSaveKit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="kitNombre">Nombre del Kit</Label>
                    <Input id="kitNombre" value={kitNombre} onChange={(e) => setKitNombre(e.target.value)} required placeholder="Ej: Kit Electricista" />
                  </div>
                  <div className="space-y-2">
                    <Label>Herramientas del Kit</Label>
                    <div className="flex gap-2 mb-2">
                      <select 
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                        onChange={(e) => {
                          if (e.target.value && !kitTools.includes(e.target.value)) {
                            setKitTools([...kitTools, e.target.value]);
                          }
                          e.target.value = "";
                        }}
                      >
                        <option value="">-- Añadir herramienta --</option>
                        {toolNames?.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[100px] p-2 border rounded-md">
                      {kitTools.length === 0 && <p className="text-xs text-muted-foreground">No hay herramientas en este kit.</p>}
                      {kitTools.map((t, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                          {t}
                          <button type="button" onClick={() => setKitTools(kitTools.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-foreground">
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" type="button" onClick={() => setOpenKit(false)}>Cancelar</Button>
                    <Button type="submit">Guardar Kit</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {kits.length === 0 ? <div className="col-span-full p-8 text-center border rounded-xl bg-card text-muted-foreground">No hay kits predefinidos configurados.</div> : kits.map((k: any) => (
              <div key={k.id} className="rounded-xl border bg-card shadow hover:shadow-md flex flex-col p-4 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-600"><Package className="h-4 w-4" /></div>
                    <span className="font-semibold text-sm">{k.nombre}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button title="Editar" variant="ghost" size="icon" onClick={() => handleOpenEditKit(k)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-muted"><Edit className="h-3 w-3" /></Button>
                    <Button title="Eliminar" variant="ghost" size="icon" onClick={() => handleDeleteKit(k.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {k.herramientas?.map((ht: string, idx: number) => (
                    <span key={idx} className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-sm">{ht}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
