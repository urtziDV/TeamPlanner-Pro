import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CompanyConfigs {
  companyName: string;
  companyCif: string;
  companyLogoPath: string;
}

export const generateIncidentsPDF = async (
  incidents: any[],
  companyConfigs: CompanyConfigs
) => {
  const doc = new jsPDF();
  
  // Fetch logo as base64 if present
  let logoBase64: string | null = null;
  if (companyConfigs.companyLogoPath) {
    try {
      const res = await fetch(`/api/logo?v=${Date.now()}`);
      if (res.ok) {
        const blob = await res.blob();
        logoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
    } catch (e) {
      console.error("Failed to load logo for PDF", e);
    }
  }

  // Header
  let startY = 20;
  if (logoBase64) {
    try {
      const imgProps = doc.getImageProperties(logoBase64);
      const maxW = 55;
      const maxH = 16;
      let w = imgProps.width;
      let h = imgProps.height;

      if (w > maxW) {
        h = (h * maxW) / w;
        w = maxW;
      }
      if (h > maxH) {
        w = (w * maxH) / h;
        h = maxH;
      }

      doc.addImage(logoBase64, 'PNG', 14, startY, w, h);
      startY += h + 10;
    } catch (e) {
      console.error("Failed to add image to PDF", e);
      startY += 10;
    }
  } else {
    startY += 10;
  }

  // Title
  doc.setFontSize(18);
  doc.text("Informe de Incidencias (Pérdidas y Roturas)", 14, startY);
  
  doc.setFontSize(11);
  const today = new Date().toLocaleDateString('es-ES');
  doc.text(`Fecha de emisión: ${today}`, 14, startY + 8);
  
  startY += 18;

  // Table Data
  const tableColumn = ["Herramienta", "Usuario", "Tipo", "Fecha", "Coste", "Observaciones"];
  const tableRows: any[][] = [];

  let totalCost = 0;

  incidents.forEach(inc => {
    const costValue = inc.Costo || 0;
    totalCost += costValue;
    
    tableRows.push([
      inc.Herramienta || "-",
      inc.Usuario || "-",
      inc.Tipo || "-",
      inc.Fecha || "-",
      `${costValue.toFixed(2)} €`,
      inc.Observaciones || "-"
    ]);
  });

  // Add Total row
  if (incidents.length > 0) {
    tableRows.push([
      { content: 'TOTAL PÉRDIDAS', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right' } },
      { content: `${totalCost.toFixed(2)} €`, styles: { fontStyle: 'bold' } },
      { content: '', styles: { } }
    ]);
  }

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: startY,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [220, 38, 38], textColor: 255 } // Red color for incidents
  });

  const fileName = `Informe_Incidencias_${today.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};
