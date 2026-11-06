/**
 * Interactive Presentation & Pages View Component
 * Didesain khusus untuk Hematology World
 * Fitur:
 * - Slide presentasi visual premium & modern 16:9
 * - Animasi bertahap (Fade, Slide, Zoom, Staggered Points)
 * - Suara Narator Dosen berbahasa Indonesia (TTS Audio / Speech Synthesis)
 * - Musik Latar (BGM) Lembut yang otomatis meredup saat narator bicara (audio ducking)
 * - Mode Fullscreen interaktif dengan pintasan keyboard & sentuhan (Arrow / Swipe / Space / Esc)
 * - Kontrol Audio: Play, Pause, Replay, Stop, Next, Prev, Volume Narator, Volume Musik, Mute
 * - Mode Otomatis (Auto Presentation Mode) & Mode Manual
 * - 3 Tombol Utama: LIHAT SLIDE (PAGES), DOWNLOAD MATERI PDF, DOWNLOAD POWERPOINT (PPTX)
 * - Watermark & Pemberitahuan Hak Cipta terintegrasi
 */

import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { LearningModuleData } from '../data/hematologyData';
import { soundManager } from '../utils/soundManager';
import { SlideCopyrightBar, CopyrightNoticeModal } from './CopyrightProtection';
import {
  downloadModulePresentationPdf,
  downloadModulePresentationPptx,
  SlideExportData,
} from '../utils/exportPresentationDocuments';

interface PagesPresentationViewProps {
  module: LearningModuleData;
  onBack?: () => void;
  onMarkComplete?: () => void;
  isCompleted?: boolean;
}

export const PagesPresentationView: React.FC<PagesPresentationViewProps> = ({
  module,
  onBack,
  onMarkComplete,
  isCompleted = false,
}) => {
  // Construct dynamic rich slides for the selected module
  const slidesData: SlideExportData[] = React.useMemo(() => {
    const list: SlideExportData[] = [];
    const total = Math.max(3, (module.detailedContent || []).length + 1);

    // Slide 1: Pengantar & Konsep Utama
    list.push({
      slideNumber: 1,
      totalSlides: total,
      title: `${module.title}: Pengantar & Konsep Utama`,
      category: module.category,
      pdfPages: module.pdfPages,
      imageSrc: `/assets/pdf/page_${String(module.primaryImagePage).padStart(2, '0')}.jpg`,
      summary: module.summary,
      bulletPoints: [
        `Kompetensi Pembelajaran: Memahami mekanisme patofisiologis & analitik ${module.title}.`,
        `Kategori Klinis: ${module.category} pada kurikulum Teknologi Laboratorium Medik (ATLM).`,
        `Rujukan Akademik: Modul Kuliah Anatomi & Fisiologi Sistem Hematologi Hal. ${module.pdfPages.join(', ')}.`,
      ],
      keyTakeaways: module.keyTakeaways.slice(0, 3),
      narrationScript: `Selamat datang pada materi perkuliahan ${module.title}. ${module.summary}. Mari kita telaah konsep dasar serta korelasi klinisnya secara bertahap.`,
    });

    // Middle Slides: Detailed Content Paragraphs
    (module.detailedContent || []).forEach((para, idx) => {
      const pageRef = module.pdfPages[idx % module.pdfPages.length] || module.primaryImagePage;
      const formulaItem = module.formulas?.[idx % (module.formulas.length || 1)];

      list.push({
        slideNumber: idx + 2,
        totalSlides: total,
        title: `${module.title}: Bagian ${idx + 1}`,
        category: module.category,
        pdfPages: [pageRef],
        imageSrc: `/assets/pdf/page_${String(pageRef).padStart(2, '0')}.jpg`,
        summary: para,
        bulletPoints: [
          `Observasi Laboratorium: Memastikan verifikasi kontrol mutu dan preparat mikroskopis.`,
          `Fisiologi Seluler: Transpor metabolit, integritas membran sel, serta kinetika pembentukan.`,
          `Implikasi Medis: Nilai abnormal menjadi indikator klinis penting pada evaluasi pasien.`,
        ],
        keyTakeaways: [
          module.keyTakeaways[idx % module.keyTakeaways.length] ||
            'Pertahankan ketepatan interpretasi hasil laboratorium hematologi.',
          `Halaman Rujukan: PDF ANFIS Darah Halaman ${pageRef}.`,
        ],
        narrationScript: `Pada bagian ini kita mempelajari bahwa: ${para}. Perhatikan baik-baik korelasi klinis dan nilai rujukan yang ditampilkan pada slide.`,
        formulaText: formulaItem ? `${formulaItem.name}: ${formulaItem.formula} (${formulaItem.unit})` : undefined,
      });
    });

    // Final Slide: Kesimpulan & Nilai Rujukan
    list.push({
      slideNumber: total,
      totalSlides: total,
      title: `${module.title}: Kesimpulan & Korelasi Laboratorium`,
      category: module.category,
      pdfPages: module.pdfPages,
      imageSrc: `/assets/pdf/page_${String(module.primaryImagePage).padStart(2, '0')}.jpg`,
      summary: module.caption,
      bulletPoints: [
        'Semua parameter hematologi saling terhubung membentuk profil klinis darah yang utuh.',
        'Korelasi antara hasil alat otomatis dan konfirmasi mikroskopik SADT adalah standar emas.',
        'Penguasaan materi ini penting untuk interpretasi 50 Soal Kuis dan Kasus Simulasi Pasien.',
      ],
      keyTakeaways: module.keyTakeaways,
      narrationScript: `Sebagai kesimpulan materi ${module.title}: ${module.caption}. Pastikan Anda mencatat poin-poin penting ini sebelum melanjutkan ke latihan kuis.`,
    });

    return list;
  }, [module]);

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
  const [animationStep, setAnimationStep] = useState(1); // 1: Title, 2: Image/Graphic, 3: Bullets, 4: Takeaways, 5: Complete

  const presentationContainerRef = useRef<HTMLDivElement>(null);
  const currentSlide = slidesData[currentSlideIndex] || slidesData[0];

  // Reset animation step when slide changes
  useEffect(() => {
    setAnimationStep(1);
    const t1 = setTimeout(() => setAnimationStep(2), 220);
    const t2 = setTimeout(() => setAnimationStep(3), 550);
    const t3 = setTimeout(() => setAnimationStep(4), 900);
    const t4 = setTimeout(() => setAnimationStep(5), 1300);

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
        soundManager.setBgmVolume(0.15); // Duck BGM
      } else {
        soundManager.setBgmVolume(0.5); // Normal BGM
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
  }, [currentSlideIndex, isFullscreen]);

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

  // Trigger Narration automatically when auto-play is enabled or when user explicitly navigates
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
      await downloadModulePresentationPdf(module, slidesData);
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
      await downloadModulePresentationPptx(module, slidesData);
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
      {/* 3 Main Action Panels: LIHAT SLIDE (PAGES), DOWNLOAD PDF, DOWNLOAD POWERPOINT */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 md:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
            <Presentation className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-sky-700 font-bold">
                PLATFORM PRESENTASI DIGITAL • MODUL #{module.moduleNumber}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                AKSES BEBAS TANPA LOGIN
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
              {module.title}
            </h2>
          </div>
        </div>

        {/* 3 Main Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              soundManager.playClick();
              if (presentationContainerRef.current) {
                presentationContainerRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Presentation className="w-4 h-4" />
            LIHAT SLIDE (PAGES)
          </button>

          <button
            onClick={handleDownloadPdfClick}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            {isExporting && pendingDownloadType === 'pdf' ? 'Membuat PDF...' : 'DOWNLOAD MATERI PDF'}
          </button>

          <button
            onClick={handleDownloadPptxClick}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
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
                {currentSlide.category} • Hal. {currentSlide.pdfPages.join(', ')}
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
                <div className="p-3.5 rounded-xl bg-sky-950/60 border border-sky-800/80 text-sky-200 font-mono text-xs">
                  <strong className="block text-sky-300 mb-1">RUMUS KLINIS HEMATOLOGI:</strong>
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
                    <span>Slide Asli PDF Halaman {currentSlide.pdfPages.join(', ')}</span>
                    <span className="text-sky-400 font-bold">dr. Juwita Ninda Suherman, M.Kes</span>
                  </div>
                </div>
              )}

              {/* Key Takeaways Card */}
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
          <div className="hidden md:flex items-center gap-1">
            {slidesData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundManager.playClick();
                  setCurrentSlideIndex(idx);
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlideIndex
                    ? 'w-6 bg-sky-400'
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
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
        sourceLabel={`Modul ${module.moduleNumber}: ${module.title}`}
      />
    </div>
  );
};
