import jsPDF from 'jspdf';
import { Vehicle } from '@/types';

export async function generateVehicleSheet(vehicle: Vehicle): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Define colors
  const accentColor = '#1CCEFF';
  const darkGray = '#212529';
  const lightGray = '#6C757D';

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Helper functions
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const setColor = (color: string) => {
    const rgb = hexToRgb(color);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
  };

  const setFillColor = (color: string) => {
    const rgb = hexToRgb(color);
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
  };

  // Header with accent color
  setFillColor(accentColor);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Garage name
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('LCF AUTO PERFORMANCE', pageWidth / 2, 15, { align: 'center' });

  // Vehicle title
  doc.setFontSize(24);
  doc.text(`${vehicle.make} ${vehicle.model}`, pageWidth / 2, 27, { align: 'center' });

  // Price box
  let yPos = 45;
  setFillColor(accentColor);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 25, 3, 3, 'F');
  
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  const priceText = formatPrice(vehicle.price);
  doc.text(priceText, pageWidth / 2, yPos + 17, { align: 'center' });

  // Main information section
  yPos = 80;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setColor(darkGray);
  doc.text('INFORMATIONS PRINCIPALES', margin, yPos);

  yPos += 8;
  const infoItems: Array<{ label: string; value: string }> = [
    { label: 'Année', value: vehicle.year.toString() },
    { label: 'Kilométrage', value: formatMileage(vehicle.mileage) },
    { label: 'Carburant', value: getFuelTypeLabel(vehicle.fuelType) },
  ];

  if (vehicle.transmission) {
    infoItems.push({ label: 'Transmission', value: getTransmissionLabel(vehicle.transmission) });
  }
  if (vehicle.color) {
    infoItems.push({ label: 'Couleur', value: vehicle.color });
  }
  if (vehicle.power && vehicle.power > 0) {
    infoItems.push({ label: 'Puissance', value: `${vehicle.power} CV` });
  }
  if (vehicle.doors) {
    infoItems.push({ label: 'Portes', value: vehicle.doors.toString() });
  }
  if (vehicle.seats) {
    infoItems.push({ label: 'Places', value: vehicle.seats.toString() });
  }
  if (vehicle.condition) {
    infoItems.push({ label: 'État', value: getConditionLabel(vehicle.condition) });
  }

  // Draw info items in a grid
  const itemsPerRow = 2;
  const colWidth = (pageWidth - 2 * margin - 10) / itemsPerRow;
  const rowHeight = 15;

  infoItems.forEach((item, index) => {
    const col = index % itemsPerRow;
    const row = Math.floor(index / itemsPerRow);
    const x = margin + col * (colWidth + 5);
    const y = yPos + row * rowHeight;

    // Background
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(x, y, colWidth, 12, 2, 2, 'F');

    // Label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(lightGray);
    doc.text(item.label, x + 3, y + 5);

    // Value
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    setColor(darkGray);
    doc.text(item.value, x + 3, y + 10);
  });

  // Equipment section
  if (vehicle.equipment && vehicle.equipment.length > 0) {
    yPos += Math.ceil(infoItems.length / itemsPerRow) * rowHeight + 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    setColor(darkGray);
    doc.text('ÉQUIPEMENTS', margin, yPos);

    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const equipmentText = vehicle.equipment.join(' • ');
    const lines = doc.splitTextToSize(equipmentText, pageWidth - 2 * margin);
    
    lines.forEach((line: string, index: number) => {
      if (yPos + (index + 1) * 6 > pageHeight - 40) return; // Avoid overflow
      doc.text(line, margin, yPos + (index + 1) * 6);
    });

    yPos += lines.length * 6 + 5;
  }

  // Description section
  if (vehicle.description && vehicle.description.trim()) {
    yPos += 10;

    if (yPos < pageHeight - 50) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      setColor(darkGray);
      doc.text('DESCRIPTION', margin, yPos);

      yPos += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const descLines = doc.splitTextToSize(vehicle.description, pageWidth - 2 * margin);
      const maxLines = Math.floor((pageHeight - 40 - yPos) / 6);
      const displayLines = descLines.slice(0, maxLines);

      displayLines.forEach((line: string, index: number) => {
        doc.text(line, margin, yPos + (index + 1) * 6);
      });
    }
  }

  // Footer
  const footerY = pageHeight - 25;
  doc.setFillColor(240, 240, 240);
  doc.rect(0, footerY, pageWidth, 25, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setColor(darkGray);
  doc.text('LCF AUTO PERFORMANCE', pageWidth / 2, footerY + 8, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(lightGray);
  doc.text('Lun-Ven: 10:00-12:00, 14:00-18:00', pageWidth / 2, footerY + 14, { align: 'center' });
  doc.text('Contact: info@lcfautoperformance.fr', pageWidth / 2, footerY + 19, { align: 'center' });

  // Save the PDF
  const fileName = `${vehicle.make}_${vehicle.model}_${vehicle.year}.pdf`
    .replace(/\s+/g, '_')
    .toLowerCase();
  doc.save(fileName);
}

// Helper functions
function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatMileage(mileage: number): string {
  return new Intl.NumberFormat('fr-FR').format(mileage) + ' km';
}

function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    'excellent': 'Excellent',
    'tres-bon': 'Très bon',
    'bon': 'Bon',
    'correct': 'Correct',
  };
  return labels[condition] || condition;
}

function getTransmissionLabel(transmission: string): string {
  const labels: Record<string, string> = {
    'manuelle': 'Manuelle',
    'automatique': 'Automatique',
  };
  return labels[transmission] || transmission;
}

function getFuelTypeLabel(fuelType: string): string {
  const labels: Record<string, string> = {
    'essence': 'Essence',
    'diesel': 'Diesel',
    'electrique': 'Électrique',
    'hybride': 'Hybride',
  };
  return labels[fuelType] || fuelType;
}
