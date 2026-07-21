"use client";

import { useState, useEffect } from "react";
import packageJson from "../../package.json";
import { getChangelog } from "@/app/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, FileText, CheckCircle, XCircle } from "lucide-react";

export function VersionChecker() {
  const currentVersion = packageJson.version;
  const [open, setOpen] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [changelog, setChangelog] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkVersion = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://api.github.com/repos/urtziDV/TeamPlanner-Pro/releases/latest");
      if (res.ok) {
        const data = await res.json();
        const tag = data.tag_name || data.name;
        // Remueve 'v' si existe (ej: 'v4.0.3' -> '4.0.3')
        setLatestVersion(tag.replace(/^v/, ''));
      } else {
        throw new Error("No se pudo obtener la última versión de GitHub.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadChangelog = async () => {
    const res = await getChangelog();
    if (res.success) {
      setChangelog(res.content || "");
    } else {
      setChangelog("Error al cargar el Changelog.");
    }
  };

  useEffect(() => {
    if (open) {
      if (!latestVersion) checkVersion();
      if (!changelog) loadChangelog();
    }
  }, [open]);

  const hasUpdate = latestVersion && latestVersion !== currentVersion;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="rounded-md bg-primary/10 hover:bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary transition-colors cursor-pointer">
        v{currentVersion}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5" />
            Acerca de ToolTracker
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-6">
          <div className="p-4 rounded-xl border bg-muted/30">
            <h3 className="font-semibold text-lg mb-2">Comprobador de Versiones</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Versión Actual: <strong className="text-foreground">v{currentVersion}</strong></p>
                {loading ? (
                  <p className="text-sm text-blue-500 flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" /> Comprobando actualizaciones...</p>
                ) : error ? (
                  <p className="text-sm text-red-500 flex items-center gap-1"><XCircle className="h-3 w-3" /> {error}</p>
                ) : latestVersion ? (
                  hasUpdate ? (
                    <p className="text-sm text-amber-500 font-medium">¡Nueva versión disponible: v{latestVersion}!</p>
                  ) : (
                    <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Estás en la última versión.</p>
                  )
                ) : null}
              </div>
              <Button variant="outline" size="sm" onClick={checkVersion} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Comprobar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              Registro de Cambios (Changelog)
            </h3>
            <div className="p-4 rounded-xl border bg-card text-sm text-muted-foreground whitespace-pre-wrap font-mono overflow-x-auto">
              {changelog || "Cargando..."}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
