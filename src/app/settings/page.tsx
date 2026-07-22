import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const configs = await prisma.config.findMany();
  const plantillas = await prisma.tiposRecordatorios.findMany();
  
  return <SettingsClient initialConfigs={configs} initialTiposRecordatorios={plantillas} />;
}
