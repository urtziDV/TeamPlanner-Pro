"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ 
  phone, 
  toolName, 
  userName,
  daysOverdue
}: { 
  phone?: string | null;
  toolName: string;
  userName: string;
  daysOverdue: number;
}) {
  const handleWhatsApp = () => {
    let text = `Hola ${userName}, tienes pendiente la devolución de: ${toolName}. `;
    if (daysOverdue > 0) {
      text += `Lleva ${daysOverdue} día(s) de retraso. `;
    } else {
      text += `Vence pronto. `;
    }
    text += `Por favor, devuélvela lo antes posible. Gracias.`;
    
    // Default to a format, but ideally we have the phone. If not, just open WhatsApp Web
    const url = phone 
      ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      
    window.open(url, '_blank');
  };

  return (
    <button 
      onClick={handleWhatsApp}
      title="Enviar WhatsApp"
      className="p-1.5 bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white rounded-md transition-colors border border-green-500/20"
    >
      <MessageCircle className="h-4 w-4" />
    </button>
  );
}
