import { prisma } from "@/lib/prisma";
import { Bell, AlertCircle, Clock, CalendarDays, Send } from "lucide-react";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { EmailButton } from "@/components/EmailButton";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const historial = await prisma.historialRecordatorios.findMany({
    orderBy: { Fecha: 'desc' },
    take: 50
  });

  const activeLoans = await prisma.asignaciones.findMany({
    where: {
      OR: [
        { Estado: 'Activa' },
        { Estado: null },
        { Estado: '' }
      ]
    }
  });

  const allUsers = await prisma.usuarios.findMany();
  const usersByName = new Map(allUsers.map(u => [u.Nombre, u]));

  // Parse dates to find overdue or upcoming
  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    const partsDash = dateStr.split('-');
    if (partsDash.length === 3) {
      return new Date(parseInt(partsDash[0]), parseInt(partsDash[1]) - 1, parseInt(partsDash[2]));
    }
    return new Date(dateStr);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const pendingReturns = activeLoans
    .filter(loan => loan.Fecha_Limite && loan.Fecha_Limite.trim() !== '')
    .map(loan => {
      const limitDate = parseDate(loan.Fecha_Limite!);
      const isOverdue = limitDate ? limitDate < today : false;
      const daysDiff = limitDate ? Math.ceil((limitDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : 999;
      const userRecord = loan.Usuario ? usersByName.get(loan.Usuario) : null;
      return { ...loan, limitDate, isOverdue, daysDiff, phone: userRecord?.Telefono, email: userRecord?.Email };
    })
    .filter(loan => loan.daysDiff <= 7) // Show overdue and due within 7 days
    .sort((a, b) => a.daysDiff - b.daysDiff);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 overflow-y-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
          Recordatorios
        </h2>
        <div className="flex gap-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            <Send className="h-4 w-4 mr-2" />
            Nuevo Envío
          </button>
        </div>
      </div>
      
      <div className="grid gap-8 grid-cols-1 xl:grid-cols-2">
        {/* Devoluciones Pendientes */}
        <div className="rounded-2xl border bg-card/50 glass shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b/50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Devoluciones Pendientes
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Préstamos retrasados o próximos a vencer.</p>
            </div>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
              {pendingReturns.length}
            </span>
          </div>
          <div className="p-0 flex-1 overflow-auto max-h-[500px]">
            {pendingReturns.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                  <CalendarDays className="h-6 w-6 text-muted-foreground/50" />
                </div>
                No hay devoluciones pendientes próximas o retrasadas.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0 backdrop-blur-md z-10">
                  <tr>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Herramienta</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Usuario</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Límite</th>
                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">Estado / Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReturns.map(loan => (
                    <tr key={loan.ID} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{loan.Herramienta}</td>
                      <td className="p-4 text-muted-foreground">{loan.Usuario}</td>
                      <td className="p-4">{loan.Fecha_Limite}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {loan.isOverdue ? (
                            <span className="inline-flex items-center rounded-md border border-red-500/20 bg-red-500/10 text-red-500 px-2 py-1 text-xs font-semibold whitespace-nowrap">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Retrasado ({Math.abs(loan.daysDiff)}d)
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md border border-orange-500/20 bg-orange-500/10 text-orange-600 px-2 py-1 text-xs font-semibold whitespace-nowrap">
                              En {loan.daysDiff} día(s)
                            </span>
                          )}
                          <WhatsAppButton 
                            phone={loan.phone} 
                            toolName={loan.Herramienta || 'Herramienta'} 
                            userName={loan.Usuario || 'Usuario'}
                            daysOverdue={loan.isOverdue ? Math.abs(loan.daysDiff) : 0}
                          />
                          <EmailButton 
                            email={loan.email} 
                            toolName={loan.Herramienta || 'Herramienta'} 
                            userName={loan.Usuario || 'Usuario'}
                            daysOverdue={loan.isOverdue ? Math.abs(loan.daysDiff) : 0}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Historial de Envíos */}
        <div className="rounded-2xl border bg-card/50 glass shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b/50">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Historial de Envíos
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Registro de notificaciones enviadas a operarios.</p>
          </div>
          <div className="p-0 flex-1 overflow-auto max-h-[500px]">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0 backdrop-blur-md z-10">
                <tr>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Fecha</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Empleado</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Tipo</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Vía</th>
                </tr>
              </thead>
              <tbody>
                {historial.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                        <Send className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      No hay envíos registrados.
                    </td>
                  </tr>
                ) : (
                  historial.map((h) => (
                    <tr key={h.ID} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{h.Fecha}</td>
                      <td className="p-4">{h.Empleado}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold bg-muted">
                          {h.Tipo}
                        </span>
                      </td>
                      <td className="p-4 flex items-center gap-2 text-muted-foreground">
                        <Bell className="h-4 w-4" />
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
    </div>
  );
}
