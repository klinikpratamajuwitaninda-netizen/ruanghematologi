import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ActivationCodeExportItem {
  id: number;
  version: number;
  pureCode: string;
  codeLabel: string;
  programCategory?: string;
  batchLabel?: string;
  isActive: boolean;
  activatedCount?: number;
  statusLabel?: 'Tersedia' | 'Sudah Digunakan' | 'Dinonaktifkan';
  usedByStudentNpm?: string | null;
  usedByStudentName?: string | null;
  createdBy: string;
  createdAt: string;
}

export type PdfFilterMode = 'all' | 'available' | 'used' | 'selected' | 'batch_date';

export interface GenerateActivationCodePdfOptions {
  lecturerName: string;
  institutionName?: string;
  allCodes: ActivationCodeExportItem[];
  filteredCodes: ActivationCodeExportItem[];
  filterMode: PdfFilterMode;
  filterDescription?: string;
  downloadDate?: Date;
}

export function resolveCodeStatus(
  code: ActivationCodeExportItem
): 'Tersedia' | 'Sudah Digunakan' | 'Dinonaktifkan' {
  if (code.statusLabel) return code.statusLabel;
  if ((code.activatedCount || 0) > 0) return 'Sudah Digunakan';
  if (code.isActive) return 'Tersedia';
  return 'Dinonaktifkan';
}

export function extractPureCode(code: ActivationCodeExportItem): string {
  if (code.pureCode && code.pureCode.trim().length > 0) {
    return code.pureCode.trim().toUpperCase();
  }
  return String(code.codeLabel || '')
    .split('•')[0]
    .trim()
    .toUpperCase();
}

export function extractBatchOrCategory(code: ActivationCodeExportItem): string {
  if (code.batchLabel && code.batchLabel.trim()) return code.batchLabel.trim();
  const parts = String(code.codeLabel || '').split('•');
  if (parts.length > 1) {
    const rawPart = parts[1]
      .replace(/\(Tersedia[^)]*\)/gi, '')
      .replace(/Digunakan oleh NPM.*$/gi, '')
      .trim();
    if (rawPart) return rawPart;
  }
  return code.programCategory || 'D-III / D-IV TLM (ATLM)';
}

export function formatIndonesianDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return '-';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatIndonesianDateTime(dateInput: Date): string {
  return dateInput.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function buildPdfFileName(lecturerName: string, date: Date = new Date()): string {
  const sanitizedLecturer = String(lecturerName || 'Dosen_ATLM')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `Daftar_Kode_Aktivasi_${sanitizedLecturer}_${yyyy}-${mm}-${dd}.pdf`;
}

/**
 * Generates a formal A4 Portrait PDF document containing the Lecturer's Student Activation Codes.
 * Pure read-only export: never mutates or creates database codes.
 */
export function createActivationCodesPdfDocument(options: GenerateActivationCodePdfOptions): {
  doc: jsPDF;
  fileName: string;
  totalGenerated: number;
  exportedCount: number;
  availableCount: number;
  usedCount: number;
  deactivatedCount: number;
} {
  const now = options.downloadDate || new Date();
  const lecturerName = options.lecturerName || 'dr. Juwita Ninda Suherman, M.Kes';
  const institution =
    options.institutionName ||
    'INSTITUT KESEHATAN RAJAWALI BANDUNG — PROGRAM STUDI D-III / D-IV TLM (ATLM)';

  // Compute global statistics from allCodes in the database
  const allCodes = options.allCodes || [];
  const totalGenerated = allCodes.length;
  const availableCount = allCodes.filter((c) => resolveCodeStatus(c) === 'Tersedia').length;
  const usedCount = allCodes.filter((c) => resolveCodeStatus(c) === 'Sudah Digunakan').length;
  const deactivatedCount = allCodes.filter((c) => resolveCodeStatus(c) === 'Dinonaktifkan').length;

  // Sort exported codes in ascending order by version / sequential order
  const sortedExportCodes = [...options.filteredCodes].sort(
    (a, b) => (a.version || a.id) - (b.version || b.id)
  );

  // Initialize A4 Portrait PDF (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;

  // Top Formal Header Banner on Page 1
  doc.setFillColor(35, 56, 82); // Deep Clinical Navy (#233852)
  doc.rect(0, 0, pageWidth, 34, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(125, 211, 252); // Sky 300
  doc.text(institution.toUpperCase(), pageWidth / 2, 10, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('DAFTAR KODE AKTIVASI MAHASISWA', pageWidth / 2, 19, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);
  doc.text('Daftar Kode Aktivasi yang Diterbitkan oleh Dosen', pageWidth / 2, 26.5, {
    align: 'center',
  });

  // Metadata & Statistics Summary Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, 39, pageWidth - marginX * 2, 29, 2.5, 2.5, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  // Left Column of Metadata
  doc.setFont('helvetica', 'bold');
  doc.text('Nama Dosen Penerbit', marginX + 4, 46);
  doc.text('Tanggal Unduh', marginX + 4, 52);
  doc.text('Program Studi / Institusi', marginX + 4, 58);
  doc.text('Filter Dokumen PDF', marginX + 4, 64);

  doc.setFont('helvetica', 'normal');
  doc.text(`: ${lecturerName}`, marginX + 44, 46);
  doc.text(`: ${formatIndonesianDateTime(now)} WIB`, marginX + 44, 52);
  doc.text(': D-III / D-IV Teknologi Laboratorium Medis (ATLM)', marginX + 44, 58);
  doc.text(
    `: ${options.filterDescription || 'Semua Kode Aktivasi'} (${sortedExportCodes.length} Kode Ditampilkan)`,
    marginX + 44,
    64
  );

  // Right Column of Statistics Summary
  const rightColX = pageWidth - marginX - 58;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Kode Digenerate : ${totalGenerated}`, rightColX, 46);

  doc.setTextColor(5, 150, 105); // Emerald 600
  doc.text(`Kode Tersedia         : ${availableCount}`, rightColX, 52);

  doc.setTextColor(3, 105, 161); // Sky 700
  doc.text(`Sudah Digunakan       : ${usedCount}`, rightColX, 58);

  doc.setTextColor(185, 28, 28); // Rose 700
  doc.text(`Kode Dinonaktifkan    : ${deactivatedCount}`, rightColX, 64);

  // Build Table Rows
  const tableBody = sortedExportCodes.map((item, idx) => {
    const pureCode = extractPureCode(item);
    const status = resolveCodeStatus(item);
    const category = extractBatchOrCategory(item);
    const createdDate = formatIndonesianDate(item.createdAt);
    const studentInfo =
      status === 'Sudah Digunakan' && (item.usedByStudentNpm || item.usedByStudentName)
        ? `${item.usedByStudentName || 'Mahasiswa ATLM'} (NIM/NPM: ${item.usedByStudentNpm || '-'})`
        : status === 'Sudah Digunakan'
        ? 'Terikat Permanen 1 Mahasiswa'
        : '-';

    return [
      String(idx + 1),
      pureCode,
      status,
      category,
      item.createdBy || lecturerName,
      createdDate,
      studentInfo,
    ];
  });

  autoTable(doc, {
    startY: 73,
    margin: { top: 22, right: marginX, bottom: 18, left: marginX },
    head: [
      [
        'No.',
        'Kode Aktivasi',
        'Status',
        'Program Studi / Kategori',
        'Dosen Penerbit',
        'Tgl. Terbit',
        'Mahasiswa Pengguna (Nama & NIM)',
      ],
    ],
    body: tableBody,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.4,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
      valign: 'middle',
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [35, 56, 82],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 11, halign: 'center', fontStyle: 'bold' },
      1: {
        cellWidth: 37,
        font: 'courier',
        fontStyle: 'bold',
        fontSize: 8.5,
        textColor: [12, 74, 110],
        overflow: ' visible' as any,
      },
      2: { cellWidth: 27, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 32 },
      4: { cellWidth: 28, fontSize: 7.5 },
      5: { cellWidth: 20, halign: 'center', fontSize: 7.5 },
      6: { cellWidth: 27, fontSize: 7.5 },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 2) {
        const rawStatus = String(hookData.cell.raw || '');
        if (rawStatus === 'Tersedia') {
          hookData.cell.styles.fillColor = [209, 250, 229]; // Emerald 100
          hookData.cell.styles.textColor = [6, 95, 70]; // Emerald 800
        } else if (rawStatus === 'Sudah Digunakan') {
          hookData.cell.styles.fillColor = [224, 242, 254]; // Sky 100
          hookData.cell.styles.textColor = [7, 89, 133]; // Sky 800
        } else {
          hookData.cell.styles.fillColor = [254, 226, 226]; // Rose 100
          hookData.cell.styles.textColor = [153, 27, 27]; // Rose 800
        }
      }
    },
    rowPageBreak: 'avoid',
  });

  // Add running Header (on pages >= 2) and Footer with Page Numbers on all pages
  const totalPages = doc.getNumberOfPages();
  const fileName = buildPdfFileName(lecturerName, now);

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    if (p > 1) {
      doc.setFillColor(35, 56, 82);
      doc.rect(0, 0, pageWidth, 14, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(
        `DAFTAR KODE AKTIVASI MAHASISWA — ${lecturerName.toUpperCase()}`,
        marginX,
        9
      );
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(186, 230, 253);
      doc.text(`Lanjutan Halaman ${p}`, pageWidth - marginX, 9, { align: 'right' });
    }

    // Footer Line & Page Number
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.25);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Dokumen Resmi Portal Dosen HEMATOLOGY WORLD • ${lecturerName} • 1 Kode Unik = 1 Mahasiswa`,
      marginX,
      pageHeight - 7.5
    );
    doc.setFont('helvetica', 'bold');
    doc.text(`Halaman ${p} dari ${totalPages}`, pageWidth - marginX, pageHeight - 7.5, {
      align: 'right',
    });
  }

  return {
    doc,
    fileName,
    totalGenerated,
    exportedCount: sortedExportCodes.length,
    availableCount,
    usedCount,
    deactivatedCount,
  };
}
