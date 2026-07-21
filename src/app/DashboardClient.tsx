"use client";

import { Handshake, CheckSquare, Wrench, AlertTriangle, ArrowRight, ArrowUpRight, Inbox, Truck, AlertCircle, Users, PlusCircle, DollarSign, Receipt } from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Button } from "@/components/ui/button";

export function DashboardClient({ 
  totalTools, 
  loanedTools, 
  activeProjects, 
  totalIncidents,
  totalRequests,
  activeVehicles,
  totalInvested,
  totalCostBroken,
  latestProjects,
  latestLoans,
  latestIncidents,
  topUsers,
  inventoryStats,
  maintenanceAlerts
}: {
  totalTools: number;
  loanedTools: number;
  activeProjects: number;
  totalIncidents: number;
  totalRequests: number;
  activeVehicles: number;
  totalInvested: number;
  totalCostBroken: number;
  latestProjects: any[];
  latestLoans: any[];
  latestIncidents: any[];
  topUsers: any[];
  inventoryStats: any[];
  maintenanceAlerts?: any[];
}) {
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border p-3 rounded-lg shadow-xl text-sm">
          <p className="font-medium text-foreground mb-1">{label}</p>
          <p className="text-primary font-semibold">
            {payload[0].value} herramientas
          </p>
        </div>
      );
    }
    return null;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 overflow-y-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
          Dashboard
        </h2>
        <div className="flex gap-2 flex-wrap">
          <Link href="/requests">
            <Button variant="outline" className="gap-2 border-orange-200 bg-orange-50/50 text-orange-700 hover:bg-orange-100 hover:text-orange-800">
              <Inbox className="h-4 w-4" /> Buzón
              {totalRequests > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">{totalRequests}</span>}
            </Button>
          </Link>
          <Link href="/requests?new=true">
            <Button variant="outline" className="gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
              <PlusCircle className="h-4 w-4" /> Nueva Solicitud
            </Button>
          </Link>
          <Link href="/loans">
            <Button title="Asignar / Prestar" className="gap-2 shadow-md">
              <Handshake className="h-4 w-4" /> Nuevo Préstamo
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* KPI Cards */}
        <div className="rounded-2xl border bg-card/50 glass p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wrench className="w-16 h-16" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4" /> Herramientas
            </span>
            <span className="text-3xl font-bold">{totalTools}</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-card/50 glass p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-500">
            <Handshake className="w-16 h-16" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-sm font-medium text-blue-500/80 flex items-center gap-2">
              <Handshake className="h-4 w-4" /> En Préstamo
            </span>
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-500">{loanedTools}</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-card/50 glass p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
            <DollarSign className="w-16 h-16" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-sm font-medium text-emerald-600/80 flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Valor Inventario
            </span>
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{formatCurrency(totalInvested)}</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-card/50 glass p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-rose-500">
            <Receipt className="w-16 h-16" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-sm font-medium text-rose-500/80 flex items-center gap-2">
              <Receipt className="h-4 w-4" /> Costo Averías
            </span>
            <span className="text-3xl font-bold text-rose-600 dark:text-rose-500">{formatCurrency(totalCostBroken)}</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-card/50 glass p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-orange-500">
            <Inbox className="w-16 h-16" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-sm font-medium text-orange-500/80 flex items-center gap-2">
              <Inbox className="h-4 w-4" /> Solicitudes
            </span>
            <span className="text-3xl font-bold text-orange-600 dark:text-orange-500">{totalRequests}</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-card/50 glass p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-red-500">
            <AlertTriangle className="w-16 h-16" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-sm font-medium text-red-500/80 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Incidentes
            </span>
            <span className="text-3xl font-bold text-red-600 dark:text-red-500">{totalIncidents}</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-card/50 glass p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-green-500">
            <CheckSquare className="w-16 h-16" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-sm font-medium text-green-500/80 flex items-center gap-2">
              <CheckSquare className="h-4 w-4" /> Proyectos
            </span>
            <span className="text-3xl font-bold text-green-600 dark:text-green-500">{activeProjects}</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-card/50 glass p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-purple-500">
            <Truck className="w-16 h-16" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-sm font-medium text-purple-500/80 flex items-center gap-2">
              <Truck className="h-4 w-4" /> Vehículos
            </span>
            <span className="text-3xl font-bold text-purple-600 dark:text-purple-500">{activeVehicles}</span>
          </div>
        </div>
      </div>

      {maintenanceAlerts && maintenanceAlerts.length > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50/30 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-lg text-orange-800">Alertas de Mantenimiento y Calibración</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {maintenanceAlerts.map((alert, i) => (
              <div key={i} className="bg-white dark:bg-card p-4 rounded-xl border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm line-clamp-1" title={alert.toolName}>{alert.toolName}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${alert.isOverdue ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {alert.isOverdue ? 'Caducado' : 'Próximo'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex justify-between">
                  <span>{alert.type}</span>
                  <span className="font-medium">
                    {alert.isOverdue 
                      ? `Hace ${Math.abs(alert.daysRemaining)} días` 
                      : `En ${alert.daysRemaining} días`}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">

        
        {/* Main Chart */}
        <div className="rounded-2xl border bg-card/50 glass shadow-sm col-span-1 lg:col-span-4 flex flex-col">
          <div className="p-5 pb-2 border-b/50">
            <h3 className="font-semibold text-lg">Estado del Inventario</h3>
            <p className="text-sm text-muted-foreground">Distribución actual de herramientas</p>
          </div>
          <div className="p-5 flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--muted)', opacity: 0.4}} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {inventoryStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Projects */}
        <div className="rounded-2xl border bg-card/50 glass shadow-sm col-span-1 lg:col-span-3 flex flex-col">
          <div className="p-5 pb-2 flex items-center justify-between border-b/50">
            <div>
              <h3 className="font-semibold text-lg">Proyectos Recientes</h3>
              <p className="text-sm text-muted-foreground">Última actividad</p>
            </div>
            <Link href="/projects" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-0 flex-1">
            {latestProjects.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No hay proyectos activos.</div>
            ) : (
              <div className="divide-y divide-border/50">
                {latestProjects.map((p: any) => (
                  <Link href={`/projects/${p.ID}`} key={p.ID} className="flex flex-col p-4 hover:bg-muted/30 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium group-hover:text-primary transition-colors flex items-center gap-1">
                        {p.Nombre} <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {p.Estado || "En Curso"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckSquare className="h-3 w-3" /> {p.Ubicacion}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Tri-Column Lower Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        
        {/* Latest Loans */}
        <div className="rounded-2xl border bg-card/50 glass shadow-sm flex flex-col">
          <div className="p-5 pb-4 border-b/50 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2"><Handshake className="w-5 h-5 text-blue-500" /> Préstamos</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Asignaciones recientes</p>
            </div>
          </div>
          <div className="p-5">
            {latestLoans.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">No hay préstamos recientes.</div>
            ) : (
              <div className="space-y-4">
                {latestLoans.map((loan: any) => (
                  <div key={loan.ID} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                      {loan.Usuario?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{loan.Herramienta}</p>
                      <p className="text-xs text-muted-foreground truncate">{loan.Usuario}</p>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">{loan.Fecha_Entrega}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Users */}
        <div className="rounded-2xl border bg-card/50 glass shadow-sm flex flex-col">
          <div className="p-5 pb-4 border-b/50 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2"><Users className="w-5 h-5 text-green-500" /> Top Usuarios</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Con más material en uso</p>
            </div>
          </div>
          <div className="p-5">
            {topUsers.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">Nadie tiene material asignado.</div>
            ) : (
              <div className="space-y-4">
                {topUsers.map((u: any, idx: number) => (
                  <div key={u.Usuario} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-4">{idx + 1}.</span>
                      <p className="text-sm font-medium">{u.Usuario}</p>
                    </div>
                    <span className="text-xs font-bold bg-muted px-2 py-1 rounded-md">
                      {u.count} uds.
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Latest Incidents */}
        <div className="rounded-2xl border bg-card/50 glass shadow-sm flex flex-col">
          <div className="p-5 pb-4 border-b/50 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500" /> Incidentes</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Últimas averías reportadas</p>
            </div>
            <Link href="/incidents" className="text-xs text-primary hover:underline">Ver todos</Link>
          </div>
          <div className="p-5">
            {latestIncidents.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">No hay incidentes recientes.</div>
            ) : (
              <div className="space-y-4">
                {latestIncidents.map((inc: any) => (
                  <div key={inc.ID} className="flex flex-col gap-1 border-l-2 border-red-500 pl-3 py-0.5">
                    <p className="text-sm font-medium">{inc.Herramienta}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{inc.Tipo} • {inc.Usuario || "N/A"}</span>
                      <span className="text-xs text-muted-foreground">{inc.Fecha?.split('T')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
