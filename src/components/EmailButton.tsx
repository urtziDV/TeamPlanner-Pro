"use client";

import { Mail } from "lucide-react";
import { sendEmailAction, logReminderAction } from "@/app/actions";
import { toast } from "sonner";
import { useState } from "react";

export function EmailButton({ 
  email, 
  toolName, 
  userName,
  daysOverdue
}: { 
  email?: string | null;
  toolName: string;
  userName: string;
  daysOverdue: number;
}) {
  const [loading, setLoading] = useState(false);

  const handleEmail = async () => {
    if (!email) {
      toast.error("El usuario no tiene un email configurado.");
      return;
    }
    
    let subject = `Recordatorio de Devolución: ${toolName}`;
    let text = `Hola ${userName},\n\nTienes pendiente la devolución de: ${toolName}.\n`;
    if (daysOverdue > 0) {
      subject = `[URGENTE] Retraso en devolución: ${toolName}`;
      text += `Lleva ${daysOverdue} día(s) de retraso.\n`;
    } else {
      text += `Vence pronto.\n`;
    }
    text += `Por favor, devuélvela lo antes posible.\n\nGracias.`;
    
    setLoading(true);
    const res = await sendEmailAction(email, subject, text);
    
    if (res.success) {
      toast.success(res.message);
      await logReminderAction({
        Herramienta: toolName,
        Usuario: userName,
        Tipo: daysOverdue > 0 ? "Retraso" : "Aviso Preventivo",
        Via: "Email",
        Mensaje: text
      });
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleEmail}
      disabled={loading}
      title="Enviar Email"
      className="p-1.5 bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white rounded-md transition-colors border border-blue-500/20 disabled:opacity-50"
    >
      <Mail className="h-4 w-4" />
    </button>
  );
}
