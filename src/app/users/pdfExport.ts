import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CompanyConfigs {
  companyName: string;
  companyCif: string;
  companyLogoPath: string;
}

interface Assignment {
  Herramienta: string;
  Identificador?: string;
  Fecha_Entrega: Date | string | null;
  Valor?: string;
}

export const generateEmployeePDF = async (
  type: 'entrega' | 'devolucion',
  employee: any,
  assignments: Assignment[],
  companyConfigs: CompanyConfigs,
  includeCost: boolean = false,
  returnBase64: boolean = false
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
      
      doc.addImage(logoBase64, 'PNG', 14, 10, w, h);
    } catch (e) {
      doc.addImage(logoBase64, 'PNG', 14, 10, 55, 16); // Fallback
    }
  }
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(companyConfigs.companyName || "Empresa", 195, 14, { align: 'right' });
  doc.text(companyConfigs.companyCif ? `CIF/NIF: ${companyConfigs.companyCif}` : "", 195, 19, { align: 'right' });
  
  doc.setDrawColor(200);
  doc.line(14, 28, 195, 28);
  
  // Title
  startY = 36;
  doc.setFontSize(14);
  doc.setTextColor(0);
  const title = type === 'entrega' ? 'ACTA DE ENTREGA DE MATERIAL' : 'ACTA DE DEVOLUCIÓN DE MATERIAL';
  doc.text(title, 105, startY, { align: 'center' });
  
  // Employee Details
  startY += 8;
  doc.setFontSize(10);
  doc.text(`Empleado: ${employee.Nombre || 'N/A'}`, 14, startY);
  doc.text(`ID Empleado: ${employee.ID_Empleado || 'N/A'}`, 14, startY + 5);
  doc.text(`Departamento: ${employee.Departamento || 'N/A'}`, 14, startY + 10);
  
  const today = new Date().toLocaleDateString();
  doc.text(`Fecha del documento: ${today}`, 195, startY, { align: 'right' });
  
  startY += 14;

  // Introduction text
  doc.setFontSize(10);
  if (type === 'entrega') {
    doc.text(
      "Mediante el presente documento, el empleado acepta la recepción y asume la responsabilidad del " +
      "uso, custodia y conservación del siguiente material de trabajo propiedad de la empresa:",
      14, startY, { maxWidth: 180 }
    );
  } else {
    doc.text(
      "Mediante el presente documento, el empleado hace entrega y la empresa recibe el siguiente material de trabajo, en " +
      "las condiciones actuales:",
      14, startY, { maxWidth: 180 }
    );
  }

  startY += 10;

  // Table
  const tableColumn = ["Material", "Identificador / SN", "Fecha de Asignación"];
  if (includeCost) tableColumn.push("Valor (€)");
  if (type === 'devolucion') tableColumn.push("Devuelto");
    
  const formatTableDate = (dateVal: any) => {
    if (!dateVal) return '-';
    const d = new Date(dateVal);
    // If it's a valid date and looks like an ISO string or standard format
    if (!isNaN(d.getTime()) && String(dateVal).includes('-')) {
      return d.toLocaleDateString();
    }
    // Otherwise, just return the string as is (it might already be formatted like DD/MM/YYYY)
    return String(dateVal);
  };

  const tableRows = assignments.map(a => {
    const row = [
      a.Herramienta,
      a.Identificador || '-',
      formatTableDate(a.Fecha_Entrega)
    ];
    if (includeCost) {
      const val = parseFloat(a.Valor?.replace(',', '.') || '0');
      row.push(val > 0 ? `${val.toFixed(2)} €` : "0.00 €");
    }
    if (type === 'devolucion') {
      row.push("  [   ]"); // Empty box for checking
    }
    return row;
  });

  if (includeCost && assignments.length > 0) {
    const total = assignments.reduce((acc, a) => acc + (parseFloat(a.Valor?.replace(',', '.') || '0') || 0), 0);
    const totalRow: any[] = [
      { content: "TOTAL VALOR ESTIMADO:", colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: `${total.toFixed(2)} €`, styles: { fontStyle: 'bold' } }
    ];
    if (type === 'devolucion') {
      totalRow.push(""); // empty cell for the Devuelto column
    }
    tableRows.push(totalRow);
  }

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: startY,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 }
  });

  // @ts-ignore
  const finalY = doc.lastAutoTable.finalY || startY + 20;

  // Signatures
  let signatureY = finalY + 40;
  
  // If the signatures would fall off the page, add a new page
  if (signatureY + 25 > 285) {
    doc.addPage();
    signatureY = 40;
  }
  
  doc.line(20, signatureY, 80, signatureY);
  doc.text("Firma del Responsable", 50, signatureY + 5, { align: 'center' });
  doc.text("Nombre:", 20, signatureY + 12);
  doc.text("Fecha:", 20, signatureY + 19);
  
  doc.line(120, signatureY, 180, signatureY);
  doc.text("Firma del Empleado", 150, signatureY + 5, { align: 'center' });
  doc.text("Nombre:", 120, signatureY + 12);
  doc.text("Fecha:", 120, signatureY + 19);

  // Save or Return
  const fileName = `Acta_${type === 'entrega' ? 'Entrega' : 'Devolucion'}_${employee.Nombre.replace(/\s+/g, '_')}_${today.replace(/\//g, '-')}.pdf`;
  
  if (returnBase64) {
    return { base64: doc.output('datauristring'), fileName };
  } else {
    doc.save(fileName);
    return { fileName };
  }
};
