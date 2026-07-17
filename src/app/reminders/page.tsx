import { prisma } from "@/lib/prisma";
import { Bell, Plus, Send } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const historial = await prisma.historialRecordatorios.findMany({
    orderBy: { Fecha: 'desc' },
    take: 50
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Recordatorios y Envíos</h2>
        <div className="flex items-center space-x-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            <Send className="h-4 w-4 mr-2" />
            Nuevo Envío
          </button>
        </div>
      </div>
      
      <div className="rounded-md border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold leading-none tracking-tight">Historial de Envíos Recientes</h3>
          <p className="text-sm text-muted-foreground mt-1">Registro de todas las notificaciones enviadas a operarios.</p>
        </div>
        
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Fecha</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Empleado</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tipo</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Vía</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {historial.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">No hay envíos registrados.</td>
                </tr>
              ) : (
                historial.map((h) => (
                  <tr key={h.ID} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{h.Fecha}</td>
                    <td className="p-4 align-middle">{h.Empleado}</td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">
                        {h.Tipo}
                      </span>
                    </td>
                    <td className="p-4 align-middle flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      {h.Via}
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
