"use client";

import { Mail, ExternalLink } from "lucide-react";
import { sendEmailAction, openOutlookAction, logReminderAction } from "@/app/actions";
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

  const buildMessage = () => {
    let subject = `Recordatorio de Devolución: ${toolName}`;
    let text = `Hola ${userName},\n\nTienes pendiente la devolución de: ${toolName}.\n`;
    if (daysOverdue > 0) {
      subject = `[URGENTE] Retraso en devolución: ${toolName}`;
      text += `Lleva ${daysOverdue} día(s) de retraso.\n`;
    } else {
      text += `Vence pronto.\n`;
    }
    text += `Por favor, devuélvela lo antes posible.\n\nGracias.`;
    return { subject, text };
  };

  const handleEmail = async () => {
    if (!email) {
      toast.error("El usuario no tiene un email configurado.");
      return;
    }

    const { subject, text } = buildMessage();
    setLoading(true);

    const res = await sendEmailAction(email, subject, text);

    if (res.success) {
      // ── SMTP path ──────────────────────────────────────────────────────────
      toast.success(res.message);
      await logReminderAction({
        Herramienta: toolName,
        Usuario: userName,
        Tipo: daysOverdue > 0 ? "Retraso" : "Aviso Preventivo",
        Via: "Email (SMTP)",
        Mensaje: text,
      });
    } else if ("useOutlook" in res && res.useOutlook) {
      // ── Outlook fallback ───────────────────────────────────────────────────
      // SMTP not configured → open Outlook with the draft pre-filled
      const outlookRes = await openOutlookAction(res.to, res.subject, res.text);
      if (outlookRes.success) {
        toast.success("Outlook abierto — revisa el borrador y pulsa Enviar.", {
          icon: <ExternalLink className="h-4 w-4" />,
          duration: 5000,
        });
        await logReminderAction({
          Herramienta: toolName,
          Usuario: userName,
          Tipo: daysOverdue > 0 ? "Retraso" : "Aviso Preventivo",
          Via: "Outlook",
          Mensaje: text,
        });
      } else {
        toast.error(outlookRes.message);
      }
    } else {
      // ── SMTP error ─────────────────────────────────────────────────────────
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
