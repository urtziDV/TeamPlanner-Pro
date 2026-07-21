"use client";

import { useState } from "react";
import { MailQuestion, Check, Trash2, Search, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteSolicitud, createAsignacion } from "@/app/actions";
import { useConfirm, ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { createSolicitud } from "@/app/actions";

export function RequestsClient({ initialRequests, tools = [], users = [] }: { initialRequests: any[], tools?: any[], users?: any[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<"name_asc" | "name_desc" | "user_asc" | "date_desc">("date_desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [currentReq, setCurrentReq] = useState<any>(null);
  const [assignData, setAssignData] = useState({ Herramienta_ID: "", Motivo: "Asignación desde Solicitud", Fecha_Limite: "" });
  const [newReqOpen, setNewReqOpen] = useState(false);
  const [newReqData, setNewReqData] = useState({ Herramienta: "", Usuario: "" });
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setNewReqOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("new");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, router, pathname]);

  const filteredRequests = [...requests].filter(req => 
    (req.Herramienta?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    (req.Usuario?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortMode === "name_asc") return (a.Herramienta || "").localeCompare(b.Herramienta || "");
    if (sortMode === "name_desc") return (b.Herramienta || "").localeCompare(a.Herramienta || "");
    if (sortMode === "user_asc") return (a.Usuario || "").localeCompare(b.Usuario || "");
    if (sortMode === "date_desc") {
      const d1 = new Date(b.Fecha || "").getTime();
      const d2 = new Date(a.Fecha || "").getTime();
      return d1 - d2 || 0;
    }
    return 0;
  });

  // Group requests by tool name
  const groupedRequests = requests.reduce((acc: any, req: any) => {
    const tool = req.Herramienta || "Desconocida";
    acc[tool] = (acc[tool] || 0) + 1;
    return acc;
  }, {});

  const groupedArray = Object.entries(groupedRequests).sort((a: any, b: any) => b[1] - a[1]);

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Eliminar Solicitud",
      message: "¿Marcar solicitud como eliminada?",
      variant: "destructive",
      confirmLabel: "Eliminar"
    });
    if (ok) {
      await deleteSolicitud(id);
      setRequests(requests.filter(r => r.ID !== id));
    }
  };

  const handleDeliver = (req: any) => {
    setCurrentReq(req);
    const matchTool = tools.find(t => t.Nombre.toLowerCase() === (req.Herramienta || "").toLowerCase());
    setAssignData({ Herramienta_ID: matchTool ? matchTool.ID : "", Motivo: "Asignación desde Solicitud", Fecha_Limite: "" });
    setAssignOpen(true);
  };

  const confirmDeliver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignData.Herramienta_ID || !currentReq) return;
    
    const userMatch = users.find(u => u.Nombre.toLowerCase() === currentReq.Usuario.toLowerCase());
    if (!userMatch) {
      alert("Usuario no encontrado en la base de datos.");
      return;
    }
    
    const toolMatch = tools.find(t => t.ID === assignData.Herramienta_ID);
    
    await createAsignacion({
      Herramienta_ID: assignData.Herramienta_ID,
      Herramienta: toolMatch?.Nombre || "Desconocida",
      Usuario_ID: userMatch.ID,
      Usuario: userMatch.Nombre,
      Motivo: assignData.Motivo,
      Fecha_Limite: assignData.Fecha_Limite || undefined
    });
    
    await deleteSolicitud(currentReq.ID);
    setRequests((prev: any[]) => prev.filter(r => r.ID !== currentReq.ID));
    setAssignOpen(false);
    setCurrentReq(null);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqData.Herramienta || !newReqData.Usuario) return;
    const newReq = await createSolicitud(newReqData);
    setRequests((prev: any[]) => [newReq, ...prev]);
    setNewReqOpen(false);
    setNewReqData({ Herramienta: "", Usuario: "" });
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Buzón de Solicitudes</h2>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto flex gap-2">
            <Button onClick={() => setNewReqOpen(true)} className="gap-2 shrink-0">
              <PlusCircle className="h-4 w-4" /> Nueva Solicitud
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:w-[250px]" 
              />
            </div>
          </div>
          <div className="flex items-center gap-4 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
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
      </div>

      <Dialog open={newReqOpen} onOpenChange={setNewReqOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Nueva Solicitud</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRequest} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="req_herramienta">Herramienta / Material</Label>
              <Input 
                id="req_herramienta" 
                list="tools-list-req"
                value={newReqData.Herramienta} 
                onChange={(e) => setNewReqData({...newReqData, Herramienta: e.target.value})} 
                placeholder="Escribe o elige de la lista..."
                required
              />
              <datalist id="tools-list-req">
                {tools.map(t => (
                  <option key={t.ID} value={`${t.Nombre} ${t.ID_Interno ? `[SN: ${t.ID_Interno}]` : ''}`.trim()} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="req_usuario">Usuario Solicitante</Label>
              <Input 
                id="req_usuario" 
                list="users-list-req"
                value={newReqData.Usuario} 
                onChange={(e) => setNewReqData({...newReqData, Usuario: e.target.value})} 
                placeholder="Escribe o elige de la lista..."
                required
              />
              <datalist id="users-list-req">
                {users.map(u => (
                  <option key={u.ID} value={u.Nombre} />
                ))}
              </datalist>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setNewReqOpen(false)}>Cancelar</Button>
              <Button type="submit">Añadir Solicitud</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {groupedArray.length > 0 && (
        <div className="rounded-xl border bg-card p-4 shadow-sm mb-6">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Resumen de Solicitudes Pendientes</h3>
          <div className="flex flex-wrap gap-2">
            {groupedArray.map(([toolName, count]: any) => (
              <button 
                key={toolName} 
                onClick={() => setSelectedGroup(toolName)}
                className="p-2 rounded-lg bg-muted flex items-center justify-between gap-3 border hover:border-primary/50 transition-colors text-left min-w-[140px]"
              >
                <span className="text-sm font-medium leading-tight line-clamp-2">{toolName}</span>
                <span className="text-lg font-bold text-primary">{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.length === 0 ? (
            <div className="col-span-full p-8 text-center border rounded-xl bg-card text-muted-foreground">
              No hay solicitudes encontradas.
            </div>
          ) : (
            filteredRequests.map((sol) => {
              const toolDetails = tools.find(t => t.Nombre.toLowerCase() === (sol.Herramienta || "").toLowerCase());
              return (
              <div key={sol.ID} className="relative rounded-xl border bg-card text-card-foreground shadow overflow-hidden group hover:border-primary/50 transition-colors">
                <div className="p-4 flex items-start gap-4">
                  <div className="h-16 w-16 rounded-lg bg-white border flex items-center justify-center shrink-0 overflow-hidden p-1">
                    {toolDetails?.Imagen_URL ? (
                      <img src={toolDetails.Imagen_URL} alt={sol.Herramienta} className="h-full w-full object-contain" />
                    ) : (
                      <MailQuestion className="h-6 w-6 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold leading-none tracking-tight truncate" title={sol.Herramienta}>{sol.Herramienta}</h3>
                    <p className="text-sm text-muted-foreground mt-1 truncate">Por: <span className="font-medium text-foreground">{sol.Usuario}</span></p>
                    <p className="text-xs text-muted-foreground mt-1">{sol.Fecha.split('T')[0]}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end shrink-0">
                    <Button title="Confirmar / Entregar" variant="outline" size="sm" className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200" onClick={() => handleDeliver(sol)}>
                      <Check className="h-4 w-4 mr-1" /> Atender
                    </Button>
                    <Button title="Eliminar" variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-destructive w-full justify-end px-2" onClick={() => handleDelete(sol.ID)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Borrar
                    </Button>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>
      ) : (
        <div className="rounded-md border bg-card overflow-hidden">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b bg-muted/50">
              <tr>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Fecha</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Herramienta</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Solicitado Por</th>
                <th className="h-10 px-4 text-right font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">No hay solicitudes encontradas.</td>
                </tr>
              ) : (
                filteredRequests.map((sol) => {
                  const toolDetails = tools.find(t => t.Nombre.toLowerCase() === (sol.Herramienta || "").toLowerCase());
                  return (
                  <tr key={sol.ID} className="border-b transition-colors hover:bg-muted/50 group">
                    <td className="p-4 align-middle text-muted-foreground">{sol.Fecha.split('T')[0]}</td>
                    <td className="p-4 align-middle font-medium flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-white border flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                        {toolDetails?.Imagen_URL ? (
                          <img src={toolDetails.Imagen_URL} alt={sol.Herramienta} className="h-full w-full object-contain" />
                        ) : (
                          <MailQuestion className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      {sol.Herramienta}
                    </td>
                    <td className="p-4 align-middle">{sol.Usuario}</td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button title="Confirmar / Entregar" variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleDeliver(sol)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button title="Eliminar" variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(sol.ID)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog confirmState={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />

      {/* Dialog for grouped requests */}
      <Dialog open={!!selectedGroup} onOpenChange={(open) => !open && setSelectedGroup(null)}>
        <DialogContent className="sm:max-w-4xl w-[95vw]">
          <DialogHeader>
            <DialogTitle>Solicitudes Pendientes</DialogTitle>
          </DialogHeader>
          
          {(() => {
            const toolDetails = tools.find(t => t.Nombre.toLowerCase() === (selectedGroup || "").toLowerCase());
            return (
              <div className="flex flex-col gap-6">
                {/* Tool Info Card */}
                <div className="flex items-center gap-5 p-5 border rounded-2xl bg-card shadow-sm">
                  <div className="h-20 w-20 rounded-xl bg-white border flex items-center justify-center shrink-0 overflow-hidden p-2 shadow-inner">
                    {toolDetails?.Imagen_URL ? (
                      <img src={toolDetails.Imagen_URL} alt={selectedGroup || ""} className="h-full w-full object-contain" />
                    ) : (
                      <MailQuestion className="h-8 w-8 text-orange-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl">{selectedGroup}</h3>
                    {toolDetails && (
                      <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10">
                          {toolDetails.Categoria || "Sin categoría"}
                        </span>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${toolDetails.Estado === 'Disponible' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'}`}>
                          {toolDetails.Estado}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Requests List */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Solicitantes</h4>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                      {requests.filter(r => r.Herramienta === selectedGroup).length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[55vh] overflow-y-auto p-1">
                    {requests.filter(r => r.Herramienta === selectedGroup).map(sol => (
                      <div key={sol.ID} className="flex flex-col p-4 border rounded-xl bg-muted/20 transition-all hover:bg-muted/50 hover:shadow-md gap-3">
                        <div>
                          <p className="font-semibold text-base line-clamp-1" title={sol.Usuario}>{sol.Usuario}</p>
                          <p className="text-xs text-muted-foreground mt-1">{sol.Fecha.split('T')[0]} {sol.Fecha.split('T')[1] ? `• ${sol.Fecha.split('T')[1].substring(0,5)}` : ''}</p>
                        </div>
                        <div className="flex gap-2 mt-auto pt-2">
                          <Button title="Confirmar / Entregar" variant="outline" size="sm" className="flex-1 text-green-700 hover:text-green-800 hover:bg-green-100 border-green-200 bg-green-50/50" onClick={() => { setSelectedGroup(null); handleDeliver(sol); }}>
                            <Check className="h-4 w-4 mr-1.5" /> Entregar
                          </Button>
                          <Button title="Eliminar" variant="outline" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-red-50 bg-white" onClick={() => { setSelectedGroup(null); handleDelete(sol.ID); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Dialog for Assigning */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entregar y Asignar Herramienta</DialogTitle>
          </DialogHeader>
          <form onSubmit={confirmDeliver} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Solicitante</Label>
              <Input value={currentReq?.Usuario || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Herramienta a entregar</Label>
              <select 
                value={assignData.Herramienta_ID} 
                onChange={(e) => setAssignData({...assignData, Herramienta_ID: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">-- Seleccionar herramienta --</option>
                {tools.map(t => {
                  let displaySN = "";
                  if (t.SN) {
                    const sns = t.SN.split(',').map((s: string) => s.trim()).filter(Boolean);
                    if (sns.length > 1) {
                      displaySN = ` (SN: ${sns[0]} +${sns.length - 1} más)`;
                    } else if (sns.length === 1) {
                      displaySN = ` (SN: ${sns[0]})`;
                    }
                  }
                  return (
                    <option key={t.ID} value={t.ID}>{t.Nombre}{displaySN}</option>
                  );
                })}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Motivo (Opcional)</Label>
              <Input 
                value={assignData.Motivo} 
                onChange={(e) => setAssignData({...assignData, Motivo: e.target.value})} 
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
                      !assignData.Fecha_Limite && "text-muted-foreground"
                    )}
                  />
                }>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {assignData.Fecha_Limite ? format(new Date(assignData.Fecha_Limite + "T12:00:00Z"), "PPP", { locale: es }) : <span>Selecciona una fecha...</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={assignData.Fecha_Limite ? new Date(assignData.Fecha_Limite + "T12:00:00Z") : undefined}
                    onSelect={(d) => setAssignData({...assignData, Fecha_Limite: d ? format(d, 'yyyy-MM-dd') : ""})}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setAssignOpen(false)}>Cancelar</Button>
              <Button type="submit">Confirmar Entrega</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
