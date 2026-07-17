"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScanLine } from "lucide-react";

export function QRScanner({ onScan, triggerButton }: { onScan: (text: string) => void, triggerButton?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode("qr-reader");
        }
        
        scannerRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScan(decodedText);
            setOpen(false);
          },
          (errorMessage) => {
            // Ignore normal scan errors
          }
        ).catch(err => {
          setError("No se pudo acceder a la cámara. Comprueba los permisos.");
        });
      }, 300);
    } else {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    }
    
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [open, onScan]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        (triggerButton as React.ReactElement) || (
          <Button variant="outline" title="Escanear Código QR">
            <ScanLine className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Escanear QR</span>
          </Button>
        )
      } />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escanear Código QR</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <div id="qr-reader" className="w-full max-w-[300px] overflow-hidden rounded-xl border-2 border-primary/20 bg-black"></div>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Apunta con la cámara al código QR de la herramienta.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
