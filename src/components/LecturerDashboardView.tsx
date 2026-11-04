import React, { useEffect, useState } from 'react';
import { HEMATOLOGY_MODULES } from '../data/hematologyData';
import { GLOSSARY_CATEGORIES, GlossaryItem } from '../data/glossaryData';
import { Leaderboard3DPodium, LeaderboardEntry } from './Leaderboard3DPodium';
import { soundManager } from '../utils/soundManager';
import {
  LayoutDashboard,
  Users,
  KeyRound,
  ShieldCheck,
  GraduationCap,
  FileQuestion,
  PlayCircle,
  ClipboardList,
  BookOpenCheck,
  BarChart3,
  Trophy,
  BookA,
  Library,
  Download,
  Settings,
  Plus,
  CheckCircle2,
  Printer,
  Lock,
  Unlock,
  RefreshCw,
  Sparkles,
  Copy,
  FileDown,
  FileText,
  Filter,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  ActivationCodeExportItem,
  PdfFilterMode,
  createActivationCodesPdfDocument,
  extractBatchOrCategory,
  extractPureCode,
  formatIndonesianDate,
  resolveCodeStatus,
} from '../utils/activationCodePdfGenerator';

interface LecturerDashboardProps {
  lecturerName: string;
  onLogout: () => void;
}

export const LECTURER_MENUS = [
  { id: 'dashboard', label: '1. Dashboard Dosen', icon: LayoutDashboard },
  { id: 'participants', label: '2. Daftar Peserta', icon: Users },
  { id: 'access_codes', label: '3. Kode Aktivasi Mahasiswa', icon: KeyRound },
  { id: 'lifetime_history', label: '4. Riwayat Aktivasi Mahasiswa', icon: ShieldCheck },
  { id: 'class_mgmt', label: '5. Manajemen Kelas', icon: GraduationCap },
  { id: 'question_bank', label: '6. Bank Soal (50 A–E)', icon: FileQuestion },
  { id: 'quiz_control', label: '7. Kuis & Sesi Live', icon: PlayCircle },
  { id: 'quiz_results', label: '8. Hasil Kuis', icon: ClipboardList },
  { id: 'explanations', label: '9. Pembahasan Rinci', icon: BookOpenCheck },
  { id: 'analytics', label: '10. Analisis Kelas', icon: BarChart3 },
  { id: 'leaderboard', label: '11. Leaderboard 3D', icon: Trophy },
  { id: 'glossary_mgmt', label: '12. Glosarium', icon: BookA },
  { id: 'material_mgmt', label: '13. Manajemen Materi (35)', icon: Library },
  { id: 'export_scores', label: '14. Ekspor Nilai (CSV/Print)', icon: Download },
  { id: 'settings', label: '15. Pengaturan Kredensial', icon: Settings },
] as const;

export type LecturerMenuId = (typeof LECTURER_MENUS)[number]['id'];

export const LecturerDashboardView: React.FC<LecturerDashboardProps> = ({
  lecturerName,
  onLogout,
}) => {
  const [activeMenu, setActiveMenu] = useState<LecturerMenuId>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [dashData, setDashData] = useState<{
    metrics: {
      totalActivatedStudents: number;
      totalQuizAttempts: number;
      averageAccuracyPercent: number;
      highestScore: number;
      lowestScore: number;
      activeAccessCodeVersion: number;
    };
    entitlements: Array<{
      id: number;
      npm: string;
      fullName: string;
      className: string;
      activatedWithCodeVersion: number;
      activatedWithCodeDisplay?: string;
      lifetimeAccess: boolean;
      revoked: boolean;
      activatedAt: string;
      lastLoginAt: string;
    }>;
    attempts: Array<{
      id: number;
      npm: string;
      fullName: string;
      className: string;
      mode: string;
      correctCount: number;
      wrongCount: number;
      accuracyPercent: number;
      totalScore: number;
      durationSec: number;
      completedAt: string;
    }>;
    accessCodes: Array<ActivationCodeExportItem>;
    leaderboard: LeaderboardEntry[];
    questionStats: Array<{
      questionNumber: number;
      sectionCode: 'A' | 'B' | 'C' | 'D';
      topic: string;
      category: string;
      caseTable?: {
        anamnesis: string;
        physicalExam: string;
        doctorOrder: string;
        labResults: string;
        medicationContext: string;
      } | null;
      correctOption: 'A' | 'B' | 'C' | 'D' | 'E';
      totalAttempts: number;
      correctCount: number;
      accuracyPercent: number;
      pdfPageRef: string;
      questionText: string;
      options: { A: string; B: string; C: string; D: string; E: string };
      scientificExplanation: string;
      atlmProcedureAndDecision: string;
      doctorClinicalExplanation: string;
      patientEducation: string;
      whyOthersWrong: string;
      calculationSteps: string | null;
    }>;
  } | null>(null);

  // Forms state
  const [newAccessCode, setNewAccessCode] = useState<string>('');
  const [newCodeLabel, setNewCodeLabel] = useState<string>('');
  const [batchCount, setBatchCount] = useState<number>(20);
  const [isSubmittingCode, setIsSubmittingCode] = useState<boolean>(false);
  const [copiedCodeId, setCopiedCodeId] = useState<number | 'all' | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // PDF Download & Filter State
  const [pdfFilterMode, setPdfFilterMode] = useState<PdfFilterMode>('all');
  const [selectedCodeIds, setSelectedCodeIds] = useState<number[]>([]);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  const [newUsername, setNewUsername] = useState<string>('dr.juwita');
  const [newPassword, setNewPassword] = useState<string>('');

  const [glossaryList, setGlossaryList] = useState<GlossaryItem[]>([]);
  const [newTerm, setNewTerm] = useState<string>('');
  const [newAbbr, setNewAbbr] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Komponen darah');
  const [newDef, setNewDef] = useState<string>('');

  const fetchDashboard = async () => {
    setLoading(true);
    setErrorBanner(null);
    try {
      const [resDash, resLb, resGloss] = await Promise.all([
        fetch('/api/lecturer/dashboard', { credentials: 'include' }),
        fetch('/api/leaderboard?role=lecturer', { credentials: 'include' }),
        fetch('/api/glossary', { credentials: 'include' }),
      ]);

      if (resDash.status === 401 || resDash.status === 403) {
        onLogout();
        return;
      }

      const d = await resDash.json();
      const lb = await resLb.json();
      const gl = await resGloss.json();
      setDashData({
        ...d,
        leaderboard: lb.leaderboard || [],
      });
      if (gl.terms) setGlossaryList(gl.terms);
    } catch (error) {
      console.error('Lecturer fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCopyPureCode = async (pureCode: string, id: number | 'all') => {
    soundManager.playClick();
    try {
      await navigator.clipboard.writeText(pureCode);
      setCopiedCodeId(id);
      setStatusBanner(
        id === 'all'
          ? 'Seluruh kode aktivasi yang tersedia berhasil disalin ke clipboard!'
          : `Kode aktivasi "${pureCode}" berhasil disalin! Silakan bagikan ke mahasiswa.`
      );
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch {
      setStatusBanner(`Kode aktivasi: ${pureCode}`);
    }
  };

  const toggleCodeSelection = (id: number) => {
    setSelectedCodeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getFilteredCodesForPdf = (codes: ActivationCodeExportItem[]): {
    filtered: ActivationCodeExportItem[];
    description: string;
  } => {
    switch (pdfFilterMode) {
      case 'available':
        return {
          filtered: codes.filter((c) => resolveCodeStatus(c) === 'Tersedia'),
          description: 'Hanya Kode yang Tersedia (Belum Digunakan)',
        };
      case 'used':
        return {
          filtered: codes.filter((c) => resolveCodeStatus(c) === 'Sudah Digunakan'),
          description: 'Hanya Kode yang Sudah Digunakan Mahasiswa',
        };
      case 'selected':
        return {
          filtered: codes.filter((c) => selectedCodeIds.includes(c.id)),
          description: `Kode Pilihan Dosen (${selectedCodeIds.length} Kode Dipilih)`,
        };
      case 'batch_date': {
        const filtered = codes.filter((c) => {
          const batchMatch =
            selectedBatchFilter === 'ALL' || extractBatchOrCategory(c) === selectedBatchFilter;
          const dateMatch =
            !selectedDateFilter ||
            String(c.createdAt || '').slice(0, 10) === selectedDateFilter;
          return batchMatch && dateMatch;
        });
        const batchLabel =
          selectedBatchFilter === 'ALL' ? 'Semua Batch' : `Batch "${selectedBatchFilter}"`;
        const dateLabel = selectedDateFilter ? `, Tanggal ${selectedDateFilter}` : '';
        return {
          filtered,
          description: `Berdasarkan ${batchLabel}${dateLabel}`,
        };
      }
      case 'all':
      default:
        return {
          filtered: codes,
          description: 'Semua Kode Aktivasi Mahasiswa',
        };
    }
  };

  const handleDownloadActivationCodesPdf = async () => {
    if (isDownloadingPdf) return;
    soundManager.playClick();
    setIsDownloadingPdf(true);
    setStatusBanner(null);
    setErrorBanner(null);

    try {
      // Fetch fresh live activation codes directly from the primary database (read-only)
      let liveCodes: ActivationCodeExportItem[] = dashData?.accessCodes || [];
      try {
        const res = await fetch('/api/lecturer/access-codes', { credentials: 'include' });
        if (res.status === 401 || res.status === 403) {
          setErrorBanner(
            'Akses ditolak. Hanya Dosen Pengampu yang berwenang mengunduh daftar kode aktivasi.'
          );
          setIsDownloadingPdf(false);
          return;
        }
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.accessCodes)) {
            liveCodes = json.accessCodes;
          }
        }
      } catch {
        // Fallback to already-loaded dashData.accessCodes if network hiccups
      }

      if (!liveCodes || liveCodes.length === 0) {
        setErrorBanner(
          'Belum ada kode aktivasi mahasiswa di database untuk diunduh. Silakan terbitkan kode terlebih dahulu.'
        );
        setIsDownloadingPdf(false);
        return;
      }

      const { filtered, description } = getFilteredCodesForPdf(liveCodes);
      if (filtered.length === 0) {
        setErrorBanner(
          pdfFilterMode === 'selected'
            ? 'Silakan centang minimal 1 kode aktivasi pada daftar di bawah sebelum mengunduh PDF mode Pilihan Dosen.'
            : `Tidak ada kode aktivasi yang cocok dengan filter "${description}".`
        );
        setIsDownloadingPdf(false);
        return;
      }

      const { doc, fileName, exportedCount } = createActivationCodesPdfDocument({
        lecturerName: lecturerName || 'dr. Juwita Ninda Suherman, M.Kes',
        allCodes: liveCodes,
        filteredCodes: filtered,
        filterMode: pdfFilterMode,
        filterDescription: description,
        downloadDate: new Date(),
      });

      // Trigger reliable PDF download across Desktop browsers and Android Chrome/WebView
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

      setStatusBanner(
        `Dokumen PDF "${fileName}" (${exportedCount} kode aktivasi utuh) berhasil diunduh! Siap dicetak pada kertas A4 atau dibagikan kepada mahasiswa.`
      );
    } catch (err) {
      console.error('PDF generation error:', err);
      setErrorBanner('Gagal membuat file PDF daftar kode aktivasi. Silakan coba kembali.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleCreateAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccessCode.trim() || isSubmittingCode) return;
    soundManager.playClick();
    setIsSubmittingCode(true);
    setStatusBanner(null);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/lecturer/access-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          newCode: newAccessCode.trim().toUpperCase(),
          codeLabel: newCodeLabel.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusBanner(data.message);
        setNewAccessCode('');
        setNewCodeLabel('');
        await fetchDashboard();
      } else {
        setErrorBanner(data.error || 'Gagal menerbitkan kode aktivasi.');
      }
    } catch {
      setErrorBanner('Gagal menghubungi server.');
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const handleGenerateBatchCodes = async () => {
    if (isSubmittingCode) return;
    soundManager.playClick();
    setIsSubmittingCode(true);
    setStatusBanner(null);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/lecturer/access-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          batchCount,
          codeLabel: newCodeLabel.trim() || 'Kode Aktivasi Unik Mahasiswa ATLM',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusBanner(data.message);
        await fetchDashboard();
      } else {
        setErrorBanner(data.error || 'Gagal menerbitkan batch kode aktivasi.');
      }
    } catch {
      setErrorBanner('Gagal menghubungi server.');
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const handleToggleCodeActive = async (id: number, currentActive: boolean) => {
    soundManager.playClick();
    setStatusBanner(null);
    setErrorBanner(null);
    const res = await fetch(`/api/lecturer/access-codes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isActive: !currentActive }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErrorBanner(data.error || 'Tidak dapat mengubah status kode ini.');
    } else if (data.message) {
      setStatusBanner(data.message);
    }
    fetchDashboard();
  };

  const handleToggleStudentEntitlement = async (npm: string, currentRevoked: boolean) => {
    soundManager.playClick();
    await fetch('/api/lecturer/toggle-entitlement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ npm, revoked: !currentRevoked }),
    });
    fetchDashboard();
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;
    setStatusBanner(null);
    setErrorBanner(null);
    const res = await fetch('/api/auth/lecturer/setup-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        newUsername,
        newPassword,
        fullName: 'dr. Juwita Ninda Suherman, M.Kes',
      }),
    });
    const d = await res.json();
    if (res.ok && d.success) {
      setStatusBanner('Kredensial pribadi Dosen berhasil diperbarui!');
      setNewPassword('');
    } else {
      setErrorBanner(d.error || 'Gagal memperbarui kredensial.');
    }
  };

  const handleAddGlossary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newDef.trim()) return;
    const res = await fetch('/api/glossary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        term: newTerm,
        abbreviation: newAbbr,
        englishTerm: newTerm,
        category: newCategory,
        definition: newDef,
        functionRole: 'Ditambahkan oleh Dosen Pengampu',
        clinicalExample: 'Evaluasi Laboratorium Hematologi ATLM',
        hematologyRelation: 'Kompetensi Hematologi IKES Rajawali',
        pdfPageRef: 1,
      }),
    });
    const d = await res.json();
    if (d.success) {
      setNewTerm('');
      setNewAbbr('');
      setNewDef('');
      fetchDashboard();
    }
  };

  const handleExportCSV = () => {
    if (!dashData) return;
    const headers = [
      'Peringkat',
      'NPM Lengkap',
      'Nama Mahasiswa',
      'Kelas',
      'Skor Total',
      'Jumlah Benar (dari 50)',
      'Akurasi (%)',
      'Durasi (Detik)',
      'Kategori Penghargaan',
    ];
    const rows = dashData.leaderboard.map((r) => [
      r.rank,
      r.rawNpm || r.npm,
      `"${r.fullName}"`,
      `"${r.className}"`,
      r.score,
      r.correctCount,
      r.accuracyPercent,
      r.durationSec,
      `"${r.badgeCategory}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Nilai_Hematologi_ATLM_IKES_Rajawali.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#dde5ef] flex flex-col lg:flex-row">
      {/* Left Sidebar (15 Lecturer Menus) */}
      <aside className="w-full lg:w-72 bg-[#233852] text-white shrink-0 border-r border-[#355172] no-print">
        <div className="p-5 border-b border-[#355172] flex items-center gap-3">
          <img
            src="/assets/ikes_rajawali_logo.png"
            alt="Logo IKES Rajawali"
            className="w-11 h-11 rounded-full bg-white p-0.5 object-contain shrink-0"
          />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-sky-300">
              PORTAL DOSEN PENGAMPU
            </p>
            <h2 className="text-sm font-bold leading-snug">{lecturerName}</h2>
            <p className="text-[11px] text-slate-300">IKES Rajawali Bandung</p>
          </div>
        </div>

        <nav className="p-3 space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto">
          {LECTURER_MENUS.map((m) => {
            const Icon = m.icon;
            const active = activeMenu === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveMenu(m.id);
                  setStatusBanner(null);
                  setErrorBanner(null);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition ${
                  active
                    ? 'bg-sky-500 text-slate-950 font-bold shadow'
                    : 'text-slate-200 hover:bg-[#2f4969] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{m.label}</span>
              </button>
            );
          })}

          <div className="pt-3 mt-3 border-t border-[#355172]">
            <button
              onClick={onLogout}
              className="w-full px-3.5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white text-xs font-semibold transition"
            >
              Logout dari Portal Dosen
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto space-y-6">
        {/* Top Academic Institution Header */}
        <div className="bg-[#edf2f7] rounded-2xl border border-slate-300 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/ikes_rajawali_logo.png"
              alt="Logo Institut Kesehatan Rajawali"
              className="w-12 h-12 object-contain"
            />
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-700">
                INSTITUT KESEHATAN RAJAWALI — PROGRAM STUDI D-III / D-IV TLM (ATLM)
              </span>
              <h1 className="text-xl font-bold text-slate-900">
                Sistem Manajemen Pembelajaran & Evaluasi Hematologi — {lecturerName}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={fetchDashboard}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Segarkan Data
            </button>
            <button
              onClick={handleDownloadActivationCodesPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />{' '}
              {isDownloadingPdf ? 'Menyiapkan PDF...' : 'UNDUH KODE AKTIVASI (PDF)'}
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Unduh CSV Nilai
            </button>
          </div>
        </div>

        {statusBanner && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusBanner}</span>
          </div>
        )}

        {errorBanner && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
            <span>{errorBanner}</span>
          </div>
        )}

        {loading || !dashData ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-sm font-mono text-slate-500">
            Memuat data real-time kelas dari database...
          </div>
        ) : (
          <>
            {/* MENU 1: DASHBOARD OVERVIEW */}
            {activeMenu === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-mono uppercase text-slate-500">
                      Mahasiswa Lifetime Aktif
                    </p>
                    <p className="text-3xl font-mono font-bold text-slate-900 mt-1">
                      {dashData.metrics.totalActivatedStudents}
                    </p>
                    <p className="text-[11px] text-emerald-600 mt-1">Akses Permanen Terikat NPM</p>
                  </div>
                  <div className="bg-[#edf2f7] p-5 rounded-2xl border border-slate-300 shadow-sm">
                    <p className="text-xs font-mono uppercase text-slate-600">Total Percobaan Kuis</p>
                    <p className="text-3xl font-mono font-bold text-sky-700 mt-1">
                      {dashData.metrics.totalQuizAttempts}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">50 Soal Pilihan Ganda (A–E)</p>
                  </div>
                  <div className="bg-[#edf2f7] p-5 rounded-2xl border border-slate-300 shadow-sm">
                    <p className="text-xs font-mono uppercase text-slate-600">Rata-rata Akurasi</p>
                    <p className="text-3xl font-mono font-bold text-emerald-700 mt-1">
                      {dashData.metrics.averageAccuracyPercent}%
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">Bagian A, B, C & D (ATLM)</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-mono uppercase text-slate-500">Skor Tertinggi</p>
                    <p className="text-3xl font-mono font-bold text-amber-600 mt-1">
                      {dashData.metrics.highestScore}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Terendah: {dashData.metrics.lowestScore}
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-mono uppercase text-slate-500">
                      Kode Mahasiswa Tersedia
                    </p>
                    <p className="text-3xl font-mono font-bold text-indigo-700 mt-1">
                      {dashData.metrics.activeAccessCodeVersion}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">1 Kode Unik = 1 Mahasiswa</p>
                  </div>
                </div>

                {/* Quick Access to 3D Leaderboard Podium */}
                <Leaderboard3DPodium entries={dashData.leaderboard} isLecturerView={true} />
              </div>
            )}

            {/* MENU 2 & 8: PARTICIPANTS & QUIZ RESULTS */}
            {(activeMenu === 'participants' || activeMenu === 'quiz_results') && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Daftar Peserta & Riwayat Nilai Ujian Hematologi (50 Soal A–E)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-mono text-slate-600 uppercase">
                        <th className="py-3 px-3">NPM Lengkap</th>
                        <th className="py-3 px-3">Nama Mahasiswa</th>
                        <th className="py-3 px-3">Kelas</th>
                        <th className="py-3 px-3">Mode</th>
                        <th className="py-3 px-3">Benar / Salah</th>
                        <th className="py-3 px-3">Akurasi</th>
                        <th className="py-3 px-3">Skor Total</th>
                        <th className="py-3 px-3">Durasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dashData.attempts.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{a.npm}</td>
                          <td className="py-3 px-3 font-semibold text-slate-900">{a.fullName}</td>
                          <td className="py-3 px-3 text-slate-600">{a.className}</td>
                          <td className="py-3 px-3 font-mono uppercase">{a.mode}</td>
                          <td className="py-3 px-3 font-mono">
                            <span className="text-emerald-700 font-bold">{a.correctCount} B</span> /{' '}
                            <span className="text-rose-600">{a.wrongCount} S</span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-sky-700">
                            {a.accuracyPercent}%
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            {a.totalScore}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600">
                            {Math.floor(a.durationSec / 60)}m {a.durationSec % 60}d
                          </td>
                        </tr>
                      ))}
                      {dashData.attempts.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-500">
                            Belum ada percobaan kuis baru. Data juara awal dapat dilihat pada menu Leaderboard.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MENU 3: UNIQUE ONE-TIME STUDENT ACTIVATION CODE MANAGEMENT */}
            {activeMenu === 'access_codes' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-5">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900">
                      Terbitkan Kode Aktivasi Unik Mahasiswa (1 Kode = 1 Mahasiswa)
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Aturan Keamanan & Lisensi Seumur Hidup:</strong> Setiap mahasiswa
                      mendapatkan satu kode aktivasi unik dari Dosen. Satu kode hanya berlaku satu
                      kali untuk satu NPM mahasiswa dan mengaktifkan akun mahasiswa tersebut secara
                      permanen seumur hidup.
                    </p>
                    <form onSubmit={handleCreateAccessCode} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                          Kode Aktivasi Unik Baru
                        </label>
                        <input
                          type="text"
                          required
                          value={newAccessCode}
                          onChange={(e) => setNewAccessCode(e.target.value.toUpperCase())}
                          placeholder="Contoh: ATLM-IKES-015"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                          Label / Nama Mahasiswa atau Kelas (Opsional)
                        </label>
                        <input
                          type="text"
                          value={newCodeLabel}
                          onChange={(e) => setNewCodeLabel(e.target.value)}
                          placeholder="Contoh: Kelas ATLM Reguler A"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingCode}
                        className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />{' '}
                        {isSubmittingCode ? 'Menerbitkan...' : 'Terbitkan 1 Kode Aktivasi Unik'}
                      </button>
                    </form>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Generate Otomatis Batch Kode Unik Kelas
                    </h3>
                    <p className="text-xs text-slate-600">
                      Buat beberapa kode aktivasi unik sekaligus untuk dibagikan kepada mahasiswa di
                      kelas.
                    </p>
                    <div className="flex items-center gap-3">
                      <select
                        value={batchCount}
                        onChange={(e) => setBatchCount(Number(e.target.value))}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                      >
                        <option value={5}>5 Kode Unik</option>
                        <option value={10}>10 Kode Unik</option>
                        <option value={20}>20 Kode Unik</option>
                        <option value={30}>30 Kode Unik</option>
                        <option value={50}>50 Kode Unik</option>
                        <option value={100}>100 Kode Unik</option>
                      </select>
                      <button
                        type="button"
                        disabled={isSubmittingCode}
                        onClick={handleGenerateBatchCodes}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-semibold"
                      >
                        {isSubmittingCode
                          ? 'Membuat Kode...'
                          : `+ Generate ${batchCount} Kode Unik`}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Daftar Kode Aktivasi Unik Mahasiswa ({dashData.accessCodes.length} Kode)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tersedia:{' '}
                        <strong className="text-emerald-700">
                          {
                            dashData.accessCodes.filter((c) => resolveCodeStatus(c) === 'Tersedia')
                              .length
                          }
                        </strong>{' '}
                        • Sudah Digunakan:{' '}
                        <strong className="text-sky-700">
                          {
                            dashData.accessCodes.filter(
                              (c) => resolveCodeStatus(c) === 'Sudah Digunakan'
                            ).length
                          }
                        </strong>{' '}
                        • Dinonaktifkan:{' '}
                        <strong className="text-rose-700">
                          {
                            dashData.accessCodes.filter(
                              (c) => resolveCodeStatus(c) === 'Dinonaktifkan'
                            ).length
                          }
                        </strong>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={isDownloadingPdf}
                        onClick={handleDownloadActivationCodesPdf}
                        className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                      >
                        <FileDown className="w-4 h-4" />
                        {isDownloadingPdf ? 'MENYIAPKAN PDF...' : 'UNDUH KODE AKTIVASI (PDF)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const available = dashData.accessCodes
                            .filter((c) => c.isActive && (c.activatedCount || 0) === 0)
                            .map((c) => extractPureCode(c));
                          if (available.length > 0) {
                            handleCopyPureCode(available.join('\n'), 'all');
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedCodeId === 'all' ? 'Tersalin!' : 'Salin Semua Kode Tersedia'}
                      </button>
                    </div>
                  </div>

                  {/* PDF Filter & Export Configuration Panel */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5 text-sky-700" />
                        Opsi Filter Unduh Dokumen PDF (Kertas A4 Portrait Resmi)
                      </span>
                      <span className="text-[11px] font-mono text-slate-600">
                        Siap diunduh:{' '}
                        <strong className="text-slate-900">
                          {getFilteredCodesForPdf(dashData.accessCodes).filtered.length}
                        </strong>{' '}
                        dari {dashData.accessCodes.length} kode
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                      {(
                        [
                          { id: 'all', label: '1. Semua Kode Aktivasi' },
                          { id: 'available', label: '2. Hanya Kode Tersedia' },
                          { id: 'used', label: '3. Hanya Kode Sudah Digunakan' },
                          {
                            id: 'selected',
                            label: `4. Pilihan Dosen (${selectedCodeIds.length})`,
                          },
                          { id: 'batch_date', label: '5. Berdasarkan Batch / Tanggal' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPdfFilterMode(opt.id)}
                          className={`px-3 py-2 rounded-lg border text-left font-semibold transition flex items-center justify-between ${
                            pdfFilterMode === opt.id
                              ? 'bg-sky-900 text-white border-sky-900 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          {pdfFilterMode === opt.id && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>

                    {pdfFilterMode === 'selected' && (
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 text-xs">
                        <span className="text-slate-600 font-medium">Aksi Cepat Pilihan:</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCodeIds(dashData.accessCodes.map((c) => c.id))
                          }
                          className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 font-semibold text-slate-700"
                        >
                          Pilih Semua ({dashData.accessCodes.length})
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCodeIds(
                              dashData.accessCodes
                                .filter((c) => resolveCodeStatus(c) === 'Tersedia')
                                .map((c) => c.id)
                            )
                          }
                          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 font-semibold text-emerald-800"
                        >
                          Pilih Semua yang Tersedia
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCodeIds([])}
                          className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 font-semibold text-rose-700"
                        >
                          Reset Pilihan
                        </button>
                      </div>
                    )}

                    {pdfFilterMode === 'batch_date' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Kategori / Label Batch Kode:
                          </label>
                          <select
                            value={selectedBatchFilter}
                            onChange={(e) => setSelectedBatchFilter(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                          >
                            <option value="ALL">Semua Batch / Kategori</option>
                            {Array.from(
                              new Set(
                                dashData.accessCodes.map((c) => extractBatchOrCategory(c))
                              )
                            ).map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Tanggal Penerbitan (Opsional):
                          </label>
                          <input
                            type="date"
                            value={selectedDateFilter}
                            onChange={(e) => setSelectedDateFilter(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {dashData.accessCodes.map((c) => {
                      const status = resolveCodeStatus(c);
                      const isUsed = status === 'Sudah Digunakan';
                      const pureCode = extractPureCode(c);
                      const isSelected = selectedCodeIds.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 ${
                            isSelected
                              ? 'border-sky-500 bg-sky-50/40'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => toggleCodeSelection(c.id)}
                              className="mt-1 text-slate-500 hover:text-sky-700"
                              title="Pilih kode ini untuk diunduh ke PDF"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-sky-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">
                                  #{c.version}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-md bg-sky-900 text-sky-100 font-mono text-sm font-bold tracking-wider">
                                  {pureCode}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyPureCode(pureCode, c.id)}
                                  className="px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-900 border border-slate-300 text-[11px] font-semibold flex items-center gap-1 transition"
                                >
                                  <Copy className="w-3 h-3" />
                                  {copiedCodeId === c.id ? 'Disalin!' : 'Salin Kode'}
                                </button>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                                    isUsed
                                      ? 'bg-sky-100 text-sky-900 border border-sky-300'
                                      : c.isActive
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                                  }`}
                                >
                                  {isUsed
                                    ? 'SUDAH DIGUNAKAN (TERIKAT PERMANEN 1 NPM)'
                                    : c.isActive
                                    ? 'TERSEDIA UNTUK 1 MAHASISWA BARU'
                                    : 'DINONAKTIFKAN'}
                                </span>
                              </div>
                              <p className="text-xs font-mono text-slate-700">
                                {c.codeLabel}
                              </p>
                              {isUsed && (c.usedByStudentName || c.usedByStudentNpm) && (
                                <p className="text-xs font-semibold text-sky-900 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200 inline-block">
                                  Mahasiswa Pengguna: {c.usedByStudentName || 'Mahasiswa ATLM'} •
                                  NIM/NPM: <span className="font-mono">{c.usedByStudentNpm}</span>
                                </p>
                              )}
                              <p className="text-[11px] text-slate-500 font-mono">
                                Diterbitkan oleh: {c.createdBy} • Tgl:{' '}
                                {formatIndonesianDate(c.createdAt)}
                              </p>
                            </div>
                          </div>
                          {!isUsed && (
                            <button
                              onClick={() => handleToggleCodeActive(c.id, c.isActive)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
                                c.isActive
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {c.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* MENU 4 & 5: LIFETIME ACTIVATION HISTORY & CLASS MANAGEMENT */}
            {(activeMenu === 'lifetime_history' || activeMenu === 'class_mgmt') && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Tabel Hak Akses Seumur Hidup Mahasiswa (Student Lifetime Entitlements)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Setiap NPM yang tercantum di bawah ini terhubung secara permanen dengan kode
                      aktivasi unik masing-masing.
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-mono text-slate-600 uppercase">
                        <th className="py-3 px-3">NPM</th>
                        <th className="py-3 px-3">Nama Lengkap</th>
                        <th className="py-3 px-3">Kelas</th>
                        <th className="py-3 px-3">Kode Aktivasi Terikat</th>
                        <th className="py-3 px-3">Status Lifetime</th>
                        <th className="py-3 px-3">Kontrol Dosen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dashData.entitlements.map((ent) => (
                        <tr key={ent.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            {ent.npm}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {ent.fullName}
                          </td>
                          <td className="py-3 px-3 text-slate-600">{ent.className}</td>
                          <td className="py-3 px-3 font-mono text-sky-800 font-semibold">
                            {ent.activatedWithCodeDisplay
                              ? ent.activatedWithCodeDisplay.split('•')[0].trim()
                              : `Kode Unik #${ent.activatedWithCodeVersion}`}
                          </td>
                          <td className="py-3 px-3">
                            {ent.revoked ? (
                              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono font-bold">
                                DIKUNCI SEMENTARA
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                                LIFETIME AKTIF PERMANEN
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() =>
                                handleToggleStudentEntitlement(ent.npm, ent.revoked)
                              }
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold inline-flex items-center gap-1"
                            >
                              {ent.revoked ? (
                                <>
                                  <Unlock className="w-3.5 h-3.5 text-emerald-600" /> Buka Kunci NPM
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5 text-rose-600" /> Kunci Sementara
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MENU 6, 9, 10: QUESTION BANK, DETAILED EXPLANATIONS & CLASS ANALYTICS */}
            {(activeMenu === 'question_bank' ||
              activeMenu === 'explanations' ||
              activeMenu === 'analytics') && (
              <div className="space-y-4">
                <div className="bg-[#edf2f7] rounded-2xl border border-slate-300 p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900">
                    Bank Soal 50 Pilihan Ganda (A–E) ATLM, Kunci Jawaban, Pembahasan & Statistik Akurasi Kelas
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Menampilkan 10 Soal Teori Dasar (Bagian A), 15 Soal Gabungan CBC/Apusan/QC (Bagian B), 20 Soal Kasus Sangat Sulit lengkap Tabel Klinis (Bagian C), dan 5 Soal Hitungan MCV/MCH/MCHC (Bagian D).
                  </p>
                </div>

                {dashData.questionStats.map((q) => (
                  <div
                    key={q.questionNumber}
                    className="bg-[#edf2f7] rounded-2xl border border-slate-300 p-5 shadow-sm space-y-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-300">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        SOAL #{String(q.questionNumber).padStart(2, '0')} [BAGIAN {q.sectionCode}] — {q.topic}
                      </span>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                          Kunci: Opsi {q.correctOption}
                        </span>
                        <span className="px-2.5 py-1 rounded bg-sky-100 text-sky-800 font-bold border border-sky-300">
                          Akurasi Kelas: {q.accuracyPercent}%
                        </span>
                        <span className="text-slate-600">{q.pdfPageRef}</span>
                      </div>
                    </div>

                    {q.caseTable && (
                      <div className="rounded-xl bg-[#e2e8f0] border border-slate-300 p-3.5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-800">
                        <div>
                          <p className="font-mono font-bold text-sky-900 uppercase">Anamnesis & Fisik:</p>
                          <p className="mt-0.5">{q.caseTable.anamnesis}</p>
                          <p className="mt-1">{q.caseTable.physicalExam}</p>
                          <p className="mt-1 font-medium">Permintaan Dokter: {q.caseTable.doctorOrder}</p>
                        </div>
                        <div>
                          <p className="font-mono font-bold text-rose-900 uppercase">Hasil Pemeriksaan Lab:</p>
                          <p className="mt-0.5 font-mono">{q.caseTable.labResults}</p>
                          <p className="mt-1"><strong>Konteks Obat/Edukasi:</strong> {q.caseTable.medicationContext}</p>
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-slate-900 font-semibold">{q.questionText}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {(['A', 'B', 'C', 'D', 'E'] as const).map((k) => (
                        <div
                          key={k}
                          className={`p-2.5 rounded-lg border ${
                            k === 'E' ? 'md:col-span-2' : ''
                          } ${
                            k === q.correctOption
                              ? 'bg-emerald-100/90 border-emerald-400 font-semibold text-emerald-950'
                              : 'bg-[#e6edf5] border-slate-300 text-slate-700'
                          }`}
                        >
                          <span className="font-mono font-bold">{k}.</span> {q.options[k]}
                        </div>
                      ))}
                    </div>
                    {q.calculationSteps && (
                      <div className="p-3 rounded-lg bg-[#243b55] text-sky-200 font-mono text-xs">
                        {q.calculationSteps}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-lg bg-[#e2e8f0] border border-slate-300 text-slate-800">
                        <strong>1. Dasar Penalaran Lab:</strong> {q.scientificExplanation}
                      </div>
                      <div className="p-3 rounded-lg bg-[#e2e8f0] border border-slate-300 text-slate-800">
                        <strong>2. Prosedur & Keputusan ATLM:</strong> {q.atlmProcedureAndDecision}
                      </div>
                      <div className="p-3 rounded-lg bg-[#e2e8f0] border border-slate-300 text-slate-800">
                        <strong>3. Hubungan Terapi Dokter:</strong> {q.doctorClinicalExplanation}
                      </div>
                      <div className="p-3 rounded-lg bg-[#e2e8f0] border border-slate-300 text-slate-800">
                        <strong>4. Edukasi & Komunikasi:</strong> {q.patientEducation}
                      </div>
                    </div>
                    <p className="text-xs text-amber-950 bg-amber-100/70 p-3 rounded-lg border border-amber-300">
                      <strong>5. Mengapa Pilihan Lain Keliru:</strong> {q.whyOthersWrong}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* MENU 7: QUIZ & LIVE SESSION CONTROL */}
            {activeMenu === 'quiz_control' && (
              <div className="bg-[#edf2f7] rounded-2xl border border-slate-300 p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Kontrol Sesi Kuis Interaktif (Solo & Live Quiz Bersama Dosen — 50 Soal A–E)
                </h3>
                <div className="p-5 rounded-2xl bg-[#243b55] text-white flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono uppercase text-sky-300">
                      KODE SESI LIVE QUIZ KELAS AKTIF
                    </p>
                    <p className="text-3xl font-mono font-bold tracking-wider mt-1">
                      ATLM-HEMATO-50
                    </p>
                    <p className="text-xs text-slate-200 mt-1">
                      Bagikan kode sesi ini kepada mahasiswa ATLM untuk memulai Live Quiz 50 Soal secara serentak.
                    </p>
                  </div>
                  <div className="text-right font-mono text-xs text-emerald-300">
                    STATUS: AKTIF • 60 DETIK / SOAL
                  </div>
                </div>
              </div>
            )}

            {/* MENU 11: 3D LEADERBOARD */}
            {activeMenu === 'leaderboard' && (
              <Leaderboard3DPodium entries={dashData.leaderboard} isLecturerView={true} />
            )}

            {/* MENU 12: GLOSSARY MANAGEMENT */}
            {activeMenu === 'glossary_mgmt' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Tambah Istilah Glosarium Baru
                  </h3>
                  <form onSubmit={handleAddGlossary} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">
                        Nama Istilah Hematologi
                      </label>
                      <input
                        type="text"
                        required
                        value={newTerm}
                        onChange={(e) => setNewTerm(e.target.value)}
                        placeholder="Contoh: Poikilositosis"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">
                        Singkatan
                      </label>
                      <input
                        type="text"
                        value={newAbbr}
                        onChange={(e) => setNewAbbr(e.target.value)}
                        placeholder="Contoh: POI"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">
                        Kategori
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                      >
                        {GLOSSARY_CATEGORIES.filter((c) => c !== 'Semua Kategori').map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">
                        Definisi Ilmiah
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={newDef}
                        onChange={(e) => setNewDef(e.target.value)}
                        placeholder="Penjelasan medis lengkap..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                    >
                      + Tambahkan ke Glosarium
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 max-h-[600px] overflow-y-auto">
                  <h3 className="text-base font-bold text-slate-900">
                    Daftar Istilah Glosarium Aktif ({glossaryList.length} Istilah)
                  </h3>
                  {glossaryList.map((g) => (
                    <div key={g.id} className="p-3.5 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">
                          {g.term} {g.abbreviation ? `(${g.abbreviation})` : ''}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 font-mono">
                          {g.category} • Hal. {g.pdfPageRef}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{g.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MENU 13: LEARNING MATERIAL MANAGEMENT (35 MODULES) */}
            {activeMenu === 'material_mgmt' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Manajemen 35 Modul Pembelajaran & 47 Halaman Gambar Asli PDF ANFIS DARAH
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {HEMATOLOGY_MODULES.map((m) => (
                    <div
                      key={m.moduleNumber}
                      className="p-4 rounded-xl border border-slate-200 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <span className="text-[11px] font-mono font-bold text-sky-700">
                          MODUL #{m.moduleNumber} • PDF HAL. {m.pdfPages.join(', ')}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">{m.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{m.summary}</p>
                      </div>
                      <img
                        src={`/assets/pdf/page_${String(m.primaryImagePage).padStart(2, '0')}.jpg`}
                        alt={m.title}
                        className="w-full h-32 object-cover rounded-lg border border-slate-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MENU 14: EXPORT CSV & PRINT FORMAL REPORT */}
            {activeMenu === 'export_scores' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/ikes_rajawali_logo.png"
                      alt="Logo IKES Rajawali"
                      className="w-14 h-14 object-contain"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        LAPORAN RESMI REKAPITULASI NILAI HEMATOLOGI MAHASISWA ATLM
                      </h3>
                      <p className="text-xs text-slate-600">
                        Institut Kesehatan Rajawali Bandung • Dosen Pengampu:{' '}
                        <strong>dr. Juwita Ninda Suherman, M.Kes</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 no-print">
                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" /> Ekspor CSV / Excel
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" /> Cetak Laporan Resmi
                    </button>
                  </div>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-mono uppercase">
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">NPM</th>
                      <th className="py-2.5 px-3">Nama Mahasiswa</th>
                      <th className="py-2.5 px-3">Kelas</th>
                      <th className="py-2.5 px-3">Skor</th>
                      <th className="py-2.5 px-3">Benar</th>
                      <th className="py-2.5 px-3">Akurasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dashData.leaderboard.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2.5 px-3 font-mono font-bold">#{r.rank}</td>
                        <td className="py-2.5 px-3 font-mono">{r.rawNpm || r.npm}</td>
                        <td className="py-2.5 px-3 font-semibold">{r.fullName}</td>
                        <td className="py-2.5 px-3">{r.className}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">{r.score}</td>
                        <td className="py-2.5 px-3 font-mono">{r.correctCount}/50</td>
                        <td className="py-2.5 px-3 font-mono font-bold">{r.accuracyPercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* MENU 15: LECTURER CREDENTIAL SETTINGS */}
            {activeMenu === 'settings' && (
              <div className="max-w-lg bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  Pengaturan Kredensial Pribadi Dosen Pengampu
                </h3>
                <p className="text-xs text-slate-600">
                  Anda dapat memperbarui username dan password/kode akses pribadi Dosen kapan saja.
                  Validasi dilakukan secara kriptografis (SHA-256) di server dan dilindungi oleh
                  Cloudflare Worker Secret.
                </p>
                <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">
                      Username Dosen
                    </label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">
                      Password / Kode Rahasia Baru Dosen
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                  >
                    Simpan Kredensial Dosen
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
