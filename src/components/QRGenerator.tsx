"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export function QRGenerator({ 
  toolId, 
  snString, 
  cantidadTotal, 
  title 
}: { 
  toolId: string, 
  snString?: string | null, 
  cantidadTotal?: number | null, 
  title?: string 
}) {
  const [open, setOpen] = useState(false);

  const sns = snString ? snString.split(',').map(s => s.trim()).filter(Boolean) : [];
  const qrs: { label: string, data: string, id: string }[] = [];

  if (sns.length > 0) {
    sns.forEach((sn, idx) => {
      qrs.push({ label: `SN: ${sn}`, data: sn, id: `${toolId}-sn-${idx}` });
    });
  } else {
    const qty = Math.max(1, cantidadTotal || 1);
    for (let i = 1; i <= qty; i++) {
      qrs.push({
        label: qty > 1 ? `Unidad #${i}` : "SN: N/A",
        data: toolId,
        id: `${toolId}-unit-${i}`
      });
    }
  }

  const handleDownload = (qrId: string, label: string) => {
    const qrCanvas = document.getElementById(`qr-code-${qrId}`) as HTMLCanvasElement;
    if (qrCanvas) {
      const stickerCanvas = document.createElement("canvas");
      stickerCanvas.width = 400;
      stickerCanvas.height = 180;
      const ctx = stickerCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, stickerCanvas.width, stickerCanvas.height);
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, stickerCanvas.width - 2, stickerCanvas.height - 2);
        ctx.drawImage(qrCanvas, 15, 15, 150, 150);
        
        ctx.fillStyle = "black";
        ctx.font = "bold 20px sans-serif";
        let displayTitle = title || "Herramienta";
        if (displayTitle.length > 20) displayTitle = displayTitle.substring(0, 20) + "...";
        ctx.fillText(displayTitle, 180, 50, 200);
        
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#475569";
        ctx.fillText(label, 180, 90, 200);
        
        // Removed ID rendering
        
        const pngUrl = stickerCanvas.toDataURL("image/png");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `Pegatina_${title || 'Herramienta'}_${label.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    }
  };

  const handleDownloadAll = () => {
    qrs.forEach((qr) => handleDownload(qr.id, qr.label));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button className="p-1.5 bg-background border shadow-sm rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors" title="Generar QR">
          <QrCode className="h-4 w-4" />
        </button>
      } />
      <DialogContent className="sm:max-w-6xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">{title || "Código(s) QR"}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto mt-4 px-2 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {qrs.map((qr) => {
              const domId = `qr-code-${qr.id}`;
              return (
                <div key={qr.id} className="flex flex-col items-center bg-white p-4 rounded-xl shadow-sm border hover:border-primary/50 transition-colors">
                  <div className="flex flex-row items-center w-full border rounded-lg p-2 mb-4 bg-white">
                     <QRCodeCanvas 
                       id={domId}
                       value={qr.data} 
                       size={100}
                       level={"H"}
                       includeMargin={true}
                     />
                     <div className="ml-4 flex flex-col items-start flex-1 min-w-0">
                       <p className="text-sm font-bold break-words w-full" title={title}>{title || "Herramienta"}</p>
                       <p className="text-xs text-slate-600 mt-1 break-words w-full">{qr.label}</p>
                     </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(qr.id, qr.label)} className="w-full text-xs">
                    <Download className="h-3 w-3 mr-2" />
                    Descargar Pegatina
                  </Button>
                </div>
              )
            })}
          </div>
        </div>

        {qrs.length > 1 && (
          <div className="pt-4 border-t mt-2 flex justify-center">
            <Button onClick={handleDownloadAll} className="w-full sm:w-auto px-8">
              <Download className="h-4 w-4 mr-2" />
              Descargar Todos ({qrs.length})
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
