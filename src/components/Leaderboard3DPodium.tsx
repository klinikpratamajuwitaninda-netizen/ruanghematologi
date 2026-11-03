import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Trophy, Award, Clock, Target, ShieldCheck } from 'lucide-react';

export interface LeaderboardEntry {
  rank: number;
  id: number;
  npm: string;
  rawNpm?: string;
  fullName: string;
  className: string;
  avatarGender: string;
  score: number;
  correctCount: number;
  accuracyPercent: number;
  durationSec: number;
  badgeCategory: string;
}

interface Leaderboard3DPodiumProps {
  entries: LeaderboardEntry[];
  isLecturerView?: boolean;
}

function buildPodiumAvatar(isFemale: boolean, trophyColor: string): THREE.Group {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: '#f1c27d', roughness: 0.45 });
  const coatMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 });
  const scrubMat = new THREE.MeshStandardMaterial({
    color: isFemale ? '#0284c7' : '#0f766e',
    roughness: 0.45,
  });
  const hairMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.6 });
  const trophyMat = new THREE.MeshStandardMaterial({
    color: trophyColor,
    metalness: 0.85,
    roughness: 0.18,
  });

  // Legs
  const legGeo = new THREE.BoxGeometry(0.28, 0.68, 0.28);
  const leftLeg = new THREE.Mesh(legGeo, scrubMat);
  leftLeg.position.set(-0.17, 0.34, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, scrubMat);
  rightLeg.position.set(0.17, 0.34, 0);
  group.add(rightLeg);

  // Torso (ATLM Lab Coat)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.85, 0.38), coatMat);
  torso.position.set(0, 1.1, 0);
  group.add(torso);

  const scrubCenter = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.82, 0.4), scrubMat);
  scrubCenter.position.set(0, 1.1, 0.01);
  group.add(scrubCenter);

  // Raised Celebrating Arms
  const armGeo = new THREE.BoxGeometry(0.22, 0.72, 0.22);
  const leftArm = new THREE.Mesh(armGeo, coatMat);
  leftArm.position.set(-0.48, 1.38, 0);
  leftArm.rotation.z = 0.45;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, coatMat);
  rightArm.position.set(0.48, 1.45, 0.12);
  rightArm.rotation.z = -0.65;
  group.add(rightArm);

  // Trophy held in right hand
  const cupBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.28, 14), trophyMat);
  cupBase.position.set(0.68, 1.78, 0.18);
  group.add(cupBase);

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.52), skinMat);
  head.position.set(0, 1.82, 0);
  group.add(head);

  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.2, 0.56), hairMat);
  hair.position.set(0, 2.06, 0);
  group.add(hair);

  return group;
}

export const Leaderboard3DPodium: React.FC<Leaderboard3DPodiumProps> = ({
  entries,
  isLecturerView = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const rank1 = entries[0];
  const rank2 = entries[1];
  const rank3 = entries[2];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 3.6, 8.2);
    camera.lookAt(0, 1.8, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      return;
    }

    const gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererName = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software|Microsoft Basic Render/i.test(rendererName);

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.2);
    dirLight.position.set(6, 12, 8);
    scene.add(dirLight);

    // Podium Blocks (#1 Center Gold, #2 Left Silver, #3 Right Bronze)
    const goldMat = new THREE.MeshStandardMaterial({
      color: '#eab308',
      metalness: 0.55,
      roughness: 0.25,
    });
    const silverMat = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      metalness: 0.55,
      roughness: 0.28,
    });
    const bronzeMat = new THREE.MeshStandardMaterial({
      color: '#d97706',
      metalness: 0.5,
      roughness: 0.3,
    });

    const podium1 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.5, 1.6), goldMat);
    podium1.position.set(0, 0.75, 0);
    scene.add(podium1);

    const podium2 = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.1, 1.5), silverMat);
    podium2.position.set(-2.1, 0.55, 0.2);
    scene.add(podium2);

    const podium3 = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.85, 1.5), bronzeMat);
    podium3.position.set(2.1, 0.425, 0.35);
    scene.add(podium3);

    const avatars: THREE.Group[] = [];

    if (rank1) {
      const av1 = buildPodiumAvatar(rank1.avatarGender === 'female_atlm', '#facc15');
      av1.position.set(0, 1.5, 0);
      scene.add(av1);
      avatars.push(av1);
    }
    if (rank2) {
      const av2 = buildPodiumAvatar(rank2.avatarGender === 'female_atlm', '#e2e8f0');
      av2.position.set(-2.1, 1.1, 0.2);
      scene.add(av2);
      avatars.push(av2);
    }
    if (rank3) {
      const av3 = buildPodiumAvatar(rank3.avatarGender === 'female_atlm', '#f59e0b');
      av3.position.set(2.1, 0.85, 0.35);
      scene.add(av3);
      avatars.push(av3);
    }

    let rafId = 0;
    let disposed = false;
    const afterDraw = isSoftwareGl
      ? (cb: FrameRequestCallback) => window.setTimeout(() => cb(performance.now()), 33)
      : (cb: FrameRequestCallback) => requestAnimationFrame(cb);

    const animate = (now: number) => {
      if (disposed) return;
      const t = now * 0.001;
      avatars.forEach((av, idx) => {
        av.rotation.y = Math.sin(t * 1.4 + idx) * 0.22;
      });
      renderer.render(scene, camera);
      rafId = afterDraw(animate) as unknown as number;
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(rafId);
      renderer.dispose();
    };
  }, [rank1, rank2, rank3]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> HEMATOLOGY WORLD CHAMPIONS — IKES RAJAWALI
            </span>
            <h2 className="text-2xl font-bold mt-1">
              Podium 3D Juara Kompetensi Hematologi ATLM
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Peringkat otomatis berbasis skor total tertinggi, akurasi jawaban 30 soal klinis & teori, serta kecepatan analisis.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isLecturerView
                ? 'Mode Dosen: NPM Lengkap Ditampilkan'
                : 'Mode Publik: Privasi NPM Tersamarkan'}
            </span>
          </div>
        </div>

        {/* 3D Podium Canvas */}
        <div
          ref={mountRef}
          className="w-full h-[340px] mt-5 rounded-xl overflow-hidden border border-slate-800"
        />

        {/* Top 3 Champion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {[
            { data: rank2, title: 'JUARA 2 — SILVER TROPHY', accent: 'border-slate-400/50 bg-slate-800/60', medal: '🥈 #2' },
            { data: rank1, title: 'JUARA 1 — GOLD CHAMPION', accent: 'border-amber-400/70 bg-amber-500/10', medal: '🥇 #1' },
            { data: rank3, title: 'JUARA 3 — BRONZE TROPHY', accent: 'border-amber-700/60 bg-slate-800/60', medal: '🥉 #3' },
          ].map((slot, i) =>
            slot.data ? (
              <div
                key={i}
                className={`rounded-xl border p-4 ${slot.accent} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                      {slot.title}
                    </span>
                    <span className="text-lg font-bold">{slot.medal}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{slot.data.fullName}</h3>
                  <p className="text-xs text-slate-300 font-mono">
                    NPM: {slot.data.npm} • {slot.data.className}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700/70 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-sky-300 text-sm">
                    {slot.data.score} Poin
                  </span>
                  <span className="text-emerald-300 font-mono">
                    {slot.data.correctCount}/30 ({slot.data.accuracyPercent}%)
                  </span>
                  <span className="text-slate-300 font-mono">
                    {formatDuration(slot.data.durationSec)}
                  </span>
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Complete Ranking Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Tabel Peringkat Kelas & Penghargaan Kategori
            </h3>
            <p className="text-xs text-slate-500">
              Data terintegrasi secara real-time dari hasil penyelesaian 30 soal kuis hematologi.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-mono uppercase border-b border-slate-200">
                <th className="py-3.5 px-4">Peringkat</th>
                <th className="py-3.5 px-4">Mahasiswa ATLM</th>
                <th className="py-3.5 px-4">NPM</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4">Skor Total</th>
                <th className="py-3.5 px-4">Benar / Akurasi</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Penghargaan Kategori</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    #{entry.rank}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {entry.fullName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{entry.npm}</td>
                  <td className="py-3.5 px-4 text-slate-600">{entry.className}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                    {entry.score}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-700">
                    {entry.correctCount}/30 ({entry.accuracyPercent}%)
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDuration(entry.durationSec)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      {entry.badgeCategory}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
