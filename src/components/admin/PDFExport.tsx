'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { jsPDF as jsPDFType } from 'jspdf';

interface PDFExportProps {
  data: Record<string, unknown>[];
  title: string;
  filename: string;
}

interface AutoTableConfig {
  head: string[][];
  body: string[][];
  startY: number;
  styles: Record<string, unknown>;
  headStyles: Record<string, unknown>;
  alternateRowStyles: Record<string, unknown>;
}

export function PDFExport({ data, title, filename }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF() as jsPDFType & { autoTable: (config: AutoTableConfig) => void };

      // Add logo/header
      doc.setFontSize(24);
      doc.setTextColor(22, 163, 74); // Green color
      doc.text('AgriGuard', 20, 30);

      // Add title
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text(title, 20, 50);

      // Add date and time
      const now = new Date();
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 20, 65);

      // Add watermark
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(60);
      doc.text('AgriGuard', doc.internal.pageSize.width / 2, doc.internal.pageSize.height / 2, {
        align: 'center',
        angle: 45,
      });

      // Prepare table data
      if (data.length > 0) {
        const headers = Object.keys(data[0]).filter(key => key !== '_id' && key !== '__v');
        const rows = data.map(item =>
          headers.map(header => {
            const value = item[header];
            if (typeof value === 'object' && value !== null) {
              return JSON.stringify(value);
            }
            return String(value || '');
          })
        );

        // Add table
        doc.autoTable({
          head: [headers],
          body: rows,
          startY: 80,
          styles: {
            fontSize: 8,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [22, 163, 74],
            textColor: 255,
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
        });
      }

      // Save the PDF
      doc.save(`${filename}_${now.getTime()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      <Download className="w-4 h-4 mr-2" />
      {isGenerating ? 'Generating...' : `Download ${title} PDF`}
    </Button>
  );
}
