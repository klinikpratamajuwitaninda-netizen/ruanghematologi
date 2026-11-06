/**
 * Export PPTX & PDF with Watermark & Copyright Protection
 * Digunakan oleh Modul Pages / Presentasi Slide Hematology World
 * Pemegang Hak Cipta: dr. Juwita Ninda Suherman, M.Kes
 */

import pptxgen from 'pptxgenjs';
import { jsPDF } from 'jspdf';
import { LearningModuleData } from '../data/hematologyData';
import { COPYRIGHT_HOLDER, COPYRIGHT_YEAR } from '../components/CopyrightProtection';

export interface SlideExportData {
  slideNumber: number;
  totalSlides: number;
  title: string;
  category: string;
  pdfPages: number[];
  imageSrc?: string;
  summary: string;
  bulletPoints: string[];
  keyTakeaways: string[];
  narrationScript: string;
  formulaText?: string;
}

/**
 * Downloads a high-fidelity PowerPoint (.pptx) file with:
 * - 16:9 widescreen ratio
 * - Copyright footer on every slide
 * - Transparent elegant diagonal watermark
 * - Slide narration notes (Presenter Notes)
 * - Complete title, bullets, key takeaways, and visual image
 */
export async function downloadModulePresentationPptx(
  mod: LearningModuleData,
  slides: SlideExportData[]
): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = `${mod.title} — Presentasi Hematologi`;
  pptx.author = 'dr. Juwita Ninda Suherman, M.Kes';
  pptx.company = 'Institut Kesehatan Rajawali Bandung';
  pptx.subject = 'Teknologi Laboratorium Medik (ATLM) — Anatomi & Fisiologi Hematologi';

  // 1. Title Slide (Cover)
  const cover = pptx.addSlide();
  cover.background = { color: '0F172A' }; // Slate-900

  cover.addText('INSTITUT KESEHATAN RAJAWALI BANDUNG', {
    x: 0.8,
    y: 0.8,
    w: 8.5,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: '38BDF8', // Sky-400
    fontFace: 'Arial',
  });

  cover.addText(`MODUL #${mod.moduleNumber}: ${mod.title.toUpperCase()}`, {
    x: 0.8,
    y: 1.4,
    w: 11.5,
    h: 1.6,
    fontSize: 32,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial',
  });

  cover.addText(`Kategori: ${mod.category} • Referensi: PDF ANFIS Darah Halaman ${mod.pdfPages.join(', ')}`, {
    x: 0.8,
    y: 3.1,
    w: 11.5,
    h: 0.5,
    fontSize: 14,
    color: '94A3B8',
    fontFace: 'Arial',
  });

  cover.addText(mod.summary, {
    x: 0.8,
    y: 3.8,
    w: 11.5,
    h: 1.4,
    fontSize: 15,
    color: 'E2E8F0',
    fontFace: 'Arial',
    lineSpacingMultiple: 1.2,
  });

  cover.addText(`Dosen Pengampu / Pemegang Hak Cipta:\ndr. Juwita Ninda Suherman, M.Kes\nProgram Studi Teknologi Laboratorium Medik (ATLM)`, {
    x: 0.8,
    y: 5.4,
    w: 8.0,
    h: 1.2,
    fontSize: 13,
    color: 'FCD34D',
    fontFace: 'Arial',
    bold: true,
  });

  // Cover Watermark & Footer
  cover.addText(`COPYRIGHT © ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER}`, {
    x: 0.8,
    y: 6.8,
    w: 11.5,
    h: 0.4,
    fontSize: 10,
    color: '64748B',
    fontFace: 'Arial',
  });

  // 2. Iterate each slide
  for (let idx = 0; idx < slides.length; idx++) {
    const s = slides[idx];
    const slide = pptx.addSlide();
    slide.background = { color: 'F8FAFC' }; // Slate-50

    // Top Header Banner
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.33,
      h: 1.1,
      fill: { color: '0F172A' },
    });

    slide.addText(`SLIDE ${s.slideNumber} / ${s.totalSlides} • ${s.category.toUpperCase()}`, {
      x: 0.8,
      y: 0.15,
      w: 11.5,
      h: 0.3,
      fontSize: 11,
      color: '38BDF8',
      bold: true,
      fontFace: 'Arial',
    });

    slide.addText(s.title, {
      x: 0.8,
      y: 0.45,
      w: 11.5,
      h: 0.55,
      fontSize: 20,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial',
    });

    // Elegant Subtle Diagonal Watermark across the slide background
    slide.addText(`COPYRIGHT © ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER}`, {
      x: 1.5,
      y: 3.2,
      w: 10.5,
      h: 1.2,
      fontSize: 22,
      bold: true,
      color: 'E2E8F0', // Very light slate watermark
      rotate: -18,
      align: 'center',
      fontFace: 'Arial',
    });

    // Content: Left Column (Summary + Bullet Points)
    const leftTextArray: Array<{ text: string; options?: any }> = [
      {
        text: s.summary + '\n\n',
        options: { fontSize: 13, bold: true, color: '0F172A', lineSpacingMultiple: 1.2 },
      },
    ];

    s.bulletPoints.forEach((bp) => {
      leftTextArray.push({
        text: `• ${bp}\n`,
        options: { fontSize: 12, color: '334155', lineSpacingMultiple: 1.25 },
      });
    });

    if (s.formulaText) {
      leftTextArray.push({
        text: `\n[Rumus Laboratorium]: ${s.formulaText}\n`,
        options: { fontSize: 12, bold: true, color: '0369A1' },
      });
    }

    slide.addText(leftTextArray, {
      x: 0.8,
      y: 1.35,
      w: 7.2,
      h: 4.8,
      valign: 'top',
      fontFace: 'Arial',
    });

    // Right Column: Key Takeaways Card & Academic Citation
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.3,
      y: 1.35,
      w: 4.3,
      h: 4.8,
      fill: { color: 'F1F5F9' },
      line: { color: 'CBD5E1', width: 1 },
    });

    const rightTextArray: Array<{ text: string; options?: any }> = [
      {
        text: 'POIN KUNCI & KORELASI KLINIS:\n',
        options: { fontSize: 11, bold: true, color: '0284C7' },
      },
    ];

    s.keyTakeaways.forEach((kt) => {
      rightTextArray.push({
        text: `✔ ${kt}\n`,
        options: { fontSize: 10.5, color: '1E293B', lineSpacingMultiple: 1.2 },
      });
    });

    rightTextArray.push({
      text: `\nReferensi Asli:\nPDF ANFIS Darah Halaman ${s.pdfPages.join(', ')}\ndr. Juwita Ninda Suherman, M.Kes`,
      options: { fontSize: 9.5, italic: true, color: '64748B' },
    });

    slide.addText(rightTextArray, {
      x: 8.5,
      y: 1.5,
      w: 3.9,
      h: 4.5,
      valign: 'top',
      fontFace: 'Arial',
    });

    // Slide Bottom Copyright & Protection Strip
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 7.05,
      w: 13.33,
      h: 0.45,
      fill: { color: '0F172A' },
    });

    slide.addText(
      `© ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER} | COPYRIGHT PROTECTED • Dilarang menggandakan/mendistribusikan tanpa izin tertulis`,
      {
        x: 0.8,
        y: 7.12,
        w: 11.5,
        h: 0.3,
        fontSize: 9,
        color: '94A3B8',
        fontFace: 'Arial',
      }
    );

    // Add Presenter Narration Script to PPTX Notes
    if (s.narrationScript) {
      slide.addNotes(
        `[NASKAH NARASI DOSEN — DR. JUWITA NINDA SUHERMAN, M.KES]:\n${s.narrationScript}\n\n[HAK CIPTA]:\n© ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER}. Seluruh hak cipta dilindungi.`
      );
    }
  }

  // 3. Final Copyright & Legal Disclaimer Slide
  const legalSlide = pptx.addSlide();
  legalSlide.background = { color: '0F172A' };

  legalSlide.addText('PEMBERITAHUAN HAK CIPTA & LISENSI PENGGUNAAN RESMI', {
    x: 0.8,
    y: 1.0,
    w: 11.5,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: '38BDF8',
    fontFace: 'Arial',
  });

  const legalContent = [
    `1. Karya ini disusun dan dimiliki secara resmi oleh dr. Juwita Ninda Suherman, M.Kes dan Institut Kesehatan Rajawali Bandung.\n`,
    `2. Slide presentasi ini hanya diperuntukkan bagi mahasiswa dan sivitas akademika untuk kepentingan pembelajaran pribadi.\n`,
    `3. Dilarang keras menyalin, menggandakan, memperbanyak, mempublikasikan ulang, mengunggah ke platform lain, atau memperjualbelikan materi ini tanpa izin tertulis dari pemegang hak cipta.\n`,
    `4. Pelanggaran hak cipta dapat dikenakan sanksi sesuai dengan Undang-Undang Hak Cipta No. 28 Tahun 2014 Republik Indonesia.\n\n`,
    `© ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER}. ALL RIGHTS RESERVED.`,
  ].join('');

  legalSlide.addText(legalContent, {
    x: 0.8,
    y: 1.8,
    w: 11.5,
    h: 4.5,
    fontSize: 13,
    color: 'E2E8F0',
    fontFace: 'Arial',
    lineSpacingMultiple: 1.3,
  });

  const filename = `HematologyWorld_Modul_${mod.moduleNumber}_${mod.title.replace(/[^a-zA-Z0-9]/g, '_')}_Protected.pptx`;
  await pptx.writeFile({ fileName: filename });
}

/**
 * Downloads a complete high-fidelity PDF file of the presentation slides with:
 * - Landscape slide format (A4 Landscape)
 * - Clear header, title, summary, bullets, and takeaways
 * - Transparent diagonal watermark on every page: COPYRIGHT © 2026 DR. JUWITA NINDA SUHERMAN, M.KES
 * - Copyright footer strip on every page
 * - Dedicated final legal & copyright disclaimer page
 */
export async function downloadModulePresentationPdf(
  mod: LearningModuleData,
  slides: SlideExportData[]
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4', // 297mm x 210mm
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // Helper to draw watermark & copyright footer on each page
  const applyWatermarkAndFooter = (pageNum: number, totalPages: number) => {
    // Elegant diagonal watermark
    doc.saveGraphicsState();
    // @ts-ignore
    if (doc.setGState) {
      // @ts-ignore
      doc.setGState(new (doc as any).GState({ opacity: 0.12 }));
    }
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(140, 155, 175);
    doc.text(
      `COPYRIGHT © ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER.toUpperCase()}`,
      pageWidth / 2,
      pageHeight / 2 + 10,
      { align: 'center', angle: -22 }
    );
    doc.restoreGraphicsState();

    // Bottom Footer Strip
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text(
      `© ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER} | COPYRIGHT PROTECTED • Dilarang memperbanyak tanpa izin`,
      14,
      pageHeight - 4.5
    );

    doc.setFont('helvetica', 'bold');
    doc.text(`Halaman ${pageNum} / ${totalPages}`, pageWidth - 14, pageHeight - 4.5, { align: 'right' });
  };

  // 1. Cover Page
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text('INSTITUT KESEHATAN RAJAWALI BANDUNG • PROGRAM STUDI TEKNOLOGI LABORATORIUM MEDIK (ATLM)', 16, 26);

  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(`MODUL #${mod.moduleNumber}: ${mod.title.toUpperCase()}`, 16, 42);

  doc.setFontSize(12);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Kategori: ${mod.category} • Referensi: PDF ANFIS Darah Halaman ${mod.pdfPages.join(', ')}`, 16, 52);

  doc.setFontSize(11);
  doc.setTextColor(226, 232, 240);
  const splitSummary = doc.splitTextToSize(mod.summary, pageWidth - 32);
  doc.text(splitSummary, 16, 66);

  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(0.5);
  doc.line(16, 95, pageWidth - 16, 95);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(252, 211, 77); // amber-300
  doc.text('Dosen Pengampu & Pemegang Hak Cipta Resmi:', 16, 110);
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('dr. Juwita Ninda Suherman, M.Kes', 16, 120);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Institut Kesehatan Rajawali Bandung — Fakultas Kedokteran & Kesehatan', 16, 128);
  doc.text(`Platform Pembelajaran Digital HEMATOLOGY WORLD • Tahun Terbit ${COPYRIGHT_YEAR}`, 16, 134);

  // Cover Watermark & Footer
  applyWatermarkAndFooter(1, slides.length + 2);

  // 2. Individual Slides
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    doc.addPage();

    // Top Header Banner
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 24, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(56, 189, 248);
    doc.text(`SLIDE ${s.slideNumber} / ${s.totalSlides} • ${s.category.toUpperCase()}`, 16, 10);

    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text(s.title, 16, 19);

    // Content: Left Column (Summary + Bullets)
    let curY = 36;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const summaryLines = doc.splitTextToSize(s.summary, 160);
    doc.text(summaryLines, 16, curY);
    curY += summaryLines.length * 5.5 + 4;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    s.bulletPoints.forEach((bp) => {
      const bpLines = doc.splitTextToSize(`• ${bp}`, 160);
      doc.text(bpLines, 16, curY);
      curY += bpLines.length * 4.8 + 2;
    });

    if (s.formulaText) {
      curY += 2;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(3, 105, 161);
      doc.text(`[Rumus Lab]: ${s.formulaText}`, 16, curY);
      curY += 6;
    }

    // Right Column: Key Takeaways Box
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(188, 32, 93, 148, 3, 3, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 132, 199);
    doc.text('POIN KUNCI & KORELASI KLINIS:', 194, 42);

    let rightY = 50;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    s.keyTakeaways.forEach((kt) => {
      const ktLines = doc.splitTextToSize(`✔ ${kt}`, 82);
      doc.text(ktLines, 194, rightY);
      rightY += ktLines.length * 4.2 + 2;
    });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(`Ref: PDF Halaman ${s.pdfPages.join(', ')}`, 194, 168);
    doc.text('dr. Juwita Ninda Suherman, M.Kes', 194, 173);

    applyWatermarkAndFooter(i + 2, slides.length + 2);
  }

  // 3. Final Legal Disclaimer Page
  doc.addPage();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(56, 189, 248);
  doc.text('PEMBERITAHUAN HAK CIPTA & KETENTUAN PENGGUNAAN', 16, 32);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);

  const disclaimerText = [
    '1. Seluruh materi, slide presentasi, dokumen, tabel klinis, dan ilustrasi ini merupakan karya intelektual resmi milik dr. Juwita Ninda Suherman, M.Kes dan Institut Kesehatan Rajawali Bandung.',
    '',
    '2. Dokumen ini hanya diperuntukkan bagi mahasiswa Teknologi Laboratorium Medik (ATLM) dan pengguna terdaftar untuk kepentingan pembelajaran akademik non-komersial.',
    '',
    '3. DILARANG KERAS menyalin, memperbanyak, membagikan ulang, mengunggah ke repositori publik, memodifikasi, atau menjual materi ini tanpa izin tertulis dari pemegang hak cipta.',
    '',
    '4. Pelanggaran terhadap hak kekayaan intelektual ini dapat ditindaklanjuti sesuai dengan hukum yang berlaku di Republik Indonesia (Undang-Undang No. 28 Tahun 2014 tentang Hak Cipta).',
    '',
    `© ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER}. ALL RIGHTS RESERVED.`,
  ];

  let discY = 48;
  disclaimerText.forEach((line) => {
    if (line === '') {
      discY += 4;
      return;
    }
    const lines = doc.splitTextToSize(line, pageWidth - 32);
    doc.text(lines, 16, discY);
    discY += lines.length * 5.2 + 2;
  });

  applyWatermarkAndFooter(slides.length + 2, slides.length + 2);

  const filename = `HematologyWorld_Modul_${mod.moduleNumber}_${mod.title.replace(/[^a-zA-Z0-9]/g, '_')}_Protected.pdf`;
  doc.save(filename);
}
