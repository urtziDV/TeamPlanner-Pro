"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Database, Moon, Sun, HardDrive, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateConfigs } from "@/app/actions";

export function SettingsClient({ initialConfigs = [] }: { initialConfigs?: any[] }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [configData, setConfigData] = useState({
    dbPath: initialConfigs.find(c => c.key === "dbPath")?.value || "",
    backupPath: initialConfigs.find(c => c.key === "backupPath")?.value || "",
    backupCopies: initialConfigs.find(c => c.key === "backupCopies")?.value || "5"
  });

  // Avoid hydration mismatch — only render theme-dependent UI after mount
  useEffect(() => setMounted(true), []);

  const handleSaveConfigs = async () => {
    setSaving(true);
    await updateConfigs([
      { key: "dbPath", value: configData.dbPath },
      { key: "backupPath", value: configData.backupPath },
      { key: "backupCopies", value: configData.backupCopies }
    ]);
    setSaving(false);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Ajustes</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
        {/* Apariencia */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Apariencia</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Personaliza el aspecto de la aplicación.
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tema del sistema</p>
                <p className="text-sm text-muted-foreground">
                  Alternar entre modo claro y oscuro.
                </p>
              </div>
              {mounted && (
                <div className="flex bg-muted rounded-lg p-1 gap-1">
                  <button
                    onClick={() => setTheme("light")}
                    title="Modo claro"
                    className={`p-2 rounded-md transition-all ${
                      theme === "light"
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    title="Modo oscuro"
                    className={`p-2 rounded-md transition-all ${
                      theme === "dark"
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Base de Datos */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Base de Datos</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Gestión y respaldos.
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dbPath">Ruta de la Base de Datos</Label>
                <Input 
                  id="dbPath" 
                  placeholder="ej. C:\App\database.db"
                  value={configData.dbPath}
                  onChange={e => setConfigData({...configData, dbPath: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backupPath">Ruta Copias de Seguridad (Local)</Label>
                <Input 
                  id="backupPath" 
                  placeholder="ej. C:\Backups"
                  value={configData.backupPath}
                  onChange={e => setConfigData({...configData, backupPath: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backupCopies">Número de Copias a Guardar</Label>
                <Input 
                  id="backupCopies" 
                  type="number"
                  min="1"
                  value={configData.backupCopies}
                  onChange={e => setConfigData({...configData, backupCopies: e.target.value})}
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveConfigs} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar Rutas"}
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Copia de Seguridad Manual</p>
                  <p className="text-sm text-muted-foreground">
                    Descargar un archivo .db con los datos actuales ahora.
                  </p>
                </div>
                <a
                  href="/api/backup"
                  download
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                >
                  <HardDrive className="h-4 w-4 mr-2" />
                  Descargar
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
