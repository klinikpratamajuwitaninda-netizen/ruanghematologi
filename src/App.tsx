/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from './lib/firebase';
import { HEMATOLOGY_MODULES, LearningModuleData } from './data/hematologyData';
import { GLOSSARY_TERMS, GLOSSARY_CATEGORIES, GlossaryItem } from './data/glossaryData';
import { LAB_EQUIPMENT_3D_ITEMS } from './data/clinicalSimulationData';
import { Hospital3DWorld } from './components/Hospital3DWorld';
import { Leaderboard3DPodium, LeaderboardEntry } from './components/Leaderboard3DPodium';
import {
  QuizizzEngine,
  QuizSummaryResult,
  DetailedReviewItem,
} from './components/QuizizzEngine';
import { DigitalCalculatorView } from './components/DigitalCalculatorView';
import { ClinicalSimulationView } from './components/ClinicalSimulationView';
import { LecturerDashboardView } from './components/LecturerDashboardView';
import { soundManager } from './utils/soundManager';
import { PagesPresentationView } from './components/PagesPresentationView';
import {
  CopyrightFooter,
  CopyrightPolicyPage,
  SlideCopyrightBar,
} from './components/CopyrightProtection';
import {
  Home,
  Compass,
  Microscope,
  BookOpen,
  Presentation,
  Droplets,
  Stethoscope,
  Award,
  Calculator,
  BookA,
  Trophy,
  BarChart2,
  ShieldCheck,
  Shield,
  UserCog,
  Volume2,
  VolumeX,
  Search,
  ZoomIn,
  CheckCircle2,
  Lock,
  Sparkles,
  GraduationCap,
  Play,
  Star,
  KeyRound,
  X,
  ChevronRight,
  Building2,
  Download,
  FileText,
} from 'lucide-react';

type StudentMenuId =
  | 'home'
  | 'explore_hospital'
  | 'virtual_lab'
  | 'learning_materials'
  | 'pages_presentation'
  | 'blood_cell_explorer'
  | 'clinical_simulation'
  | 'hematology_quiz'
  | 'digital_calculator'
  | 'medical_glossary'
  | 'leaderboard'
  | 'my_score'
  | 'achievements'
  | 'avatar_settings'
  | 'audio_settings'
  | 'copyright_policy';

interface QuizHistoryEntry {
  id: number;
  attemptUuid: string;
  sessionCode: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracyPercent: number;
  score: number;
  durationSeconds: number;
  completedAt: string;
}

interface StudentSessionData {
  npm: string;
  fullName: string;
  className: string;
  avatarGender: 'male_atlm' | 'female_atlm';
  xp: number;
  level: number;
  highestScore: number;
  bestAccuracy: number;
  quizCount?: number;
  isLifetimeActive?: boolean;
  activatedWithVersion: number;
  activatedWithCodeDisplay?: string;
  activatedCode?: string;
  activatedAt?: string;
  labCoatColor?: string;
  scrubColor?: string;
  hairColor?: string;
  skinTone?: string;
  completedModules?: number[];
  quizHistory?: QuizHistoryEntry[];
}

const STUDENT_14_MENUS: { id: StudentMenuId; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home & Dashboard', icon: Home },
  { id: 'explore_hospital', label: 'Explore Hospital 3D', icon: Compass },
  { id: 'virtual_lab', label: 'Virtual Hematology Lab', icon: Microscope },
  { id: 'pages_presentation', label: 'Pages (Presentasi Slide & Audio)', icon: Presentation },
  { id: 'learning_materials', label: 'Learning Materials (35 Modul)', icon: BookOpen },
  { id: 'blood_cell_explorer', label: 'Blood Cell Explorer', icon: Droplets },
  { id: 'clinical_simulation', label: 'Clinical Case Simulation', icon: Stethoscope },
  { id: 'hematology_quiz', label: 'Hematology Quiz (50 A–E)', icon: Play },
  { id: 'digital_calculator', label: 'Digital Calculator', icon: Calculator },
  { id: 'medical_glossary', label: 'Medical Glossary', icon: BookA },
  { id: 'leaderboard', label: 'Leaderboard 3D', icon: Trophy },
  { id: 'my_score', label: 'My Score & Review', icon: BarChart2 },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'avatar_settings', label: 'Avatar Settings (ATLM)', icon: UserCog },
  { id: 'audio_settings', label: 'Audio Settings', icon: Volume2 },
  { id: 'copyright_policy', label: 'Kebijakan Hak Cipta', icon: Shield },
];

const BLOOD_CELL_ATLAS = [
  {
    name: 'Eritrosit (Red Blood Cell)',
    normalRange: 'Pria: 4,7–6,1 juta/µL | Wanita: 4,2–5,4 juta/µL',
    size: 'Diameter 7–8 µm, Tebal tepi 2 µm, Tengah 1 µm',
    lifespan: '120 Hari di sirkulasi darah',
    morphology: 'Cakram bikonkaf merah muda-oranye dengan central pallor ≤ 1/3 diameter sel, tanpa inti dan tanpa mitokondria.',
    function: 'Transpor O2 dari paru ke jaringan dan CO2 kembali ke paru melalui ~280 juta molekul Hemoglobin per sel.',
    pdfPage: 13,
    pdfImage: '/assets/pdf/page_13.jpg',
  },
  {
    name: 'Neutrofil (Segmen & Batang)',
    normalRange: '60 – 70% dari total Leukosit',
    size: 'Diameter 10–12 µm (Granulosit)',
    lifespan: 'Beberapa jam di darah – Beberapa hari di jaringan',
    morphology: 'Inti berlobus 2–5 dihubungkan benang kromatin tipis; sitoplasma bergranula halus ungu muda netral.',
    function: 'Fagositosis lini pertama terhadap infeksi bakteri piogenik dan jamur akut (kemotaksis, diapedesis, lisozim, defensin).',
    pdfPage: 27,
    pdfImage: '/assets/pdf/page_27.jpg',
  },
  {
    name: 'Eosinofil',
    normalRange: '2 – 4% dari total Leukosit',
    size: 'Diameter 10–12 µm (Granulosit)',
    lifespan: '8–12 hari di jaringan',
    morphology: 'Inti umumnya berlobus 2 (kacamata); sitoplasma penuh granula bulat besar berwarna merah-oranye terang (eosinofilik).',
    function: 'Meredam reaksi hipersensitivitas/alergi (histaminase) dan menghancurkan parasit cacing (helmintiasis).',
    pdfPage: 27,
    pdfImage: '/assets/pdf/page_27.jpg',
  },
  {
    name: 'Basofil',
    normalRange: '0,5 – 1% dari total Leukosit',
    size: 'Diameter 8–10 µm (Granulosit)',
    lifespan: 'Beberapa jam hingga beberapa hari',
    morphology: 'Inti berlobus 2 tidak teratur yang sering tertutup granula kasar bulat besar berwarna biru-ungu gelap.',
    function: 'Melepaskan histamin, heparin, dan serotonin pada reaksi alergi/anafilaksis dan inflamasi.',
    pdfPage: 27,
    pdfImage: '/assets/pdf/page_27.jpg',
  },
  {
    name: 'Limfosit (Sel B, Sel T CD4+/CD8+, Sel NK)',
    normalRange: '20 – 25% dari total Leukosit',
    size: 'Limfosit kecil 6–9 µm | Limfosit besar 10–14 µm (Agranulosit)',
    lifespan: 'Beberapa hari hingga bertahun-tahun (sel memori)',
    morphology: 'Inti bulat padat berwarna ungu tua mendominasi sel dengan cincin sitoplasma biru langit tipis.',
    function: 'Imunitas adaptif spesifik: Sel B memproduksi antibodi (sel plasma), Sel T memediasi imunitas seluler, Sel NK menghancurkan sel terinfeksi virus/tumor.',
    pdfPage: 28,
    pdfImage: '/assets/pdf/page_28.jpg',
  },
  {
    name: 'Monosit & Makrofag',
    normalRange: '3 – 8% dari total Leukosit',
    size: 'Diameter 12–20 µm (Leukosit Terbesar / Agranulosit)',
    lifespan: 'Bermigrasi ke jaringan menjadi makrofag selama berbulan-bulan',
    morphology: 'Inti berbentuk ginjal atau tapal kuda (horseshoe); sitoplasma biru keabu-abuan berbusa (foamy).',
    function: 'Fagositosis skala besar terhadap mikroba kronis, sel mati, serta daur ulang zat besi dari eritrosit tua berusia 120 hari.',
    pdfPage: 28,
    pdfImage: '/assets/pdf/page_28.jpg',
  },
  {
    name: 'Trombosit (Keping Darah / Platelet)',
    normalRange: '150.000 – 400.000 /µL (atau 150.000 – 450.000 /µL)',
    size: 'Diameter 2–4 µm (Fragmen Megakariosit)',
    lifespan: '5 – 9 Hari',
    morphology: 'Fragmen sitoplasma kecil berbentuk cakram tanpa inti sel dengan granula alfa dan dense granules.',
    function: 'Membentuk sumbat trombosit (adhesi, pelepasan ADP/TXA2/serotonin, agregasi) dan mendukung kaskade koagulasi fibrin.',
    pdfPage: 32,
    pdfImage: '/assets/pdf/page_32.jpg',
  },
];

export default function App() {
  const [activeMenu, setActiveMenu] = useState<StudentMenuId>('home');
  const [isLecturerLoggedIn, setIsLecturerLoggedIn] = useState<boolean>(false);
  const [lecturerName, setLecturerName] = useState<string>('dr. Juwita Ninda Suherman, M.Kes');

  // Student Lifetime Session State (Open Access: Tidak butuh kode aktivasi / login)
  const [studentSession, setStudentSession] = useState<StudentSessionData>({
    npm: 'ATLM-2026',
    fullName: 'Mahasiswa ATLM (Akses Terbuka)',
    className: 'ATLM Reguler - IKES Rajawali',
    avatarGender: 'female_atlm',
    xp: 150,
    level: 1,
    highestScore: 0,
    bestAccuracy: 0,
    quizCount: 0,
    isLifetimeActive: true,
    activatedWithVersion: 1,
    activatedWithCodeDisplay: 'Akses Terbuka Bebas Kode Aktivasi',
    labCoatColor: '#ffffff',
    scrubColor: '#0284c7',
    hairColor: '#1e293b',
    skinTone: '#f1c27d',
    completedModules: [],
    quizHistory: [],
  });
  const [isStudentActivated, setIsStudentActivated] = useState<boolean>(true);

  // Modals for Student Activation, Login & Account Recovery, and Lecturer Login
  const [showAuthModal, setShowAuthModal] = useState<'student' | 'lecturer' | null>(null);
  const [studentAuthTab, setStudentAuthTab] = useState<'login' | 'activate' | 'recover'>('login');
  const [formFullName, setFormFullName] = useState<string>('');
  const [formNpm, setFormNpm] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formClass, setFormClass] = useState<string>('ATLM Reguler A - IKES Rajawali');
  const [formAccessCode, setFormAccessCode] = useState<string>('');
  const [formGender, setFormGender] = useState<'male_atlm' | 'female_atlm'>('female_atlm');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState<boolean>(false);
  const [npmLookupInfo, setNpmLookupInfo] = useState<{
    checkedNpm: string;
    exists: boolean;
    studentName?: string;
    className?: string;
    accountStatus?: string;
    codeStatus?: string;
    activatedCode?: string;
    hasPassword?: boolean;
    message?: string;
  } | null>(null);

  // Lecturer Login Form (No hardcoded secrets in frontend)
  const [lecturerBootstrapCode, setLecturerBootstrapCode] = useState<string>('');
  const [lecturerUsername, setLecturerUsername] = useState<string>('dr.juwita');
  const [lecturerPassword, setLecturerPassword] = useState<string>('');
  const [lecturerTab, setLecturerTab] = useState<'bootstrap' | 'credentials'>('bootstrap');

  // Learning Modules State
  const [selectedModule, setSelectedModule] = useState<LearningModuleData>(HEMATOLOGY_MODULES[0]);
  const [moduleSearch, setModuleSearch] = useState<string>('');
  const [moduleCategoryFilter, setModuleCategoryFilter] = useState<string>('Semua');
  const [zoomedPdfImage, setZoomedPdfImage] = useState<string | null>(null);

  // Glossary State
  const [glossaryItems, setGlossaryItems] = useState<GlossaryItem[]>(GLOSSARY_TERMS);
  const [glossarySearch, setGlossarySearch] = useState<string>('');
  const [glossaryCategory, setGlossaryCategory] = useState<string>('Semua Kategori');
  const [favoriteTerms, setFavoriteTerms] = useState<number[]>([]);
  const [selectedGlossaryDetail, setSelectedGlossaryDetail] = useState<GlossaryItem | null>(null);

  // Leaderboard & Quiz Score History State
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [lastQuizSummary, setLastQuizSummary] = useState<QuizSummaryResult | null>(null);
  const [lastQuizReview, setLastQuizReview] = useState<DetailedReviewItem[]>([]);

  // Audio Settings State
  const [soundSettings, setSoundSettings] = useState(soundManager.getSettings());

  const getStoredCertForNpm = (rawNpm: string): string | undefined => {
    try {
      const clean = String(rawNpm || '')
        .replace(/[\s./]+/g, '')
        .trim()
        .toUpperCase();
      if (!clean) return undefined;
      const mapStr = localStorage.getItem('hw_activated_certs_v1');
      if (!mapStr) return undefined;
      const mapObj = JSON.parse(mapStr);
      return mapObj[clean] || undefined;
    } catch {
      return undefined;
    }
  };

  const saveCertForNpm = (rawNpm: string, cert?: string) => {
    if (!rawNpm || !cert) return;
    try {
      const clean = String(rawNpm)
        .replace(/[\s./]+/g, '')
        .trim()
        .toUpperCase();
      const mapStr = localStorage.getItem('hw_activated_certs_v1');
      const mapObj = mapStr ? JSON.parse(mapStr) : {};
      mapObj[clean] = cert;
      localStorage.setItem('hw_activated_certs_v1', JSON.stringify(mapObj));
    } catch {
      // Ignore storage errors
    }
  };

  const applyStudentPayload = (student: any) => {
    if (student?.npm && student?.activationCert) {
      saveCertForNpm(student.npm, student.activationCert);
    }
    setStudentSession((prev) => ({
      ...prev,
      ...student,
      labCoatColor: student.avatar?.labCoatColor || prev.labCoatColor || '#ffffff',
      scrubColor: student.avatar?.scrubColor || prev.scrubColor || '#0284c7',
      hairColor: student.avatar?.hairColor || prev.hairColor || '#1e293b',
      skinTone: student.avatar?.skinTone || prev.skinTone || '#f1c27d',
      completedModules: Array.isArray(student.completedModules) ? student.completedModules : [],
      quizHistory: Array.isArray(student.quizHistory) ? student.quizHistory : [],
    }));
    if (student.latestSummary && Array.isArray(student.latestReview)) {
      setLastQuizSummary(student.latestSummary);
      setLastQuizReview(student.latestReview);
    }
    setIsStudentActivated(true);
  };

  // Restore session from secure HttpOnly cookie via /api/auth/me on mount
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.lecturer) {
          setLecturerName(d.lecturer.fullName || 'dr. Juwita Ninda Suherman, M.Kes');
          setIsLecturerLoggedIn(true);
        }
        if (d.student) {
          applyStudentPayload(d.student);
        }
      })
      .catch(() => {});

    fetchLeaderboard();
    fetch('/api/glossary', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.terms) setGlossaryItems(d.terms);
      })
      .catch(() => {});
  }, []);

  const fetchLeaderboard = () => {
    fetch('/api/leaderboard', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.leaderboard) setLeaderboardEntries(d.leaderboard);
      })
      .catch(() => {});
  };

  const handleNavigateMenu = (menuId: StudentMenuId) => {
    soundManager.playNavigation();
    setActiveMenu(menuId);
  };

  const handleCheckStudentNpm = async (npmInput?: string) => {
    const targetNpm = String(npmInput ?? formNpm).trim();
    if (!targetNpm || targetNpm.length < 3) {
      setNpmLookupInfo(null);
      return;
    }
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/student/check-npm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          npm: targetNpm,
          activationCert: getStoredCertForNpm(targetNpm),
        }),
      });
      const data = await res.json();
      if (res.ok && data.exists) {
        setNpmLookupInfo({
          checkedNpm: data.npm || targetNpm,
          exists: true,
          studentName: data.studentName,
          className: data.className,
          accountStatus: data.accountStatus || 'Sudah Teraktivasi',
          codeStatus: data.codeStatus || 'Sudah Digunakan',
          activatedCode: data.activatedCode,
          hasPassword: data.hasPassword,
          message: data.message || 'Akun berhasil ditemukan. Silakan melanjutkan proses login.',
        });
      } else {
        setNpmLookupInfo({
          checkedNpm: targetNpm,
          exists: false,
          accountStatus: data.accountStatus || 'Belum Terdaftar',
          message:
            data.error || 'NPM belum memiliki akun. Silakan lakukan aktivasi terlebih dahulu.',
        });
      }
    } catch {
      // Ignore background check error
    }
  };

  const handleStudentActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthSubmitting) return;
    setAuthError(null);
    setAuthSuccess(null);
    setIsAuthSubmitting(true);
    soundManager.playClick();

    try {
      const cleanNpmStr = String(formNpm).trim();
      const storedCert = getStoredCertForNpm(cleanNpmStr);
      const endpoint =
        studentAuthTab === 'login'
          ? '/api/student-login'
          : studentAuthTab === 'recover'
          ? '/api/auth/student/recover'
          : '/api/auth/student/activate';

      const payload =
        studentAuthTab === 'login'
          ? {
              mode: 'login',
              npm: cleanNpmStr,
              password: formPassword.trim() || undefined,
              activationCert: storedCert,
            }
          : studentAuthTab === 'recover'
          ? {
              mode: 'recover',
              npm: cleanNpmStr,
              fullName: formFullName.trim() || undefined,
              password: formPassword.trim() || undefined,
              activationCert: storedCert,
            }
          : {
              mode: 'activate',
              fullName: formFullName.trim(),
              npm: cleanNpmStr,
              password: formPassword.trim() || undefined,
              className: formClass.trim(),
              accessCode: formAccessCode.trim(),
              avatarGender: formGender,
              activationCert: storedCert,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        soundManager.playWrong();
        setAuthError(data.error || 'Terjadi gangguan koneksi. Silakan coba kembali.');
        return;
      }

      soundManager.playLevelUp();
      applyStudentPayload(data.student);
      setFormAccessCode('');
      setFormPassword('');
      setNpmLookupInfo(null);
      setAuthSuccess(
        data.message || 'Akun berhasil ditemukan. Sesi Akses Seumur Hidup Mahasiswa Aktif!'
      );
      setTimeout(() => {
        setShowAuthModal(null);
        setAuthSuccess(null);
      }, 650);
    } catch {
      setAuthError('Terjadi gangguan koneksi. Silakan coba kembali.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleStudentLogout = async () => {
    soundManager.playClick();
    await fetch('/api/student-logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
    setIsStudentActivated(false);
    setLastQuizSummary(null);
    setLastQuizReview([]);
    setStudentSession({
      npm: '',
      fullName: 'Pengunjung (Belum Login)',
      className: 'ATLM Reguler A - IKES Rajawali',
      avatarGender: 'female_atlm',
      xp: 100,
      level: 1,
      highestScore: 0,
      bestAccuracy: 0,
      quizCount: 0,
      isLifetimeActive: false,
      activatedWithVersion: 1,
      activatedWithCodeDisplay: '',
      labCoatColor: '#ffffff',
      scrubColor: '#0284c7',
      hairColor: '#1e293b',
      skinTone: '#f1c27d',
      completedModules: [],
      quizHistory: [],
    });
    setActiveMenu('home');
    setShowAuthModal(null);
  };

  const handleLecturerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthSubmitting) return;
    setAuthError(null);
    setIsAuthSubmitting(true);
    soundManager.playClick();

    try {
      const payload =
        lecturerTab === 'bootstrap'
          ? { accessCode: lecturerBootstrapCode.trim() }
          : { username: lecturerUsername.trim(), password: lecturerPassword.trim() };

      const res = await fetch('/api/teacher-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        soundManager.playWrong();
        setAuthError(data.error || 'Kode akses atau kredensial dosen tidak valid.');
        return;
      }

      soundManager.playVictory();
      setLecturerBootstrapCode('');
      setLecturerPassword('');
      setLecturerName(data.lecturer?.fullName || 'dr. Juwita Ninda Suherman, M.Kes');
      setIsLecturerLoggedIn(true);
      setShowAuthModal(null);
    } catch {
      setAuthError('Gagal memproses login dosen.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLecturerLogout = async () => {
    soundManager.playClick();
    await fetch('/api/teacher-logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
    setIsLecturerLoggedIn(false);
  };

  const handleLecturerGoogleLogin = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      if (user.email !== 'klinikpratamajuwitaninda@gmail.com' && user.email !== 'juwita.ninda@ikesrajawali.ac.id') {
        setAuthError('Email Google ini tidak terdaftar sebagai Dosen Pengampu.');
        return;
      }
      setAuthError('Silakan masukkan Kode Akses Rahasia Dosen untuk memverifikasi sesi server.');
    } catch (error) {
      console.error('Google Sign-In error:', error);
      setAuthError('Login Google dibatalkan. Silakan masukkan Kode Akses Dosen.');
    }
  };

  const handleMarkModuleComplete = async (modNum: number) => {
    soundManager.playCorrect();
    const currentList = studentSession.completedModules || [];
    if (!currentList.includes(modNum)) {
      const updated = [...currentList, modNum];
      setStudentSession((prev) => ({
        ...prev,
        completedModules: updated,
        xp: prev.xp + 30,
      }));
      await fetch('/api/student/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ npm: studentSession.npm, moduleNumber: modNum }),
      }).catch(() => {});
    }
  };

  const handleSaveAvatarSettings = async () => {
    soundManager.playLevelUp();
    await fetch('/api/student/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        npm: studentSession.npm,
        gender: studentSession.avatarGender,
        labCoatColor: studentSession.labCoatColor,
        scrubColor: studentSession.scrubColor,
        hairColor: studentSession.hairColor,
        skinTone: studentSession.skinTone,
      }),
    }).catch(() => {});
    fetchLeaderboard();
  };

  // If Lecturer Mode is active, render the 15-Menu Lecturer Dashboard
  if (isLecturerLoggedIn) {
    return (
      <LecturerDashboardView
        lecturerName={lecturerName}
        onLogout={handleLecturerLogout}
      />
    );
  }

  const filteredModules = HEMATOLOGY_MODULES.filter((m) => {
    const matchCat = moduleCategoryFilter === 'Semua' || m.category === moduleCategoryFilter;
    const matchText =
      m.title.toLowerCase().includes(moduleSearch.toLowerCase()) ||
      m.summary.toLowerCase().includes(moduleSearch.toLowerCase());
    return matchCat && matchText;
  });

  const filteredGlossary = glossaryItems.filter((g) => {
    const matchCat = glossaryCategory === 'Semua Kategori' || g.category === glossaryCategory;
    const matchText =
      g.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      (g.abbreviation || '').toLowerCase().includes(glossarySearch.toLowerCase()) ||
      g.definition.toLowerCase().includes(glossarySearch.toLowerCase());
    return matchCat && matchText;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Academic Navigation Bar with IKES Rajawali Logo & dr. Juwita Ninda Suherman, M.Kes */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md no-print">
        <div className="max-w-[1440px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Brand & IKES Rajawali Logo */}
          <div
            onClick={() => setActiveMenu('home')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img
              src="/assets/ikes_rajawali_logo.png"
              alt="Logo Institut Kesehatan Rajawali Bandung"
              className="w-11 h-11 rounded-full bg-white p-0.5 object-contain shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400">
                  INSTITUT KESEHATAN RAJAWALI BANDUNG
                </span>
              </div>
              <h1 className="text-sm md:text-base font-bold tracking-tight text-white leading-tight">
                HEMATOLOGY WORLD —{' '}
                <span className="text-sky-300 font-semibold">
                  dr. Juwita Ninda Suherman, M.Kes
                </span>
              </h1>
            </div>
          </div>

          {/* Right Open Access Status & Lecturer Portal Trigger */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline font-sans font-semibold text-white">
                  Akses Terbuka Mahasiswa ATLM
                </span>
                <span className="text-[10px] bg-emerald-950/80 px-1.5 py-0.5 rounded text-emerald-300 font-bold">
                  Bebas Kode
                </span>
              </span>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                setAuthError(null);
                setShowAuthModal('lecturer');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Portal Dosen</span>
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable 14 Student Menus Bar */}
        <div className="bg-slate-950/90 border-t border-slate-800/80">
          <div className="max-w-[1440px] mx-auto px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {STUDENT_14_MENUS.map((m) => {
              const Icon = m.icon;
              const isActive = activeMenu === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleNavigateMenu(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 transition ${
                    isActive
                      ? 'bg-sky-600 text-white font-semibold shadow'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main
        className={
          activeMenu === 'explore_hospital'
            ? 'flex-1 w-full'
            : 'flex-1 max-w-[1440px] w-full mx-auto px-4 py-6 md:py-8'
        }
      >
        {/* ===================================================================
            MENU 1: HOME — CLINICAL & ACADEMIC PROFILE OF DR. JUWITA NINDA SUHERMAN, M.KES & IKES RAJAWALI LOGO
           =================================================================== */}
        {activeMenu === 'home' && (
          <div className="space-y-8">
            {/* Hero Clinical & Academic Profile Card */}
            <div className="rounded-3xl bg-gradient-to-br from-[#233954] via-[#2b4666] to-[#23435e] border border-[#3d5c80] p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                {/* Left Column: Institution Logo, Author Profile & Headline */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/12 backdrop-blur-md border border-white/20">
                    <img
                      src="/assets/ikes_rajawali_logo.png"
                      alt="Logo Institut Kesehatan Rajawali"
                      className="w-12 h-12 rounded-full bg-white p-1 object-contain"
                    />
                    <div className="text-left">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-sky-200 font-bold">
                        INSTITUT KESEHATAN RAJAWALI • BANDUNG, INDONESIA
                      </p>
                      <p className="text-xs text-slate-100 font-medium">
                        Fakultas Kesehatan • Program Studi Teknologi Laboratorium Medik (ATLM)
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
                      ATLM MEDICAL ACADEMY & CLINICAL SIMULATION PLATFORM
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-1 leading-tight">
                      HEMATOLOGY WORLD
                    </h2>
                    <p className="text-lg md:text-xl text-sky-200 font-medium mt-1">
                      “Explore Blood. Analyze Results. Become a Hematology Expert.”
                    </p>
                  </div>

                  <p className="text-sm md:text-base text-slate-100 leading-relaxed">
                    Platform pembelajaran 3D Rumah Sakit & Laboratorium Hematologi untuk Mahasiswa{' '}
                    <strong>ATLM</strong>, dilengkapi Kalkulator Klinis Indeks Eritrosit (MCV, MCH,
                    MCHC), Simulasi Alur Diagnostik ATLM-Dokter, serta Evaluasi Kompetensi{' '}
                    <strong>50 Soal Pilihan Ganda (A–E)</strong> (10 Teori Dasar, 15 Gabungan CBC &
                    QC, 20 Kasus Sangat Sulit lengkap Tabel Klinis, dan 5 Hitungan Indeks) karya{' '}
                    <strong>dr. Juwita Ninda Suherman, M.Kes</strong>.
                  </p>

                  {/* Primary Action CTA Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => {
                        soundManager.playDoor();
                        handleNavigateMenu('explore_hospital');
                      }}
                      className="px-5 py-3 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-md transition"
                    >
                      <Compass className="w-4 h-4" /> Masuk Dunia 3D Rumah Sakit & Lab
                    </button>
                    <button
                      onClick={() => {
                        soundManager.playQuizStart();
                        handleNavigateMenu('hematology_quiz');
                      }}
                      className="px-5 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-md transition"
                    >
                      <Play className="w-4 h-4 fill-current" /> Mulai Ujian 50 Soal A–E (ATLM)
                    </button>
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        handleNavigateMenu('pages_presentation');
                      }}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg transition"
                    >
                      <Presentation className="w-4 h-4" /> Buka Pages (Slide & Audio Narator)
                    </button>
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        handleNavigateMenu('learning_materials');
                      }}
                      className="px-5 py-3 rounded-xl bg-[#345275] hover:bg-[#3f628a] border border-sky-300/30 text-white font-semibold text-sm flex items-center gap-2 transition"
                    >
                      <BookOpen className="w-4 h-4 text-sky-300" /> Baca 35 Modul & Slide PDF Asli
                    </button>
                  </div>
                </div>

                {/* Right Column: Official Clinical & Academic Profile Card of dr. Juwita Ninda Suherman, M.Kes */}
                <div className="lg:col-span-5">
                  <div className="bg-[#edf2f7] text-slate-900 rounded-2xl p-6 shadow-xl border-2 border-sky-300/60 space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b border-slate-300">
                      <img
                        src="/assets/ikes_rajawali_logo.png"
                        alt="Logo Resmi Institut Kesehatan Rajawali"
                        className="w-20 h-20 object-contain shrink-0 rounded-xl bg-white p-1.5 border border-slate-300"
                      />
                      <div>
                        <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-mono text-[11px] font-bold uppercase">
                          PROFIL KLINIS & AKADEMIK PENULIS
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 mt-1">
                          dr. Juwita Ninda Suherman, M.Kes
                        </h3>
                        <p className="text-xs font-semibold text-sky-700">
                          Dosen Pengampu & Konsultan Pendidikan Hematologi Medik
                        </p>
                        <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          Institut Kesehatan Rajawali (IKES Rajawali) Bandung
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                      <p>
                        <strong>Bidang Keahlian:</strong> Anatomi Fisiologi Sistem Hematologi,
                        Diagnostik Laboratorium Klinik (CBC & Indeks Eritrosit MCV, MCH, MCHC),
                        Morfologi Sel Darah Tepi, Hemostasis, dan Imunohematologi Golongan Darah
                        ABO/Rhesus.
                      </p>
                      <p>
                        <strong>Dedikasi Akademik:</strong> Mengembangkan kurikulum interaktif
                        berbasis simulasi klinis 3D untuk mencetak lulusan{' '}
                        <strong>Ahli Teknologi Laboratorium Medik (ATLM)</strong> Institut Kesehatan
                        Rajawali yang presisi di laboratorium dan unggul dalam kolaborasi klinis.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-300 text-center font-mono">
                      <div className="p-2 rounded-lg bg-[#e2e8f0] border border-slate-300">
                        <p className="text-base font-bold text-sky-700">47 Hal</p>
                        <p className="text-[10px] text-slate-600">Slide PDF Asli</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[#e2e8f0] border border-slate-300">
                        <p className="text-base font-bold text-emerald-700">35 Modul</p>
                        <p className="text-[10px] text-slate-600">Kurikulum ATLM</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[#e2e8f0] border border-slate-300">
                        <p className="text-base font-bold text-amber-700">50 Soal</p>
                        <p className="text-[10px] text-slate-600">Pilihan A–E</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Dashboard Status Card */}
            {isStudentActivated ? (
              <div className="bg-white rounded-2xl border-2 border-emerald-300 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold uppercase">
                        AKUN MAHASISWA AKTIF SEUMUR HIDUP
                      </span>
                      {studentSession.activatedCode && (
                        <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-mono text-[11px] font-bold">
                          Kode Terikat: {studentSession.activatedCode}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {studentSession.fullName} —{' '}
                      <span className="font-mono text-sky-700">NPM: {studentSession.npm}</span> (
                      {studentSession.className})
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Skor Tertinggi: <strong>{studentSession.highestScore}</strong> • Akurasi
                      Terbaik: <strong>{studentSession.bestAccuracy}%</strong> • Modul Selesai:{' '}
                      <strong>{(studentSession.completedModules || []).length}/35</strong> • Riwayat
                      Kuis: <strong>{(studentSession.quizHistory || []).length} percobaan</strong>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleNavigateMenu('my_score')}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition"
                  >
                    Dashboard & Riwayat Nilai
                  </button>
                  <button
                    onClick={handleStudentLogout}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition"
                  >
                    Logout Sesi
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-amber-300 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-mono text-[11px] font-bold uppercase">
                    STATUS SESI: BELUM LOGIN MAHASISWA
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Masuk atau Aktifkan Kode Akses Unik Mahasiswa ATLM
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Mahasiswa yang sudah pernah mengaktifkan akun cukup memasukkan NPM pada tab{' '}
                    <strong>Login Mahasiswa Aktif</strong> tanpa perlu mengulang aktivasi.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setStudentAuthTab('login');
                      setAuthError(null);
                      setShowAuthModal('student');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition"
                  >
                    Login Mahasiswa Aktif
                  </button>
                  <button
                    onClick={() => {
                      setStudentAuthTab('activate');
                      setAuthError(null);
                      setShowAuthModal('student');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                  >
                    Aktivasi Kode Baru
                  </button>
                </div>
              </div>
            )}

            {/* Quick Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div
                onClick={() => handleNavigateMenu('digital_calculator')}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-3">
                    Kalkulator Digital MCV, MCH & MCHC
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Substitusi rumus langkah demi langkah, validasi Rule of Three, dan deteksi
                    artefak MCHC &gt; 36 g/dL.
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold text-sky-700 flex items-center gap-1">
                  Buka Kalkulator <ChevronRight className="w-4 h-4" />
                </span>
              </div>

              <div
                onClick={() => handleNavigateMenu('clinical_simulation')}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-3">
                    Simulasi Klinis 14 Tahap (ATLM & Dokter)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Alur lengkap dari penerimaan tabung K2EDTA, analisis CBC, evaluasi SADT, hingga
                    edukasi pasien dan terapi dokter.
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  Mulai Simulasi Klinis <ChevronRight className="w-4 h-4" />
                </span>
              </div>

              <div
                onClick={() => handleNavigateMenu('medical_glossary')}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <BookA className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-3">
                    Glosarium Medis & Hematologi (8 Kategori)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Kamus istilah ilmiah hematologi lengkap dengan singkatan, fungsi fisiologis,
                    contoh klinis, dan halaman PDF.
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold text-indigo-700 flex items-center gap-1">
                  Jelajahi Glosarium <ChevronRight className="w-4 h-4" />
                </span>
              </div>

              <div
                onClick={() => handleNavigateMenu('leaderboard')}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-3">
                    Podium 3D Hematology World Champions
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Lihat Top 3 Avatar ATLM di Podium 3D Emas, Perak, dan Perunggu beserta tabel
                    peringkat kelas real-time.
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold text-amber-700 flex items-center gap-1">
                  Lihat Podium Juara <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            MENU 2: EXPLORE HOSPITAL 3D (ROBLOX-STYLE 3D WORLD)
           =================================================================== */}
        {activeMenu === 'explore_hospital' && (
          <Hospital3DWorld
            studentName={studentSession.fullName}
            studentNpm={studentSession.npm}
            avatarGender={studentSession.avatarGender}
            labCoatColor={studentSession.labCoatColor}
            scrubColor={studentSession.scrubColor}
            hairColor={studentSession.hairColor}
            skinTone={studentSession.skinTone}
            onStartQuiz={() => handleNavigateMenu('hematology_quiz')}
            onOpenCalculator={() => handleNavigateMenu('digital_calculator')}
            onOpenSimulation={() => handleNavigateMenu('clinical_simulation')}
          />
        )}

        {/* ===================================================================
            MENU 3: VIRTUAL HEMATOLOGY LAB (10 INTERACTIVE INSTRUMENTS)
           =================================================================== */}
        {activeMenu === 'virtual_lab' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-sky-400">
                  LABORATORIUM HEMATOLOGI VIRTUAL — KOMPETENSI INSTRUMEN ATLM
                </span>
                <h2 className="text-2xl font-bold mt-1">
                  10 Stasiun Instrumen & Reagensia Laboratorium Hematologi
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  Pelajari fungsi, prinsip kerja analitik, dan SOP standar ATLM untuk setiap alat
                  laboratorium.
                </p>
              </div>
              <button
                onClick={() => handleNavigateMenu('explore_hospital')}
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" /> Jelajahi Lab dalam Mode 3D
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {LAB_EQUIPMENT_3D_ITEMS.map((eq) => (
                <div
                  key={eq.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-mono font-bold uppercase text-sky-700">
                        {eq.category} • PDF Hal. {eq.pdfPageRef}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                        {eq.indonesianName}
                      </h3>
                      <p className="text-xs text-slate-500">{eq.name}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <strong>Fungsi Utama:</strong> {eq.functionSummary}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Prinsip Kerja:</strong> {eq.operatingPrinciple}
                  </p>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-800 mb-1.5">
                      SOP Praktikum ATLM:
                    </p>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {eq.atlmSOP.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-mono font-bold text-sky-700">{idx + 1}.</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            MENU 4: LEARNING MATERIALS (35 MODULES + 47 ORIGINAL PDF PAGES)
           =================================================================== */}
        {activeMenu === 'learning_materials' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="/assets/ikes_rajawali_logo.png"
                  alt="Logo IKES Rajawali"
                  className="w-12 h-12 rounded-full bg-white p-0.5 object-contain"
                />
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-sky-400">
                    MATERI UTAMA: PDF ANFIS DARAH (47 HALAMAN ASLI) • DR. JUWITA NINDA SUHERMAN, M.KES
                  </span>
                  <h2 className="text-2xl font-bold mt-0.5">
                    35 Modul Pembelajaran Anatomi & Fisiologi Sistem Hematologi
                  </h2>
                </div>
              </div>
              <div className="text-xs font-mono bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700">
                Progres Selesai: {(studentSession.completedModules || []).length} / 35 Modul
              </div>
            </div>

            {/* Search & Category Filter */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={moduleSearch}
                  onChange={(e) => setModuleSearch(e.target.value)}
                  placeholder="Cari modul, rumus MCV/MCH/MCHC, leukosit, hemostasis, ABO..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Semua',
                  'Dasar & Komposisi Darah',
                  'Hemopoiesis & Sumsum Tulang',
                  'Eritrosit & Hemoglobin',
                  'Indeks Eritrosit & Anemia',
                  'Leukosit & Imunologi',
                  'Trombosit & Hemostasis',
                  'Golongan Darah ABO & Rhesus',
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setModuleCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      moduleCategoryFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Master-Detail Module Reader */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Module List */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm max-h-[720px] overflow-y-auto space-y-2">
                {filteredModules.map((mod) => {
                  const isSelected = selectedModule.moduleNumber === mod.moduleNumber;
                  const isDone = (studentSession.completedModules || []).includes(
                    mod.moduleNumber
                  );
                  return (
                    <button
                      key={mod.moduleNumber}
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedModule(mod);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-sky-50 border-sky-400 text-slate-900 shadow-sm'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div>
                        <span className="text-[11px] font-mono font-bold text-sky-700">
                          MODUL #{mod.moduleNumber} • Hal. {mod.pdfPages.join(', ')}
                        </span>
                        <h4 className="text-xs font-bold mt-0.5 leading-snug">{mod.title}</h4>
                      </div>
                      {isDone && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Selected Module Content & Original PDF Slide Images */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 font-mono text-xs font-bold">
                      MODUL {selectedModule.moduleNumber} DARI 35 • {selectedModule.category}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-2">
                      {selectedModule.title}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 mt-1">
                      Referensi Materi Asli: PDF ANFIS DARAH Halaman{' '}
                      {selectedModule.pdfPages.join(', ')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setActiveMenu('pages_presentation');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Presentation className="w-4 h-4" /> Buka di Pages (Presentasi Slide & Audio)
                    </button>
                    <button
                      onClick={() => handleMarkModuleComplete(selectedModule.moduleNumber)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Tandai Selesai (+30 XP)
                    </button>
                  </div>
                </div>

                {/* Summary & Detailed Paragraphs */}
                <div className="p-4 rounded-xl bg-sky-50/80 border border-sky-200 text-sm text-sky-950 font-medium leading-relaxed">
                  {selectedModule.summary}
                </div>

                <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                  {selectedModule.detailedContent.map((para: string, i: number) => (
                    <p key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      {para}
                    </p>
                  ))}
                </div>

                {selectedModule.keyTakeaways && selectedModule.keyTakeaways.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-900 text-sky-300 font-mono text-xs space-y-1">
                    <p className="text-white font-bold uppercase mb-1.5">
                      Poin Kunci & Nilai Rujukan Laboratorium:
                    </p>
                    {selectedModule.keyTakeaways.map((kv: string, i: number) => (
                      <p key={i}>• {kv}</p>
                    ))}
                  </div>
                )}

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
                  <strong className="uppercase block mb-1">
                    Keterangan Gambar & Korelasi Klinis:
                  </strong>
                  {selectedModule.caption}
                </div>

                {/* Original Extracted PDF Slide Images with Zoom */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                    Visualisasi Slide Asli PDF ANFIS DARAH (Klik Gambar untuk Perbesar / Zoom HD)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedModule.pdfPages.map((pageNum: number) => {
                      const imgUrl = `/assets/pdf/page_${String(pageNum).padStart(2, '0')}.jpg`;
                      return (
                        <div
                          key={pageNum}
                          onClick={() => setZoomedPdfImage(imgUrl)}
                          className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-sm"
                        >
                          <img
                            src={imgUrl}
                            alt={`${selectedModule.title} - Halaman ${pageNum}`}
                            className="w-full h-auto object-contain group-hover:scale-[1.02] transition"
                          />
                          <div className="p-2.5 bg-slate-900/90 text-white text-[11px] font-mono flex items-center justify-between">
                            <span>
                              Slide Asli PDF Hal. {pageNum} — dr. Juwita Ninda Suherman, M.Kes
                            </span>
                            <ZoomIn className="w-4 h-4 text-sky-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            PAGES PRESENTATION VIEW: PRESENTASI SLIDE MODERN, ANIMASI & AUDIO NARATOR
           =================================================================== */}
        {activeMenu === 'pages_presentation' && (
          <PagesPresentationView
            module={selectedModule}
            onBack={() => setActiveMenu('learning_materials')}
            onMarkComplete={() => handleMarkModuleComplete(selectedModule.moduleNumber)}
            isCompleted={(studentSession.completedModules || []).includes(selectedModule.moduleNumber)}
          />
        )}

        {/* ===================================================================
            MENU 5: BLOOD CELL EXPLORER (ATLAS MORFOLOGI SEL DARAH)
           =================================================================== */}
        {activeMenu === 'blood_cell_explorer' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-xl">
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400">
                BLOOD CELL MORPHOLOGY ATLAS • ERITROSIT, 5 LEUKOSIT & TROMBOSIT
              </span>
              <h2 className="text-2xl font-bold mt-1">
                Eksplorasi Struktur, Morfologi SADT & Fungsi Seluler Darah
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BLOOD_CELL_ATLAS.map((cell, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200 font-mono text-xs font-bold">
                        PDF Halaman {cell.pdfPage}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{cell.size}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{cell.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 block text-[10px]">NILAI RUJUKAN</span>
                        <span className="text-slate-800 font-bold">{cell.normalRange}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">MASA HIDUP</span>
                        <span className="text-slate-800 font-bold">{cell.lifespan}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Ciri Morfologi Mikroskopis:</strong> {cell.morphology}
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong>Fungsi Fisiologis & Imunologis:</strong> {cell.function}
                    </p>
                  </div>
                  <div
                    onClick={() => setZoomedPdfImage(cell.pdfImage)}
                    className="border-t border-slate-100 bg-slate-50 p-3 cursor-pointer"
                  >
                    <img
                      src={cell.pdfImage}
                      alt={cell.name}
                      className="w-full h-44 object-cover rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            MENU 6: CLINICAL CASE SIMULATION (14-STEP WORKFLOW)
           =================================================================== */}
        {activeMenu === 'clinical_simulation' && <ClinicalSimulationView />}

        {/* ===================================================================
            MENU 7: HEMATOLOGY QUIZ (50 A-E QUESTIONS + POST-QUIZ REVIEW)
           =================================================================== */}
        {activeMenu === 'hematology_quiz' && (
          <QuizizzEngine
            studentNpm={studentSession.npm}
            studentName={studentSession.fullName}
            studentClass={studentSession.className}
            avatarGender={studentSession.avatarGender}
            initialSummary={lastQuizSummary}
            initialReview={lastQuizReview}
            onQuizCompleted={(summary, review) => {
              setLastQuizSummary(summary);
              setLastQuizReview(review);
              const newAttempt: QuizHistoryEntry = {
                id: Date.now(),
                attemptUuid: `ATT-${Date.now()}`,
                sessionCode: 'IKES-ATLM-LIVE',
                totalQuestions: summary.totalQuestions,
                correctCount: summary.correctCount,
                wrongCount: summary.wrongCount,
                accuracyPercent: summary.accuracyPercent,
                score: summary.totalScore,
                durationSeconds: summary.durationSec,
                completedAt: new Date().toISOString(),
              };
              setStudentSession((prev) => ({
                ...prev,
                highestScore: Math.max(prev.highestScore, summary.totalScore),
                bestAccuracy: Math.max(prev.bestAccuracy, summary.accuracyPercent),
                xp: prev.xp + summary.xpEarned,
                quizHistory: [newAttempt, ...(prev.quizHistory || [])].slice(0, 20),
              }));
              fetchLeaderboard();
            }}
            onViewLeaderboard={() => handleNavigateMenu('leaderboard')}
          />
        )}

        {/* ===================================================================
            MENU 8: DIGITAL CALCULATOR (MCV, MCH, MCHC)
           =================================================================== */}
        {activeMenu === 'digital_calculator' && (
          <DigitalCalculatorView studentNpm={studentSession.npm} />
        )}

        {/* ===================================================================
            MENU 9: MEDICAL & HEMATOLOGY GLOSSARY (8 CATEGORIES)
           =================================================================== */}
        {activeMenu === 'medical_glossary' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-xl">
              <span className="text-xs font-mono uppercase tracking-wider text-sky-400">
                KAMUS ISTILAH MEDIS & HEMATOLOGI (8 KATEGORI)
              </span>
              <h2 className="text-2xl font-bold mt-1">
                Glosarium Ilmiah Hematologi ATLM Terintegrasi Halaman PDF
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  placeholder="Cari istilah (misal: Eritropoietin, MCV, Buffy Coat, Hemostasis, Rhesus)..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {GLOSSARY_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGlossaryCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      glossaryCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGlossary.map((item) => {
                const isFav = favoriteTerms.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedGlossaryDetail(item)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-sky-400 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-mono text-[11px] font-bold">
                          {item.category} • Hal. {item.pdfPageRef}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFavoriteTerms((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((id) => id !== item.id)
                                : [...prev, item.id]
                            );
                          }}
                          className="text-slate-400 hover:text-amber-500"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isFav ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </button>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-2">
                        {item.term}{' '}
                        {item.abbreviation && (
                          <span className="font-mono text-sky-700">({item.abbreviation})</span>
                        )}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-400">{item.englishTerm}</p>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {item.definition}
                      </p>
                    </div>
                    <span className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-sky-700">
                      Klik untuk contoh klinis & peran fisiologis →
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================
            MENU 10: 3D PODIUM LEADERBOARD
           =================================================================== */}
        {activeMenu === 'leaderboard' && (
          <Leaderboard3DPodium entries={leaderboardEntries} isLecturerView={false} />
        )}

        {/* ===================================================================
            MENU 11: MY SCORE & REVIEW HISTORY (STUDENT DASHBOARD)
           =================================================================== */}
        {activeMenu === 'my_score' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-sky-400">
                    DASHBOARD AKUN & REKOR KOMPETENSI MAHASISWA ATLM
                  </span>
                  <h2 className="text-2xl font-bold mt-1">
                    {studentSession.fullName} (NPM: {studentSession.npm})
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Kelas: {studentSession.className} • Status Aktivasi:{' '}
                    <span className="text-emerald-400 font-bold">
                      Aktif Seumur Hidup ({studentSession.activatedCode || studentSession.activatedWithCodeDisplay || 'Terverifikasi'})
                    </span>
                  </p>
                </div>
                <button
                  onClick={handleStudentLogout}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-xs font-semibold"
                >
                  Logout Sesi Mahasiswa
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                  <p className="text-xs font-mono text-slate-400">SKOR TERTINGGI</p>
                  <p className="text-2xl font-mono font-bold text-sky-400 mt-1">
                    {studentSession.highestScore}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                  <p className="text-xs font-mono text-slate-400">AKURASI TERBAIK</p>
                  <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                    {studentSession.bestAccuracy}%
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                  <p className="text-xs font-mono text-slate-400">LEVEL & TOTAL XP</p>
                  <p className="text-2xl font-mono font-bold text-amber-300 mt-1">
                    Lv.{studentSession.level} ({studentSession.xp} XP)
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                  <p className="text-xs font-mono text-slate-400">MODUL SELESAI</p>
                  <p className="text-2xl font-mono font-bold text-white mt-1">
                    {(studentSession.completedModules || []).length} / 35
                  </p>
                </div>
              </div>
            </div>

            {lastQuizSummary && lastQuizReview.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Ringkasan Pembahasan Percobaan Kuis Terakhir ({lastQuizSummary.correctCount}/
                  {lastQuizSummary.totalQuestions} Benar — {lastQuizSummary.accuracyPercent}%)
                </h3>
                <button
                  onClick={() => handleNavigateMenu('hematology_quiz')}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
                >
                  Buka Kembali Halaman Pembahasan Lengkap
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                <p className="text-sm text-slate-600">
                  Selesaikan 50 Soal Kuis Hematologi ATLM (A–E) untuk membuka analisis skor dan
                  pembahasan lengkap 5 aspek laboratorium.
                </p>
                <button
                  onClick={() => handleNavigateMenu('hematology_quiz')}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold"
                >
                  Mulai Kuis 50 Soal Sekarang
                </button>
              </div>
            )}

            {/* Quiz Attempt History Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  Riwayat Pengerjaan Hematology Quiz ({(studentSession.quizHistory || []).length}{' '}
                  Percobaan Tersimpan)
                </h3>
              </div>
              {(studentSession.quizHistory || []).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-slate-300 font-mono uppercase">
                        <th className="p-3">No</th>
                        <th className="p-3">Waktu Selesai</th>
                        <th className="p-3">Benar / Total</th>
                        <th className="p-3">Akurasi</th>
                        <th className="p-3">Skor Total</th>
                        <th className="p-3">Durasi Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(studentSession.quizHistory || []).map((att, idx) => (
                        <tr key={att.attemptUuid || att.id || idx} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-700">#{idx + 1}</td>
                          <td className="p-3 font-mono text-slate-600">
                            {new Date(att.completedAt).toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-900">
                            {att.correctCount} / {att.totalQuestions}
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-600">
                            {att.accuracyPercent}%
                          </td>
                          <td className="p-3 font-mono font-bold text-sky-700">{att.score}</td>
                          <td className="p-3 font-mono text-slate-600">{att.durationSeconds} dtk</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Belum ada riwayat pengerjaan kuis yang tercatat untuk NPM {studentSession.npm}.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            MENU 12: ACHIEVEMENTS & BADGES
           =================================================================== */}
        {activeMenu === 'achievements' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-xl">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                ATLM CLINICAL ACHIEVEMENT BADGES
              </span>
              <h2 className="text-2xl font-bold mt-1">
                Lencana Penghargaan Kompetensi Hematologi
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: 'ATLM Lifetime Cadet',
                  desc: 'Mengaktifkan akses seumur hidup mahasiswa ATLM Institut Kesehatan Rajawali.',
                  unlocked: isStudentActivated,
                },
                {
                  title: 'Erythrocyte Index Master',
                  desc: 'Menghitung MCV, MCH, dan MCHC secara presisi pada Kalkulator Digital & Simulasi Klinis.',
                  unlocked: true,
                },
                {
                  title: 'Anfis Darah Scholar',
                  desc: 'Mempelajari modul pembelajaran dan slide asli PDF ANFIS DARAH.',
                  unlocked: (studentSession.completedModules || []).length >= 1,
                },
                {
                  title: 'Clinical Case Specialist',
                  desc: 'Menyelesaikan 50 Soal Pilihan Ganda (A–E) Hematologi ATLM beserta 20 Kasus Sangat Sulit.',
                  unlocked: studentSession.highestScore > 0,
                },
                {
                  title: 'Speed Diagnostic Star',
                  desc: 'Menyelesaikan ujian 50 soal dengan akurasi ≥ 80% dan waktu cepat.',
                  unlocked: studentSession.bestAccuracy >= 80,
                },
                {
                  title: 'Gold Hematology Champion',
                  desc: 'Meraih akurasi ≥ 90% pada evaluasi 50 soal dan menembus Podium 3D Juara.',
                  unlocked: studentSession.bestAccuracy >= 90,
                },
              ].map((b, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border ${
                    b.unlocked
                      ? 'bg-white border-amber-300 shadow-sm'
                      : 'bg-slate-100 border-slate-200 opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Award
                      className={`w-8 h-8 ${
                        b.unlocked ? 'text-amber-500' : 'text-slate-400'
                      }`}
                    />
                    <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-slate-900 text-white">
                      {b.unlocked ? 'TERBUKA' : 'TERKUNCI'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-3">{b.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            MENU 13: AVATAR SETTINGS (STRICTLY MALE & FEMALE ATLM AVATARS ONLY)
           =================================================================== */}
        {activeMenu === 'avatar_settings' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-sky-700">
                KUSTOMISASI KARAKTER UTAMA 3D (KHUSUS MAHASISWA ATLM)
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                Pengaturan Avatar ATLM Pria & ATLM Wanita
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sesuai aturan akademik, pemain hanya menggunakan Avatar Mahasiswa ATLM (Pria atau
                Wanita) dengan jas laboratorium resmi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() =>
                  setStudentSession((prev) => ({ ...prev, avatarGender: 'female_atlm' }))
                }
                className={`p-4 rounded-xl border text-left transition ${
                  studentSession.avatarGender === 'female_atlm'
                    ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <p className="text-xs font-mono font-bold uppercase text-sky-700">KARAKTER 1</p>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Avatar Mahasiswa ATLM Wanita
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Jas laboratorium putih, scrub medis biru, ID Badge ATLM IKES Rajawali.
                </p>
              </button>

              <button
                onClick={() =>
                  setStudentSession((prev) => ({ ...prev, avatarGender: 'male_atlm' }))
                }
                className={`p-4 rounded-xl border text-left transition ${
                  studentSession.avatarGender === 'male_atlm'
                    ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <p className="text-xs font-mono font-bold uppercase text-sky-700">KARAKTER 2</p>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Avatar Mahasiswa ATLM Pria
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Jas laboratorium putih, scrub medis teal/biru, ID Badge ATLM IKES Rajawali.
                </p>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  Warna Seragam Scrub
                </label>
                <select
                  value={studentSession.scrubColor}
                  onChange={(e) =>
                    setStudentSession((prev) => ({ ...prev, scrubColor: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="#0284c7">Biru Medis ATLM (#0284c7)</option>
                  <option value="#0f766e">Hijau Bedah Teal (#0f766e)</option>
                  <option value="#1d4ed8">Biru Navy Klinis (#1d4ed8)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  Warna Rambut
                </label>
                <select
                  value={studentSession.hairColor}
                  onChange={(e) =>
                    setStudentSession((prev) => ({ ...prev, hairColor: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="#1e293b">Hitam Natural</option>
                  <option value="#451a03">Coklat Tua</option>
                  <option value="#334155">Abu-abu Gelap</option>
                </select>
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  Warna Kulit
                </label>
                <select
                  value={studentSession.skinTone}
                  onChange={(e) =>
                    setStudentSession((prev) => ({ ...prev, skinTone: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="#f1c27d">Sawo Matang Cerah</option>
                  <option value="#ffdbac">Kuning Langsat</option>
                  <option value="#c68642">Sawo Matang</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveAvatarSettings}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                Simpan Kustomisasi Avatar
              </button>
              <button
                onClick={() => handleNavigateMenu('explore_hospital')}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
              >
                Lihat Avatar di Dunia 3D →
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            MENU 14: AUDIO SETTINGS (5-CHANNEL ENGINE, ANDROID UNLOCK & CHARACTER VOICE PREVIEW)
           =================================================================== */}
        {activeMenu === 'audio_settings' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-sky-700">
                  AUDIO ENGINE • ANDROID & DESKTOP COMPATIBLE
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  Pengaturan Audio, Musik Latar & Identitas Suara Karakter 3D
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Mengatur Master Volume, Volume Suara Karakter 3D, Volume Musik Latar, dan Volume
                  Efek Suara secara independen. Mendukung kebijakan autoplay browser Android.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await soundManager.unlockAudioEngine(true);
                  setSoundSettings(soundManager.getSettings());
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                AKTIFKAN SUARA (ANDROID & PC)
              </button>
            </div>

            {/* 1. Mute / Unmute Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Status Suara Utama (Mute / Unmute)
                </p>
                <p className="text-xs text-slate-500">
                  Matikan atau nyalakan seluruh saluran audio aplikasi dalam satu sentuhan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextMute = !soundSettings.isMuted;
                  soundManager.setMuted(nextMute);
                  setSoundSettings(soundManager.getSettings());
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                  soundSettings.isMuted
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {soundSettings.isMuted ? (
                  <>
                    <VolumeX className="w-4 h-4" /> Suara Nonaktif (Muted)
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" /> Suara Aktif (Unmuted)
                  </>
                )}
              </button>
            </div>

            {/* 2–5: Independent 4-Channel Volume Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-800">
                  1. Master Volume: {Math.round((soundSettings.masterVolume ?? 0.9) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundSettings.masterVolume ?? 0.9}
                  onChange={(e) => {
                    soundManager.setMasterVolume(parseFloat(e.target.value));
                    setSoundSettings(soundManager.getSettings());
                  }}
                  className="w-full accent-sky-600"
                />
                <p className="text-[11px] text-slate-500">
                  Mengatur batas volume keseluruhan aplikasi.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 space-y-2">
                <label className="block text-xs font-bold uppercase text-sky-900">
                  2. Character Voice Volume:{' '}
                  {Math.round((soundSettings.voiceVolume ?? 0.95) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundSettings.voiceVolume ?? 0.95}
                  onChange={(e) => {
                    soundManager.setVoiceVolume(parseFloat(e.target.value));
                    setSoundSettings(soundManager.getSettings());
                  }}
                  className="w-full accent-sky-600"
                />
                <p className="text-[11px] text-sky-800">
                  Khusus volume suara dialog Dosen, Dokter, Analis Lab, Perawat & 6 Pasien 3D.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-800">
                  3. Background Music Volume:{' '}
                  {Math.round((soundSettings.bgmVolume ?? 0.22) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundSettings.bgmVolume ?? 0.22}
                  onChange={(e) => {
                    soundManager.setBgmVolume(parseFloat(e.target.value));
                    setSoundSettings(soundManager.getSettings());
                  }}
                  className="w-full accent-sky-600"
                />
                <p className="text-[11px] text-slate-500">
                  Volume musik ambient laboratorium (tidak mengecilkan suara karakter).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-800">
                  4. Sound Effect Volume (SFX):{' '}
                  {Math.round((soundSettings.sfxVolume ?? 0.65) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundSettings.sfxVolume ?? 0.65}
                  onChange={(e) => {
                    soundManager.setSfxVolume(parseFloat(e.target.value));
                    soundManager.playClick();
                    setSoundSettings(soundManager.getSettings());
                  }}
                  className="w-full accent-sky-600"
                />
                <p className="text-[11px] text-slate-500">
                  Volume efek klik tombol, notifikasi jawaban kuis, dan perpindahan ruangan.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.startBGM();
                  setSoundSettings(soundManager.getSettings());
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
              >
                Nyalakan Musik Ambient Lab
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.stopBGM();
                  setSoundSettings(soundManager.getSettings());
                }}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
              >
                Hentikan Musik Ambient
              </button>
              <button
                type="button"
                onClick={() => soundManager.stopSpeaking()}
                className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold"
              >
                Hentikan Suara Karakter Saat Ini
              </button>
            </div>

            {/* Interactive Character Voice Identity & Gender Matching Preview Deck */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300 font-bold">
                    CHARACTER VOICE IDENTITY & EMOTIONAL PROSODY TEST
                  </span>
                  <h3 className="text-sm font-bold">
                    Uji Identitas Suara Karakter Pria & Wanita (Android & Desktop)
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {[
                  {
                    id: 'npc_dr_juwita',
                    label: 'dr. Juwita Ninda Suherman, M.Kes (Dosen Wanita)',
                    badge: 'Wanita • Encouraging',
                    sample:
                      'Selamat datang di Hematology World Institut Kesehatan Rajawali! Ketelitian Anda menghitung MCV, MCH, dan MCHC sangat menentukan diagnosis klinis.',
                  },
                  {
                    id: 'npc_dr_hendrawan',
                    label: 'dr. Hendrawan Pratama, Sp.PK(K) (Dokter Spesialis Pria)',
                    badge: 'Pria Senior • Serious',
                    sample:
                      'Rekan ATLM, jika Anda menemukan nilai MCHC lebih dari 36 gram per desiliter, periksa apakah ada sferositosis atau artefak cold agglutinin!',
                  },
                  {
                    id: 'npc_atlm_senior',
                    label: 'Raka Aditya, S.Tr.Kes (Analis Lab Pria)',
                    badge: 'Pria • Confident',
                    sample:
                      'Halo rekan ATLM! Gunakan pemeriksaan cepat Rule of Three pada sampel normositik normokromik sebelum merilis hasil laboratorium.',
                  },
                  {
                    id: 'npc_patient_nadia',
                    label: 'Nn. Nadia Putri (Pasien Wanita 24 Thn)',
                    badge: 'Wanita Muda • Curious',
                    sample:
                      'Kak ATLM, hasil laboratorium saya menunjukkan Hemoglobin 8,4 gram per desiliter dan MCV 64,3 femtoliter. Apa artinya ya?',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      soundManager.speakCharacterDialogue({
                        text: item.sample,
                        characterId: item.id,
                        characterName: item.label,
                        lang: 'id-ID',
                      })
                    }
                    className="text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white truncate">{item.label}</span>
                      <Volume2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px]">
                      {item.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            MENU: COPYRIGHT & INTELLECTUAL PROPERTY POLICY
           =================================================================== */}
        {activeMenu === 'copyright_policy' && (
          <CopyrightPolicyPage onBackToHome={() => setActiveMenu('home')} />
        )}
      </main>

      {/* Global Copyright Protection Footer */}
      <CopyrightFooter />

      {/* =====================================================================
          ZOOMED PDF SLIDE MODAL (ALL 47 ORIGINAL PAGES)
         ===================================================================== */}
      {zoomedPdfImage && (
        <div
          onClick={() => setZoomedPdfImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-mono font-bold text-slate-700">
                Pratinjau Resolusi Tinggi — Slide Asli PDF ANFIS DARAH (dr. Juwita Ninda Suherman,
                M.Kes)
              </span>
              <button
                onClick={() => setZoomedPdfImage(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={zoomedPdfImage}
              alt="Zoomed PDF Slide"
              className="w-full h-auto object-contain mt-3 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* =====================================================================
          GLOSSARY DETAIL POP-UP MODAL
         ===================================================================== */}
      {selectedGlossaryDetail && (
        <div
          onClick={() => setSelectedGlossaryDetail(null)}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-sky-100 text-sky-800 font-mono text-xs font-bold">
                  {selectedGlossaryDetail.category} • PDF Hal. {selectedGlossaryDetail.pdfPageRef}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedGlossaryDetail.term}{' '}
                  {selectedGlossaryDetail.abbreviation
                    ? `(${selectedGlossaryDetail.abbreviation})`
                    : ''}
                </h3>
                <p className="text-xs font-mono text-slate-500">
                  {selectedGlossaryDetail.englishTerm}
                </p>
              </div>
              <button
                onClick={() => setSelectedGlossaryDetail(null)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="block text-slate-900 uppercase mb-1">Definisi Ilmiah:</strong>
                {selectedGlossaryDetail.definition}
              </div>
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100">
                <strong className="block text-sky-950 uppercase mb-1">Fungsi & Peran:</strong>
                {selectedGlossaryDetail.functionRole}
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <strong className="block text-emerald-950 uppercase mb-1">
                  Contoh Konteks Medis & Hubungan Pemeriksaan Hematologi:
                </strong>
                {selectedGlossaryDetail.clinicalExample} —{' '}
                {selectedGlossaryDetail.hematologyRelation}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          STUDENT LIFETIME ACCESS & LECTURER LOGIN MODAL
         ===================================================================== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/ikes_rajawali_logo.png"
                  alt="Logo IKES Rajawali"
                  className="w-11 h-11 object-contain"
                />
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-sky-700">
                    {showAuthModal === 'student'
                      ? 'SISTEM AUTENTIKASI & AKTIVASI MAHASISWA ATLM'
                      : 'PORTAL DOSEN PENGAMPU IKES RAJAWALI'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {showAuthModal === 'student'
                      ? 'Login & Aktivasi Akun Mahasiswa'
                      : 'Autentikasi Dosen Pengampu'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAuthModal(null);
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {showAuthModal === 'student' ? (
              <>
                {isStudentActivated && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-emerald-900">
                        Sesi Aktif: {studentSession.fullName} ({studentSession.npm})
                      </p>
                      <p className="text-emerald-700 font-mono text-[11px]">
                        Kode Terikat: {studentSession.activatedCode || 'AKTIF-SEUMUR-HIDUP'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleStudentLogout}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shrink-0"
                    >
                      Logout
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setStudentAuthTab('login');
                      setAuthError(null);
                      setAuthSuccess(null);
                    }}
                    className={`py-2 px-2 rounded-lg transition ${
                      studentAuthTab === 'login'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    Login Mahasiswa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentAuthTab('activate');
                      setAuthError(null);
                      setAuthSuccess(null);
                    }}
                    className={`py-2 px-2 rounded-lg transition ${
                      studentAuthTab === 'activate'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    Aktivasi Baru
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentAuthTab('recover');
                      setAuthError(null);
                      setAuthSuccess(null);
                    }}
                    className={`py-2 px-2 rounded-lg transition ${
                      studentAuthTab === 'recover'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    Pemulihan Akun
                  </button>
                </div>

                <form onSubmit={handleStudentActivate} className="space-y-3.5 text-xs">
                  {(studentAuthTab === 'activate' || studentAuthTab === 'recover') && (
                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">
                        Nama Lengkap Mahasiswa{' '}
                        {studentAuthTab === 'recover' ? '(Opsional untuk Pembaruan)' : ''}
                      </label>
                      <input
                        type="text"
                        required={studentAuthTab === 'activate'}
                        value={formFullName}
                        onChange={(e) => setFormFullName(e.target.value)}
                        placeholder="Masukkan Nama Lengkap"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold uppercase text-slate-700">
                        Nomor Pokok Mahasiswa (NPM)
                      </label>
                      {studentAuthTab !== 'activate' && (
                        <button
                          type="button"
                          onClick={() => handleCheckStudentNpm(formNpm)}
                          className="text-[11px] font-mono font-bold text-sky-700 hover:text-sky-900 underline"
                        >
                          Cek Status NPM
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={formNpm}
                      onChange={(e) => {
                        setFormNpm(e.target.value);
                        if (npmLookupInfo) setNpmLookupInfo(null);
                      }}
                      onBlur={() => {
                        if (studentAuthTab !== 'activate' && formNpm.trim().length >= 3) {
                          handleCheckStudentNpm(formNpm);
                        }
                      }}
                      placeholder="Contoh: 24011001"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
                    />
                    {studentAuthTab === 'login' && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        Mahasiswa yang sudah pernah melakukan aktivasi cukup memasukkan NPM (dan
                        password bila telah diatur) tanpa perlu kode aktivasi baru.
                      </p>
                    )}
                  </div>

                  {/* Live Account & Code Status Separation Card */}
                  {npmLookupInfo && studentAuthTab !== 'activate' && (
                    <div
                      className={`p-3 rounded-xl border text-[11px] space-y-1 ${
                        npmLookupInfo.exists
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <p className="font-bold">{npmLookupInfo.message}</p>
                      {npmLookupInfo.exists && (
                        <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-950 font-bold">
                            Status Akun: {npmLookupInfo.accountStatus} (Aktif)
                          </span>
                          <span className="px-2 py-0.5 rounded bg-sky-200/70 text-sky-950 font-bold">
                            Status Kode ({npmLookupInfo.activatedCode}): {npmLookupInfo.codeStatus}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Password Field for Login, First-Time Activation, or Account Recovery */}
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">
                      {studentAuthTab === 'activate'
                        ? 'Buat Password Login Mahasiswa (Opsional / Pengaman Akun)'
                        : studentAuthTab === 'recover'
                        ? 'Atur Password Baru Mahasiswa'
                        : 'Password Mahasiswa (Kosongkan bila belum pernah mengatur password)'}
                    </label>
                    <input
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder={
                        studentAuthTab === 'recover'
                          ? 'Masukkan password baru untuk akun NPM Anda'
                          : 'Masukkan password akun mahasiswa'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>

                  {studentAuthTab === 'recover' && (
                    <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-[11px] leading-relaxed">
                      <strong>Pemulihan & Sinkronisasi Akun Lama:</strong> Jika NPM Anda sebelumnya
                      sudah berhasil menggunakan kode aktivasi, sistem akan otomatis memulihkan
                      relasi akun dan menyimpan password baru Anda tanpa memerlukan kode aktivasi
                      baru.
                    </div>
                  )}

                  {studentAuthTab === 'activate' && (
                    <>
                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          Kelas / Angkatan
                        </label>
                        <input
                          type="text"
                          value={formClass}
                          onChange={(e) => setFormClass(e.target.value)}
                          placeholder="ATLM Reguler A - IKES Rajawali"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          Kode Aktivasi Unik Mahasiswa (Dari Dosen)
                        </label>
                        <input
                          type="text"
                          required
                          value={formAccessCode}
                          onChange={(e) => setFormAccessCode(e.target.value.toUpperCase())}
                          placeholder="Masukkan kode aktivasi unik dari Dosen"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono uppercase"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                          1 kode aktivasi unik hanya berlaku untuk 1 mahasiswa (NPM) dan aktif
                          permanen seumur hidup.
                        </p>
                      </div>

                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          Pilih Avatar Karakter ATLM
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setFormGender('female_atlm')}
                            className={`py-2 px-3 rounded-xl border font-semibold ${
                              formGender === 'female_atlm'
                                ? 'bg-sky-50 border-sky-500 text-sky-900'
                                : 'border-slate-200 text-slate-600'
                            }`}
                          >
                            ATLM Wanita
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormGender('male_atlm')}
                            className={`py-2 px-3 rounded-xl border font-semibold ${
                              formGender === 'male_atlm'
                                ? 'bg-sky-50 border-sky-500 text-sky-900'
                                : 'border-slate-200 text-slate-600'
                            }`}
                          >
                            ATLM Pria
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium">
                      {authError}
                    </div>
                  )}
                  {authSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                      {authSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAuthSubmitting}
                    className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-bold text-xs shadow"
                  >
                    {isAuthSubmitting
                      ? 'Memproses Autentikasi...'
                      : studentAuthTab === 'activate'
                      ? 'Aktifkan Kode Unik & Buat Akun Permanen'
                      : studentAuthTab === 'recover'
                      ? 'Pulihkan & Sinkronkan Akun Mahasiswa'
                      : 'Masuk dengan NPM Terdaftar'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setLecturerTab('bootstrap');
                      setAuthError(null);
                    }}
                    className={`py-2 rounded-lg transition ${
                      lecturerTab === 'bootstrap'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    Kode Akses Dosen
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLecturerTab('credentials');
                      setAuthError(null);
                    }}
                    className={`py-2 rounded-lg transition ${
                      lecturerTab === 'credentials'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    Username & Password
                  </button>
                </div>

                <form onSubmit={handleLecturerLogin} className="space-y-3.5 text-xs">
                  {lecturerTab === 'bootstrap' ? (
                    <div>
                      <label className="block font-bold uppercase text-slate-700 mb-1">
                        Kode Akses Rahasia Dosen Pengampu
                      </label>
                      <input
                        type="password"
                        required
                        autoComplete="off"
                        value={lecturerBootstrapCode}
                        onChange={(e) => setLecturerBootstrapCode(e.target.value)}
                        placeholder="Masukkan kode akses rahasia dosen"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-900"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Validasi dilakukan secara tertutup di server menggunakan secret
                        server-side dan sesi cookie HttpOnly.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          Username Dosen
                        </label>
                        <input
                          type="text"
                          required
                          value={lecturerUsername}
                          onChange={(e) => setLecturerUsername(e.target.value)}
                          placeholder="Masukkan username dosen"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold uppercase text-slate-700 mb-1">
                          Password Dosen
                        </label>
                        <input
                          type="password"
                          required
                          value={lecturerPassword}
                          onChange={(e) => setLecturerPassword(e.target.value)}
                          placeholder="Masukkan password pribadi dosen"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
                        />
                      </div>
                    </>
                  )}

                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAuthSubmitting}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-xs"
                  >
                    {isAuthSubmitting
                      ? 'Memverifikasi Kredensial...'
                      : 'Verifikasi & Masuk ke Portal Dosen'}
                  </button>
                </form>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleLecturerGoogleLogin}
                    className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5 text-sky-600" /> Masuk Dosen dengan Akun Google
                    (Firebase Auth)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
