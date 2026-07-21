"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Database, Moon, Sun, Mail, Save, FolderOpen, Download, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateConfigs, openFilePicker, openFolderPicker, exportBackupAction, importBackupAction } from "@/app/actions";
import { toast } from "sonner";

export function SettingsClient({ initialConfigs = [] }: { initialConfigs?: any[] }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [configData, setConfigData] = useState({
    dbPath: initialConfigs.find(c => c.key === "dbPath")?.value || "",
    backupPath: initialConfigs.find(c => c.key === "backupPath")?.value || "",
    backupCopies: initialConfigs.find(c => c.key === "backupCopies")?.value || "5",
    smtpHost: initialConfigs.find(c => c.key === "smtpHost")?.value || "",
    smtpPort: initialConfigs.find(c => c.key === "smtpPort")?.value || "",
    smtpUser: initialConfigs.find(c => c.key === "smtpUser")?.value || "",
    smtpPass: initialConfigs.find(c => c.key === "smtpPass")?.value || "",
  });

  // Avoid hydration mismatch — only render theme-dependent UI after mount
  useEffect(() => setMounted(true), []);

  const handleSaveConfigs = async () => {
    setSaving(true);
    await updateConfigs([
      { key: "dbPath", value: configData.dbPath },
      { key: "backupPath", value: configData.backupPath },
      { key: "backupCopies", value: configData.backupCopies },
      { key: "smtpHost", value: configData.smtpHost },
      { key: "smtpPort", value: configData.smtpPort },
      { key: "smtpUser", value: configData.smtpUser },
      { key: "smtpPass", value: configData.smtpPass }
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
                <div className="flex gap-2">
                  <Input 
                    id="dbPath" 
                    placeholder="ej. C:\App\database.db"
                    value={configData.dbPath}
                    onChange={e => setConfigData({...configData, dbPath: e.target.value})}
                  />
                  <Button variant="outline" onClick={async () => {
                    const res = await openFilePicker();
                    if (res) setConfigData({...configData, dbPath: res});
                  }}>
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="backupPath">Ruta Copias de Seguridad (Local)</Label>
                <div className="flex gap-2">
                  <Input 
                    id="backupPath" 
                    placeholder="ej. C:\Backups"
                    value={configData.backupPath}
                    onChange={e => setConfigData({...configData, backupPath: e.target.value})}
                  />
                  <Button variant="outline" onClick={async () => {
                    const res = await openFolderPicker();
                    if (res) setConfigData({...configData, backupPath: res});
                  }}>
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                </div>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Exportar Copia Local</p>
                    <p className="text-sm text-muted-foreground">
                      Guardar una copia de seguridad en una carpeta.
                    </p>
                  </div>
                  <Button variant="outline" onClick={async () => {
                    const res = await exportBackupAction();
                    if (res.success) toast.success(res.message);
                    else toast.error(res.message);
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar...
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Restaurar Copia (Importar)</p>
                    <p className="text-sm text-muted-foreground">
                      Restaura la base de datos desde un archivo .db.
                    </p>
                  </div>
                  <Button variant="outline" onClick={async () => {
                    const res = await importBackupAction();
                    if (res.success) toast.success(res.message);
                    else toast.error(res.message);
                  }}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar...
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Servidor de Correo */}
        <div className="rounded-xl border bg-card text-card-foreground shadow md:col-span-2">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Servidor de Correo (SMTP)</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Configura los credenciales para el envío de recordatorios automáticos por email.
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">Servidor SMTP (Host)</Label>
                <Input 
                  id="smtpHost" 
                  placeholder="ej. smtp.office365.com"
                  value={configData.smtpHost}
                  onChange={e => setConfigData({...configData, smtpHost: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">Puerto</Label>
                <Input 
                  id="smtpPort" 
                  placeholder="ej. 587"
                  value={configData.smtpPort}
                  onChange={e => setConfigData({...configData, smtpPort: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpUser">Usuario / Email</Label>
                <Input 
                  id="smtpUser" 
                  placeholder="ej. notificaciones@miempresa.com"
                  value={configData.smtpUser}
                  onChange={e => setConfigData({...configData, smtpUser: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPass">Contraseña</Label>
                <Input 
                  id="smtpPass" 
                  type="password"
                  value={configData.smtpPass}
                  onChange={e => setConfigData({...configData, smtpPass: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveConfigs} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
