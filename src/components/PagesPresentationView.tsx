/**
 * Interactive Presentation & Pages View Component
 * Didesain khusus untuk Platform HEMATOLOGY WORLD
 * Pemegang Hak Cipta: dr. Juwita Ninda Suherman, M.Kes
 *
 * Fitur:
 * - Dukungan 2 Kumpulan Presentasi Lengkap:
 *   1. "Perhitungan Parameter Hematologi (24 Slide Lengkap ATLM)" berdasarkan PDF Baru:
 *      RBC, WBC, Trombosit, HCT, Diff Count, Retikulosit, Indeks MCV/MCH/MCHC, ANC, Klasifikasi Anemia, Polisitemia, Hemostasis 4 Fase & Kaskade Koagulasi.
 *   2. "35 Modul Pembelajaran Hematologi Lengkap" (Mencakup seluruh 47 Halaman Asli: Sel Darah, Hemopoiesis, Leukosit, Trombosit, dll.).
 * - Pemilih Modul / Slide Dropdown agar pengguna dapat membuka slide manapun (bukan hanya sejarah).
 * - Animasi Bertahap Halus (Fade In, Staggered Points, Zoom Visual).
 * - Suara Narator Dosen bahasa Indonesia (Wanita: dr. Juwita Ninda Suherman, M.Kes / Pria: dr. Hendrawan Pratama, Sp.PK).
 * - Musik Latar (BGM) Lembut dengan Audio Ducking saat narator berbicara.
 * - Mode Layar Penuh (Fullscreen) dengan Pintasan Keyboard (Arrow / Space / Esc).
 * - 3 Tombol Utama: LIHAT SLIDE (PAGES), DOWNLOAD MATERI PDF, DOWNLOAD POWERPOINT (PPTX).
 * - Watermark Hak Cipta Transparan dan Bilah Hak Cipta di setiap slide.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Presentation,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Shield,
  Layers,
  Music,
  User,
  Sliders,
  Eye,
  Calculator,
  Search,
} from 'lucide-react';
import { HEMATOLOGY_MODULES, LearningModuleData } from '../data/hematologyData';
import { ATLM_CALC_24_SLIDES, AtlmSlideItem } from '../data/atlmCalcSlidesData';
import { soundManager } from '../utils/soundManager';
import { SlideCopyrightBar, CopyrightNoticeModal } from './CopyrightProtection';
import {
  downloadModulePresentationPdf,
  downloadModulePresentationPptx,
  SlideExportData,
} from '../utils/exportPresentationDocuments';

interface PagesPresentationViewProps {
  module?: LearningModuleData;
  onBack?: () => void;
  onMarkComplete?: () => void;
  isCompleted?: boolean;
}

export const PagesPresentationView: React.FC<PagesPresentationViewProps> = ({
  module: initialModule,
  onBack,
  onMarkComplete,
  isCompleted = false,
}) => {
  // Mode Presentasi: 'atlm_calc' (24 Slide Perhitungan Baru) atau 'modules_35' (35 Modul Hematologi)
  const [presentationSource, setPresentationSource] = useState<'atlm_calc' | 'modules_35'>('atlm_calc');
  const [selectedModuleNumber, setSelectedModuleNumber] = useState<number>(initialModule?.moduleNumber || 1);

  // Active module when in 35-modules mode
  const currentModule = useMemo(() => {
    return HEMATOLOGY_MODULES.find((m) => m.moduleNumber === selectedModuleNumber) || HEMATOLOGY_MODULES[0];
  }, [selectedModuleNumber]);

  // Construct current slidesData based on presentation source
  const slidesData: SlideExportData[] = useMemo(() => {
    if (presentationSource === 'atlm_calc') {
      return ATLM_CALC_24_SLIDES.map((item) => {
        const bullets = [...item.bulletPoints];
        if (item.calculationExample) {
          bullets.push(`Contoh Hitung: ${item.calculationExample.input} -> ${item.calculationExample.result}`);
        }
        if (item.clinicalNotes && item.clinicalNotes.length > 0) {
          bullets.push(`Catatan ATLM: ${item.clinicalNotes[0]}`);
        }

        const takeaways = item.referenceRanges.map((r) => `${r.label}: ${r.range}`);
        if (item.formula) {
          takeaways.unshift(`Rumus: ${item.formula}`);
        }

        return {
          slideNumber: item.slideNumber,
          totalSlides: item.totalSlides,
          title: item.title,
          category: item.category,
          pdfPages: [item.slideNumber],
          imageSrc: item.imageSrc,
          summary: item.summary,
          bulletPoints: bullets,
          keyTakeaways: takeaways,
          narrationScript: item.narrationScript,
          formulaText: item.formula,
        };
      });
    }

    // Otherwise, generate slides from the selected 35 module
    const list: SlideExportData[] = [];
    const total = Math.max(3, (currentModule.detailedContent || []).length + 2);

    // Slide 1: Pengantar
    list.push({
      slideNumber: 1,
      totalSlides: total,
      title: `${currentModule.title}: Pengantar & Konsep Dasar`,
      category: currentModule.category,
      pdfPages: currentModule.pdfPages,
      imageSrc: `/assets/pdf/page_${String(currentModule.primaryImagePage).padStart(2, '0')}.jpg`,
      summary: currentModule.summary,
      bulletPoints: [
        `Kompetensi Pembelajaran: Menjelaskan fisiologi dan analisis ${currentModule.title}.`,
        `Kategori Perkuliahan: ${currentModule.category} (Teknologi Laboratorium Medik).`,
        `Rujukan Resmi: PDF ANFIS Darah Halaman ${currentModule.pdfPages.join(', ')}.`,
      ],
      keyTakeaways: currentModule.keyTakeaways.slice(0, 3),
      narrationScript: `Selamat datang pada materi ${currentModule.title}. ${currentModule.summary}. Mari kita pelajari konsep dan korelasi laboratoriumnya secara terperinci.`,
    });

    // Content Slides
    (currentModule.detailedContent || []).forEach((para, idx) => {
      const pageRef = currentModule.pdfPages[idx % currentModule.pdfPages.length] || currentModule.primaryImagePage;
      const formulaItem = currentModule.formulas?.[idx % (currentModule.formulas.length || 1)];

      list.push({
        slideNumber: idx + 2,
        totalSlides: total,
        title: `${currentModule.title}: Pembahasan ${idx + 1}`,
        category: currentModule.category,
        pdfPages: [pageRef],
        imageSrc: `/assets/pdf/page_${String(pageRef).padStart(2, '0')}.jpg`,
        summary: para,
        bulletPoints: [
          'Evaluasi Analitik: Memastikan validitas kontrol mutu dan penanganan reagen.',
          'Kinetika & Metabolisme: Dinamika fisiologis seluler dalam sirkulasi darah utuh.',
          'Signifikansi Klinis: Indikator diagnostik untuk membedakan kondisi patologis.',
        ],
        keyTakeaways: [
          currentModule.keyTakeaways[idx % currentModule.keyTakeaways.length] ||
            'Terapkan prosedur standar operasional (SOP) hematologi medik.',
          `Halaman Rujukan: PDF Hal. ${pageRef}.`,
        ],
        narrationScript: `Pada pembahasan bagian ini: ${para}. Perhatikan baik-baik nilai normal dan korelasi analitik yang tertera.`,
        formulaText: formulaItem ? `${formulaItem.name}: ${formulaItem.formula} (${formulaItem.unit})` : undefined,
      });
    });

    // Final Slide: Rangkuman
    list.push({
      slideNumber: total,
      totalSlides: total,
      title: `${currentModule.title}: Rangkuman & Nilai Rujukan`,
      category: currentModule.category,
      pdfPages: currentModule.pdfPages,
      imageSrc: `/assets/pdf/page_${String(currentModule.primaryImagePage).padStart(2, '0')}.jpg`,
      summary: currentModule.caption,
      bulletPoints: [
        'Semua parameter hematologi saling mengonfirmasi profil klinis pasien.',
        'Korelasi antara hasil alat otomatis dan verifikasi mikroskopis SADT merupakan standar emas.',
        'Penguasaan materi ini menunjang keberhasilan ujian kompetensi ATLM.',
      ],
      keyTakeaways: currentModule.keyTakeaways,
      narrationScript: `Sebagai rangkuman modul ${currentModule.title}: ${currentModule.caption}. Pastikan seluruh poin rujukan dipahami dengan saksama.`,
    });

    return list;
  }, [presentationSource, currentModule]);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);
  const [isAutoPlayMode, setIsAutoPlayMode] = useState(false);
  const [isBgmEnabled, setIsBgmEnabled] = useState(true);
  const [narratorGender, setNarratorGender] = useState<'female' | 'male'>('female');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCopyrightWarning, setShowCopyrightWarning] = useState(false);
  const [pendingDownloadType, setPendingDownloadType] = useState<'pdf' | 'pptx' | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Staggered step animations for current slide elements
  const [animationStep, setAnimationStep] = useState(1);

  const presentationContainerRef = useRef<HTMLDivElement>(null);
  const currentSlide = slidesData[currentSlideIndex] || slidesData[0];

  // Reset slide index when source or module changes
  useEffect(() => {
    setCurrentSlideIndex(0);
    soundManager.stopSpeaking();
    setIsPlayingNarration(false);
  }, [presentationSource, selectedModuleNumber]);

  // Reset animation step when slide changes
  useEffect(() => {
    setAnimationStep(1);
    const t1 = setTimeout(() => setAnimationStep(2), 200);
    const t2 = setTimeout(() => setAnimationStep(3), 500);
    const t3 = setTimeout(() => setAnimationStep(4), 850);
    const t4 = setTimeout(() => setAnimationStep(5), 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [currentSlideIndex]);

  // Handle Background Music Ducking during narration
  useEffect(() => {
    if (isBgmEnabled) {
      soundManager.startBGM();
      if (isPlayingNarration) {
        soundManager.setBgmVolume(0.12);
      } else {
        soundManager.setBgmVolume(0.45);
      }
    } else {
      soundManager.stopBGM();
    }
  }, [isBgmEnabled, isPlayingNarration]);

  // Stop BGM and Narration when component unmounts
  useEffect(() => {
    return () => {
      soundManager.stopBGM();
      soundManager.stopSpeaking();
    };
  }, []);

  // Keyboard Navigation for Fullscreen & Presentation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, isFullscreen, slidesData.length]);

  const playSlideNarration = () => {
    soundManager.stopSpeaking();
    setIsPlayingNarration(true);

    const script = currentSlide.narrationScript;
    const charId = narratorGender === 'female' ? 'lecturer_juwita' : 'doctor_hendrawan';

    soundManager.speakCharacterDialogue({
      text: script,
      lang: 'id-ID',
      characterId: charId,
      emotion: 'Confident',
      onComplete: () => {
        setIsPlayingNarration(false);
        if (isAutoPlayMode && currentSlideIndex < slidesData.length - 1) {
          setTimeout(() => {
            setCurrentSlideIndex((prev) => prev + 1);
          }, 1200);
        }
      },
    });
  };

  const pauseSlideNarration = () => {
    soundManager.stopSpeaking();
    setIsPlayingNarration(false);
  };

  const replaySlideNarration = () => {
    soundManager.stopSpeaking();
    playSlideNarration();
  };

  const goToNextSlide = () => {
    soundManager.playClick();
    soundManager.stopSpeaking();
    setIsPlayingNarration(false);
    if (currentSlideIndex < slidesData.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const goToPrevSlide = () => {
    soundManager.playClick();
    soundManager.stopSpeaking();
    setIsPlayingNarration(false);
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    soundManager.playClick();
    if (!isFullscreen) {
      if (presentationContainerRef.current?.requestFullscreen) {
        presentationContainerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Trigger Narration automatically when auto-play is enabled
  useEffect(() => {
    if (isAutoPlayMode) {
      const timer = setTimeout(() => {
        playSlideNarration();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentSlideIndex, isAutoPlayMode]);

  // Protected Download Handlers
  const handleDownloadPdfClick = () => {
    soundManager.playClick();
    const hasAgreed = localStorage.getItem('hw_copyright_agreed');
    if (!hasAgreed) {
      setPendingDownloadType('pdf');
      setShowCopyrightWarning(true);
    } else {
      executeDownloadPdf();
    }
  };

  const handleDownloadPptxClick = () => {
    soundManager.playClick();
    const hasAgreed = localStorage.getItem('hw_copyright_agreed');
    if (!hasAgreed) {
      setPendingDownloadType('pptx');
      setShowCopyrightWarning(true);
    } else {
      executeDownloadPptx();
    }
  };

  const executeDownloadPdf = async () => {
    try {
      setIsExporting(true);
      const activeModuleMeta =
        presentationSource === 'atlm_calc'
          ? {
              moduleNumber: 100,
              title: 'Perhitungan Parameter Hematologi & Korelasi Klinis (24 Slide Lengkap ATLM)',
              category: 'Pemeriksaan Lab & Klinis' as const,
              pdfPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
              primaryImagePage: 1,
              caption: 'Perhitungan Parameter Hematologi: RBC, WBC, PLT, HCT, Diff Count, Retikulosit, Indeks Eritrosit, ANC, Klasifikasi Anemia & Hemostasis.',
              summary: 'Materi Lengkap Presentasi Slide Mahasiswa ATLM Berdasarkan Diktat Kuliah dr. Juwita Ninda Suherman, M.Kes.',
              detailedContent: slidesData.map((s) => s.summary),
              keyTakeaways: slidesData.flatMap((s) => s.keyTakeaways),
              practiceQuestion: {
                question: 'Berapakah faktor pengali untuk hitung eritrosit manual pada kamar hitung Improved Neubauer?',
                options: ['100', '1.000', '10.000', '50'],
                correctIndex: 2,
                explanation: 'Faktor pengali eritrosit pada 5 kotak kecil tengah adalah 10.000 (Pengenceran 1:200 dibagi volume 0,02 mm³).',
              },
            }
          : currentModule;

      await downloadModulePresentationPdf(activeModuleMeta, slidesData);
      soundManager.playLevelUp();
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const executeDownloadPptx = async () => {
    try {
      setIsExporting(true);
      const activeModuleMeta =
        presentationSource === 'atlm_calc'
          ? {
              moduleNumber: 100,
              title: 'Perhitungan Parameter Hematologi & Korelasi Klinis (24 Slide Lengkap ATLM)',
              category: 'Pemeriksaan Lab & Klinis' as const,
              pdfPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
              primaryImagePage: 1,
              caption: 'Perhitungan Parameter Hematologi: RBC, WBC, PLT, HCT, Diff Count, Retikulosit, Indeks Eritrosit, ANC, Klasifikasi Anemia & Hemostasis.',
              summary: 'Materi Lengkap Presentasi Slide Mahasiswa ATLM Berdasarkan Diktat Kuliah dr. Juwita Ninda Suherman, M.Kes.',
              detailedContent: slidesData.map((s) => s.summary),
              keyTakeaways: slidesData.flatMap((s) => s.keyTakeaways),
              practiceQuestion: {
                question: 'Berapakah faktor pengali untuk hitung leukosit manual pada kamar hitung Improved Neubauer?',
                options: ['10', '50', '200', '10.000'],
                correctIndex: 1,
                explanation: 'Faktor pengali leukosit pada 4 kotak sudut adalah 50 (Pengenceran 1:20 dibagi volume 0,4 mm³).',
              },
            }
          : currentModule;

      await downloadModulePresentationPptx(activeModuleMeta, slidesData);
      soundManager.playLevelUp();
    } catch (err) {
      console.error('PPTX export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyrightAgreed = () => {
    localStorage.setItem('hw_copyright_agreed', 'true');
    setShowCopyrightWarning(false);
    if (pendingDownloadType === 'pdf') {
      executeDownloadPdf();
    } else if (pendingDownloadType === 'pptx') {
      executeDownloadPptx();
    }
    setPendingDownloadType(null);
  };

  return (
    <div className="space-y-6">
      {/* Presentation Switcher: 24 Slide Perhitungan Baru vs 35 Modul Lengkap */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src="/assets/ikes_rajawali_logo.png"
            alt="Logo IKES Rajawali"
            className="w-12 h-12 rounded-full bg-white p-0.5 object-contain shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400">
                PAGES DIGITAL PRESENTATION • DR. JUWITA NINDA SUHERMAN, M.KES
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                AKSES TERBUKA
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold mt-0.5 leading-tight">
              {presentationSource === 'atlm_calc'
                ? 'Perhitungan Parameter Hematologi (24 Slide Lengkap ATLM)'
                : `Modul #${currentModule.moduleNumber}: ${currentModule.title}`}
            </h2>
          </div>
        </div>

        {/* Presentation Deck Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setPresentationSource('atlm_calc');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              presentationSource === 'atlm_calc'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Calculator className="w-4 h-4" />
            24 Slide Perhitungan ATLM (Lengkap)
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setPresentationSource('modules_35');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              presentationSource === 'modules_35'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            35 Modul Hematologi
          </button>
        </div>
      </div>

      {/* Module Selector Dropdown if in 35-Modules mode */}
      {presentationSource === 'modules_35' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Pilih Modul Pembelajaran:
            </span>
            <select
              value={selectedModuleNumber}
              onChange={(e) => {
                soundManager.playClick();
                setSelectedModuleNumber(Number(e.target.value));
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {HEMATOLOGY_MODULES.map((m) => (
                <option key={m.moduleNumber} value={m.moduleNumber}>
                  Modul #{m.moduleNumber}: {m.title} ({m.category})
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Total 35 Modul Lengkap (Mencakup 47 Halaman Asli PDF)
          </span>
        </div>
      )}

      {/* Direct Slide Jump Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 font-mono">Lompat ke Slide:</span>
          <select
            value={currentSlideIndex}
            onChange={(e) => {
              soundManager.playClick();
              soundManager.stopSpeaking();
              setIsPlayingNarration(false);
              setCurrentSlideIndex(Number(e.target.value));
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50"
          >
            {slidesData.map((s, idx) => (
              <option key={idx} value={idx}>
                Slide {s.slideNumber}: {s.title}
              </option>
            ))}
          </select>
        </div>

        {/* 3 Main Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              if (presentationContainerRef.current) {
                presentationContainerRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Presentation className="w-4 h-4" />
            LIHAT SLIDE (PAGES)
          </button>

          <button
            onClick={handleDownloadPdfClick}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            {isExporting && pendingDownloadType === 'pdf' ? 'Membuat PDF...' : 'DOWNLOAD MATERI PDF'}
          </button>

          <button
            onClick={handleDownloadPptxClick}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Download className="w-4 h-4 text-white" />
            {isExporting && pendingDownloadType === 'pptx'
              ? 'Membuat PPTX...'
              : 'DOWNLOAD POWERPOINT (PPTX)'}
          </button>
        </div>
      </div>

      {/* Presentation Stage Container (Supports Fullscreen) */}
      <div
        ref={presentationContainerRef}
        className={`rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 text-white shadow-2xl transition-all duration-300 flex flex-col ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'relative w-full'
        }`}
        style={{ minHeight: isFullscreen ? '100vh' : '620px' }}
      >
        {/* Top Slide Control & Progress Bar */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-sky-400">
              SLIDE {currentSlide.slideNumber} / {currentSlide.totalSlides}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-semibold text-slate-300 truncate max-w-xs md:max-w-md">
              {currentSlide.title}
            </span>
          </div>

          {/* Quick Audio & Mode Toggles */}
          <div className="flex items-center gap-2">
            {/* Narrator Voice Selector */}
            <button
              onClick={() => {
                soundManager.playClick();
                setNarratorGender(narratorGender === 'female' ? 'male' : 'female');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-200 border border-slate-700 flex items-center gap-1.5"
              title="Ganti Suara Narator Dosen"
            >
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>{narratorGender === 'female' ? 'Narator Wanita' : 'Narator Pria'}</span>
            </button>

            {/* BGM Toggle */}
            <button
              onClick={() => {
                soundManager.playClick();
                setIsBgmEnabled(!isBgmEnabled);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border flex items-center gap-1.5 transition ${
                isBgmEnabled
                  ? 'bg-sky-950/70 text-sky-300 border-sky-800/80'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Musik Latar Presentasi"
            >
              <Music className="w-3.5 h-3.5" />
              <span>{isBgmEnabled ? 'Musik Aktif' : 'Musik Mati'}</span>
            </button>

            {/* Auto Play Toggle */}
            <button
              onClick={() => {
                soundManager.playClick();
                setIsAutoPlayMode(!isAutoPlayMode);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border flex items-center gap-1.5 transition ${
                isAutoPlayMode
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAutoPlayMode ? 'Auto Mode: ON' : 'Auto Mode: OFF'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Layar Penuh (Fullscreen)"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Visual Slide Body: Modern 16:9 Gradient Layout with Staggered Animations */}
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#121c2c] via-[#162235] to-[#0f172a]">
          {/* Subtle Elegant Watermark in background */}
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-5">
            <span className="text-4xl md:text-6xl font-black text-slate-100 uppercase tracking-widest -rotate-12">
              COPYRIGHT © 2026 DR. JUWITA NINDA SUHERMAN, M.KES
            </span>
          </div>

          {/* Slide Header with Fade-In Animation */}
          <div
            className={`transition-all duration-500 transform ${
              animationStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-mono font-bold">
                {currentSlide.category} • Slide {currentSlide.slideNumber} dari {currentSlide.totalSlides}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Institut Kesehatan Rajawali Bandung
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {currentSlide.title}
            </h1>
          </div>

          {/* Slide Main Content Grid: Left Column Text & Bullets, Right Column Visual Image & Takeaways */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 items-center flex-1">
            {/* Left Column: Summary & Staggered Bullet Points */}
            <div className="lg:col-span-7 space-y-4">
              <div
                className={`p-4 md:p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-slate-100 text-sm md:text-base leading-relaxed transition-all duration-500 ${
                  animationStep >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
                }`}
              >
                {currentSlide.summary}
              </div>

              {/* Staggered Bullet Points */}
              <div
                className={`space-y-2.5 transition-all duration-500 delay-100 ${
                  animationStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                {currentSlide.bulletPoints.map((bp, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs md:text-sm text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{bp}</span>
                  </div>
                ))}
              </div>

              {currentSlide.formulaText && (
                <div className="p-3.5 rounded-xl bg-sky-950/70 border border-sky-700/80 text-sky-200 font-mono text-xs">
                  <strong className="block text-sky-300 mb-1">RUMUS PERHITUNGAN HEMATOLOGI:</strong>
                  {currentSlide.formulaText}
                </div>
              )}
            </div>

            {/* Right Column: Visual Reference & Key Takeaways Card */}
            <div className="lg:col-span-5 space-y-4">
              {/* Visual PDF Image Preview */}
              {currentSlide.imageSrc && (
                <div
                  className={`rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-xl transition-all duration-500 ${
                    animationStep >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                >
                  <img
                    src={currentSlide.imageSrc}
                    alt={currentSlide.title}
                    className="w-full h-48 md:h-56 object-contain bg-slate-950"
                  />
                  <div className="p-2.5 bg-slate-900/90 text-slate-300 font-mono text-[11px] flex items-center justify-between border-t border-slate-800">
                    <span>
                      {presentationSource === 'atlm_calc'
                        ? `Slide Resmi ATLM #${currentSlide.slideNumber}`
                        : `Slide Asli PDF Hal. ${currentSlide.pdfPages.join(', ')}`}
                    </span>
                    <span className="text-sky-400 font-bold">dr. Juwita Ninda Suherman, M.Kes</span>
                  </div>
                </div>
              )}

              {/* Key Takeaways & Reference Ranges Card */}
              <div
                className={`p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 text-xs text-sky-200 font-mono space-y-1.5 transition-all duration-500 ${
                  animationStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <p className="text-white font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-sky-400" />
                  Poin Kunci & Nilai Rujukan:
                </p>
                {currentSlide.keyTakeaways.map((kt, i) => (
                  <p key={i} className="text-slate-300 leading-relaxed">
                    • {kt}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Narration Script Transcript Bubble */}
          <div className="mt-2 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center shrink-0 mt-0.5">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sky-300 text-[11px] uppercase tracking-wider font-mono">
                NARASI DOSEN ({narratorGender === 'female' ? 'dr. Juwita Ninda Suherman, M.Kes' : 'dr. Hendrawan Pratama, Sp.PK'}):
              </p>
              <p className="text-slate-200 leading-relaxed mt-0.5">
                "{currentSlide.narrationScript}"
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Audio & Presentation Control Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Previous / Next Slide Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevSlide}
              disabled={currentSlideIndex === 0}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:inline">Sebelumnya</span>
            </button>

            <span className="text-xs font-mono font-bold text-slate-300 px-2">
              {currentSlideIndex + 1} / {slidesData.length}
            </span>

            <button
              onClick={goToNextSlide}
              disabled={currentSlideIndex === slidesData.length - 1}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition flex items-center gap-1"
            >
              <span className="text-xs font-semibold hidden sm:inline">Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Center: Narration Audio Controls (Play, Pause, Replay, Stop) */}
          <div className="flex items-center gap-2">
            {!isPlayingNarration ? (
              <button
                onClick={playSlideNarration}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Putar Narasi Suara
              </button>
            ) : (
              <button
                onClick={pauseSlideNarration}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                Jeda Narasi
              </button>
            )}

            <button
              onClick={replaySlideNarration}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Ulangi Narasi Slide Ini"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {onMarkComplete && (
              <button
                onClick={onMarkComplete}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isCompleted
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleted ? 'Sudah Selesai' : 'Tandai Selesai (+30 XP)'}</span>
              </button>
            )}
          </div>

          {/* Right: Slide Thumbnail Dots */}
          <div className="hidden md:flex items-center gap-1 max-w-[280px] overflow-x-auto no-scrollbar py-1">
            {slidesData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundManager.playClick();
                  setCurrentSlideIndex(idx);
                }}
                className={`h-2 rounded-full transition-all shrink-0 ${
                  idx === currentSlideIndex
                    ? 'w-5 bg-sky-400'
                    : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Pindah ke Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Elegant Bottom Copyright Bar */}
        <SlideCopyrightBar light={false} />
      </div>

      {/* Copyright Legal Agreement Modal for Downloads */}
      <CopyrightNoticeModal
        isOpen={showCopyrightWarning}
        onAccept={handleCopyrightAgreed}
        onCancel={() => {
          setShowCopyrightWarning(false);
          setPendingDownloadType(null);
        }}
        sourceLabel={
          presentationSource === 'atlm_calc'
            ? `Perhitungan Parameter Hematologi (24 Slide Lengkap ATLM)`
            : `Modul ${currentModule.moduleNumber}: ${currentModule.title}`
        }
      />
    </div>
  );
};
