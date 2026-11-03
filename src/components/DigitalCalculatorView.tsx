import React, { useEffect, useState } from 'react';
import { soundManager } from '../utils/soundManager';
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Save,
  History,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface CalculatorHistoryRow {
  id: number;
  npm: string;
  hb: number;
  hct: number;
  rbc: number;
  mcv: number;
  mch: number;
  mchc: number;
  interpretation: string;
  createdAt: string;
}

interface DigitalCalculatorViewProps {
  studentNpm: string;
}

const PRESET_CLINICAL_SAMPLES = [
  {
    label: 'Kasus 1: Anemia Mikrositik Defisiensi Besi',
    hb: '9.5',
    hct: '28.8',
    rbc: '4.0',
  },
  {
    label: 'Kasus 2: Anemia Makrositik Megaloblastik',
    hb: '10.5',
    hct: '36.0',
    rbc: '3.2',
  },
  {
    label: 'Kasus 3: Anemia Normositik Normokromik (CKD)',
    hb: '9.0',
    hct: '27.0',
    rbc: '3.0',
  },
  {
    label: 'Kasus 4: Thalassemia Beta Minor (RBC Tinggi)',
    hb: '10.2',
    hct: '31.8',
    rbc: '5.3',
  },
];

export const DigitalCalculatorView: React.FC<DigitalCalculatorViewProps> = ({ studentNpm }) => {
  const [hbInput, setHbInput] = useState<string>('9.5');
  const [hctInput, setHctInput] = useState<string>('28.8');
  const [rbcInput, setRbcInput] = useState<string>('4.0');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<CalculatorHistoryRow[]>([]);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const loadHistory = () => {
    fetch(`/api/calculator/history?npm=${encodeURIComponent(studentNpm)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.history) setHistory(d.history);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadHistory();
  }, [studentNpm]);

  const hb = parseFloat(hbInput);
  const hct = parseFloat(hctInput);
  const rbc = parseFloat(rbcInput);

  const isValid =
    !isNaN(hb) &&
    !isNaN(hct) &&
    !isNaN(rbc) &&
    hb > 0 &&
    hct > 0 &&
    rbc > 0 &&
    hb <= 28 &&
    hct <= 85 &&
    rbc <= 12;

  const mcv = isValid ? Number(((hct * 10) / rbc).toFixed(2)) : 0;
  const mch = isValid ? Number(((hb * 10) / rbc).toFixed(2)) : 0;
  const mchc = isValid ? Number(((hb * 100) / hct).toFixed(2)) : 0;
  const mentzerIndex = isValid ? Number((mcv / rbc).toFixed(1)) : 0;

  useEffect(() => {
    if (!hbInput.trim() || !hctInput.trim() || !rbcInput.trim()) {
      setErrorMsg('Input Hb, Hematokrit, dan RBC tidak boleh kosong.');
      setWarningMsg(null);
      return;
    }
    if (isNaN(hb) || isNaN(hct) || isNaN(rbc)) {
      setErrorMsg('Masukkan angka numerik yang valid.');
      setWarningMsg(null);
      return;
    }
    if (hb <= 0 || hct <= 0 || rbc <= 0) {
      setErrorMsg('Nilai Hb, Hematokrit, dan RBC harus lebih besar dari 0 (mencegah pembagian nol).');
      setWarningMsg(null);
      return;
    }
    if (hb > 28 || hct > 85 || rbc > 12) {
      setErrorMsg('Nilai berada di luar batas fisiologis manusia (Hb ≤ 28 g/dL, Hct ≤ 85%, RBC ≤ 12 juta/µL).');
      setWarningMsg(null);
      return;
    }
    setErrorMsg(null);

    // Check Rule of Three & MCHC > 38 g/dL physiological warning
    const calcMchc = (hb * 100) / hct;
    const ruleDiff = Math.abs(hb * 3 - hct);
    if (calcMchc > 37.5) {
      setWarningMsg(
        `Peringatan Pra-Analitik ATLM: Nilai MCHC (${calcMchc.toFixed(1)} g/dL) > 36 g/dL! Curigai adanya Sferositosis Herediter atau artefak laboratorium seperti Cold Agglutinin (aglutinasi dingin), Lipemia, atau Hemolisis in vitro.`
      );
    } else if (ruleDiff > 5.5) {
      setWarningMsg(
        `Catatan Rule of Three: Terdapat deviasi antara Hb × 3 (${(hb * 3).toFixed(1)}) dan Hematokrit (${hct}%), khas pada kelainan ukuran/warna eritrosit (mikrositik hipokromik atau makrositik).`
      );
    } else {
      setWarningMsg(null);
    }
  }, [hbInput, hctInput, rbcInput, hb, hct, rbc]);

  const getMcvClass = (val: number) => {
    if (val < 80) return { label: 'Mikrositik (< 80 fL)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (val > 100) return { label: 'Makrositik (> 100 fL)', color: 'text-purple-700 bg-purple-50 border-purple-200' };
    return { label: 'Normositik (80 – 100 fL)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  const getMchClass = (val: number) => {
    if (val < 27) return { label: 'Menurun (< 27 pg)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (val > 33) return { label: 'Meningkat (> 33 pg)', color: 'text-purple-700 bg-purple-50 border-purple-200' };
    return { label: 'Normal (27 – 33 pg)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  const getMchcClass = (val: number) => {
    if (val < 32) return { label: 'Hipokromik (< 32 g/dL)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (val > 36) return { label: 'Meningkat / Sferositosis (> 36 g/dL)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    return { label: 'Normokromik (32 – 36 g/dL)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  const combinedSummary = isValid
    ? `${getMcvClass(mcv).label.split(' ')[0]} ${getMchcClass(mchc).label.split(' ')[0]} (MCV ${mcv} fL, MCH ${mch} pg, MCHC ${mchc} g/dL)`
    : '-';

  const handleSaveCalculation = async () => {
    if (!isValid) return;
    soundManager.playClick();
    try {
      await fetch('/api/calculator/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npm: studentNpm,
          hb,
          hct,
          rbc,
          mcv,
          mch,
          mchc,
          interpretation: combinedSummary,
        }),
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
      loadHistory();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Calculator className="w-4 h-4" /> DIGITAL HEMATOLOGY CALCULATOR (INDEKS ERITROSIT)
            </span>
            <h2 className="text-2xl font-bold mt-1">
              Kalkulator Klinis MCV, MCH & MCHC dengan Substitusi Langkah demi Langkah
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Sesuai rumus infografik PDF ANFIS DARAH Halaman 23 & 40 — dilengkapi validasi Rule of Three dan deteksi artefak.
            </p>
          </div>
        </div>

        {/* Preset Clinical Case Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Contoh Kasus Klinis:</span>
          {PRESET_CLINICAL_SAMPLES.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundManager.playClick();
                setHbInput(p.hb);
                setHctInput(p.hct);
                setRbcInput(p.rbc);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-sky-600 text-xs font-medium text-slate-200 hover:text-white border border-slate-700 transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Panel */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span>Input Parameter CBC Pasien</span>
            <button
              onClick={() => {
                setHbInput('12.0');
                setHctInput('36.0');
                setRbcInput('4.0');
              }}
              className="text-xs font-mono text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Normal
            </button>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                1. Kadar Hemoglobin (Hb) — Satuan: g/dL
              </label>
              <input
                type="number"
                step="0.1"
                value={hbInput}
                onChange={(e) => setHbInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-base focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Contoh: 9.5"
              />
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Rujukan Dewasa: Pria 13,5–18,0 g/dL (WHO ≥13,0) | Wanita 12,0–16,0 g/dL
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                2. Nilai Hematokrit (Hct / PCV) — Satuan: %
              </label>
              <input
                type="number"
                step="0.1"
                value={hctInput}
                onChange={(e) => setHctInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-base focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Contoh: 28.8"
              />
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Rujukan Dewasa: Pria 40–54% | Wanita 38–46%
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                3. Jumlah Eritrosit (RBC) — Satuan: juta/µL (10⁶/µL)
              </label>
              <input
                type="number"
                step="0.1"
                value={rbcInput}
                onChange={(e) => setRbcInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-base focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Contoh: 4.0"
              />
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Rujukan Dewasa: Pria ~4,7–6,1 juta/µL | Wanita ~4,2–5,4 juta/µL
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {warningMsg && !errorMsg && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{warningMsg}</span>
            </div>
          )}

          <button
            disabled={!isValid}
            onClick={handleSaveCalculation}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            {savedToast ? 'Tersimpan ke Riwayat Database!' : 'Simpan Hasil Perhitungan ke Database'}
          </button>
        </div>

        {/* Right Step-by-Step Substitution & Output Cards */}
        <div className="lg:col-span-7 space-y-4">
          {isValid ? (
            <>
              {/* 1. MCV Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase text-sky-700">
                      1. Mean Corpuscular Volume (MCV) — Ukuran Volume Sel
                    </span>
                    <h4 className="text-2xl font-mono font-bold text-slate-900 mt-0.5">
                      {mcv} fL <span className="text-xs font-normal text-slate-500">(femtoliter)</span>
                    </h4>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold border ${getMcvClass(mcv).color}`}
                  >
                    {getMcvClass(mcv).label}
                  </span>
                </div>
                <div className="mt-3 p-3 rounded-xl bg-slate-900 text-sky-300 font-mono text-xs">
                  Rumus: MCV = (Hct (%) × 10) / RBC (juta/µL)
                  <br />
                  Substitusi: MCV = ({hct} × 10) / {rbc} = {(hct * 10).toFixed(1)} / {rbc} ={' '}
                  <strong className="text-white">{mcv} fL</strong> (Nilai Rujukan: 80 – 100 fL)
                </div>
              </div>

              {/* 2. MCH Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase text-emerald-700">
                      2. Mean Corpuscular Hemoglobin (MCH) — Bobot Hb per Sel
                    </span>
                    <h4 className="text-2xl font-mono font-bold text-slate-900 mt-0.5">
                      {mch} pg <span className="text-xs font-normal text-slate-500">(pikogram)</span>
                    </h4>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold border ${getMchClass(mch).color}`}
                  >
                    {getMchClass(mch).label}
                  </span>
                </div>
                <div className="mt-3 p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs">
                  Rumus: MCH = (Hb (g/dL) × 10) / RBC (juta/µL)
                  <br />
                  Substitusi: MCH = ({hb} × 10) / {rbc} = {(hb * 10).toFixed(1)} / {rbc} ={' '}
                  <strong className="text-white">{mch} pg</strong> (Nilai Rujukan: 27 – 33 pg)
                </div>
              </div>

              {/* 3. MCHC Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase text-indigo-700">
                      3. Mean Corpuscular Hemoglobin Concentration (MCHC) — Konsentrasi Warna Hb
                    </span>
                    <h4 className="text-2xl font-mono font-bold text-slate-900 mt-0.5">
                      {mchc} g/dL <span className="text-xs font-normal text-slate-500">(gram/desiliter)</span>
                    </h4>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold border ${getMchcClass(mchc).color}`}
                  >
                    {getMchcClass(mchc).label}
                  </span>
                </div>
                <div className="mt-3 p-3 rounded-xl bg-slate-900 text-indigo-300 font-mono text-xs">
                  Rumus: MCHC = (Hb (g/dL) × 100) / Hct (%)
                  <br />
                  Substitusi: MCHC = ({hb} × 100) / {hct} = {(hb * 100).toFixed(1)} / {hct} ={' '}
                  <strong className="text-white">{mchc} g/dL</strong> (Nilai Rujukan: 32 – 36 g/dL)
                </div>
              </div>

              {/* Clinical Conclusion & Mentzer Index */}
              <div className="bg-sky-50 rounded-2xl border border-sky-200 p-5 text-sm text-slate-800">
                <h4 className="font-bold text-sky-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  Kesimpulan Morfologi Eritrosit & Indeks Mentzer (ATLM Note)
                </h4>
                <p className="font-bold text-base text-slate-900 mt-1">{combinedSummary}</p>
                {mcv < 80 && (
                  <p className="text-xs text-slate-700 mt-2">
                    • <strong>Indeks Mentzer (MCV / RBC)</strong> = {mcv} / {rbc} ={' '}
                    <strong className="font-mono">{mentzerIndex}</strong>.{' '}
                    {mentzerIndex < 13
                      ? 'Nilai < 13 mengarahkan kecurigaan pada Thalassemia Trait (gangguan sintesis rantai globin dengan jumlah RBC relatif tinggi).'
                      : 'Nilai > 13 mengarahkan kecurigaan pada Anemia Defisiensi Besi (perlu konfirmasi Ferritin serum).'}
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Saved History Table */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-sky-600" />
            Riwayat Perhitungan Indeks Eritrosit Tersimpan
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-mono text-slate-600">
                  <th className="py-2.5 px-3">Hb (g/dL)</th>
                  <th className="py-2.5 px-3">Hct (%)</th>
                  <th className="py-2.5 px-3">RBC (juta/µL)</th>
                  <th className="py-2.5 px-3">MCV (fL)</th>
                  <th className="py-2.5 px-3">MCH (pg)</th>
                  <th className="py-2.5 px-3">MCHC (g/dL)</th>
                  <th className="py-2.5 px-3">Interpretasi Morfologi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">{h.hb}</td>
                    <td className="py-2.5 px-3">{h.hct}</td>
                    <td className="py-2.5 px-3">{h.rbc}</td>
                    <td className="py-2.5 px-3 font-bold text-sky-700">{h.mcv}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{h.mch}</td>
                    <td className="py-2.5 px-3 font-bold text-indigo-700">{h.mchc}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-700">{h.interpretation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
