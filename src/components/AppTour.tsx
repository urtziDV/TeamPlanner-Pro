"use client";

import { useEffect, useState } from "react";
import { Joyride, STATUS, Step } from "react-joyride";

export function AppTour() {
  const [run, setRun] = useState(false);

  const steps: Step[] = [
    {
      target: "body",
      placement: "center",
      content: (
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">¡Bienvenido a ToolTracker Pro! 👋</h2>
          <p className="text-sm text-muted-foreground">
            Esta herramienta te ayudará a llevar el control absoluto de tus herramientas, vehículos y proyectos de forma profesional.
          </p>
          <p className="text-sm font-medium">
            Vamos a dar un rápido paseo por las secciones principales.
          </p>
        </div>
      ),

    },
    {
      target: "#tour-dashboard",
      content: (
        <div>
          <h3 className="font-bold mb-1">Dashboard (Inicio)</h3>
          <p className="text-sm">Aquí verás un resumen de tu inversión, pérdidas por extravíos y gráficas de costes.</p>
        </div>
      ),
      placement: "right",

    },
    {
      target: "#tour-inventory",
      content: (
        <div>
          <h3 className="font-bold mb-1">Inventario</h3>
          <p className="text-sm">El corazón de la app. Aquí darás de alta tus herramientas, escanearás códigos QR y registrarás números de serie.</p>
        </div>
      ),
      placement: "right",

    },
    {
      target: "#tour-loans",
      content: (
        <div>
          <h3 className="font-bold mb-1">Préstamos</h3>
          <p className="text-sm">La zona de acción. Asigna rápidamente el material a tu equipo o registra devoluciones en segundos.</p>
        </div>
      ),
      placement: "right",

    },
    {
      target: "#tour-users",
      content: (
        <div>
          <h3 className="font-bold mb-1">Usuarios</h3>
          <p className="text-sm">Gestiona a tus empleados y genera Actas de Devolución en PDF listas para firmar.</p>
        </div>
      ),
      placement: "right",

    },
    {
      target: "#tour-vehicles",
      content: (
        <div>
          <h3 className="font-bold mb-1">Vehículos</h3>
          <p className="text-sm">Controla tu flota. Avisos de ITV, seguros y averías de furgonetas.</p>
        </div>
      ),
      placement: "right",

    },
    {
      target: "#tour-projects",
      content: (
        <div>
          <h3 className="font-bold mb-1">Proyectos</h3>
          <p className="text-sm">Agrupa herramientas por obra o ubicación para saber dónde está tu dinero invertido.</p>
        </div>
      ),
      placement: "right",

    },
    {
      target: "#tour-settings",
      content: (
        <div>
          <h3 className="font-bold mb-1">Ajustes</h3>
          <p className="text-sm">Configura el logo, automatiza las copias de seguridad de la base de datos y... ¡repite este tour cuando lo necesites!</p>
        </div>
      ),
      placement: "right",

    }
  ];

  useEffect(() => {
    // Escuchar el evento personalizado para reiniciar el tour
    const handleResetTour = () => {
      localStorage.removeItem("tooltracker_tour_completed");
      setRun(true);
    };

    window.addEventListener("resetAppTour", handleResetTour);

    // Solo arrancar si estamos en cliente y no ha completado el tour
    const hasCompleted = localStorage.getItem("tooltracker_tour_completed");
    if (!hasCompleted) {
      setRun(true);
    }

    return () => {
      window.removeEventListener("resetAppTour", handleResetTour);
    };
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    
    // Si el usuario cierra el tour, termina, o salta el tour
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      localStorage.setItem("tooltracker_tour_completed", "true");
      setRun(false);
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#0ea5e9', // text-primary equivalent approx
          textColor: '#000', // Safe default, we will rely on CSS classes for dark mode if needed
        },
        tooltip: {
          padding: '20px',
          borderRadius: '8px',
        }
      }}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar tour'
      }}
    />
  );
}
