"use client";

import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { AlertCircle, TrendingDown, Package, DollarSign } from "lucide-react";

export function DashboardClient({
  totalValue,
  totalLostValue,
  totalBrokenValue,
  categoryChartData,
  topLossUsersData
}: {
  totalValue: number;
  totalLostValue: number;
  totalBrokenValue: number;
  categoryChartData: any[];
  topLossUsersData: any[];
}) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a28bfe', '#fd79a8'];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Analítica de Costes (ROI)</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Valor Total Inventario</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">€{totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Capital invertido en herramientas</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow border-red-500/20 bg-red-50/50 dark:bg-red-950/10">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-red-800 dark:text-red-400">Pérdidas Acumuladas</h3>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-red-600">€{totalLostValue.toFixed(2)}</div>
            <p className="text-xs text-red-600/80">Por herramientas extraviadas</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow border-orange-500/20 bg-orange-50/50 dark:bg-orange-950/10">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-orange-800 dark:text-orange-400">Coste por Averías</h3>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-orange-600">€{totalBrokenValue.toFixed(2)}</div>
            <p className="text-xs text-orange-600/80">Herramientas rotas/averiadas</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-1 lg:col-span-4">
          <div className="p-6 pb-2">
            <h3 className="font-semibold leading-none tracking-tight">Inversión por Categoría</h3>
            <p className="text-sm text-muted-foreground mt-1">Distribución del capital</p>
          </div>
          <div className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => [`€${value.toFixed(2)}`, 'Inversión']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-1 lg:col-span-3">
          <div className="p-6 pb-2">
            <h3 className="font-semibold leading-none tracking-tight">Top Empleados con Pérdidas/Roturas</h3>
            <p className="text-sm text-muted-foreground mt-1">Valor de herramientas perdidas o rotas por usuario</p>
          </div>
          <div className="p-6 h-[300px]">
            {topLossUsersData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Package className="h-8 w-8 mb-2 opacity-20" />
                <p>No hay registro de pérdidas o roturas.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topLossUsersData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} formatter={(value: number) => [`€${value.toFixed(2)}`, 'Coste Total']} />
                  <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
