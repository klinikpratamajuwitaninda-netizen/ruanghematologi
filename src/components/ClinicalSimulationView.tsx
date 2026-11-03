import React, { useState } from 'react';
import { CLINICAL_SIMULATION_CASES, ClinicalSimulationCase } from '../data/clinicalSimulationData';
import { soundManager } from '../utils/soundManager';
import {
  Stethoscope,
  Microscope,
  CheckCircle2,
  ArrowRight,
  ClipboardCheck,
  TestTube,
  Calculator,
  FileText,
  Sparkles,
  UserCheck,
} from 'lucide-react';

const WORKFLOW_14_STEPS = [
  '1. Pasien Datang ke Poliklinik / IGD',
  '2. Anamnesis Keluhan & Riwayat Medis',
  '3. Pemeriksaan Fisik & Tanda Vital',
  '4. Permintaan Pemeriksaan Darah Lengkap (CBC)',
  '5. Flebotomi & Verifikasi Pra-Analitik Tabung K2EDTA',
  '6. Analisis Sampel pada 5-Diff Hematology Analyzer',
  '7. Pembacaan Parameter Hb, Hct, RBC, WBC & PLT',
  '8. Perhitungan Indeks Eritrosit (MCV, MCH, MCHC) oleh ATLM',
  '9. Evaluasi Morfologi Sediaan Apus Darah Tepi (SADT)',
  '10. Validasi Pasca-Analitik & Pelaporan LIS ke Dokter',
  '11. Interpretasi Klinis & Penegakan Diagnosis oleh Dokter',
  '12. Edukasi Nutrisi & Pencegahan kepada Pasien',
  '13. Perencanaan Tata Laksana & Terapi Medis',
  '14. Pemantauan Respons Terapi (Kontrol Hb & Retikulosit)',
];

export const ClinicalSimulationView: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<ClinicalSimulationCase>(
    CLINICAL_SIMULATION_CASES[0]
  );
  const [activeStep, setActiveStep] = useState<number>(1);
  const [studentMcv, setStudentMcv] = useState<string>('');
  const [studentMch, setStudentMch] = useState<string>('');
  const [studentMchc, setStudentMchc] = useState<string>('');
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const handleSelectCase = (c: ClinicalSimulationCase) => {
    soundManager.playClick();
    setSelectedCase(c);
    setActiveStep(1);
    setStudentMcv('');
    setStudentMch('');
    setStudentMchc('');
    setVerificationFeedback(null);
  };

  const verifyStudentCalculation = () => {
    const mcvVal = parseFloat(studentMcv);
    const mchVal = parseFloat(studentMch);
    const mchcVal = parseFloat(studentMchc);

    if (isNaN(mcvVal) || isNaN(mchVal) || isNaN(mchcVal)) {
      soundManager.playWrong();
      setVerificationFeedback('Harap isi ketiga nilai MCV, MCH, dan MCHC terlebih dahulu.');
      return;
    }

    const okMcv = Math.abs(mcvVal - selectedCase.expectedIndices.mcv) <= 1.0;
    const okMch = Math.abs(mchVal - selectedCase.expectedIndices.mch) <= 1.0;
    const okMchc = Math.abs(mchcVal - selectedCase.expectedIndices.mchc) <= 1.0;

    if (okMcv && okMch && okMchc) {
      soundManager.playCorrect();
      setVerificationFeedback(
        `Tepat sekali! MCV = ${selectedCase.expectedIndices.mcv} fL, MCH = ${selectedCase.expectedIndices.mch} pg, MCHC = ${selectedCase.expectedIndices.mchc} g/dL (${selectedCase.expectedIndices.morphologyClassification}).`
      );
    } else {
      soundManager.playClick();
      setVerificationFeedback(
        `Koreksi Perhitungan ATLM: MCV yang tepat = ${selectedCase.expectedIndices.mcv} fL, MCH = ${selectedCase.expectedIndices.mch} pg, MCHC = ${selectedCase.expectedIndices.mchc} g/dL.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Case Selector */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Microscope className="w-4 h-4" /> CLINICAL HEMATOLOGY SIMULATION (14-STEP WORKFLOW)
            </span>
            <h2 className="text-2xl font-bold mt-1">
              Simulasi Alur Kerja Kolaboratif ATLM & Dokter Spesialis
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Perankan tugas Ahli Teknologi Laboratorium Medik (ATLM) mulai dari penerimaan spesimen EDTA, kalkulasi indeks eritrosit, hingga pelaporan ke Dokter.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          {CLINICAL_SIMULATION_CASES.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectCase(c)}
              className={`text-left p-4 rounded-xl border transition ${
                selectedCase.id === c.id
                  ? 'bg-sky-600/30 border-sky-400 text-white'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <p className="text-xs font-mono text-sky-300">{c.patientName} ({c.ageGender})</p>
              <h3 className="text-sm font-bold mt-1 leading-snug">{c.title}</h3>
            </button>
          ))}
        </div>
      </div>

      {/* Main 14-Step Simulation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 14-Step Timeline */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-3">
            14 Tahap Alur Klinis & Laboratorium
          </h3>
          <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
            {WORKFLOW_14_STEPS.map((stepTitle, idx) => {
              const stepNum = idx + 1;
              const isCurrent = activeStep === stepNum;
              const isDone = activeStep > stepNum;
              return (
                <button
                  key={stepNum}
                  onClick={() => {
                    soundManager.playClick();
                    setActiveStep(stepNum);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                    isCurrent
                      ? 'bg-slate-900 text-white font-semibold shadow'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{stepTitle}</span>
                  {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Interactive Step Detail Panel */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-sky-700">
                  TAHAP {activeStep} DARI 14 • PDF HALAMAN {selectedCase.pdfPageRef}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {WORKFLOW_14_STEPS[activeStep - 1]}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs">
                {activeStep <= 4
                  ? 'Peran: Pemeriksaan Awal Dokter'
                  : activeStep <= 10
                  ? 'Peran Aktif: Mahasiswa ATLM'
                  : 'Peran: Keputusan Klinis Dokter'}
              </span>
            </div>

            {/* Patient & Clinical Info (Steps 1-4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <p className="font-bold text-slate-900 uppercase">Identitas & Keluhan Utama</p>
                <p>
                  <strong>Pasien:</strong> {selectedCase.patientName} ({selectedCase.ageGender})
                </p>
                <p>
                  <strong>Keluhan Utama:</strong> {selectedCase.chiefComplaint}
                </p>
                <p>
                  <strong>Anamnesis:</strong> {selectedCase.anamnesis}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <p className="font-bold text-slate-900 uppercase">Pemeriksaan Fisik & Spesimen</p>
                <p>
                  <strong>Tanda Vital:</strong> TD {selectedCase.physicalExam.bp}, Nadi{' '}
                  {selectedCase.physicalExam.hr}, Suhu {selectedCase.physicalExam.temp}
                </p>
                <p>
                  <strong>Konjungtiva:</strong> {selectedCase.physicalExam.conjunctiva}
                </p>
                <p>
                  <strong>Spesimen:</strong> {selectedCase.specimenInfo.tubeType} —{' '}
                  {selectedCase.specimenInfo.volumeStatus}
                </p>
              </div>
            </div>

            {/* Raw Hematology Analyzer Output Table */}
            <div className="p-4 rounded-xl bg-slate-900 text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase text-sky-400 flex items-center gap-1.5">
                  <TestTube className="w-4 h-4" /> Hasil Pengukuran Instrumen Hematology Analyzer
                </span>
                <span className="text-xs font-mono text-amber-300">
                  Golongan Darah: {selectedCase.rawLabData.bloodType}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-center font-mono">
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <p className="text-[11px] text-slate-400">Hb (g/dL)</p>
                  <p className="text-base font-bold text-rose-400">{selectedCase.rawLabData.hb}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <p className="text-[11px] text-slate-400">Hct (%)</p>
                  <p className="text-base font-bold text-amber-300">{selectedCase.rawLabData.hct}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <p className="text-[11px] text-slate-400">RBC (10⁶/µL)</p>
                  <p className="text-base font-bold text-sky-300">{selectedCase.rawLabData.rbc}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <p className="text-[11px] text-slate-400">WBC (/µL)</p>
                  <p className="text-base font-bold text-white">{selectedCase.rawLabData.wbc}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <p className="text-[11px] text-slate-400">PLT (/µL)</p>
                  <p className="text-base font-bold text-white">{selectedCase.rawLabData.plt}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <p className="text-[11px] text-slate-400">Retikulosit</p>
                  <p className="text-base font-bold text-emerald-300">
                    {selectedCase.rawLabData.reticulocyte}%
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive ATLM Calculation Verification Box */}
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-950 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-sky-700" />
                  Tugas Verifikasi Indeks Eritrosit oleh Mahasiswa ATLM
                </h4>
                <button
                  onClick={() => {
                    setStudentMcv(String(selectedCase.expectedIndices.mcv));
                    setStudentMch(String(selectedCase.expectedIndices.mch));
                    setStudentMchc(String(selectedCase.expectedIndices.mchc));
                  }}
                  className="text-xs font-mono text-sky-700 underline"
                >
                  Isi Otomatis Hasil Hitung
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-700 mb-1">
                    Hitung MCV (fL) = (Hct×10)/RBC
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={studentMcv}
                    onChange={(e) => setStudentMcv(e.target.value)}
                    placeholder="Masukkan MCV"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-700 mb-1">
                    Hitung MCH (pg) = (Hb×10)/RBC
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={studentMch}
                    onChange={(e) => setStudentMch(e.target.value)}
                    placeholder="Masukkan MCH"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-700 mb-1">
                    Hitung MCHC (g/dL) = (Hb×100)/Hct
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={studentMchc}
                    onChange={(e) => setStudentMchc(e.target.value)}
                    placeholder="Masukkan MCHC"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={verifyStudentCalculation}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
                >
                  Verifikasi Perhitungan Indeks
                </button>
                {verificationFeedback && (
                  <p className="text-xs font-medium text-slate-800">{verificationFeedback}</p>
                )}
              </div>
            </div>

            {/* SADT Findings, ATLM Validation, Doctor Interpretation, Education & Therapy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-900 uppercase mb-1">
                  Temuan Sediaan Apus Darah Tepi (SADT) & Catatan ATLM
                </p>
                <p className="text-slate-700">{selectedCase.smearFindings}</p>
                <p className="text-slate-600 mt-1.5">{selectedCase.atlmValidationNote}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="font-bold text-emerald-950 uppercase mb-1">
                  Interpretasi Klinis Dokter, Edukasi & Rencana Terapi
                </p>
                <p className="text-emerald-900">{selectedCase.doctorInterpretation}</p>
                <p className="text-emerald-800 mt-1.5">
                  <strong>Edukasi & Terapi:</strong> {selectedCase.patientEducation}{' '}
                  {selectedCase.therapyPlan}
                </p>
              </div>
            </div>
          </div>

          {/* Step Navigation Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              disabled={activeStep === 1}
              onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-semibold text-slate-700"
            >
              ← Tahap Sebelumnya
            </button>
            <button
              onClick={() =>
                setActiveStep((s) => (s < WORKFLOW_14_STEPS.length ? s + 1 : 1))
              }
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <span>
                {activeStep < WORKFLOW_14_STEPS.length
                  ? `Lanjut ke Tahap ${activeStep + 1}`
                  : 'Ulangi dari Tahap 1'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
