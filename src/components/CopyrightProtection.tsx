/**
 * Copyright & Intellectual Property Protection Component & Utilities
 * Dibuat untuk Platform Pembelajaran HEMATOLOGY WORLD
 * Pemegang Hak Cipta: dr. Juwita Ninda Suherman, M.Kes & Institut Kesehatan Rajawali Bandung
 */

import React, { useState } from 'react';
import { Shield, ShieldAlert, Award, FileText, CheckCircle2, ChevronRight, Lock, Eye, AlertTriangle } from 'lucide-react';

export const COPYRIGHT_HOLDER = 'dr. Juwita Ninda Suherman, M.Kes & Institut Kesehatan Rajawali Bandung';
export const COPYRIGHT_YEAR = 2026;
export const COPYRIGHT_NOTICE_FULL = `© ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER}. ALL RIGHTS RESERVED. Seluruh konten, materi pembelajaran, desain, ilustrasi, presentasi, dokumen, dan aset digital yang tersedia pada platform ini dilindungi oleh hak cipta dan peraturan perundang-undangan yang berlaku. Dilarang menyalin, menggandakan, memperbanyak, mendistribusikan, mempublikasikan ulang, mengunggah ke platform lain, menjual, mengubah, atau menggunakan seluruh maupun sebagian materi untuk kepentingan komersial tanpa izin tertulis dari pemegang hak cipta.`;
export const COPYRIGHT_NOTICE_SHORT = `© ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER} | COPYRIGHT PROTECTED`;

/**
 * Global Website Footer Copyright Notice
 */
export const CopyrightFooter: React.FC = () => {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-400 border-t border-slate-800/80 py-8 px-4 text-xs select-none">
      <div className="max-w-[1440px] mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src="/assets/ikes_rajawali_logo.png"
              alt="Logo IKES Rajawali"
              className="w-10 h-10 rounded-full bg-white p-0.5 object-contain"
            />
            <div>
              <p className="font-bold text-slate-200 text-sm">
                HEMATOLOGY WORLD — dr. Juwita Ninda Suherman, M.Kes
              </p>
              <p className="text-[11px] text-sky-400 font-mono">
                Program Studi Teknologi Laboratorium Medik (ATLM) • Institut Kesehatan Rajawali Bandung
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 font-mono text-[11px]">
              <Shield className="w-3.5 h-3.5" /> AKSES TERBUKA BEBAS KODE AKTIVASI
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/70 text-sky-400 border border-sky-800/60 font-mono text-[11px]">
              <Lock className="w-3.5 h-3.5" /> HAK CIPTA DILINDUNGI
            </span>
          </div>
        </div>

        <div className="space-y-2 text-slate-400 text-justify leading-relaxed">
          <p className="font-bold text-slate-200">
            © {COPYRIGHT_YEAR} {COPYRIGHT_HOLDER}. ALL RIGHTS RESERVED.
          </p>
          <p>
            Seluruh konten, materi pembelajaran, slide presentasi, desain visual, ilustrasi sel darah, diagram, 
            kalkulator klinis, simulasi kasus, audio narasi, bank soal, kuis 50 soal pilihan ganda (A–E), serta dokumen 
            akademik yang tersedia pada platform ini dilindungi oleh hak cipta dan peraturan perundang-undangan Republik Indonesia.
          </p>
          <p className="text-slate-500 text-[11px]">
            Dilarang menyalin, menggandakan, memperbanyak, mendistribusikan, mempublikasikan ulang, mengunggah ke platform lain, 
            menjual, mengubah, atau menggunakan seluruh maupun sebagian materi untuk kepentingan komersial tanpa izin tertulis 
            resmi dari pemegang hak cipta: <strong>dr. Juwita Ninda Suherman, M.Kes</strong>.
          </p>
        </div>
      </div>
    </footer>
  );
};

/**
 * Slide / Pages Bottom Copyright Strip (Elegant, Non-Obtrusive)
 */
export const SlideCopyrightBar: React.FC<{ light?: boolean }> = ({ light = false }) => {
  return (
    <div
      className={`w-full py-1.5 px-4 text-[10px] md:text-[11px] font-mono select-none flex flex-wrap items-center justify-between gap-2 border-t ${
        light
          ? 'bg-slate-100 text-slate-600 border-slate-200'
          : 'bg-slate-950/90 text-slate-400 border-slate-800/80 backdrop-blur-md'
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <Shield className="w-3 h-3 text-sky-400 shrink-0" />
        <span className="font-bold text-slate-300">© 2026 {COPYRIGHT_HOLDER}</span>
        <span className="hidden sm:inline text-sky-400">|</span>
        <span className="hidden sm:inline">COPYRIGHT PROTECTED • PENGGUNAAN AKADEMIK RESMI</span>
      </div>
      <div className="text-[10px] text-slate-500">
        Dilarang memperbanyak/distribusi tanpa izin tertulis
      </div>
    </div>
  );
};

/**
 * First-Time User Copyright Warning Modal (Persisted in localStorage)
 */
export const CopyrightNoticeModal: React.FC<{
  isOpen: boolean;
  onAccept: () => void;
  onCancel?: () => void;
  title?: string;
  sourceLabel?: string;
}> = ({ isOpen, onAccept, onCancel, title = 'PERHATIAN — HAK CIPTA DILINDUNGI', sourceLabel = 'Materi Pembelajaran' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border-2 border-sky-400/30 space-y-5 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold block">
              PEMBERITAHUAN HUKUM & ETIKA AKADEMIK
            </span>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 font-medium">
            Seluruh materi pada platform ini ({sourceLabel}), termasuk slide presentasi, dokumen PDF, file PowerPoint, 
            narasi suara, grafik, dan evaluasi kuis merupakan karya orisinal yang dilindungi hak cipta milik:{' '}
            <strong className="text-slate-900 block mt-1">dr. Juwita Ninda Suherman, M.Kes & Institut Kesehatan Rajawali</strong>.
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-600">
            <p className="font-bold text-slate-900">Ketentuan Penggunaan:</p>
            <p>• Diberikan hak akses untuk keperluan belajar mandiri dan akademik.</p>
            <p>• Dilarang menyalin, menggandakan, memperbanyak, mendistribusikan, atau mengunggah ulang ke media sosial / platform lain.</p>
            <p>• Dilarang memperjualbelikan atau mengambil keuntungan komersial dari materi tanpa izin tertulis.</p>
            <p>• Dilarang menghapus tanda hak cipta dan watermark dari dokumen PDF atau PowerPoint.</p>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Dengan melanjutkan, Anda menyatakan memahami dan bersedia mematuhi seluruh ketentuan perlindungan hak kekayaan intelektual ini.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
            >
              KEMBALI
            </button>
          )}
          <button
            onClick={onAccept}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            SAYA MEMAHAMI & SETUJU
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Dedicated Page: COPYRIGHT & INTELLECTUAL PROPERTY POLICY
 */
export const CopyrightPolicyPage: React.FC<{ onBackToHome?: () => void }> = ({ onBackToHome }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-8 text-white shadow-xl flex items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold block mb-1">
            LEGAL & ACADEMIC INTEGRITY
          </span>
          <h2 className="text-3xl font-bold tracking-tight">
            Copyright & Intellectual Property Policy
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Kebijakan Hak Cipta & Perlindungan Hak Kekayaan Intelektual Platform HEMATOLOGY WORLD
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center shrink-0">
          <Shield className="w-8 h-8 text-sky-400" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
          <p className="font-bold text-sky-950 text-base mb-1">
            Pemegang Hak Cipta Resmi: dr. Juwita Ninda Suherman, M.Kes
          </p>
          <p className="text-xs text-sky-900">
            Institut Kesehatan Rajawali Bandung • Program Studi Teknologi Laboratorium Medik (ATLM)
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> 10 Butir Kebijakan Hak Cipta:
          </h3>

          <ol className="space-y-3.5 list-decimal list-inside text-slate-700 text-xs md:text-sm">
            <li className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong>Karya Cipta Asli:</strong> Seluruh materi yang dibuat dan dimiliki oleh pengelola website merupakan karya ilmiah dan edukasi orisinal yang dilindungi oleh Undang-Undang Hak Cipta Republik Indonesia.
            </li>
            <li className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong>Hak Akses Pembelajaran:</strong> Pengguna diberikan hak akses untuk membaca, mempelajari, dan memanfaatkan materi untuk kepentingan pembelajaran pribadi atau akademik yang sah.
            </li>
            <li className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong>Larangan Penggandaan:</strong> Pengguna dilarang menggandakan, memfotokopi massal, atau memperbanyak materi dalam format apapun tanpa izin tertulis dari pemegang hak cipta.
            </li>
            <li className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong>Larangan Unggah Ulang:</strong> Pengguna dilarang mengunggah ulang (re-upload) materi, slide, video, atau dokumen ke website lain, media sosial, Google Drive publik, repositori terbuka, atau platform distribusi dokumen komersial.
            </li>
            <li className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong>Larangan Komersialisasi:</strong> Pengguna dilarang menjual, memperdagangkan, melisensikan, atau mengambil keuntungan komersial dalam bentuk apapun dari materi tanpa izin tertulis.
            </li>
            <li className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong>Integritas Watermark & Identitas:</strong> Pengguna dilarang menghapus, mengaburkan, atau memodifikasi watermark, logo instansi, serta identitas pemilik hak cipta pada materi digital yang diunduh (PDF dan PowerPoint).
            </li>
            <li className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong>Larangan Plagiarisme:</strong> Pengguna dilarang mengklaim karya, modul, kalkulator, soal, atau diagram milik pengelola website sebagai karya pribadi.
            </li>
            <li className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong>Kewajiban Sitasi & Atribusi:</strong> Penggunaan kutipan materi untuk karya tulis ilmiah wajib mencantumkan atribusi lengkap dan sitasi akademik kepada <em>dr. Juwita Ninda Suherman, M.Kes</em> dan <em>Institut Kesehatan Rajawali</em>.
            </li>
            <li className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong>Materi Pihak Ketiga:</strong> Materi pihak ketiga (seperti rujukan standar laboratorium internasional, pedoman WHO, dan nama alat) tetap tunduk pada hak cipta dan lisensi pemilik aslinya.
            </li>
            <li className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <strong>Penegakan Hukum:</strong> Setiap bentuk pelanggaran hak cipta dapat ditindaklanjuti secara tegas sesuai ketentuan hukum pidana dan perdata yang berlaku di Republik Indonesia.
            </li>
          </ol>
        </div>

        {onBackToHome && (
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={onBackToHome}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
            >
              Kembali ke Menu Utama
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
