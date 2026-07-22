"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  Wrench, 
  LayoutDashboard, 
  Archive, 
  CheckSquare, 
  Bell, 
  Settings,
  UsersRound,
  Handshake,
  Truck,
  AlertTriangle,
  MailQuestion 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { VersionChecker } from "./VersionChecker";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Analítica ROI", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventario", href: "/inventory", icon: Archive },
  { name: "Préstamos", href: "/loans", icon: Handshake },
  { name: "Solicitudes", href: "/requests", icon: MailQuestion },
  { name: "Vehículos", href: "/vehicles", icon: Truck },
  { name: "Incidentes", href: "/incidents", icon: AlertTriangle },
  { name: "Recordatorios", href: "/reminders", icon: Bell },
  { name: "Categorías", href: "/categories", icon: Wrench },
  { name: "Proyectos", href: "/projects", icon: CheckSquare },
  { name: "Usuarios", href: "/users", icon: UsersRound },
  { name: "Ajustes", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur-sm">
      <div className="flex h-16 shrink-0 items-center gap-3 px-6 border-b">
        {logoError ? (
          <Wrench className="h-6 w-6 text-primary shrink-0" />
        ) : (
          <img 
            src="/logo.png" 
            alt="ToolTracker Pro Logo" 
            className="h-8 w-auto max-w-[40px] object-contain shrink-0 rounded-md shadow-sm" 
            onError={() => setLogoError(true)}
          />
        )}
        <div className="flex flex-col justify-center">
          <span className="text-[1.15rem] font-bold tracking-tight whitespace-nowrap leading-tight">
            ToolTracker <span className="text-primary font-black">Pro</span>
          </span>
          <div className="mt-0.5 self-start">
            <VersionChecker />
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <nav className="flex-1 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                id={`tour-${item.href === '/' ? 'dashboard' : item.href.replace('/', '')}`}
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted transition-colors cursor-pointer w-full">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-primary">UR</span>
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-medium truncate">Urtzi</span>
            <span className="text-xs text-muted-foreground truncate">Admin</span>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
