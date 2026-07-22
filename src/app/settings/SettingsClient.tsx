"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Database, Moon, Sun, Mail, Save, FolderOpen, Download, Upload, Building2, BellRing, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateConfigs, openFilePicker, openFolderPicker, exportBackupAction, importBackupAction, openOutlookAction, openImagePicker, processAndSaveLogo } from "@/app/actions";
import { toast } from "sonner";
import { TemplatesManager } from "./TemplatesManager";

export function SettingsClient({ initialConfigs = [], initialTiposRecordatorios = [] }: { initialConfigs?: any[], initialTiposRecordatorios?: any[] }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [configData, setConfigData] = useState({
    dbPath: initialConfigs.find(c => c.key === "dbPath")?.value || "",
    backupPath: initialConfigs.find(c => c.key === "backupPath")?.value || "",
    cloudBackupPath: initialConfigs.find(c => c.key === "cloudBackupPath")?.value || "",
    backupCopies: initialConfigs.find(c => c.key === "backupCopies")?.value || "30",
    smtpHost: initialConfigs.find(c => c.key === "smtpHost")?.value || "",
    smtpPort: initialConfigs.find(c => c.key === "smtpPort")?.value || "",
    smtpUser: initialConfigs.find(c => c.key === "smtpUser")?.value || "",
    smtpPass: initialConfigs.find(c => c.key === "smtpPass")?.value || "",
    companyName: initialConfigs.find(c => c.key === "companyName")?.value || "",
    companyCif: initialConfigs.find(c => c.key === "companyCif")?.value || "",
    companyLogoPath: initialConfigs.find(c => c.key === "companyLogoPath")?.value || "",
    maintenanceAlertDays: initialConfigs.find(c => c.key === "maintenanceAlertDays")?.value || "30",
    calibrationAlertDays: initialConfigs.find(c => c.key === "calibrationAlertDays")?.value || "30",
  });
  
  const [logoTimestamp, setLogoTimestamp] = useState("");

  // Avoid hydration mismatch — only render theme-dependent UI after mount
  useEffect(() => setMounted(true), []);

  const handleSaveConfigs = async () => {
    setSaving(true);
    await updateConfigs([
      { key: "dbPath", value: configData.dbPath },
      { key: "backupPath", value: configData.backupPath },
      { key: "cloudBackupPath", value: configData.cloudBackupPath },
      { key: "backupCopies", value: configData.backupCopies },
      { key: "smtpHost", value: configData.smtpHost },
      { key: "smtpPort", value: configData.smtpPort },
      { key: "smtpUser", value: configData.smtpUser },
      { key: "smtpPass", value: configData.smtpPass },
      { key: "companyName", value: configData.companyName },
      { key: "companyCif", value: configData.companyCif },
      { key: "companyLogoPath", value: configData.companyLogoPath },
      { key: "maintenanceAlertDays", value: configData.maintenanceAlertDays },
      { key: "calibrationAlertDays", value: configData.calibrationAlertDays }
    ]);
    setSaving(false);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 overflow-y-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Ajustes</h2>
      </div>

      <div className="flex flex-col gap-6 w-full">
        <div className="grid gap-6 md:grid-cols-2 w-full items-start">
          <div className="flex flex-col gap-6">
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

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="font-medium">Tour de Bienvenida</p>
                <p className="text-sm text-muted-foreground">
                  Reiniciar el recorrido inicial por la aplicación.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  window.dispatchEvent(new Event("resetAppTour"));
                }}
              >
                Ver Tour
              </Button>
            </div>
          </div>
        </div>

        {/* Datos de la Empresa */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Datos de la Empresa</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Información para informes y PDFs.
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nombre de la Empresa</Label>
              <Input 
                id="companyName" 
                placeholder="ej. Mi Empresa S.L."
                value={configData.companyName}
                onChange={e => setConfigData({...configData, companyName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyCif">NIF / CIF</Label>
              <Input 
                id="companyCif" 
                placeholder="ej. B12345678"
                value={configData.companyCif}
                onChange={e => setConfigData({...configData, companyCif: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="companyLogoPath">Logo de la Empresa</Label>
              {configData.companyLogoPath && (
                <div className="p-2 border rounded-md bg-muted/30 flex justify-center items-center w-full min-h-[60px] max-w-[200px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={logoTimestamp ? `/api/logo?v=${logoTimestamp}` : "/api/logo"} 
                    alt="Logo Empresa" 
                    className="max-h-[60px] object-contain" 
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Input 
                  id="companyLogoPath" 
                  placeholder="Seleccionar imagen..."
                  value={configData.companyLogoPath}
                  onChange={e => setConfigData({...configData, companyLogoPath: e.target.value})}
                  readOnly
                />
                <Button type="button" variant="outline" size="icon" onClick={async () => {
                  const sourcePath = await openImagePicker();
                  if (sourcePath) {
                    toast.loading("Procesando logo...");
                    const res = await processAndSaveLogo(sourcePath);
                    toast.dismiss();
                    if (res.success) {
                      setConfigData({...configData, companyLogoPath: "/prisma/company_logo.png"});
                      setLogoTimestamp(Date.now().toString());
                      toast.success("Logo guardado y redimensionado correctamente");
                    } else {
                      toast.error("Error al procesar el logo: " + res.message);
                    }
                  }
                }}>
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveConfigs} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar Datos"}
              </Button>
            </div>
          </div>
        </div>

        {/* Alertas de Inventario */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Alertas de Inventario</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Días de antelación para notificar.
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maintenanceAlertDays">Mantenimiento (días antes)</Label>
              <Input 
                id="maintenanceAlertDays" 
                type="number"
                min="1"
                value={configData.maintenanceAlertDays}
                onChange={e => setConfigData({...configData, maintenanceAlertDays: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calibrationAlertDays">Calibración (días antes)</Label>
              <Input 
                id="calibrationAlertDays" 
                type="number"
                min="1"
                value={configData.calibrationAlertDays}
                onChange={e => setConfigData({...configData, calibrationAlertDays: e.target.value})}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveConfigs} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar Alertas"}
              </Button>
            </div>
          </div>
        </div>

      </div>

      <div className="flex flex-col gap-6">
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
                  <Button variant="outline" size="icon" onClick={async () => {
                    const res = await openFolderPicker();
                    if (res) setConfigData({...configData, backupPath: res});
                  }}>
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cloudBackupPath">Ruta Copias de Seguridad (Nube)</Label>
                <div className="flex gap-2">
                  <Input 
                    id="cloudBackupPath" 
                    placeholder="ej. C:\Users\Nombre\OneDrive\Backups"
                    value={configData.cloudBackupPath}
                    onChange={e => setConfigData({...configData, cloudBackupPath: e.target.value})}
                  />
                  <Button variant="outline" size="icon" onClick={async () => {
                    const res = await openFolderPicker();
                    if (res) setConfigData({...configData, cloudBackupPath: res});
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
                    <p className="font-medium">Ejecutar Copias de Seguridad</p>
                    <p className="text-sm text-muted-foreground">
                      Guardar copias en las rutas configuradas (Local y Nube).
                    </p>
                  </div>
                  <Button variant="outline" onClick={async () => {
                    const res = await exportBackupAction(true);
                    if (res.success) toast.success(res.message);
                    else toast.error(res.message);
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Ejecutar Copias...
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
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Servidor de Correo</h3>
              </div>
              {/* Active method badge */}
              {mounted && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
                    configData.smtpHost && configData.smtpUser && configData.smtpPass
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                  }`}
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                  {configData.smtpHost && configData.smtpUser && configData.smtpPass
                    ? "Método activo: SMTP"
                    : "Método activo: Outlook (cliente local)"}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Configura SMTP para envío automático, o deja vacío para abrir Outlook con el borrador ya rellenado.
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
            {/* Info note + actions */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Modo Outlook (sin SMTP)</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Si no configuras SMTP, al pulsar ✉ en Recordatorios se abrirá Outlook con el destinatario, asunto y cuerpo ya rellenados. Tú decides cuándo enviar.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const res = await openOutlookAction(
                    "ejemplo@empresa.com",
                    "[Prueba] ToolTracker Pro",
                    "Este es un correo de prueba enviado desde ToolTracker Pro mediante Outlook."
                  );
                  if (res.success) toast.success(res.message);
                  else toast.error(res.message);
                }}
                className="inline-flex items-center gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 transition-colors whitespace-nowrap"
              >
                <Mail className="h-3.5 w-3.5" />
                Probar con Outlook
              </button>
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

        {/* Plantillas de Correo (Markdown) */}
        <TemplatesManager initialTemplates={initialTiposRecordatorios} />

      </div>
    </div>
  );
}
