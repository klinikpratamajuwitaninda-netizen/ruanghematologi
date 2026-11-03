import React, { useEffect, useState } from 'react';
import { soundManager } from '../utils/soundManager';
import {
  Play,
  Clock,
  Flame,
  Trophy,
  CheckCircle2,
  XCircle,
  BookOpen,
  Calculator,
  Printer,
  RotateCcw,
  Sparkles,
  FileText,
  Stethoscope,
  Users,
  User,
  ClipboardList,
  AlertCircle,
  History,
} from 'lucide-react';
import {
  QUIZ_30_QUESTIONS,
  type ClinicalCaseTable,
  type OptionKey,
} from '../data/quiz30Data';

interface SanitizedQuestion {
  questionNumber: number;
  sectionCode: 'A' | 'B' | 'C' | 'D';
  category: 'theory' | 'combined' | 'clinical_case' | 'calculation';
  topic: string;
  caseTable?: ClinicalCaseTable | null;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  pdfPageRef: string;
}

export interface DetailedReviewItem {
  questionNumber: number;
  sectionCode: 'A' | 'B' | 'C' | 'D';
  category: 'theory' | 'combined' | 'clinical_case' | 'calculation';
  topic: string;
  caseTable?: ClinicalCaseTable | null;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  studentAnswer: OptionKey | '-';
  correctOption: OptionKey;
  isCorrect: boolean;
  timeSpentSec: number;
  scientificExplanation: string;
  atlmProcedureAndDecision: string;
  doctorClinicalExplanation: string;
  patientEducation: string;
  whyOthersWrong: string;
  calculationSteps?: string | null;
  pdfPageRef: string;
}

export interface QuizSummaryResult {
  npm: string;
  fullName: string;
  className: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracyPercent: number;
  totalScore: number;
  speedBonusTotal: number;
  maxStreak: number;
  durationSec: number;
  xpEarned: number;
  gradeLabel: string;
  badgeCategory: string;
}

interface QuizizzEngineProps {
  studentNpm: string;
  studentName: string;
  studentClass: string;
  avatarGender: 'male_atlm' | 'female_atlm';
  initialSummary?: QuizSummaryResult | null;
  initialReview?: DetailedReviewItem[];
  onQuizCompleted?: (summary: QuizSummaryResult, review: DetailedReviewItem[]) => void;
  onViewLeaderboard?: () => void;
}

const DEFAULT_SANITIZED_QUESTIONS: SanitizedQuestion[] = QUIZ_30_QUESTIONS.map((q) => ({
  questionNumber: q.questionNumber,
  sectionCode: q.sectionCode,
  category: q.category,
  topic: q.topic,
  caseTable: q.caseTable || null,
  questionText: q.questionText,
  options: q.options,
  pdfPageRef: q.pdfPageRef,
}));

const SECTION_BADGE_MAP: Record<
  'A' | 'B' | 'C' | 'D',
  { label: string; style: string }
> = {
  A: {
    label: 'BAGIAN A • TEORI DASAR & PRAKTIK ATLM (01–10)',
    style: 'bg-sky-500/20 border-sky-300/40 text-sky-100',
  },
  B: {
    label: 'BAGIAN B • GABUNGAN CBC, APUSAN & QC (11–25)',
    style: 'bg-teal-500/20 border-teal-300/40 text-teal-100',
  },
  C: {
    label: 'BAGIAN C • KASUS KLINIS SANGAT SULIT (26–45)',
    style: 'bg-amber-500/20 border-amber-300/40 text-amber-100',
  },
  D: {
    label: 'BAGIAN D • PERHITUNGAN MCV, MCH, MCHC & VALIDASI (46–50)',
    style: 'bg-indigo-500/20 border-indigo-300/40 text-indigo-100',
  },
};

function computeLocalGrading(
  studentNpm: string,
  studentName: string,
  studentClass: string,
  totalDurationSec: number,
  payloadAnswers: Array<{ questionNumber: number; selectedOption: string; timeSpentSec: number }>
): { summary: QuizSummaryResult; detailedReview: DetailedReviewItem[] } {
  const answerMap: Record<number, { selectedOption: string; timeSpentSec: number }> = {};
  for (const a of payloadAnswers) {
    answerMap[a.questionNumber] = a;
  }

  let correctCount = 0;
  let wrongCount = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let totalScore = 0;
  let speedBonusTotal = 0;

  const detailedReview: DetailedReviewItem[] = QUIZ_30_QUESTIONS.map((q) => {
    const sub = answerMap[q.questionNumber];
    const rawOpt = String(sub?.selectedOption || '-').toUpperCase();
    const studentAnswer: OptionKey | '-' = ['A', 'B', 'C', 'D', 'E'].includes(rawOpt)
      ? (rawOpt as OptionKey)
      : '-';
    const timeSpent = sub?.timeSpentSec || 20;
    const isCorrect = studentAnswer === q.correctOption;

    if (isCorrect) {
      correctCount++;
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
      const basePoints = 80;
      const speedBonus = Math.max(0, Math.min(20, Math.round((60 - Math.min(60, timeSpent)) / 3)));
      const streakBonus = Math.min(20, currentStreak * 2);
      speedBonusTotal += speedBonus;
      totalScore += basePoints + speedBonus + streakBonus;
    } else {
      wrongCount++;
      currentStreak = 0;
    }

    return {
      questionNumber: q.questionNumber,
      sectionCode: q.sectionCode,
      category: q.category,
      topic: q.topic,
      caseTable: q.caseTable || null,
      questionText: q.questionText,
      options: q.options,
      studentAnswer,
      correctOption: q.correctOption,
      isCorrect,
      timeSpentSec: timeSpent,
      scientificExplanation: q.scientificExplanation,
      atlmProcedureAndDecision: q.atlmProcedureAndDecision,
      doctorClinicalExplanation: q.doctorClinicalExplanation,
      patientEducation: q.patientEducation,
      whyOthersWrong: q.whyOthersWrong,
      calculationSteps: q.calculationSteps || null,
      pdfPageRef: q.pdfPageRef,
    };
  });

  const accuracyPercent = Number(((correctCount / QUIZ_30_QUESTIONS.length) * 100).toFixed(1));
  const xpEarned = correctCount * 25 + maxStreak * 10 + (accuracyPercent >= 80 ? 150 : 50);

  let gradeLabel = 'Perlu Penguatan Kompetensi';
  if (accuracyPercent >= 90) gradeLabel = 'A (Sangat Memuaskan — Hematology Expert)';
  else if (accuracyPercent >= 80) gradeLabel = 'AB (Kompeten Tinggi — Senior Analyst)';
  else if (accuracyPercent >= 70) gradeLabel = 'B (Kompeten — ATLM Praktisi)';
  else if (accuracyPercent >= 60) gradeLabel = 'BC (Cukup Kompeten)';

  let badgeCategory = 'ATLM Clinical Analyst';
  if (accuracyPercent >= 90)
    badgeCategory = 'Gold Hematology Champion & Erythrocyte Index Master';
  else if (accuracyPercent >= 80 && totalDurationSec <= 750)
    badgeCategory = 'Speed Diagnostic Star';
  else if (accuracyPercent >= 80) badgeCategory = 'Clinical Case Specialist';

  return {
    summary: {
      npm: studentNpm,
      fullName: studentName,
      className: studentClass,
      totalQuestions: QUIZ_30_QUESTIONS.length,
      correctCount,
      wrongCount,
      accuracyPercent,
      totalScore,
      speedBonusTotal,
      maxStreak,
      durationSec: totalDurationSec,
      xpEarned,
      gradeLabel,
      badgeCategory,
    },
    detailedReview,
  };
}

export const QuizizzEngine: React.FC<QuizizzEngineProps> = ({
  studentNpm,
  studentName,
  studentClass,
  avatarGender,
  initialSummary,
  initialReview,
  onQuizCompleted,
  onViewLeaderboard,
}) => {
  const [questions, setQuestions] = useState<SanitizedQuestion[]>(DEFAULT_SANITIZED_QUESTIONS);
  const [loading, setLoading] = useState<boolean>(false);
  const [stage, setStage] = useState<'lobby' | 'playing' | 'submitting' | 'review'>('lobby');
  const [quizMode, setQuizMode] = useState<'solo' | 'live'>('solo');
  const [liveSessionCode, setLiveSessionCode] = useState<string>('ATLM-HEMATO-50');

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, { selectedOption: OptionKey; timeSpentSec: number }>
  >({});
  const [questionTimer, setQuestionTimer] = useState<number>(60);
  const [totalElapsedSec, setTotalElapsedSec] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [showHelperFormula, setShowHelperFormula] = useState<boolean>(false);

  const [summaryResult, setSummaryResult] = useState<QuizSummaryResult | null>(
    initialSummary || null
  );
  const [detailedReview, setDetailedReview] = useState<DetailedReviewItem[]>(
    initialReview || []
  );
  const [reviewFilter, setReviewFilter] = useState<
    'all' | 'correct' | 'wrong' | 'secA' | 'secB' | 'secC' | 'secD'
  >('all');

  useEffect(() => {
    if (initialSummary && initialReview && initialReview.length > 0 && !summaryResult) {
      setSummaryResult(initialSummary);
      setDetailedReview(initialReview);
    }
  }, [initialSummary, initialReview]);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/quiz/questions', { credentials: 'include' })
      .then(async (r) => {
        const contentType = r.headers.get('content-type') || '';
        if (!r.ok || !contentType.includes('application/json')) return null;
        return r.json();
      })
      .then((data) => {
        if (
          isMounted &&
          data &&
          Array.isArray(data.questions) &&
          data.questions.length > 0
        ) {
          setQuestions(data.questions);
        }
      })
      .catch(() => {
        // Fallback already populated via DEFAULT_SANITIZED_QUESTIONS
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (stage !== 'playing') return;
    const interval = window.setInterval(() => {
      setTotalElapsedSec((prev) => prev + 1);
      setQuestionTimer((prev) => {
        if (prev <= 1) {
          if (currentIndex < questions.length - 1) {
            setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1));
            setQuestionStartTime(Date.now());
            return 60;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, currentIndex, questions.length]);

  const startQuiz = (mode: 'solo' | 'live') => {
    soundManager.playQuizStart();
    setQuizMode(mode);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setQuestionTimer(60);
    setTotalElapsedSec(0);
    setQuestionStartTime(Date.now());
    setStage('playing');
  };

  const handleSelectOption = (optionKey: OptionKey) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    soundManager.playClick();
    const spent = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
    const updated = {
      ...selectedAnswers,
      [currentQ.questionNumber]: {
        selectedOption: optionKey,
        timeSpentSec: spent,
      },
    };
    setSelectedAnswers(updated);
  };

  const submitAllAnswers = async () => {
    setStage('submitting');
    const duration = Math.max(30, totalElapsedSec);
    const payloadAnswers = questions.map((q) => ({
      questionNumber: q.questionNumber,
      selectedOption: selectedAnswers[q.questionNumber]?.selectedOption || '-',
      timeSpentSec: selectedAnswers[q.questionNumber]?.timeSpentSec || 20,
    }));

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          npm: studentNpm,
          fullName: studentName,
          className: studentClass,
          avatarGender,
          mode: quizMode,
          totalDurationSec: duration,
          answers: payloadAnswers,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.summary && data.detailedReview) {
          soundManager.playVictory();
          setSummaryResult(data.summary);
          setDetailedReview(data.detailedReview);
          setStage('review');
          if (onQuizCompleted) {
            onQuizCompleted(data.summary, data.detailedReview);
          }
          return;
        }
      }
    } catch (error) {
      console.error('Submit quiz API warning, using verified local grading:', error);
    }

    // Guaranteed local grading & review fallback if offline/edge error
    const localResult = computeLocalGrading(
      studentNpm,
      studentName,
      studentClass,
      duration,
      payloadAnswers
    );
    soundManager.playVictory();
    setSummaryResult(localResult.summary);
    setDetailedReview(localResult.detailedReview);
    setStage('review');
    if (onQuizCompleted) {
      onQuizCompleted(localResult.summary, localResult.detailedReview);
    }
  };

  const handleNextOrSubmit = async () => {
    if (currentIndex < questions.length - 1) {
      soundManager.playNavigation();
      setCurrentIndex((prev) => prev + 1);
      setQuestionTimer(60);
      setQuestionStartTime(Date.now());
      return;
    }
    await submitAllAnswers();
  };

  if (loading && questions.length === 0) {
    return (
      <div className="p-12 text-center bg-[#edf2f7] rounded-2xl border border-slate-300">
        <p className="text-sm font-mono text-slate-600">
          Memuat 50 Soal Ujian Kompetensi Hematologi ATLM (Pilihan Ganda A–E)...
        </p>
      </div>
    );
  }

  // ===========================================================================
  // STAGE 1: QUIZIZZ-STYLE LOBBY (SOLO & LIVE MODE - 50 SOAL A-E)
  // ===========================================================================
  if (stage === 'lobby') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-[#243b55] border border-[#365374] p-7 md:p-8 text-slate-100 shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-4xl">
              <span className="text-xs font-mono uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> UJIAN KOMPETENSI HEMATOLOGI UNTUK ATLM (EDISI 50 SOAL PILIHAN GANDA A–E)
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mt-2 text-white">
                50 Soal Hematologi untuk ATLM — Anatomi & Fisiologi Sistem Hematologi dengan Analisis Praktik Laboratorium
              </h2>
              <p className="text-slate-200 text-sm mt-2 leading-relaxed">
                Disusun untuk Mahasiswa <strong>Ahli Teknologi Laboratorium Medik (ATLM)</strong> oleh{' '}
                <strong>dr. Juwita Ninda Suherman, M.Kes</strong> — Institut Kesehatan Rajawali Bandung.
                Mencakup <strong>10 Soal Teori Dasar & Praktik ATLM</strong>,{' '}
                <strong>15 Soal Gabungan CBC/Apusan/QC</strong>,{' '}
                <strong>20 Soal Kasus Sangat Sulit (lengkap tabel klinis)</strong>, dan{' '}
                <strong>5 Soal Perhitungan MCV, MCH, MCHC & Validasi</strong>.
              </p>
            </div>

            {summaryResult && detailedReview.length > 0 && (
              <button
                onClick={() => setStage('review')}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow shrink-0"
              >
                <History className="w-4 h-4" /> Lihat Hasil & Pembahasan Terakhir ({summaryResult.correctCount}/50)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6">
            <div className="p-4 rounded-xl bg-[#2e4866] border border-[#426388]">
              <p className="text-xs font-mono text-sky-200 uppercase">Bagian A (Soal 01–10)</p>
              <p className="text-lg font-bold mt-1 text-white">10 Soal Teori ATLM</p>
              <p className="text-xs text-slate-200 mt-1">
                Fungsi darah, viskositas, hematokrit, Hb & methemoglobin, hemolisis, diapedesis, hemostasis, crossmatch
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#2e4866] border border-[#426388]">
              <p className="text-xs font-mono text-teal-200 uppercase">Bagian B (Soal 11–25)</p>
              <p className="text-lg font-bold mt-1 text-white">15 Soal Gabungan</p>
              <p className="text-xs text-slate-200 mt-1">
                CBC, apusan darah tepi, NRBC, PT/aPTT, EDTA vs sitrat, cold agglutinin, nilai kritis & QC Westgard
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#2e4866] border border-[#426388]">
              <p className="text-xs font-mono text-amber-200 uppercase">Bagian C (Soal 26–45)</p>
              <p className="text-lg font-bold mt-1 text-white">20 Kasus Sangat Sulit</p>
              <p className="text-xs text-slate-200 mt-1">
                Dilengkapi Tabel Anamnesis, Pemeriksaan Fisik, Permintaan Dokter, Hasil Lab & Konteks Obat/Edukasi
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#2e4866] border border-[#426388]">
              <p className="text-xs font-mono text-indigo-200 uppercase">Bagian D (Soal 46–50)</p>
              <p className="text-lg font-bold mt-1 text-white">5 Hitungan Indeks</p>
              <p className="text-xs text-slate-200 mt-1">
                Perhitungan MCV = (Hct×10)/RBC, MCH = (Hb×10)/RBC, MCHC = (Hb×100)/Hct & Rule of Three
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode 1: Solo Quiz */}
            <div className="p-5 rounded-2xl bg-[#1d3249] border border-sky-400/35 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sky-300 text-xs font-mono uppercase font-bold">
                  <User className="w-4 h-4" /> MODE 1: SOLO QUIZ (LATIHAN & UJIAN MANDIRI)
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Kerjakan 50 Soal Pilihan Ganda (A–E)
                </h3>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  Kerjakan seluruh 50 soal ATLM secara berurutan atau lompat antar nomor soal. Pembahasan 5 aspek laboratorium terbuka otomatis setelah ujian selesai.
                </p>
              </div>
              <button
                onClick={() => startQuiz('solo')}
                className="mt-5 w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition shadow-md"
              >
                <Play className="w-4 h-4 fill-current" /> Mulai Solo Quiz (50 Soal A–E)
              </button>
            </div>

            {/* Mode 2: Live Quiz with Lecturer */}
            <div className="p-5 rounded-2xl bg-[#1f3b3d] border border-emerald-400/35 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono uppercase font-bold">
                  <Users className="w-4 h-4" /> MODE 2: LIVE QUIZ KELAS BERSAMA DOSEN
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Sesi Kelas Sinkron & Podium 3D ATLM
                </h3>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  Masukkan kode sesi kelas dari Dosen untuk berkompetisi secara langsung menuju Podium 3D Hematology World Champions.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={liveSessionCode}
                    onChange={(e) => setLiveSessionCode(e.target.value.toUpperCase())}
                    placeholder="Kode Sesi Kelas"
                    className="px-3 py-2 rounded-lg bg-[#162936] border border-emerald-500/40 text-xs font-mono text-white w-full"
                  />
                </div>
              </div>
              <button
                onClick={() => startQuiz('live')}
                className="mt-4 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition shadow-md"
              >
                <Play className="w-4 h-4 fill-current" /> Gabung Live Quiz Kelas (50 Soal)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // STAGE 2: FULL-SCREEN QUIZIZZ GAMEPLAY (50 QUESTIONS, OPTIONS A-E)
  // ===========================================================================
  if (stage === 'playing' || stage === 'submitting') {
    const currentQ = questions[currentIndex];
    if (!currentQ) return null;
    const chosen = selectedAnswers[currentQ.questionNumber]?.selectedOption;
    const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);
    const secBadge = SECTION_BADGE_MAP[currentQ.sectionCode || 'A'];

    return (
      <div className="rounded-2xl bg-[#243b55] border border-[#3a5778] p-5 md:p-7 text-slate-100 shadow-xl min-h-[640px] flex flex-col justify-between">
        {/* Top Status Bar */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#3a5778]">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1.5 rounded-lg bg-sky-400/20 border border-sky-300/40 text-sky-200 font-mono font-bold text-xs">
                SOAL {String(currentQ.questionNumber).padStart(2, '0')} / {questions.length}
              </span>
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border ${secBadge.style}`}
              >
                {secBadge.label}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowHelperFormula(!showHelperFormula)}
                className="px-3 py-1.5 rounded-lg bg-[#314d6d] hover:bg-[#3a5a7f] border border-[#4a6c94] text-xs font-mono text-sky-200 flex items-center gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5" />
                {showHelperFormula ? 'Tutup Rumus' : 'Rumus Indeks Eritrosit'}
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-300/40 text-amber-200 font-mono text-xs font-bold">
                <Flame className="w-4 h-4 text-amber-300" />
                Terjawab: {Object.keys(selectedAnswers).length}/{questions.length}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#314d6d] border border-[#4a6c94] font-mono text-xs text-slate-100">
                <Clock className="w-4 h-4 text-sky-300" />
                {questionTimer}d (Total: {Math.floor(totalElapsedSec / 60)}m {totalElapsedSec % 60}d)
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-[#1b2e43] rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Formula Reference Banner */}
          {showHelperFormula && (
            <div className="mt-4 p-3.5 rounded-xl bg-[#1d3147] border border-sky-400/40 text-xs font-mono text-sky-100 grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>• MCV (fL) = (Hct (%) × 10) / RBC (juta/µL) [Normal: 80–100 fL]</div>
              <div>• MCH (pg) = (Hb (g/dL) × 10) / RBC (juta/µL) [Normal: 27–33 pg]</div>
              <div>• MCHC (g/dL) = (Hb (g/dL) × 100) / Hct (%) [Normal: 32–36 g/dL]</div>
            </div>
          )}

          {/* Clinical Case Table for Bagian C (Questions 26-45) */}
          {currentQ.caseTable && (
            <div className="mt-5 rounded-2xl bg-[#edf2f7] border border-slate-300 text-slate-800 overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 bg-[#314d6d] text-white flex items-center justify-between text-xs font-mono">
                <span className="font-bold flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-amber-300" />
                  REKAM KLINIS & LABORATORIUM ATLM — SOAL KASUS #{currentQ.questionNumber}
                </span>
                <span className="text-sky-200">{currentQ.topic}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-300 text-xs">
                <div className="p-3.5 space-y-2.5">
                  <div>
                    <p className="font-mono font-bold text-[11px] uppercase text-sky-900">
                      Anamnesis Pasien
                    </p>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">
                      {currentQ.caseTable.anamnesis}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono font-bold text-[11px] uppercase text-sky-900">
                      Pemeriksaan Fisik
                    </p>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">
                      {currentQ.caseTable.physicalExam}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono font-bold text-[11px] uppercase text-sky-900">
                      Catatan / Permintaan Dokter
                    </p>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">
                      {currentQ.caseTable.doctorOrder}
                    </p>
                  </div>
                </div>
                <div className="p-3.5 space-y-2.5 bg-[#e6edf5]/70">
                  <div>
                    <p className="font-mono font-bold text-[11px] uppercase text-rose-900">
                      Hasil Pemeriksaan Laboratorium
                    </p>
                    <p className="font-mono text-slate-800 mt-0.5 leading-relaxed font-medium">
                      {currentQ.caseTable.labResults}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono font-bold text-[11px] uppercase text-emerald-900">
                      Konteks Obat dan Edukasi
                    </p>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">
                      {currentQ.caseTable.medicationContext}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Question Card */}
          <div className="mt-5 bg-[#2e4866] border border-[#45678e] rounded-2xl p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-sky-200 mb-2">
              <span className="font-semibold">Topik: {currentQ.topic}</span>
              <span>Referensi Modul: {currentQ.pdfPageRef}</span>
            </div>
            <p className="text-base md:text-lg font-semibold text-white leading-relaxed">
              {currentQ.questionText}
            </p>
          </div>

          {/* 5 Multiple-Choice Option Cards: A, B, C, D, E */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-5">
            {(['A', 'B', 'C', 'D', 'E'] as const).map((optKey) => {
              const isSelected = chosen === optKey;
              const cardColors: Record<OptionKey, string> = {
                A: isSelected
                  ? 'bg-sky-600 border-white ring-2 ring-sky-200'
                  : 'bg-[#1f364d] hover:bg-[#274360] border-sky-400/35',
                B: isSelected
                  ? 'bg-teal-600 border-white ring-2 ring-teal-200'
                  : 'bg-[#1f3b3f] hover:bg-[#274a4f] border-teal-400/35',
                C: isSelected
                  ? 'bg-amber-600 border-white ring-2 ring-amber-200'
                  : 'bg-[#3b3323] hover:bg-[#4a402c] border-amber-400/35',
                D: isSelected
                  ? 'bg-indigo-600 border-white ring-2 ring-indigo-200'
                  : 'bg-[#282d4d] hover:bg-[#333961] border-indigo-400/35',
                E: isSelected
                  ? 'bg-rose-600 border-white ring-2 ring-rose-200'
                  : 'bg-[#3d2735] hover:bg-[#4d3143] border-rose-400/35',
              };

              return (
                <button
                  key={optKey}
                  onClick={() => handleSelectOption(optKey)}
                  className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    optKey === 'E' ? 'md:col-span-2' : ''
                  } ${cardColors[optKey]}`}
                >
                  <span className="w-8 h-8 rounded-lg bg-black/25 border border-white/25 font-mono font-bold text-sm flex items-center justify-center shrink-0 text-white">
                    {optKey}
                  </span>
                  <span className="text-sm md:text-base font-medium leading-snug text-slate-100">
                    {currentQ.options[optKey]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Navigator & Submit Footer */}
        <div className="mt-7 pt-4 border-t border-[#3a5778] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex((prev) => Math.max(0, prev - 1));
                setQuestionTimer(60);
                setQuestionStartTime(Date.now());
              }}
              className="px-4 py-2.5 rounded-xl bg-[#314d6d] hover:bg-[#3c5d82] disabled:opacity-40 text-xs font-semibold text-white"
            >
              ← Soal Sebelumnya
            </button>
            <div className="flex items-center gap-1 max-w-xs sm:max-w-md xl:max-w-xl overflow-x-auto py-1">
              {questions.map((q, idx) => {
                const answered = Boolean(selectedAnswers[q.questionNumber]);
                return (
                  <button
                    key={q.questionNumber}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setQuestionTimer(60);
                      setQuestionStartTime(Date.now());
                    }}
                    className={`w-6 h-6 rounded text-[11px] font-mono font-bold shrink-0 ${
                      currentIndex === idx
                        ? 'bg-sky-400 text-slate-950'
                        : answered
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-[#1b2e43] text-slate-300'
                    }`}
                  >
                    {q.questionNumber}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {currentIndex < questions.length - 1 && (
              <button
                disabled={stage === 'submitting'}
                onClick={submitAllAnswers}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-500 text-white font-semibold text-xs"
              >
                Kumpulkan Sekarang
              </button>
            )}
            <button
              disabled={stage === 'submitting'}
              onClick={handleNextOrSubmit}
              className="px-6 py-3 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-sm shadow-md transition"
            >
              {stage === 'submitting'
                ? 'Menilai & Menyimpan Skor 50 Soal...'
                : currentIndex === questions.length - 1
                ? 'Selesaikan Kuis & Buka Pembahasan 50 Soal →'
                : 'Soal Berikutnya →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // STAGE 3: HEMATOLOGY QUIZ REVIEW & DETAILED EXPLANATION (POST-QUIZ 50 SOAL)
  // ===========================================================================
  const filteredReview = detailedReview.filter((item) => {
    if (reviewFilter === 'correct') return item.isCorrect;
    if (reviewFilter === 'wrong') return !item.isCorrect;
    if (reviewFilter === 'secA') return item.sectionCode === 'A';
    if (reviewFilter === 'secB') return item.sectionCode === 'B';
    if (reviewFilter === 'secC') return item.sectionCode === 'C';
    if (reviewFilter === 'secD') return item.sectionCode === 'D';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Summary Score Card */}
      {summaryResult && (
        <div className="rounded-2xl bg-[#243b55] border border-[#3a5778] p-6 md:p-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#3a5778]">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Trophy className="w-4 h-4" /> EVALUASI & PEMBAHASAN LENGKAP 50 SOAL HEMATOLOGI ATLM
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mt-1">
                Hasil Evaluasi Kompetensi: {summaryResult.fullName}
              </h2>
              <p className="text-xs font-mono text-slate-200 mt-1">
                NPM: {summaryResult.npm} • Kelas: {summaryResult.className} • Predikat:{' '}
                <strong className="text-amber-300">{summaryResult.gradeLabel}</strong>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-[#314d6d] hover:bg-[#3c5d82] border border-[#4a6c94] text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-sky-300" /> Cetak Pembahasan
              </button>
              {onViewLeaderboard && (
                <button
                  onClick={onViewLeaderboard}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4" /> Lihat Podium 3D Leaderboard
                </button>
              )}
              <button
                onClick={() => setStage('lobby')}
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Ulangi Kuis 50 Soal
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-[#2e4866] border border-[#45678e]">
              <p className="text-xs font-mono text-slate-300 uppercase">Skor Total</p>
              <p className="text-2xl font-mono font-bold text-sky-300 mt-1">
                {summaryResult.totalScore}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                +{summaryResult.speedBonusTotal} Bonus Kecepatan
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#2e4866] border border-[#45678e]">
              <p className="text-xs font-mono text-slate-300 uppercase">Jawaban Benar</p>
              <p className="text-2xl font-mono font-bold text-emerald-300 mt-1">
                {summaryResult.correctCount} / {summaryResult.totalQuestions}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Salah: {summaryResult.wrongCount} Soal
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#2e4866] border border-[#45678e]">
              <p className="text-xs font-mono text-slate-300 uppercase">Persentase Akurasi</p>
              <p className="text-2xl font-mono font-bold text-amber-300 mt-1">
                {summaryResult.accuracyPercent}%
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Streak Maks: {summaryResult.maxStreak}x
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#2e4866] border border-[#45678e]">
              <p className="text-xs font-mono text-slate-300 uppercase">Waktu Pengerjaan</p>
              <p className="text-2xl font-mono font-bold text-white mt-1">
                {Math.floor(summaryResult.durationSec / 60)}m {summaryResult.durationSec % 60}d
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">+{summaryResult.xpEarned} XP</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-400/15 border border-amber-300/40 col-span-2 md:col-span-1">
              <p className="text-xs font-mono text-amber-200 uppercase">Penghargaan</p>
              <p className="text-sm font-bold text-white mt-1 leading-snug">
                {summaryResult.badgeCategory}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs for 50-Question Detailed Review */}
      <div className="bg-[#edf2f7] rounded-2xl border border-slate-300 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: `Semua 50 Soal (${detailedReview.length})` },
            {
              id: 'correct',
              label: `Jawaban Benar (${detailedReview.filter((x) => x.isCorrect).length})`,
            },
            {
              id: 'wrong',
              label: `Jawaban Salah (${detailedReview.filter((x) => !x.isCorrect).length})`,
            },
            { id: 'secA', label: 'Bagian A: Teori Dasar (10)' },
            { id: 'secB', label: 'Bagian B: Gabungan CBC & QC (15)' },
            { id: 'secC', label: 'Bagian C: Kasus Sangat Sulit (20)' },
            { id: 'secD', label: 'Bagian D: Hitungan MCV/MCH/MCHC (5)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReviewFilter(tab.id as typeof reviewFilter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                reviewFilter === tab.id
                  ? 'bg-[#243b55] text-white shadow'
                  : 'bg-[#dde5ef] hover:bg-slate-300 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Question-by-Question Review Cards */}
      <div className="space-y-5">
        {filteredReview.map((item) => (
          <div
            key={item.questionNumber}
            className="bg-[#edf2f7] rounded-2xl border border-slate-300 shadow-sm overflow-hidden"
          >
            {/* Question Header */}
            <div
              className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                item.isCorrect
                  ? 'bg-emerald-100/80 border-emerald-300'
                  : 'bg-rose-100/80 border-rose-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-700 shrink-0" />
                )}
                <span className="font-mono font-bold text-sm text-slate-800">
                  SOAL #{String(item.questionNumber).padStart(2, '0')} [BAGIAN {item.sectionCode}] — {item.topic}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span
                  className={`px-2.5 py-1 rounded-md font-bold ${
                    item.isCorrect
                      ? 'bg-emerald-700 text-white'
                      : 'bg-rose-700 text-white'
                  }`}
                >
                  {item.isCorrect
                    ? 'BENAR (+Poin)'
                    : item.studentAnswer === '-'
                    ? 'TIDAK DIJAWAB'
                    : `SALAH (Pilih: ${item.studentAnswer})`}
                </span>
                <span className="text-slate-700 bg-[#e2e8f0] px-2.5 py-1 rounded-md border border-slate-300">
                  {item.pdfPageRef}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Clinical Case Table if Bagian C */}
              {item.caseTable && (
                <div className="rounded-xl bg-[#e2e8f0] border border-slate-300 p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-800">
                  <div>
                    <p className="font-mono font-bold text-sky-900 uppercase">Anamnesis & Fisik:</p>
                    <p className="mt-0.5">{item.caseTable.anamnesis}</p>
                    <p className="mt-1 text-slate-700">{item.caseTable.physicalExam}</p>
                    <p className="mt-1 font-medium text-slate-900">
                      Permintaan Dokter: {item.caseTable.doctorOrder}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono font-bold text-rose-900 uppercase">Hasil Pemeriksaan Lab:</p>
                    <p className="mt-0.5 font-mono">{item.caseTable.labResults}</p>
                    <p className="mt-1.5 text-emerald-950">
                      <strong>Konteks Obat/Edukasi:</strong> {item.caseTable.medicationContext}
                    </p>
                  </div>
                </div>
              )}

              {/* Question Text */}
              <p className="text-base font-semibold text-slate-900 leading-relaxed">
                {item.questionText}
              </p>

              {/* All 5 Options A-E Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                {(['A', 'B', 'C', 'D', 'E'] as const).map((optKey) => {
                  const isCorrectOpt = optKey === item.correctOption;
                  const isStudentOpt = optKey === item.studentAnswer;
                  return (
                    <div
                      key={optKey}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                        optKey === 'E' ? 'md:col-span-2' : ''
                      } ${
                        isCorrectOpt
                          ? 'bg-emerald-100/90 border-emerald-400 text-emerald-950 font-semibold'
                          : isStudentOpt && !item.isCorrect
                          ? 'bg-rose-100/90 border-rose-400 text-rose-950 font-semibold'
                          : 'bg-[#e6edf5] border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-white/70 border border-slate-300">
                        {optKey}
                      </span>
                      <div className="flex-1">
                        <p>{item.options[optKey]}</p>
                        {isCorrectOpt && (
                          <span className="inline-block mt-1 text-[11px] font-mono text-emerald-800 font-bold">
                            ✓ KUNCI JAWABAN BENAR
                          </span>
                        )}
                        {isStudentOpt && !isCorrectOpt && (
                          <span className="inline-block mt-1 text-[11px] font-mono text-rose-800 font-bold">
                            ✗ JAWABAN MAHASISWA
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step-by-step Calculation (if Calculation Question) */}
              {item.calculationSteps && (
                <div className="p-4 rounded-xl bg-[#243b55] text-sky-200 font-mono text-xs leading-relaxed border border-[#3a5778]">
                  <p className="text-white font-bold uppercase mb-1 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-sky-300" />
                    Langkah Perhitungan & Validasi Indeks Eritrosit:
                  </p>
                  <p>{item.calculationSteps}</p>
                </div>
              )}

              {/* 5-Part Detailed ATLM Explanations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-[#e2e8f0] border border-slate-300 text-xs text-slate-800 leading-relaxed">
                  <p className="font-bold text-slate-900 uppercase mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-sky-700" />
                    1. Dasar Penalaran Laboratorium
                  </p>
                  <p>{item.scientificExplanation}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#e2e8f0] border border-slate-300 text-xs text-slate-800 leading-relaxed">
                  <p className="font-bold text-slate-900 uppercase mb-1 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-700" />
                    2. Prosedur dan Keputusan ATLM
                  </p>
                  <p>{item.atlmProcedureAndDecision}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#e2e8f0] border border-slate-300 text-xs text-slate-800 leading-relaxed">
                  <p className="font-bold text-slate-900 uppercase mb-1 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-indigo-700" />
                    3. Hubungan dengan Terapi / Obat Dokter
                  </p>
                  <p>{item.doctorClinicalExplanation}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#e2e8f0] border border-slate-300 text-xs text-slate-800 leading-relaxed">
                  <p className="font-bold text-slate-900 uppercase mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    4. Edukasi dan Komunikasi Klinis
                  </p>
                  <p>{item.patientEducation}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-100/60 border border-amber-300 text-xs text-slate-800 leading-relaxed">
                <p className="font-bold text-amber-950 uppercase mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-800" />
                  5. Mengapa Pilihan Lain Keliru (Analisis Opsi A–E)
                </p>
                <p>{item.whyOthersWrong}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
