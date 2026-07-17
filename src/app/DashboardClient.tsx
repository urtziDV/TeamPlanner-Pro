"use client";

import { Handshake, CheckSquare, Wrench, AlertTriangle, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

export function DashboardClient({ 
  totalTools, 
  loanedTools, 
  activeProjects, 
  totalIncidents,
  latestProjects,
  latestLoans,
  inventoryStats
}: {
  totalTools: number;
  loanedTools: number;
  activeProjects: number;
  totalIncidents: number;
  latestProjects: any[];
  latestLoans: any[];
  inventoryStats: any[];
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

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 overflow-y-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
          Dashboard
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* KPI Cards */}
        <div className="rounded-2xl border bg-card/50 glass p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wrench className="w-24 h-24" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4" /> Total Herramientas
            </span>
            <span className="text-4xl font-bold">{totalTools}</span>
            <span className="text-xs text-muted-foreground mt-2">Registradas en inventario</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-card/50 glass p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-500">
            <Handshake className="w-24 h-24" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-sm font-medium text-blue-500/80 flex items-center gap-2">
              <Handshake className="h-4 w-4" /> En Préstamo
            </span>
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-500">{loanedTools}</span>
            <span className="text-xs text-muted-foreground mt-2">Asignaciones activas</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-card/50 glass p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-green-500">
            <CheckSquare className="w-24 h-24" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-sm font-medium text-green-500/80 flex items-center gap-2">
              <CheckSquare className="h-4 w-4" /> Proyectos
            </span>
            <span className="text-4xl font-bold text-green-600 dark:text-green-500">{activeProjects}</span>
            <span className="text-xs text-muted-foreground mt-2">En curso o preparación</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-card/50 glass p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-orange-500">
            <AlertTriangle className="w-24 h-24" />
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-sm font-medium text-orange-500/80 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Incidentes
            </span>
            <span className="text-4xl font-bold text-orange-600 dark:text-orange-500">{totalIncidents}</span>
            <span className="text-xs text-muted-foreground mt-2">Averías registradas</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        
        {/* Main Chart */}
        <div className="rounded-2xl border bg-card/50 glass shadow-sm col-span-1 lg:col-span-4 flex flex-col">
          <div className="p-6 pb-2 border-b/50">
            <h3 className="font-semibold text-lg">Estado del Inventario</h3>
            <p className="text-sm text-muted-foreground">Distribución actual de herramientas</p>
          </div>
          <div className="p-6 flex-1 min-h-[300px]">
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
          <div className="p-6 pb-2 flex items-center justify-between border-b/50">
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

      {/* Latest Activity Timeline */}
      <div className="rounded-2xl border bg-card/50 glass shadow-sm flex flex-col">
        <div className="p-6 pb-4 border-b/50">
          <h3 className="font-semibold text-lg">Actividad de Préstamos</h3>
          <p className="text-sm text-muted-foreground">Herramientas asignadas recientemente</p>
        </div>
        <div className="p-6">
          {latestLoans.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">No hay préstamos recientes.</div>
          ) : (
            <div className="space-y-6">
              {latestLoans.map((loan: any, i: number) => (
                <div key={loan.ID} className="flex gap-4 relative">
                  {/* Line */}
                  {i !== latestLoans.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-[-24px] w-px bg-border/80" />
                  )}
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm text-blue-500">
                    <Handshake className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col pt-1.5 w-full">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-medium leading-none">
                        {loan.Usuario} ha retirado <span className="font-semibold text-primary">{loan.Herramienta}</span>
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {loan.Fecha_Entrega}
                      </span>
                    </div>
                    {loan.Motivo && (
                      <p className="text-xs text-muted-foreground mt-1.5 bg-muted/50 p-2 rounded-md border border-border/50 inline-block">
                        {loan.Motivo}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
