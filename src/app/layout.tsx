import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { AppTour } from "@/components/AppTour";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ToolTracker Pro v4.2",
  description: "Sistema Avanzado de Gestión de Herramientas y Proyectos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} flex h-screen bg-background text-foreground antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delay={200}>
            <Toaster position="bottom-right" richColors />
            <AppTour />
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
              {children}
            </main>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
