'use client';

import { Button } from '@mantine/core';
import { IconFileDownload } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SpecExportPdfProps {
  specRef: React.RefObject<HTMLDivElement | null>;
  title: string;
}

export function SpecExportPdf({ specRef, title }: SpecExportPdfProps) {
  const handleExport = async () => {
    if (!specRef.current) return;

    try {
      notifications.show({
        id: 'pdf-export',
        title: 'Exporting PDF…',
        message: 'Please wait while we generate your PDF.',
        color: 'blue',
        autoClose: 5000,
      });

      const canvas = await html2canvas(specRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // 10mm margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let yPos = 10;
      const marginBottom = 10;

      if (imgHeight <= pageHeight - marginBottom - yPos) {
        pdf.addImage(imgData, 'PNG', 10, yPos, imgWidth, imgHeight);
      } else {
        // Split into multiple pages
        let remainingHeight = imgHeight;
        let offset = 0;
        while (remainingHeight > 0) {
          const pageSliceHeight =
            ((pageHeight - marginBottom - yPos) * canvas.width) / imgWidth;
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = pageSliceHeight;
          const ctx = sliceCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(
              canvas,
              0,
              offset,
              canvas.width,
              pageSliceHeight,
              0,
              0,
              canvas.width,
              pageSliceHeight
            );
          }
          const sliceData = sliceCanvas.toDataURL('image/png');
          if (offset > 0) pdf.addPage();
          pdf.addImage(sliceData, 'PNG', 10, yPos, imgWidth, pageHeight - 20);
          offset += pageSliceHeight;
          remainingHeight -= pageSliceHeight;
          yPos = 10;
        }
      }

      pdf.save(`${title.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`);

      notifications.update({
        id: 'pdf-export',
        title: 'PDF Exported',
        message: 'Your specification has been downloaded as a PDF.',
        color: 'green',
        autoClose: 3000,
      });
    } catch {
      notifications.update({
        id: 'pdf-export',
        title: 'Export Failed',
        message: 'Something went wrong. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  return (
    <Button
      variant="light"
      leftSection={<IconFileDownload size={18} />}
      onClick={handleExport}
      size="sm"
    >
      Export PDF
    </Button>
  );
}
