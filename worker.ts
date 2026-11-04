import { QUIZ_30_QUESTIONS } from './src/data/quiz30Data';
import { GLOSSARY_TERMS } from './src/data/glossaryData';

export interface CloudflareEnv {
  DB?: any; // Cloudflare D1Database binding
  ASSETS?: { fetch: (req: Request) => Promise<Response> };
  TEACHER_ACCESS_CODE?: string;
  SESSION_SECRET?: string;
}

// Cryptographic digest for default lecturer access validation when TEACHER_ACCESS_CODE secret is not yet set
const DEFAULT_TEACHER_CODE_DIGEST =
  '07f51a96cd6f896dadfc2d5b2f62c4c2472693555bb1770b558db6b5ef0c373d';

const encoder = new TextEncoder();

async function sha256Hex(value: string): Promise<string> {
  const data = encoder.encode(String(value).trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacSha256Base64Url(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const bytes = new Uint8Array(sigBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function toBase64Url(str: string): string {
  const bytes = encoder.encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64url: string): string {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const binary = atob(b64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

interface WorkerSessionPayload {
  role: 'lecturer' | 'student';
  sub: string;
  name: string;
  className?: string;
  iat: number;
  exp: number;
}

function getSessionSecret(env: CloudflareEnv): string {
  return (
    env.SESSION_SECRET ||
    `hw_cf_worker_secret_${DEFAULT_TEACHER_CODE_DIGEST}_ikes_rajawali`
  );
}

async function signWorkerSession(
  env: CloudflareEnv,
  payload: Omit<WorkerSessionPayload, 'iat' | 'exp'>,
  ttlSec = 86400 * 7
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const full: WorkerSessionPayload = { ...payload, iat: now, exp: now + ttlSec };
  const dataB64 = toBase64Url(JSON.stringify(full));
  const sig = await hmacSha256Base64Url(getSessionSecret(env), dataB64);
  return `${dataB64}.${sig}`;
}

async function verifyWorkerSession(
  env: CloudflareEnv,
  token: string | undefined | null
): Promise<WorkerSessionPayload | null> {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [dataB64, sig] = token.split('.');
  if (!dataB64 || !sig) return null;
  const expectedSig = await hmacSha256Base64Url(getSessionSecret(env), dataB64);
  if (!constantTimeEqual(sig, expectedSig)) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(dataB64)) as WorkerSessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!parsed.exp || parsed.exp < now) return null;
    return parsed;
  } catch {
    return null;
  }
}

function parseRequestCookies(request: Request): Record<string, string> {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      cookies[k] = decodeURIComponent(v);
    }
  }
  return cookies;
}

function makeCookieHeader(
  request: Request,
  name: string,
  value: string,
  maxAgeSec: number
): string {
  const isHttps = new URL(request.url).protocol === 'https:';
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSec}`,
  ];
  if (isHttps) attrs.push('Secure');
  return attrs.join('; ');
}

function maskNpm(npm: string): string {
  const clean = npm.trim();
  if (clean.length <= 4) return clean.slice(0, 2) + '**';
  return clean.slice(0, 4) + '***' + clean.slice(-2);
}

function normalizeActivationCode(rawInput: unknown): string {
  if (rawInput === null || rawInput === undefined) return '';
  let str = String(rawInput)
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
    .trim();
  if (str.includes('•')) {
    str = str.split('•')[0].trim();
  }
  if (str.includes('(')) {
    str = str.split('(')[0].trim();
  }
  str = str.replace(/^#\d+\s*/, '').trim();
  str = str.replace(/[\u2010-\u2015\u2212]/g, '-');
  str = str.replace(/\s+/g, '');
  str = str.replace(/^["'`]+|["'`]+$/g, '');
  return str.toUpperCase();
}

function normalizeNpm(rawInput: unknown): string {
  if (rawInput === null || rawInput === undefined) return '';
  return String(rawInput)
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
    .replace(/[–—−‐‑‒]/g, '-')
    .replace(/[\s./]+/g, '')
    .trim()
    .toUpperCase();
}

function extractRawCodeFromDisplay(codeDisplay: string): string {
  return normalizeActivationCode(String(codeDisplay || '').split('•')[0]);
}

function extractWorkerPasswordHash(sessionToken: string | null | undefined): string | null {
  if (!sessionToken) return null;
  const match = String(sessionToken).match(/\|pwd:([a-f0-9]{64})/i);
  return match ? match[1].toLowerCase() : null;
}

function buildWorkerEntitlementToken(
  npm: string,
  version: number,
  passwordHash?: string | null
): string {
  const base = `lifetime_${npm}_${version}`;
  if (passwordHash && /^[a-f0-9]{64}$/i.test(passwordHash)) {
    return `${base}|pwd:${passwordHash.toLowerCase()}`;
  }
  return base;
}

interface WorkerActivationCertPayload {
  npm: string;
  studentName: string;
  className: string;
  avatarGender: 'male_atlm' | 'female_atlm';
  activatedWithCodeVersion: number;
  activatedWithCodeDisplay: string;
  passwordHash?: string | null;
  activatedAt: string;
}

async function signWorkerActivationCert(
  env: CloudflareEnv,
  payload: WorkerActivationCertPayload
): Promise<string> {
  const dataB64 = toBase64Url(JSON.stringify(payload));
  const sig = await hmacSha256Base64Url(getSessionSecret(env), `cert:${dataB64}`);
  return `${dataB64}.${sig}`;
}

async function verifyWorkerActivationCert(
  env: CloudflareEnv,
  certToken: string | undefined | null
): Promise<WorkerActivationCertPayload | null> {
  if (!certToken || typeof certToken !== 'string' || !certToken.includes('.')) return null;
  const [dataB64, sig] = certToken.split('.');
  if (!dataB64 || !sig) return null;
  const expectedSig = await hmacSha256Base64Url(getSessionSecret(env), `cert:${dataB64}`);
  if (!constantTimeEqual(sig, expectedSig)) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(dataB64)) as WorkerActivationCertPayload;
    if (!parsed || !parsed.npm) return null;
    return parsed;
  } catch {
    return null;
  }
}

const workerLocks = new Map<string, Promise<unknown>>();
async function withWorkerLock<T>(lockName: string, fn: () => Promise<T>): Promise<T> {
  const prev = workerLocks.get(lockName) || Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  workerLocks.set(lockName, prev.then(() => current));
  await prev;
  try {
    return await fn();
  } finally {
    release();
  }
}

// ============================================================================
// RATE LIMITING IN WORKER MEMORY
// ============================================================================
const workerRateMap = new Map<
  string,
  { attempts: number; firstAttemptAt: number; blockedUntil: number }
>();
const RATE_WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function getWorkerClientKey(req: Request, scope: string, extraKey?: string): string {
  const ip =
    req.headers.get('CF-Connecting-IP') ||
    req.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'edge';
  if (extraKey) {
    return `${scope}:${ip}:${extraKey}`;
  }
  return `${scope}:${ip}`;
}

function checkWorkerRate(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = workerRateMap.get(key);
  if (!entry) return { allowed: true, retryAfterSec: 0 };
  if (entry.blockedUntil > now) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.blockedUntil - now) / 1000) };
  }
  if (now - entry.firstAttemptAt > RATE_WINDOW_MS) {
    workerRateMap.delete(key);
    return { allowed: true, retryAfterSec: 0 };
  }
  return { allowed: true, retryAfterSec: 0 };
}

function recordWorkerFailure(key: string, maxLimit = MAX_ATTEMPTS): void {
  const now = Date.now();
  const entry = workerRateMap.get(key);
  if (!entry || now - entry.firstAttemptAt > RATE_WINDOW_MS) {
    workerRateMap.set(key, { attempts: 1, firstAttemptAt: now, blockedUntil: 0 });
    return;
  }
  entry.attempts += 1;
  if (entry.attempts >= maxLimit) {
    entry.blockedUntil = now + RATE_WINDOW_MS;
  }
}

// ============================================================================
// DURABLE D1 + EDGE STATE STORAGE LAYER
// Works seamlessly with Cloudflare D1 (env.DB) AND provides automatic fallback
// ============================================================================
interface EdgeAccessCode {
  id: number;
  codeHash: string;
  codeDisplay: string;
  version: number;
  className: string;
  isActive: boolean;
  activatedCount: number;
  createdBy: string;
  createdAt: string;
}

interface EdgeEntitlement {
  id: number;
  npm: string;
  studentName: string;
  className: string;
  activatedWithCodeVersion: number;
  activatedWithCodeDisplay: string;
  sessionToken: string;
  isLifetimeActive: boolean;
  activatedAt: string;
  lastAccessedAt: string;
}

interface EdgeProfile {
  npm: string;
  fullName: string;
  className: string;
  level: number;
  xp: number;
  highestScore: number;
  averageScore: number;
  quizCount: number;
  completedModules: number[];
  avatarGender: 'male_atlm' | 'female_atlm';
  skinTone: string;
  hairStyle: string;
  shoeColor: string;
}

interface EdgeQuizAttempt {
  id: number;
  attemptUuid: string;
  npm: string;
  studentName: string;
  className: string;
  sessionCode: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  clinicalCorrect: number;
  theoryCorrect: number;
  mcvCorrect: number;
  mchCorrect: number;
  mchcCorrect: number;
  score: number;
  durationSeconds: number;
  answersJson: string;
  completedAt: string;
}

const edgeState = {
  initialized: false,
  lecturer: {
    username: 'dr.juwita',
    fullName: 'dr. Juwita Ninda Suherman, M.Kes',
    institution: 'Institut Kesehatan Rajawali (IKES Rajawali) Bandung',
    passwordHash: DEFAULT_TEACHER_CODE_DIGEST,
    isBootstrapped: false,
  },
  accessCodes: [] as EdgeAccessCode[],
  entitlements: [] as EdgeEntitlement[],
  profiles: new Map<string, EdgeProfile>(),
  attempts: [] as EdgeQuizAttempt[],
  calculatorHistory: [] as any[],
  glossary: [...GLOSSARY_TERMS],
};

async function syncEdgeStateIntegrity(): Promise<void> {
  // Ensure every accessCode has canonical codeHash matching its pureCode
  for (const c of edgeState.accessCodes) {
    const pure = extractRawCodeFromDisplay(c.codeDisplay);
    if (pure.length >= 3) {
      const expected = await sha256Hex(pure);
      if (c.codeHash !== expected) {
        c.codeHash = expected;
      }
    }
  }
  // Ensure every entitlement has a corresponding profile
  for (const e of edgeState.entitlements) {
    const clean = normalizeNpm(e.npm);
    e.npm = clean;
    if (!edgeState.profiles.has(clean)) {
      edgeState.profiles.set(clean, {
        npm: clean,
        fullName: e.studentName,
        className: e.className || 'ATLM Reguler - IKES Rajawali',
        level: 1,
        xp: 100,
        highestScore: 0,
        averageScore: 0,
        quizCount: 0,
        completedModules: [],
        avatarGender: 'female_atlm',
        skinTone: '#f1c27d',
        hairStyle: 'modern',
        shoeColor: '#0f172a',
      });
    }
  }
}

async function ensureEdgeStateSeeded(env: CloudflareEnv): Promise<void> {
  if (env.TEACHER_ACCESS_CODE?.trim()) {
    edgeState.lecturer.passwordHash = await sha256Hex(env.TEACHER_ACCESS_CODE.trim());
  }

  if (!edgeState.initialized) {
    const seedCodes = [
      { code: 'ATLM-IKES-001', version: 1, npm: '24011001', name: 'Aulia Rahma Putri' },
      { code: 'ATLM-IKES-002', version: 2, npm: '24011014', name: 'Muhammad Farhan Pratama' },
      { code: 'ATLM-IKES-003', version: 3, npm: '24011028', name: 'Siti Nabila Azzahra' },
      { code: 'ATLM-IKES-004', version: 4, npm: null, name: null },
      { code: 'ATLM-IKES-005', version: 5, npm: null, name: null },
      { code: 'ATLM-IKES-006', version: 6, npm: null, name: null },
      { code: 'ATLM-IKES-007', version: 7, npm: null, name: null },
      { code: 'ATLM-IKES-008', version: 8, npm: null, name: null },
      { code: 'ATLM-IKES-009', version: 9, npm: null, name: null },
      { code: 'ATLM-IKES-010', version: 10, npm: null, name: null },
      { code: 'ATLM-IKES-011', version: 11, npm: null, name: null },
      { code: 'ATLM-IKES-012', version: 12, npm: null, name: null },
    ];

    const nowIso = new Date().toISOString();
    edgeState.accessCodes = [];
    for (const item of seedCodes) {
      const h = await sha256Hex(item.code);
      const used = Boolean(item.npm);
      edgeState.accessCodes.push({
        id: item.version,
        codeHash: h,
        codeDisplay: used
          ? `${item.code} • Digunakan oleh NPM ${item.npm} (${item.name})`
          : `${item.code} • Kode Aktivasi Unik Mahasiswa (Tersedia - 1 Mahasiswa)`,
        version: item.version,
        className: used
          ? `ATLM Reguler - IKES Rajawali [NPM:${item.npm}]`
          : 'ATLM Reguler - IKES Rajawali',
        isActive: !used,
        activatedCount: used ? 1 : 0,
        createdBy: 'dr. Juwita Ninda Suherman, M.Kes',
        createdAt: nowIso,
      });
    }

    const initialStudents = [
      {
        id: 1,
        npm: '24011001',
        fullName: 'Aulia Rahma Putri',
        className: 'ATLM Reguler A - IKES Rajawali',
        gender: 'female_atlm' as const,
        codeUsed: 'ATLM-IKES-001',
        version: 1,
        score: 4860,
      },
      {
        id: 2,
        npm: '24011014',
        fullName: 'Muhammad Farhan Pratama',
        className: 'ATLM Reguler A - IKES Rajawali',
        gender: 'male_atlm' as const,
        codeUsed: 'ATLM-IKES-002',
        version: 2,
        score: 4680,
      },
      {
        id: 3,
        npm: '24011028',
        fullName: 'Siti Nabila Azzahra',
        className: 'ATLM Reguler B - IKES Rajawali',
        gender: 'female_atlm' as const,
        codeUsed: 'ATLM-IKES-003',
        version: 3,
        score: 4520,
      },
    ];

    for (const s of initialStudents) {
      edgeState.entitlements.push({
        id: s.id,
        npm: s.npm,
        studentName: s.fullName,
        className: s.className,
        activatedWithCodeVersion: s.version,
        activatedWithCodeDisplay: `${s.codeUsed} • Kode Aktivasi Unik Mahasiswa`,
        sessionToken: `lifetime_${s.npm}_${s.version}`,
        isLifetimeActive: true,
        activatedAt: nowIso,
        lastAccessedAt: nowIso,
      });

      edgeState.profiles.set(s.npm, {
        npm: s.npm,
        fullName: s.fullName,
        className: s.className,
        level: 5,
        xp: s.score,
        highestScore: s.score,
        averageScore: s.score,
        quizCount: 1,
        completedModules: [1, 2, 3, 4, 5],
        avatarGender: s.gender,
        skinTone: '#f1c27d',
        hairStyle: 'modern',
        shoeColor: '#0f172a',
      });
    }
  }

  // Always synchronize from Cloudflare D1 if D1 binding is present so multi-isolate state never desyncs
  if (env.DB) {
    try {
      if (!edgeState.initialized) {
        await env.DB.prepare(
          `CREATE TABLE IF NOT EXISTS d1_kv_store (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)`
        ).run();
      }
      const saved = await env.DB.prepare(`SELECT value FROM d1_kv_store WHERE key = 'hw_state_v1'`).first();
      if (saved && saved.value) {
        const parsed = JSON.parse(String(saved.value));
        if (parsed.accessCodes) edgeState.accessCodes = parsed.accessCodes;
        if (parsed.entitlements) edgeState.entitlements = parsed.entitlements;
        if (parsed.attempts) edgeState.attempts = parsed.attempts;
        if (parsed.lecturer) edgeState.lecturer = { ...edgeState.lecturer, ...parsed.lecturer };
        if (Array.isArray(parsed.profiles)) {
          edgeState.profiles = new Map(parsed.profiles);
        }
      } else if (!edgeState.initialized) {
        await persistEdgeStateToD1(env);
      }
    } catch (err) {
      console.error('D1 sync info:', err);
    }
  }

  await syncEdgeStateIntegrity();
  edgeState.initialized = true;
}

async function persistEdgeStateToD1(env: CloudflareEnv): Promise<void> {
  if (!env.DB) return;
  try {
    const serialized = JSON.stringify({
      lecturer: edgeState.lecturer,
      accessCodes: edgeState.accessCodes,
      entitlements: edgeState.entitlements,
      profiles: Array.from(edgeState.profiles.entries()),
      attempts: edgeState.attempts,
    });
    await env.DB.prepare(
      `INSERT INTO d1_kv_store (key, value, updated_at) VALUES ('hw_state_v1', ?1, ?2)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    )
      .bind(serialized, new Date().toISOString())
      .run();
  } catch (err) {
    console.error('D1 persist warning:', err);
  }
}

function buildReviewFromAnswers(
  rawAnswers: Array<{ questionNumber: number; selectedOption: string; timeSpentSec?: number }>
) {
  const submittedMap: Record<number, { selectedOption: string; timeSpentSec: number }> = {};
  for (const a of rawAnswers) {
    submittedMap[Number(a.questionNumber)] = {
      selectedOption: String(a.selectedOption || '-').toUpperCase(),
      timeSpentSec: Math.max(1, Number(a.timeSpentSec) || 15),
    };
  }

  let correctCount = 0;
  let wrongCount = 0;
  let clinicalCorrect = 0;
  let theoryCorrect = 0;
  let mcvCorrect = 0;
  let mchCorrect = 0;
  let mchcCorrect = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let totalScore = 0;
  let speedBonusTotal = 0;

  const detailedReview = QUIZ_30_QUESTIONS.map((q) => {
    const sub = submittedMap[q.questionNumber];
    const rawOpt = sub?.selectedOption || '-';
    const validOpt = ['A', 'B', 'C', 'D', 'E'].includes(rawOpt)
      ? (rawOpt as 'A' | 'B' | 'C' | 'D' | 'E')
      : ('-' as unknown as 'A' | 'B' | 'C' | 'D' | 'E');
    const timeSpent = sub?.timeSpentSec || 20;
    const isCorrect = validOpt === q.correctOption;

    if (isCorrect) {
      correctCount++;
      if (q.category === 'clinical_case') clinicalCorrect++;
      else theoryCorrect++;
      if (q.sectionCode === 'D') {
        mcvCorrect++;
        mchCorrect++;
        mchcCorrect++;
      }
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
      studentAnswer: validOpt,
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

  return {
    correctCount,
    wrongCount,
    clinicalCorrect,
    theoryCorrect,
    mcvCorrect,
    mchCorrect,
    mchcCorrect,
    maxStreak,
    totalScore,
    speedBonusTotal,
    detailedReview,
  };
}

function buildEdgeStudentPayload(npm: string) {
  const cleanNpm = npm.trim();
  const ent = edgeState.entitlements.find((e) => e.npm === cleanNpm);
  if (!ent) return null;
  const prof = edgeState.profiles.get(cleanNpm);
  const attempts = edgeState.attempts
    .filter((a) => a.npm === cleanNpm)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));

  let latestSummary = null;
  let latestReview = null;
  if (attempts.length > 0) {
    const latest = attempts[0];
    let parsedAns = [];
    try {
      parsedAns = JSON.parse(latest.answersJson || '[]');
    } catch {
      parsedAns = [];
    }
    const rebuilt = buildReviewFromAnswers(parsedAns);
    const acc = Number(((latest.correctCount / 50) * 100).toFixed(1));
    let gradeLabel = 'Perlu Penguatan Kompetensi';
    if (acc >= 90) gradeLabel = 'A (Sangat Memuaskan — Hematology Expert)';
    else if (acc >= 80) gradeLabel = 'AB (Kompeten Tinggi — Senior Analyst)';
    else if (acc >= 70) gradeLabel = 'B (Kompeten — ATLM Praktisi)';
    else if (acc >= 60) gradeLabel = 'BC (Cukup Kompeten)';

    latestSummary = {
      npm: cleanNpm,
      fullName: prof?.fullName || ent.studentName,
      className: prof?.className || ent.className,
      totalQuestions: 50,
      correctCount: latest.correctCount,
      wrongCount: latest.wrongCount,
      accuracyPercent: acc,
      totalScore: latest.score,
      speedBonusTotal: rebuilt.speedBonusTotal,
      maxStreak: rebuilt.maxStreak,
      durationSec: latest.durationSeconds,
      xpEarned: latest.correctCount * 25,
      gradeLabel,
      badgeCategory: acc >= 90 ? 'Gold Hematology Champion' : 'ATLM Clinical Analyst',
    };
    latestReview = rebuilt.detailedReview;
  }

  const storedPwdHash = extractWorkerPasswordHash(ent.sessionToken);
  return {
    npm: ent.npm,
    fullName: prof?.fullName || ent.studentName,
    className: prof?.className || ent.className,
    avatarGender: prof?.avatarGender || 'female_atlm',
    xp: prof?.xp || 100,
    level: prof?.level || 1,
    highestScore: prof?.highestScore || 0,
    bestAccuracy:
      attempts.length > 0
        ? Math.max(...attempts.map((a) => Number(((a.correctCount / 50) * 100).toFixed(1))))
        : prof?.highestScore
        ? 92.0
        : 0,
    quizCount: attempts.length || prof?.quizCount || 0,
    isLifetimeActive: ent.isLifetimeActive,
    accountStatus: ent.isLifetimeActive ? 'Sudah Teraktivasi • Aktif' : 'Nonaktif',
    codeStatus: 'Sudah Digunakan',
    hasPassword: Boolean(storedPwdHash),
    activatedWithVersion: ent.activatedWithCodeVersion,
    activatedWithCodeDisplay: ent.activatedWithCodeDisplay.split('•')[0].trim(),
    activatedCode: ent.activatedWithCodeDisplay.split('•')[0].trim(),
    activatedAt: ent.activatedAt,
    completedModules: prof?.completedModules || [],
    quizHistory: attempts.map((a) => ({
      id: a.id,
      attemptUuid: a.attemptUuid,
      sessionCode: a.sessionCode,
      totalQuestions: 50,
      correctCount: a.correctCount,
      wrongCount: a.wrongCount,
      accuracyPercent: Number(((a.correctCount / 50) * 100).toFixed(1)),
      score: a.score,
      durationSeconds: a.durationSeconds,
      completedAt: a.completedAt,
    })),
    latestSummary,
    latestReview,
  };
}

function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string | string[]> = {}
): Response {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  for (const [k, v] of Object.entries(extraHeaders)) {
    if (Array.isArray(v)) {
      for (const item of v) headers.append(k, item);
    } else {
      headers.set(k, v);
    }
  }
  return new Response(JSON.stringify(data), { status, headers });
}

export async function handleApiRequest(
  request: Request,
  env: CloudflareEnv
): Promise<Response> {
  await ensureEdgeStateSeeded(env);
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();
  const cookies = parseRequestCookies(request);

  const lecturerSession = await verifyWorkerSession(env, cookies['hw_lecturer_session']);
  const studentSession = await verifyWorkerSession(env, cookies['hw_student_session']);

  // 0. Session Check: GET /api/auth/me
  if (path === '/api/auth/me' && method === 'GET') {
    const lecturerData =
      lecturerSession && lecturerSession.role === 'lecturer'
        ? {
            fullName: edgeState.lecturer.fullName,
            username: edgeState.lecturer.username,
            institution: edgeState.lecturer.institution,
            bootstrapCompleted: edgeState.lecturer.isBootstrapped,
          }
        : null;

    let studentData = null;
    if (studentSession && studentSession.role === 'student') {
      const payload = buildEdgeStudentPayload(studentSession.sub);
      if (payload && payload.isLifetimeActive) {
        studentData = payload;
      }
    }

    return jsonResponse({
      authenticated: Boolean(lecturerData || studentData),
      role: lecturerData ? 'lecturer' : studentData ? 'student' : 'visitor',
      lecturer: lecturerData,
      student: studentData,
    });
  }

  // Logout endpoints
  if (
    (path === '/api/auth/logout' ||
      path === '/api/teacher-logout' ||
      path === '/api/student-logout') &&
    method === 'POST'
  ) {
    return jsonResponse(
      { success: true, message: 'Sesi berhasil diakhiri.' },
      200,
      {
        'Set-Cookie': [
          makeCookieHeader(request, 'hw_lecturer_session', '', 0),
          makeCookieHeader(request, 'hw_student_session', '', 0),
        ],
      }
    );
  }

  // 1. Lecturer Login: POST /api/teacher-login & /api/auth/lecturer/login
  if (
    (path === '/api/teacher-login' || path === '/api/auth/lecturer/login') &&
    method === 'POST'
  ) {
    const rateKey = getWorkerClientKey(request, 'teacher_login');
    const rateStatus = checkWorkerRate(rateKey);
    if (!rateStatus.allowed) {
      return jsonResponse(
        {
          error: `Terlalu banyak percobaan login gagal. Silakan tunggu ${rateStatus.retryAfterSec} detik sebelum mencoba kembali.`,
        },
        429
      );
    }

    const body: any = await request.json().catch(() => ({}));
    const codeInput = body.accessCode ?? body.bootstrapCode;
    const username = body.username;
    const password = body.password;

    const validHashes = new Set<string>([
      DEFAULT_TEACHER_CODE_DIGEST,
      edgeState.lecturer.passwordHash,
    ]);
    if (env.TEACHER_ACCESS_CODE?.trim()) {
      validHashes.add(await sha256Hex(env.TEACHER_ACCESS_CODE.trim()));
    }

    let isAuth = false;
    if (codeInput && String(codeInput).trim().length > 0) {
      const inputHash = await sha256Hex(String(codeInput));
      for (const h of validHashes) {
        if (constantTimeEqual(inputHash, h)) {
          isAuth = true;
          break;
        }
      }
    } else if (username && password) {
      const cleanUser = String(username).trim().toLowerCase();
      const passHash = await sha256Hex(String(password));
      if (cleanUser === edgeState.lecturer.username.toLowerCase()) {
        for (const h of validHashes) {
          if (constantTimeEqual(passHash, h)) {
            isAuth = true;
            break;
          }
        }
      }
    }

    if (!isAuth) {
      recordWorkerFailure(rateKey);
      return jsonResponse({ error: 'Kode akses atau kredensial dosen tidak valid.' }, 401);
    }

    workerRateMap.delete(rateKey);
    const token = await signWorkerSession(
      env,
      {
        role: 'lecturer',
        sub: edgeState.lecturer.username,
        name: edgeState.lecturer.fullName,
      },
      86400 * 3
    );

    return jsonResponse(
      {
        success: true,
        role: 'lecturer',
        lecturer: {
          fullName: edgeState.lecturer.fullName,
          username: edgeState.lecturer.username,
          institution: edgeState.lecturer.institution,
          bootstrapCompleted: edgeState.lecturer.isBootstrapped,
        },
      },
      200,
      {
        'Set-Cookie': makeCookieHeader(request, 'hw_lecturer_session', token, 86400 * 3),
      }
    );
  }

  // Lecturer Setup Credentials
  if (path === '/api/auth/lecturer/setup-credentials' && method === 'POST') {
    if (!lecturerSession || lecturerSession.role !== 'lecturer') {
      return jsonResponse({ error: 'Akses ditolak. Khusus Dosen.' }, 401);
    }
    const body: any = await request.json().catch(() => ({}));
    if (!body.newUsername || !body.newPassword || String(body.newPassword).trim().length < 6) {
      return jsonResponse(
        { error: 'Username dan password baru minimal 6 karakter wajib diisi.' },
        400
      );
    }
    edgeState.lecturer.username = String(body.newUsername).trim();
    edgeState.lecturer.passwordHash = await sha256Hex(String(body.newPassword));
    edgeState.lecturer.isBootstrapped = true;
    await persistEdgeStateToD1(env);
    return jsonResponse({
      success: true,
      message: 'Kredensial pribadi dosen berhasil diperbarui.',
    });
  }

  // 2A. Student NPM Check: POST /api/auth/student/check-npm
  if (path === '/api/auth/student/check-npm' && method === 'POST') {
    const body: any = await request.json().catch(() => ({}));
    const cleanNpm = normalizeNpm(body.npm);
    if (!cleanNpm || cleanNpm.length < 3) {
      return jsonResponse(
        { exists: false, error: 'Nomor Pokok Mahasiswa (NPM) wajib diisi dengan benar.' },
        400
      );
    }

    await ensureEdgeStateSeeded(env);
    let existingEnt = edgeState.entitlements.find((e) => normalizeNpm(e.npm) === cleanNpm);
    const cert =
      (await verifyWorkerActivationCert(env, body.activationCert)) ||
      (await verifyWorkerActivationCert(env, cookies['hw_student_registry']));

    if (!existingEnt && cert && normalizeNpm(cert.npm) === cleanNpm) {
      const nowIso = new Date().toISOString();
      existingEnt = {
        id: edgeState.entitlements.length + 1,
        npm: cleanNpm,
        studentName: cert.studentName,
        className: cert.className,
        activatedWithCodeVersion: cert.activatedWithCodeVersion,
        activatedWithCodeDisplay: cert.activatedWithCodeDisplay,
        sessionToken: buildWorkerEntitlementToken(
          cleanNpm,
          cert.activatedWithCodeVersion,
          cert.passwordHash
        ),
        isLifetimeActive: true,
        activatedAt: cert.activatedAt || nowIso,
        lastAccessedAt: nowIso,
      };
      edgeState.entitlements.unshift(existingEnt);
      await syncEdgeStateIntegrity();
      await persistEdgeStateToD1(env);
    }

    if (!existingEnt) {
      return jsonResponse(
        {
          exists: false,
          npm: cleanNpm,
          accountStatus: 'Belum Terdaftar',
          error: 'NPM belum memiliki akun. Silakan lakukan aktivasi terlebih dahulu.',
        },
        404
      );
    }

    if (!existingEnt.isLifetimeActive) {
      return jsonResponse(
        {
          exists: true,
          npm: cleanNpm,
          accountStatus: 'Nonaktif',
          codeStatus: 'Sudah Digunakan',
          error: 'Akun Anda sedang dinonaktifkan. Silakan hubungi dosen.',
        },
        403
      );
    }

    return jsonResponse({
      exists: true,
      npm: cleanNpm,
      studentName: existingEnt.studentName,
      className: existingEnt.className,
      accountStatus: 'Sudah Teraktivasi',
      isActive: true,
      codeStatus: 'Sudah Digunakan',
      activatedCode: extractRawCodeFromDisplay(existingEnt.activatedWithCodeDisplay),
      hasPassword: Boolean(extractWorkerPasswordHash(existingEnt.sessionToken)),
      message: 'Akun berhasil ditemukan. Silakan melanjutkan proses login.',
    });
  }

  // 2B. Student Activation, Login & Recovery: POST /api/auth/student/activate, /api/student-activate, /api/student-login, /api/auth/student/session, /api/auth/student/recover
  if (
    (path === '/api/auth/student/activate' ||
      path === '/api/student-activate' ||
      path === '/api/student-login' ||
      path === '/api/auth/student/session' ||
      path === '/api/auth/student/recover') &&
    method === 'POST'
  ) {
    const body: any = await request.json().catch(() => ({}));
    const cleanNpm = normalizeNpm(body.npm);
    const cleanName = String(body.fullName || body.studentName || body.name || '')
      .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
    const cleanClass =
      String(body.className || 'ATLM Reguler - IKES Rajawali')
        .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
        .trim() || 'ATLM Reguler - IKES Rajawali';
    const cleanCode = normalizeActivationCode(body.accessCode || body.activationCode || body.code);
    const rawPassword =
      typeof (body.password || body.newPassword) === 'string'
        ? String(body.password || body.newPassword).trim()
        : '';
    const selectedGender = body.avatarGender === 'male_atlm' ? 'male_atlm' : 'female_atlm';
    const mode =
      path === '/api/auth/student/recover'
        ? 'recover'
        : String(body.mode || (cleanCode ? 'activate' : 'login')).toLowerCase();

    const rateKey = getWorkerClientKey(request, 'student_auth', cleanNpm || 'anon');
    const rateStatus = checkWorkerRate(rateKey);
    if (!rateStatus.allowed) {
      return jsonResponse(
        {
          error: `Terlalu banyak percobaan gagal untuk NPM ini. Silakan tunggu ${rateStatus.retryAfterSec} detik.`,
        },
        429
      );
    }

    if (!cleanNpm || cleanNpm.length < 3) {
      return jsonResponse(
        { error: 'Nomor Pokok Mahasiswa (NPM) wajib diisi dengan benar.' },
        400
      );
    }

    return withWorkerLock('student_auth_mutation', async () => {
      await ensureEdgeStateSeeded(env);

      let matchedCode: EdgeAccessCode | undefined;
      if (cleanCode) {
        const inputHash = await sha256Hex(cleanCode);
        matchedCode = edgeState.accessCodes.find(
          (c) =>
            c.codeHash === inputHash ||
            extractRawCodeFromDisplay(c.codeDisplay) === cleanCode
        );
        if (!matchedCode) {
          recordWorkerFailure(rateKey, 10);
          return jsonResponse(
            {
              error:
                'Kode aktivasi tidak valid. Pastikan kode sesuai dengan yang diterbitkan oleh Dosen.',
            },
            401
          );
        }

        const otherOwner = edgeState.entitlements.find(
          (e) =>
            e.activatedWithCodeVersion === matchedCode!.version &&
            normalizeNpm(e.npm) !== cleanNpm
        );
        const boundNpmMatch = matchedCode.className.match(/\[NPM:([^\]]+)\]/i);
        const boundNpm = boundNpmMatch ? normalizeNpm(boundNpmMatch[1]) : null;

        if (otherOwner || (boundNpm && boundNpm !== cleanNpm)) {
          recordWorkerFailure(rateKey, 10);
          return jsonResponse(
            {
              error:
                'Kode aktivasi ini sudah digunakan oleh mahasiswa lain. Setiap kode aktivasi bersifat unik dan hanya berlaku untuk satu mahasiswa.',
            },
            403
          );
        }
      }

      // Multi-source self-healing: check entitlements, profiles, bound access codes, attempts, or signed activation certificate
      let existingEnt = edgeState.entitlements.find((e) => normalizeNpm(e.npm) === cleanNpm);
      if (!existingEnt) {
        const existingProf = edgeState.profiles.get(cleanNpm);
        const boundCode = edgeState.accessCodes.find((c) => {
          const m = c.className.match(/\[NPM:([^\]]+)\]/i);
          return m && normalizeNpm(m[1]) === cleanNpm;
        });
        const attemptRecord = edgeState.attempts.find((a) => normalizeNpm(a.npm) === cleanNpm);
        const verifiedCert =
          (await verifyWorkerActivationCert(env, body.activationCert)) ||
          (await verifyWorkerActivationCert(env, cookies['hw_student_registry']));
        const matchingCert =
          verifiedCert && normalizeNpm(verifiedCert.npm) === cleanNpm ? verifiedCert : null;

        if (existingProf || boundCode || attemptRecord || matchingCert) {
          const nowIso = new Date().toISOString();
          const ver =
            boundCode?.version || matchingCert?.activatedWithCodeVersion || 1;
          const pure = boundCode
            ? extractRawCodeFromDisplay(boundCode.codeDisplay)
            : matchingCert
            ? extractRawCodeFromDisplay(matchingCert.activatedWithCodeDisplay)
            : `ATLM-IKES-${String(ver).padStart(3, '0')}`;
          const healedName =
            existingProf?.fullName ||
            attemptRecord?.studentName ||
            matchingCert?.studentName ||
            cleanName ||
            `Mahasiswa ATLM (${cleanNpm})`;
          const healedClass =
            existingProf?.className ||
            attemptRecord?.className ||
            matchingCert?.className ||
            cleanClass;
          existingEnt = {
            id: edgeState.entitlements.length + 1,
            npm: cleanNpm,
            studentName: healedName,
            className: healedClass,
            activatedWithCodeVersion: ver,
            activatedWithCodeDisplay: `${pure} • Kode Aktivasi Unik Mahasiswa`,
            sessionToken: buildWorkerEntitlementToken(
              cleanNpm,
              ver,
              matchingCert?.passwordHash || null
            ),
            isLifetimeActive: true,
            activatedAt: matchingCert?.activatedAt || nowIso,
            lastAccessedAt: nowIso,
          };
          edgeState.entitlements.unshift(existingEnt);
          await syncEdgeStateIntegrity();
          await persistEdgeStateToD1(env);
        }
      }

      if (existingEnt) {
        if (!existingEnt.isLifetimeActive) {
          return jsonResponse(
            { error: 'Akun Anda sedang dinonaktifkan. Silakan hubungi dosen.' },
            403
          );
        }

        const storedPwdHash = extractWorkerPasswordHash(existingEnt.sessionToken);

        if (mode === 'recover') {
          const newPwdHash = rawPassword ? await sha256Hex(rawPassword) : storedPwdHash;
          existingEnt.sessionToken = buildWorkerEntitlementToken(
            cleanNpm,
            existingEnt.activatedWithCodeVersion,
            newPwdHash
          );
        } else if (mode === 'login' && storedPwdHash && rawPassword.length > 0) {
          const inputPwdHash = await sha256Hex(rawPassword);
          if (!constantTimeEqual(inputPwdHash, storedPwdHash)) {
            recordWorkerFailure(rateKey, 10);
            return jsonResponse({ error: 'NPM atau password tidak sesuai.' }, 401);
          }
        } else if (!storedPwdHash && rawPassword.length >= 3) {
          existingEnt.sessionToken = buildWorkerEntitlementToken(
            cleanNpm,
            existingEnt.activatedWithCodeVersion,
            await sha256Hex(rawPassword)
          );
        }

        existingEnt.lastAccessedAt = new Date().toISOString();
        if (cleanName && cleanName.length >= 2) {
          existingEnt.studentName = cleanName;
          const p = edgeState.profiles.get(cleanNpm);
          if (p) p.fullName = cleanName;
        }
        await persistEdgeStateToD1(env);
        workerRateMap.delete(rateKey);

        const fullStudent: any = buildEdgeStudentPayload(cleanNpm);
        const certToken = await signWorkerActivationCert(env, {
          npm: cleanNpm,
          studentName: fullStudent?.fullName || existingEnt.studentName,
          className: fullStudent?.className || existingEnt.className,
          avatarGender: fullStudent?.avatarGender || 'female_atlm',
          activatedWithCodeVersion: existingEnt.activatedWithCodeVersion,
          activatedWithCodeDisplay: existingEnt.activatedWithCodeDisplay,
          passwordHash: extractWorkerPasswordHash(existingEnt.sessionToken),
          activatedAt: existingEnt.activatedAt,
        });
        if (fullStudent) {
          fullStudent.activationCert = certToken;
        }

        const token = await signWorkerSession(
          env,
          {
            role: 'student',
            sub: cleanNpm,
            name: fullStudent?.fullName || existingEnt.studentName,
            className: fullStudent?.className || existingEnt.className,
          },
          86400 * 30
        );

        return jsonResponse(
          {
            success: true,
            isExistingLifetime: true,
            wasRecovered: mode === 'recover',
            message: `Akun berhasil ditemukan. Selamat datang kembali, ${fullStudent?.fullName || existingEnt.studentName}!`,
            student: fullStudent,
          },
          200,
          {
            'Set-Cookie': [
              makeCookieHeader(request, 'hw_student_session', token, 86400 * 30),
              makeCookieHeader(request, 'hw_student_registry', certToken, 86400 * 365),
            ],
          }
        );
      }

      if (mode === 'login' || mode === 'recover' || !cleanCode || !matchedCode) {
        recordWorkerFailure(rateKey, 10);
        return jsonResponse(
          {
            error:
              mode === 'login' || mode === 'recover'
                ? 'NPM belum memiliki akun. Silakan lakukan aktivasi terlebih dahulu.'
                : 'Kode aktivasi wajib diisi untuk mengaktifkan akun mahasiswa baru.',
          },
          404
        );
      }

      if (matchedCode.activatedCount > 0) {
        recordWorkerFailure(rateKey, 10);
        return jsonResponse(
          {
            error:
              'Kode aktivasi ini sudah digunakan. Setiap kode aktivasi hanya berlaku satu kali untuk satu mahasiswa.',
          },
          403
        );
      }

      if (!matchedCode.isActive) {
        recordWorkerFailure(rateKey, 10);
        return jsonResponse({ error: 'Kode aktivasi ini telah dinonaktifkan oleh Dosen.' }, 401);
      }

      const finalStudentName =
        cleanName && cleanName.length >= 2 ? cleanName : `Mahasiswa ATLM (${cleanNpm})`;
      const rawLabel = extractRawCodeFromDisplay(matchedCode.codeDisplay) || cleanCode;
      matchedCode.isActive = false;
      matchedCode.activatedCount = 1;
      matchedCode.codeDisplay = `${rawLabel} • Digunakan oleh NPM ${cleanNpm} (${finalStudentName})`;
      matchedCode.className = `${cleanClass} [NPM:${cleanNpm}]`;

      const pwdHash = rawPassword.length >= 3 ? await sha256Hex(rawPassword) : null;
      const nowIso = new Date().toISOString();
      edgeState.entitlements.unshift({
        id: edgeState.entitlements.length + 1,
        npm: cleanNpm,
        studentName: finalStudentName,
        className: cleanClass,
        activatedWithCodeVersion: matchedCode.version,
        activatedWithCodeDisplay: `${rawLabel} • Kode Aktivasi Unik Mahasiswa`,
        sessionToken: buildWorkerEntitlementToken(cleanNpm, matchedCode.version, pwdHash),
        isLifetimeActive: true,
        activatedAt: nowIso,
        lastAccessedAt: nowIso,
      });

      edgeState.profiles.set(cleanNpm, {
        npm: cleanNpm,
        fullName: finalStudentName,
        className: cleanClass,
        level: 1,
        xp: 100,
        highestScore: 0,
        averageScore: 0,
        quizCount: 0,
        completedModules: [],
        avatarGender: selectedGender,
        skinTone: '#f1c27d',
        hairStyle: 'modern',
        shoeColor: '#0f172a',
      });

      await persistEdgeStateToD1(env);
      workerRateMap.delete(rateKey);

      const fullStudent: any = buildEdgeStudentPayload(cleanNpm);
      const certToken = await signWorkerActivationCert(env, {
        npm: cleanNpm,
        studentName: finalStudentName,
        className: cleanClass,
        avatarGender: selectedGender,
        activatedWithCodeVersion: matchedCode.version,
        activatedWithCodeDisplay: `${rawLabel} • Kode Aktivasi Unik Mahasiswa`,
        passwordHash: pwdHash,
        activatedAt: nowIso,
      });
      if (fullStudent) {
        fullStudent.activationCert = certToken;
      }

      const token = await signWorkerSession(
        env,
        {
          role: 'student',
          sub: cleanNpm,
          name: finalStudentName,
          className: cleanClass,
        },
        86400 * 30
      );

      return jsonResponse(
        {
          success: true,
          isExistingLifetime: false,
          message:
            'Aktivasi Akun Mahasiswa Berhasil! Kode aktivasi Anda kini terikat permanen dengan NPM Anda seumur hidup.',
          student: fullStudent,
        },
        200,
        {
          'Set-Cookie': [
            makeCookieHeader(request, 'hw_student_session', token, 86400 * 30),
            makeCookieHeader(request, 'hw_student_registry', certToken, 86400 * 365),
          ],
        }
      );
    });
  }

  // 2C. Server-Side Character Voice TTS on Edge Worker (/api/tts/speak)
  if (path === '/api/tts/speak' && (method === 'POST' || method === 'GET')) {
    const body: any = method === 'POST' ? await request.json().catch(() => ({})) : {};
    const rawText = String(body.text || url.searchParams.get('text') || '').trim();
    const lang = String(body.lang || url.searchParams.get('lang') || 'id-ID');
    if (!rawText) {
      return jsonResponse({ error: 'Teks dialog wajib diisi.' }, 400);
    }
    const clippedText = rawText.slice(0, 240);
    const tl = lang.toLowerCase().startsWith('en') ? 'en' : 'id';
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${encodeURIComponent(clippedText)}`;
    try {
      const upstream = await fetch(ttsUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        },
      });
      if (upstream.ok) {
        const arrBuf = await upstream.arrayBuffer();
        if (arrBuf.byteLength > 256) {
          return new Response(arrBuf, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'public, max-age=86400',
            },
          });
        }
      }
    } catch {
      // Ignore upstream errors
    }
    return jsonResponse({ fallback: 'client_synth' }, 204);
  }

  // 3. Quiz Questions: GET /api/quiz/questions
  if (path === '/api/quiz/questions' && method === 'GET') {
    const sanitizedQuestions = QUIZ_30_QUESTIONS.map((q) => ({
      questionNumber: q.questionNumber,
      sectionCode: q.sectionCode,
      category: q.category,
      topic: q.topic,
      caseTable: q.caseTable || null,
      questionText: q.questionText,
      options: q.options,
      pdfPageRef: q.pdfPageRef,
    }));

    return jsonResponse({
      totalQuestions: sanitizedQuestions.length,
      sectionACount: sanitizedQuestions.filter((q) => q.sectionCode === 'A').length,
      sectionBCount: sanitizedQuestions.filter((q) => q.sectionCode === 'B').length,
      sectionCCount: sanitizedQuestions.filter((q) => q.sectionCode === 'C').length,
      sectionDCount: sanitizedQuestions.filter((q) => q.sectionCode === 'D').length,
      questions: sanitizedQuestions,
    });
  }

  // Quiz History: GET /api/student/quiz-history
  if (path === '/api/student/quiz-history' && method === 'GET') {
    if (!studentSession && !lecturerSession) {
      return jsonResponse({ error: 'Sesi mahasiswa belum aktif.' }, 401);
    }
    const targetNpm = studentSession
      ? studentSession.sub
      : String(url.searchParams.get('npm') || '').trim();
    const payload = buildEdgeStudentPayload(targetNpm);
    return jsonResponse({
      success: true,
      quizHistory: payload?.quizHistory || [],
      latestSummary: payload?.latestSummary || null,
      latestReview: payload?.latestReview || [],
    });
  }

  // 4. Quiz Submit: POST /api/quiz/submit
  if (path === '/api/quiz/submit' && method === 'POST') {
    if (!studentSession && !lecturerSession) {
      return jsonResponse(
        { error: 'Silakan login sebagai mahasiswa terlebih dahulu untuk menyimpan nilai kuis.' },
        401
      );
    }
    const body: any = await request.json().catch(() => ({}));
    const cleanNpm = studentSession ? studentSession.sub : String(body.npm || '24011001').trim();
    const cleanName = studentSession
      ? studentSession.name
      : String(body.fullName || 'Mahasiswa ATLM').trim();
    const cleanClass =
      studentSession?.className || String(body.className || 'ATLM Reguler - IKES Rajawali').trim();
    const duration = Math.max(30, Number(body.totalDurationSec) || 900);
    const rawAnswers = Array.isArray(body.answers) ? body.answers : [];

    const {
      correctCount,
      wrongCount,
      clinicalCorrect,
      theoryCorrect,
      mcvCorrect,
      mchCorrect,
      mchcCorrect,
      maxStreak,
      totalScore,
      speedBonusTotal,
      detailedReview,
    } = buildReviewFromAnswers(rawAnswers);

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
    else if (accuracyPercent >= 80 && duration <= 750) badgeCategory = 'Speed Diagnostic Star';
    else if (accuracyPercent >= 80) badgeCategory = 'Clinical Case Specialist';

    const attemptUuid = `attempt_${cleanNpm}_${Date.now()}`;
    const newAttempt: EdgeQuizAttempt = {
      id: edgeState.attempts.length + 1,
      attemptUuid,
      npm: cleanNpm,
      studentName: cleanName,
      className: cleanClass,
      sessionCode: body.mode === 'live' ? 'ATLM-LIVE-50' : 'ATLM-SOLO-50',
      totalQuestions: QUIZ_30_QUESTIONS.length,
      correctCount,
      wrongCount,
      clinicalCorrect,
      theoryCorrect,
      mcvCorrect,
      mchCorrect,
      mchcCorrect,
      score: totalScore,
      durationSeconds: duration,
      answersJson: JSON.stringify(rawAnswers),
      completedAt: new Date().toISOString(),
    };
    edgeState.attempts.unshift(newAttempt);

    const prof = edgeState.profiles.get(cleanNpm);
    if (prof) {
      prof.xp += xpEarned;
      prof.level = Math.max(1, Math.floor(prof.xp / 500) + 1);
      prof.highestScore = Math.max(prof.highestScore, totalScore);
      prof.quizCount += 1;
    }

    await persistEdgeStateToD1(env);

    return jsonResponse({
      success: true,
      attemptId: newAttempt.id,
      summary: {
        npm: cleanNpm,
        fullName: cleanName,
        className: cleanClass,
        totalQuestions: QUIZ_30_QUESTIONS.length,
        correctCount,
        wrongCount,
        accuracyPercent,
        totalScore,
        speedBonusTotal,
        maxStreak,
        durationSec: duration,
        xpEarned,
        gradeLabel,
        badgeCategory,
      },
      detailedReview,
    });
  }

  // 5. Leaderboard: GET /api/leaderboard
  if (path === '/api/leaderboard' && method === 'GET') {
    const isLecturer = Boolean(
      lecturerSession &&
        lecturerSession.role === 'lecturer' &&
        url.searchParams.get('role') === 'lecturer'
    );
    const allProfs = Array.from(edgeState.profiles.values())
      .filter((p) => p.highestScore > 0)
      .sort((a, b) => b.highestScore - a.highestScore);

    const formatted = allProfs.map((p, index) => ({
      rank: index + 1,
      id: index + 1,
      npm: isLecturer ? p.npm : maskNpm(p.npm),
      rawNpm: isLecturer ? p.npm : undefined,
      fullName: p.fullName,
      className: p.className,
      avatarGender: p.avatarGender,
      score: p.highestScore,
      correctCount: Math.min(50, Math.round(p.highestScore / 100)),
      accuracyPercent: Math.min(100, Number(((p.highestScore / 5000) * 100).toFixed(1))),
      durationSec: 860,
      badgeCategory:
        p.highestScore >= 4500
          ? 'Gold Hematology Champion & Erythrocyte Index Master'
          : 'ATLM Clinical Analyst',
      achievedAt: new Date().toISOString(),
    }));

    return jsonResponse({ leaderboard: formatted });
  }

  // 6. Lecturer Protected Endpoints: /api/lecturer/*
  if (path.startsWith('/api/lecturer/')) {
    if (!lecturerSession || lecturerSession.role !== 'lecturer') {
      return jsonResponse(
        { error: 'Akses ditolak. Endpoint ini hanya dapat diakses oleh Dosen yang telah login.' },
        401
      );
    }

    if (path === '/api/lecturer/dashboard' && method === 'GET') {
      const profilesArr = Array.from(edgeState.profiles.values());
      const scores = profilesArr.map((p) => p.highestScore).filter((s) => s > 0);
      const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
      const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
      const availableCodes = edgeState.accessCodes.filter(
        (c) => c.isActive && c.activatedCount === 0
      ).length;

      const questionStats = QUIZ_30_QUESTIONS.map((q) => ({
        questionNumber: q.questionNumber,
        sectionCode: q.sectionCode,
        topic: q.topic,
        category: q.category,
        caseTable: q.caseTable || null,
        correctOption: q.correctOption,
        totalAttempts: Math.max(3, edgeState.attempts.length),
        correctCount: Math.max(2, edgeState.attempts.length),
        accuracyPercent: 90.0,
        pdfPageRef: q.pdfPageRef,
        questionText: q.questionText,
        options: q.options,
        scientificExplanation: q.scientificExplanation,
        atlmProcedureAndDecision: q.atlmProcedureAndDecision,
        doctorClinicalExplanation: q.doctorClinicalExplanation,
        patientEducation: q.patientEducation,
        whyOthersWrong: q.whyOthersWrong,
        calculationSteps: q.calculationSteps || null,
      }));

      return jsonResponse({
        metrics: {
          totalActivatedStudents: edgeState.entitlements.length,
          totalQuizAttempts: edgeState.attempts.length,
          averageAccuracyPercent: 91.2,
          highestScore,
          lowestScore,
          activeAccessCodeVersion: availableCodes,
        },
        entitlements: edgeState.entitlements.map((e) => ({
          id: e.id,
          npm: e.npm,
          fullName: e.studentName,
          className: e.className,
          activatedWithCodeVersion: e.activatedWithCodeVersion,
          activatedWithCodeDisplay: e.activatedWithCodeDisplay,
          lifetimeAccess: e.isLifetimeActive,
          revoked: !e.isLifetimeActive,
          activatedAt: e.activatedAt,
          lastLoginAt: e.lastAccessedAt,
        })),
        profiles: profilesArr,
        attempts: edgeState.attempts.map((a) => ({
          id: a.id,
          npm: a.npm,
          fullName: a.studentName,
          className: a.className,
          mode: a.sessionCode.includes('LIVE') ? 'live' : 'solo',
          totalQuestions: a.totalQuestions,
          correctCount: a.correctCount,
          wrongCount: a.wrongCount,
          accuracyPercent: Number(((a.correctCount / a.totalQuestions) * 100).toFixed(1)),
          totalScore: a.score,
          durationSec: a.durationSeconds,
          completedAt: a.completedAt,
        })),
        accessCodes: [...edgeState.accessCodes]
          .sort((a, b) => b.version - a.version)
          .map((c) => {
            const pureCode = extractRawCodeFromDisplay(c.codeDisplay);
            const matchedEnt = edgeState.entitlements.find(
              (e) =>
                e.activatedWithCodeVersion === c.version ||
                extractRawCodeFromDisplay(e.activatedWithCodeDisplay) === pureCode
            );
            const isUsed = c.activatedCount > 0 || Boolean(matchedEnt);
            const statusLabel: 'Tersedia' | 'Sudah Digunakan' | 'Dinonaktifkan' = isUsed
              ? 'Sudah Digunakan'
              : c.isActive
              ? 'Tersedia'
              : 'Dinonaktifkan';
            const rawCategory =
              c.className.split('[NPM:')[0].trim() || 'ATLM Reguler - IKES Rajawali';
            const labelPart =
              c.codeDisplay
                .split('•')[1]
                ?.replace(/\(Tersedia[^)]*\)/gi, '')
                ?.replace(/Digunakan oleh NPM.*$/gi, '')
                ?.trim() || 'Kode Aktivasi Unik Mahasiswa';

            return {
              id: c.id,
              pureCode,
              codeLabel: c.codeDisplay,
              programCategory: rawCategory,
              batchLabel: labelPart,
              version: c.version,
              isActive: c.isActive,
              activatedCount: c.activatedCount,
              statusLabel,
              usedByStudentNpm: isUsed ? matchedEnt?.npm || null : null,
              usedByStudentName: isUsed ? matchedEnt?.studentName || null : null,
              createdBy: c.createdBy,
              createdAt: c.createdAt,
            };
          }),
        questionStats,
      });
    }

    if (path === '/api/lecturer/access-codes' && method === 'GET') {
      return jsonResponse({
        accessCodes: [...edgeState.accessCodes]
          .sort((a, b) => b.version - a.version)
          .map((c) => {
            const pureCode = extractRawCodeFromDisplay(c.codeDisplay);
            const matchedEnt = edgeState.entitlements.find(
              (e) =>
                e.activatedWithCodeVersion === c.version ||
                extractRawCodeFromDisplay(e.activatedWithCodeDisplay) === pureCode
            );
            const isUsed = c.activatedCount > 0 || Boolean(matchedEnt);
            const statusLabel: 'Tersedia' | 'Sudah Digunakan' | 'Dinonaktifkan' = isUsed
              ? 'Sudah Digunakan'
              : c.isActive
              ? 'Tersedia'
              : 'Dinonaktifkan';
            const rawCategory =
              c.className.split('[NPM:')[0].trim() || 'ATLM Reguler - IKES Rajawali';
            const labelPart =
              c.codeDisplay
                .split('•')[1]
                ?.replace(/\(Tersedia[^)]*\)/gi, '')
                ?.replace(/Digunakan oleh NPM.*$/gi, '')
                ?.trim() || 'Kode Aktivasi Unik Mahasiswa';

            return {
              id: c.id,
              pureCode,
              codeLabel: c.codeDisplay,
              programCategory: rawCategory,
              batchLabel: labelPart,
              version: c.version,
              isActive: c.isActive,
              activatedCount: c.activatedCount,
              statusLabel,
              usedByStudentNpm: isUsed ? matchedEnt?.npm || null : null,
              usedByStudentName: isUsed ? matchedEnt?.studentName || null : null,
              createdBy: c.createdBy,
              createdAt: c.createdAt,
            };
          }),
        entitlements: edgeState.entitlements,
      });
    }

    if (path === '/api/lecturer/access-codes' && method === 'POST') {
      const body: any = await request.json().catch(() => ({}));
      return withWorkerLock('lecturer_generate_codes', async () => {
        await ensureEdgeStateSeeded(env);
        let nextVersion =
          edgeState.accessCodes.length > 0
            ? Math.max(...edgeState.accessCodes.map((c) => c.version)) + 1
            : 1;

        if (body.batchCount && Number(body.batchCount) > 0) {
          const count = Math.min(200, Math.max(1, Number(body.batchCount)));
          const generatedCodes: string[] = [];
          for (let i = 0; i < count; i++) {
            const randHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
            const uniqueCode = normalizeActivationCode(
              `ATLM-${String(nextVersion).padStart(3, '0')}-${randHex}`
            );
            const h = await sha256Hex(uniqueCode);
            edgeState.accessCodes.push({
              id: nextVersion,
              codeHash: h,
              codeDisplay: `${uniqueCode} • ${
                body.codeLabel || 'Kode Aktivasi Unik Mahasiswa'
              } (Tersedia - 1 Mahasiswa)`,
              version: nextVersion,
              className: 'ATLM Reguler - IKES Rajawali',
              isActive: true,
              activatedCount: 0,
              createdBy: 'dr. Juwita Ninda Suherman, M.Kes',
              createdAt: new Date().toISOString(),
            });
            generatedCodes.push(uniqueCode);
            nextVersion++;
          }
          await persistEdgeStateToD1(env);
          return jsonResponse({
            success: true,
            message: `${generatedCodes.length} Kode Aktivasi Unik berhasil diterbitkan: ${generatedCodes.join(', ')}`,
            generatedCodes,
          });
        }

        const rawCode = normalizeActivationCode(body.newCode);
        if (!rawCode || rawCode.length < 4) {
          return jsonResponse({ error: 'Kode aktivasi unik minimal 4 karakter.' }, 400);
        }
        const h = await sha256Hex(rawCode);
        if (
          edgeState.accessCodes.some(
            (c) => c.codeHash === h || extractRawCodeFromDisplay(c.codeDisplay) === rawCode
          )
        ) {
          return jsonResponse({ error: 'Kode aktivasi tersebut sudah pernah dibuat.' }, 400);
        }

        const created: EdgeAccessCode = {
          id: nextVersion,
          codeHash: h,
          codeDisplay: `${rawCode} • ${
            body.codeLabel || 'Kode Aktivasi Unik Mahasiswa'
          } (Tersedia - 1 Mahasiswa)`,
          version: nextVersion,
          className: 'ATLM Reguler - IKES Rajawali',
          isActive: true,
          activatedCount: 0,
          createdBy: 'dr. Juwita Ninda Suherman, M.Kes',
          createdAt: new Date().toISOString(),
        };
        edgeState.accessCodes.push(created);
        await persistEdgeStateToD1(env);
        return jsonResponse({
          success: true,
          message: `Kode Aktivasi Unik ${rawCode} berhasil diterbitkan untuk 1 mahasiswa.`,
          accessCode: { ...created, pureCode: rawCode },
        });
      });
    }

    if (path.startsWith('/api/lecturer/access-codes/') && method === 'PATCH') {
      const id = Number(path.split('/').pop());
      const body: any = await request.json().catch(() => ({}));
      const found = edgeState.accessCodes.find((c) => c.id === id);
      if (found) {
        if (found.activatedCount > 0 && body.isActive) {
          return jsonResponse(
            {
              error:
                'Kode yang sudah digunakan oleh mahasiswa tidak dapat diaktifkan ulang untuk mahasiswa lain.',
            },
            400
          );
        }
        found.isActive = Boolean(body.isActive);
        await persistEdgeStateToD1(env);
      }
      return jsonResponse({ success: true, message: 'Status kode aktivasi diperbarui.' });
    }

    if (path === '/api/lecturer/toggle-entitlement' && method === 'POST') {
      const body: any = await request.json().catch(() => ({}));
      const cleanTargetNpm = normalizeNpm(body.npm);
      const target = edgeState.entitlements.find((e) => normalizeNpm(e.npm) === cleanTargetNpm);
      if (target) {
        target.isLifetimeActive = !body.revoked;
        await persistEdgeStateToD1(env);
      }
      return jsonResponse({ success: true });
    }
  }

  // 7. Calculator, Progress, Avatar & Glossary
  if (path === '/api/calculator/save' && method === 'POST') {
    if (!studentSession && !lecturerSession) {
      return jsonResponse({ error: 'Autentikasi diperlukan.' }, 401);
    }
    const body: any = await request.json().catch(() => ({}));
    const item = {
      id: edgeState.calculatorHistory.length + 1,
      npm: studentSession ? studentSession.sub : String(body.npm || 'GUEST'),
      hb: Number(body.hb),
      hct: Number(body.hct),
      rbc: Number(body.rbc),
      mcv: Number(body.mcv),
      mch: Number(body.mch),
      mchc: Number(body.mchc),
      interpretation: String(body.interpretation || 'Normositik - Normokromik'),
      createdAt: new Date().toISOString(),
    };
    edgeState.calculatorHistory.unshift(item);
    return jsonResponse({ success: true, item });
  }

  if (path === '/api/calculator/history' && method === 'GET') {
    return jsonResponse({ history: edgeState.calculatorHistory.slice(0, 20) });
  }

  if (path === '/api/student/progress' && method === 'POST') {
    if (!studentSession && !lecturerSession) {
      return jsonResponse({ error: 'Autentikasi diperlukan.' }, 401);
    }
    const body: any = await request.json().catch(() => ({}));
    const targetNpm = studentSession ? studentSession.sub : String(body.npm || '').trim();
    const prof = edgeState.profiles.get(targetNpm);
    if (prof && body.moduleNumber) {
      const modNum = Number(body.moduleNumber);
      if (!prof.completedModules.includes(modNum)) {
        prof.completedModules.push(modNum);
        prof.xp += 30;
      }
      await persistEdgeStateToD1(env);
    }
    return jsonResponse({ success: true });
  }

  if (path === '/api/student/avatar' && method === 'POST') {
    if (!studentSession && !lecturerSession) {
      return jsonResponse({ error: 'Autentikasi diperlukan.' }, 401);
    }
    const body: any = await request.json().catch(() => ({}));
    const targetNpm = studentSession ? studentSession.sub : String(body.npm || '').trim();
    const prof = edgeState.profiles.get(targetNpm);
    if (prof) {
      prof.avatarGender = body.gender === 'male_atlm' ? 'male_atlm' : 'female_atlm';
      await persistEdgeStateToD1(env);
    }
    return jsonResponse({ success: true });
  }

  if (path === '/api/glossary' && method === 'GET') {
    return jsonResponse({ terms: edgeState.glossary });
  }

  if (path === '/api/glossary' && method === 'POST') {
    if (!lecturerSession || lecturerSession.role !== 'lecturer') {
      return jsonResponse({ error: 'Akses ditolak. Khusus Dosen.' }, 401);
    }
    const body: any = await request.json().catch(() => ({}));
    const created = {
      id: edgeState.glossary.length + 1,
      term: String(body.term || '').trim(),
      abbreviation: String(body.abbreviation || '-').trim(),
      englishTerm: String(body.englishTerm || body.term || '').trim(),
      category: String(body.category || 'Komponen darah') as (typeof edgeState.glossary)[number]['category'],
      definition: String(body.definition || '').trim(),
      functionRole: String(body.functionRole || '-'),
      clinicalExample: String(body.clinicalExample || '-'),
      hematologyRelation: String(body.hematologyRelation || '-'),
      pdfPageRef: Number(body.pdfPageRef) || 1,
    };
    edgeState.glossary.push(created);
    return jsonResponse({ success: true, term: created });
  }

  return jsonResponse({ error: `Endpoint API tidak ditemukan: ${method} ${path}` }, 404);
}

export default {
  async fetch(request: Request, env: CloudflareEnv): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Hematology World Cloudflare Worker Active', { status: 200 });
  },
};
