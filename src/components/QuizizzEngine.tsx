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
  Award,
  Sparkles,
  FileText,
  Stethoscope,
  Users,
  User,
} from 'lucide-react';

interface SanitizedQuestion {
  questionNumber: number;
  category: 'clinical_case' | 'theory';
  topic: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  pdfPageRef: string;
}

export interface DetailedReviewItem {
  questionNumber: number;
  category: 'clinical_case' | 'theory';
  topic: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  studentAnswer: 'A' | 'B' | 'C' | 'D';
  correctOption: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  timeSpentSec: number;
  scientificExplanation: string;
  optionRationales: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  calculationSteps?: string | null;
  doctorClinicalExplanation: string;
  patientEducation: string;
  managementPlan: string;
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
  onQuizCompleted?: (summary: QuizSummaryResult, review: DetailedReviewItem[]) => void;
  onViewLeaderboard?: () => void;
}

export const QuizizzEngine: React.FC<QuizizzEngineProps> = ({
  studentNpm,
  studentName,
  studentClass,
  avatarGender,
  onQuizCompleted,
  onViewLeaderboard,
}) => {
  const [questions, setQuestions] = useState<SanitizedQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stage, setStage] = useState<'lobby' | 'playing' | 'submitting' | 'review'>('lobby');
  const [quizMode, setQuizMode] = useState<'solo' | 'live'>('solo');
  const [liveSessionCode, setLiveSessionCode] = useState<string>('ATLM-HEMATO-30');

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, { selectedOption: 'A' | 'B' | 'C' | 'D'; timeSpentSec: number }>
  >({});
  const [questionTimer, setQuestionTimer] = useState<number>(60);
  const [totalElapsedSec, setTotalElapsedSec] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [streakCount, setStreakCount] = useState<number>(0);
  const [showHelperFormula, setShowHelperFormula] = useState<boolean>(false);

  const [summaryResult, setSummaryResult] = useState<QuizSummaryResult | null>(null);
  const [detailedReview, setDetailedReview] = useState<DetailedReviewItem[]>([]);
  const [reviewFilter, setReviewFilter] = useState<
    'all' | 'correct' | 'wrong' | 'clinical' | 'indices' | 'theory'
  >('all');

  useEffect(() => {
    fetch('/api/quiz/questions')
      .then((r) => r.json())
      .then((data) => {
        if (data.questions) {
          setQuestions(data.questions);
        }
      })
      .catch((err) => console.error('Load quiz error:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (stage !== 'playing') return;
    const interval = window.setInterval(() => {
      setTotalElapsedSec((prev) => prev + 1);
      setQuestionTimer((prev) => {
        if (prev <= 1) {
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, currentIndex]);

  const startQuiz = (mode: 'solo' | 'live') => {
    soundManager.playQuizStart();
    setQuizMode(mode);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setQuestionTimer(60);
    setTotalElapsedSec(0);
    setQuestionStartTime(Date.now());
    setStreakCount(0);
    setStage('playing');
  };

  const handleSelectOption = (optionKey: 'A' | 'B' | 'C' | 'D') => {
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
    setStreakCount((prev) => prev + 1);
  };

  const handleNextOrSubmit = async () => {
    if (currentIndex < questions.length - 1) {
      soundManager.playNavigation();
      setCurrentIndex((prev) => prev + 1);
      setQuestionTimer(60);
      setQuestionStartTime(Date.now());
      return;
    }

    // Submit all 30 answers to backend for official grading
    setStage('submitting');
    try {
      const payloadAnswers = questions.map((q) => ({
        questionNumber: q.questionNumber,
        selectedOption: selectedAnswers[q.questionNumber]?.selectedOption || 'A',
        timeSpentSec: selectedAnswers[q.questionNumber]?.timeSpentSec || 20,
      }));

      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npm: studentNpm,
          fullName: studentName,
          className: studentClass,
          avatarGender,
          mode: quizMode,
          totalDurationSec: Math.max(45, totalElapsedSec),
          answers: payloadAnswers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        soundManager.playVictory();
        setSummaryResult(data.summary);
        setDetailedReview(data.detailedReview);
        setStage('review');
        if (onQuizCompleted) {
          onQuizCompleted(data.summary, data.detailedReview);
        }
      } else {
        setStage('playing');
      }
    } catch (error) {
      console.error('Submit quiz error:', error);
      setStage('playing');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-mono text-slate-500">
          Memuat 30 Soal Ujian Kompetensi Hematologi ATLM...
        </p>
      </div>
    );
  }

  // ===========================================================================
  // STAGE 1: QUIZIZZ-STYLE LOBBY (SOLO & LIVE MODE)
  // ===========================================================================
  if (stage === 'lobby') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 text-white shadow-xl">
          <div className="max-w-3xl">
            <span className="text-xs font-mono uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> UJIAN KOMPETENSI HEMATOLOGI INTERAKTIF (QUIZIZZ EDITION)
            </span>
            <h2 className="text-3xl font-bold mt-2">
              30 Soal ABCD Super Sulit — Kasus Klinis & Teori Fisiologi Darah
            </h2>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Disusun langsung dari materi <strong>PDF ANFIS DARAH (47 Halaman)</strong> karya{' '}
              <strong>dr. Juwita Ninda Suherman, M.Kes</strong> — Institut Kesehatan Rajawali Bandung.
              Terdiri atas <strong>20 Soal Kasus Klinis Sangat Sulit</strong> (perhitungan MCV, MCH, MCHC,
              ambang anemia WHO 2024, leukosit, trombosit, ABO/Rh) dan{' '}
              <strong>10 Soal Teori Sangat Sulit</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <p className="text-xs font-mono text-sky-300 uppercase">Komposisi Soal</p>
              <p className="text-xl font-bold mt-1">30 Soal ABCD</p>
              <p className="text-xs text-slate-400 mt-1">
                20 Kasus Klinis + 10 Teori Mendalam (Tanpa kunci jawaban bocor sebelum selesai)
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <p className="text-xs font-mono text-emerald-300 uppercase">Rumus Indeks Eritrosit</p>
              <p className="text-xs font-mono mt-1.5 text-slate-200">
                • MCV = (Hct × 10) / RBC [fL]
                <br />• MCH = (Hb × 10) / RBC [pg]
                <br />• MCHC = (Hb × 100) / Hct [g/dL]
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <p className="text-xs font-mono text-amber-300 uppercase">Pembahasan Pasca-Kuis</p>
              <p className="text-xl font-bold mt-1">100% Terbuka</p>
              <p className="text-xs text-slate-400 mt-1">
                Rasional opsi A/B/C/D, substitusi angka, interpretasi dokter & edukasi pasien
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode 1: Solo Quiz */}
            <div className="p-5 rounded-2xl bg-sky-950/60 border border-sky-500/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sky-300 text-xs font-mono uppercase font-bold">
                  <User className="w-4 h-4" /> MODE 1: SOLO QUIZ (MANDIRI)
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Kerjakan Mandiri Kapan Saja
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Kerjakan 30 soal dengan pengatur waktu, kumpulkan XP, pecahkan rekor skor pribadi,
                  dan pelajari pembahasan lengkap.
                </p>
              </div>
              <button
                onClick={() => startQuiz('solo')}
                className="mt-5 w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg"
              >
                <Play className="w-4 h-4 fill-current" /> Mulai Solo Quiz (30 Soal)
              </button>
            </div>

            {/* Mode 2: Live Quiz with Lecturer */}
            <div className="p-5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono uppercase font-bold">
                  <Users className="w-4 h-4" /> MODE 2: LIVE QUIZ BERSAMA DOSEN
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  Sesi Kelas Sinkron & Podium 3D
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Masukkan kode sesi kelas dari Dosen untuk berkompetisi secara langsung menuju Podium
                  3D Hematology World Champions.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={liveSessionCode}
                    onChange={(e) => setLiveSessionCode(e.target.value.toUpperCase())}
                    placeholder="Kode Sesi Kelas"
                    className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white w-full"
                  />
                </div>
              </div>
              <button
                onClick={() => startQuiz('live')}
                className="mt-4 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg"
              >
                <Play className="w-4 h-4 fill-current" /> Gabung Live Quiz Kelas
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // STAGE 2: FULL-SCREEN QUIZIZZ GAMEPLAY (30 QUESTIONS)
  // ===========================================================================
  if (stage === 'playing' || stage === 'submitting') {
    const currentQ = questions[currentIndex];
    if (!currentQ) return null;
    const chosen = selectedAnswers[currentQ.questionNumber]?.selectedOption;
    const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 md:p-8 text-white shadow-2xl min-h-[620px] flex flex-col justify-between">
        {/* Top Quizizz Status Bar */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-lg bg-sky-500/20 border border-sky-400/40 text-sky-300 font-mono font-bold text-xs">
                SOAL {currentQ.questionNumber} DARI {questions.length}
              </span>
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border ${
                  currentQ.category === 'clinical_case'
                    ? 'bg-rose-500/15 border-rose-400/40 text-rose-300'
                    : 'bg-indigo-500/15 border-indigo-400/40 text-indigo-300'
                }`}
              >
                {currentQ.category === 'clinical_case'
                  ? 'KASUS KLINIS SANGAT SULIT'
                  : 'TEORI HEMATOLOGI SANGAT SULIT'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHelperFormula(!showHelperFormula)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-sky-300 flex items-center gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5" />
                {showHelperFormula ? 'Tutup Rumus' : 'Lihat Rumus Indeks'}
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-300 font-mono text-xs font-bold">
                <Flame className="w-4 h-4 text-amber-400" />
                Terjawab: {Object.keys(selectedAnswers).length}/30
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs text-slate-200">
                <Clock className="w-4 h-4 text-sky-400" />
                {questionTimer}d
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Formula Reference Banner (Optional toggle for MCV/MCH/MCHC math questions) */}
          {showHelperFormula && (
            <div className="mt-4 p-3.5 rounded-xl bg-slate-900 border border-sky-500/40 text-xs font-mono text-sky-200 grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>MCV (fL) = (Hematokrit (%) × 10) / RBC (juta/µL) [Normal: 80–100 fL]</div>
              <div>MCH (pg) = (Hb (g/dL) × 10) / RBC (juta/µL) [Normal: 27–33 pg]</div>
              <div>MCHC (g/dL) = (Hb (g/dL) × 100) / Hematokrit (%) [Normal: 32–36 g/dL]</div>
            </div>
          )}

          {/* Question Card */}
          <div className="mt-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>{currentQ.topic}</span>
              <span>Sumber PDF: {currentQ.pdfPageRef}</span>
            </div>
            <p className="text-base md:text-lg font-medium text-white leading-relaxed">
              {currentQ.questionText}
            </p>
          </div>

          {/* 4 ABCD Option Cards (Quizizz Color Palette) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
              const isSelected = chosen === optKey;
              const cardColors: Record<'A' | 'B' | 'C' | 'D', string> = {
                A: isSelected
                  ? 'bg-sky-600 border-white ring-2 ring-sky-300'
                  : 'bg-sky-950/70 hover:bg-sky-900/80 border-sky-500/40',
                B: isSelected
                  ? 'bg-emerald-600 border-white ring-2 ring-emerald-300'
                  : 'bg-emerald-950/70 hover:bg-emerald-900/80 border-emerald-500/40',
                C: isSelected
                  ? 'bg-amber-600 border-white ring-2 ring-amber-300'
                  : 'bg-amber-950/70 hover:bg-amber-900/80 border-amber-500/40',
                D: isSelected
                  ? 'bg-purple-600 border-white ring-2 ring-purple-300'
                  : 'bg-purple-950/70 hover:bg-purple-900/80 border-purple-500/40',
              };

              return (
                <button
                  key={optKey}
                  onClick={() => handleSelectOption(optKey)}
                  className={`text-left p-5 rounded-xl border transition-all flex items-start gap-3.5 ${cardColors[optKey]}`}
                >
                  <span className="w-8 h-8 rounded-lg bg-slate-950/60 border border-white/20 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                    {optKey}
                  </span>
                  <span className="text-sm md:text-base font-medium leading-snug text-white">
                    {currentQ.options[optKey]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Navigator & Submit Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold"
            >
              ← Soal Sebelumnya
            </button>
            <div className="hidden lg:flex items-center gap-1 max-w-md overflow-x-auto py-1">
              {questions.map((q, idx) => {
                const answered = Boolean(selectedAnswers[q.questionNumber]);
                return (
                  <button
                    key={q.questionNumber}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-6 h-6 rounded text-[11px] font-mono font-bold shrink-0 ${
                      currentIndex === idx
                        ? 'bg-sky-400 text-slate-950'
                        : answered
                        ? 'bg-emerald-600/80 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {q.questionNumber}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            disabled={stage === 'submitting'}
            onClick={handleNextOrSubmit}
            className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg transition"
          >
            {stage === 'submitting'
              ? 'Menilai & Menyimpan Skor...'
              : currentIndex === questions.length - 1
              ? 'Selesaikan Kuis & Buka Pembahasan 30 Soal →'
              : 'Soal Berikutnya →'}
          </button>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // STAGE 3: HEMATOLOGY QUIZ REVIEW & DETAILED EXPLANATION (POST-QUIZ)
  // ===========================================================================
  const filteredReview = detailedReview.filter((item) => {
    if (reviewFilter === 'correct') return item.isCorrect;
    if (reviewFilter === 'wrong') return !item.isCorrect;
    if (reviewFilter === 'clinical') return item.category === 'clinical_case';
    if (reviewFilter === 'indices') return Boolean(item.calculationSteps);
    if (reviewFilter === 'theory') return item.category === 'theory';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Summary Score Card */}
      {summaryResult && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4" /> HEMATOLOGY QUIZ REVIEW & DETAILED EXPLANATION
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mt-1">
                Hasil Evaluasi Kompetensi: {summaryResult.fullName}
              </h2>
              <p className="text-xs font-mono text-slate-300 mt-1">
                NPM: {summaryResult.npm} • Kelas: {summaryResult.className} • Predikat:{' '}
                <strong className="text-amber-300">{summaryResult.gradeLabel}</strong>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-sky-400" /> Cetak Pembahasan
              </button>
              {onViewLeaderboard && (
                <button
                  onClick={onViewLeaderboard}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4" /> Lihat Podium 3D Leaderboard
                </button>
              )}
              <button
                onClick={() => setStage('lobby')}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Ulangi Kuis
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <p className="text-xs font-mono text-slate-400 uppercase">Skor Total</p>
              <p className="text-2xl font-mono font-bold text-sky-400 mt-1">
                {summaryResult.totalScore}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                +{summaryResult.speedBonusTotal} Bonus Kecepatan
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <p className="text-xs font-mono text-slate-400 uppercase">Jawaban Benar</p>
              <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                {summaryResult.correctCount} / {summaryResult.totalQuestions}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Salah: {summaryResult.wrongCount} Soal
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <p className="text-xs font-mono text-slate-400 uppercase">Persentase Akurasi</p>
              <p className="text-2xl font-mono font-bold text-amber-300 mt-1">
                {summaryResult.accuracyPercent}%
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Streak Maks: {summaryResult.maxStreak}x
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <p className="text-xs font-mono text-slate-400 uppercase">Waktu Pengerjaan</p>
              <p className="text-2xl font-mono font-bold text-white mt-1">
                {Math.floor(summaryResult.durationSec / 60)}m {summaryResult.durationSec % 60}d
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">+{summaryResult.xpEarned} XP</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/40 col-span-2 md:col-span-1">
              <p className="text-xs font-mono text-amber-300 uppercase">Penghargaan</p>
              <p className="text-sm font-bold text-white mt-1 leading-snug">
                {summaryResult.badgeCategory}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs for 30-Question Detailed Review */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: `Semua Soal (${detailedReview.length})` },
            {
              id: 'correct',
              label: `Jawaban Benar (${detailedReview.filter((x) => x.isCorrect).length})`,
            },
            {
              id: 'wrong',
              label: `Jawaban Salah (${detailedReview.filter((x) => !x.isCorrect).length})`,
            },
            { id: 'clinical', label: 'Soal Kasus Klinis (20)' },
            { id: 'indices', label: 'Soal Perhitungan MCV/MCH/MCHC (11)' },
            { id: 'theory', label: 'Soal Teori Sulit (10)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReviewFilter(tab.id as typeof reviewFilter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                reviewFilter === tab.id
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Question Header */}
            <div
              className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                item.isCorrect
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-rose-50/70 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span className="font-mono font-bold text-sm text-slate-900">
                  SOAL #{item.questionNumber} — {item.topic}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span
                  className={`px-2.5 py-1 rounded-md font-bold ${
                    item.isCorrect
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {item.isCorrect ? 'BENAR (+Poin)' : 'SALAH'}
                </span>
                <span className="text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                  Referensi PDF: {item.pdfPageRef}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Question Text */}
              <p className="text-base font-medium text-slate-900 leading-relaxed">
                {item.questionText}
              </p>

              {/* Student Answer vs Correct Answer Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  className={`p-3.5 rounded-xl border ${
                    item.isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <p className="text-xs font-mono uppercase opacity-75">Jawaban Mahasiswa</p>
                  <p className="text-sm font-bold mt-0.5">
                    Opsi {item.studentAnswer}: {item.options[item.studentAnswer]}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-950">
                  <p className="text-xs font-mono uppercase opacity-75">Kunci Jawaban Benar</p>
                  <p className="text-sm font-bold mt-0.5">
                    Opsi {item.correctOption}: {item.options[item.correctOption]}
                  </p>
                </div>
              </div>

              {/* Step-by-step Calculation (if Erythrocyte Index Question) */}
              {item.calculationSteps && (
                <div className="p-4 rounded-xl bg-slate-900 text-sky-300 font-mono text-xs leading-relaxed border border-slate-800">
                  <p className="text-white font-bold uppercase mb-1 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-sky-400" />
                    Langkah Perhitungan Indeks Eritrosit (Substitusi Rumus):
                  </p>
                  <p>{item.calculationSteps}</p>
                </div>
              )}

              {/* Scientific Explanation */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
                <p className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  Pembahasan Ilmiah Hematologi
                </p>
                <p>{item.scientificExplanation}</p>
              </div>

              {/* Rationale for Every Option A, B, C, D */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Analisis Rasional Setiap Opsi Pilihan (A, B, C, D)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  {(['A', 'B', 'C', 'D'] as const).map((optKey) => (
                    <div
                      key={optKey}
                      className={`p-3 rounded-xl border ${
                        optKey === item.correctOption
                          ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <p className="font-mono font-bold">
                        Opsi {optKey}: {item.options[optKey]}
                      </p>
                      <p className="mt-1">{item.optionRationales[optKey]}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Interpretation, Patient Education & Management Plan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-100 text-xs text-slate-700">
                  <p className="font-bold text-sky-900 uppercase mb-1 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5" /> Interpretasi Klinis Dokter
                  </p>
                  <p>{item.doctorClinicalExplanation}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100 text-xs text-slate-700">
                  <p className="font-bold text-amber-900 uppercase mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Edukasi Pasien
                  </p>
                  <p>{item.patientEducation}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-slate-700">
                  <p className="font-bold text-emerald-900 uppercase mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Rencana Tindak Lanjut
                  </p>
                  <p>{item.managementPlan}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
