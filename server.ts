import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { eq, desc, asc, and, sql } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import {
  users,
  lecturers,
  studentAccessCodes,
  studentEntitlements,
  studentProfiles,
  quizSessions,
  quizAttempts,
  questions,
  answerOptions,
  studentAnswers,
  quizResults,
  leaderboard,
  learningModules,
  studentProgress,
  glossaryTerms,
  calculatorHistory,
  achievements,
  avatarSettings,
} from './src/db/schema.ts';
import { HEMATOLOGY_MODULES } from './src/data/hematologyData.ts';
import { GLOSSARY_TERMS } from './src/data/glossaryData.ts';
import { QUIZ_30_QUESTIONS } from './src/data/quiz30Data.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server-side cryptographic digest for default lecturer access validation when TEACHER_ACCESS_CODE env is not injected
const DEFAULT_TEACHER_CODE_DIGEST =
  '07f51a96cd6f896dadfc2d5b2f62c4c2472693555bb1770b558db6b5ef0c373d';

const SESSION_SECRET_KEY =
  process.env.SESSION_SECRET ||
  crypto
    .createHash('sha256')
    .update(`hw_session_secret_${DEFAULT_TEACHER_CODE_DIGEST}_ikes_rajawali`)
    .digest('hex');

/**
 * Canonical normalization for Student Activation Codes:
 * - Removes invisible Unicode characters (\u200B-\u200D, \uFEFF, \u00A0)
 * - Strips any copied label suffix after '•' or '(' or leading '#version'
 * - Normalizes all Unicode dashes (–, —, −) to standard ASCII hyphen '-'
 * - Removes all whitespace and converts to uppercase
 */
export function normalizeActivationCode(rawInput: unknown): string {
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
  str = str
    .replace(/[–—−‐‑‒]/g, '-')
    .replace(/['"`]/g, '')
    .replace(/\s+/g, '')
    .toUpperCase();
  return str;
}

/**
 * Canonical normalization for Student NPM / NIM:
 * - Removes invisible Unicode characters and internal spaces
 * - Normalizes dashes and converts to uppercase
 */
export function normalizeNpm(rawInput: unknown): string {
  if (rawInput === null || rawInput === undefined) return '';
  return String(rawInput)
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
    .replace(/[–—−‐‑‒]/g, '-')
    .replace(/\s+/g, '')
    .trim()
    .toUpperCase();
}

export function extractRawCodeFromDisplay(codeDisplay: string): string {
  return normalizeActivationCode(String(codeDisplay || '').split('•')[0]);
}

export function hashCode(value: string): string {
  return crypto.createHash('sha256').update(String(value).trim()).digest('hex');
}

export function hashActivationCode(value: string): string {
  return hashCode(normalizeActivationCode(value));
}

// In-process async mutex lock to serialize concurrent activation/generation operations
const activeLocks = new Map<string, Promise<void>>();
async function withAsyncLock<T>(lockKey: string, fn: () => Promise<T>): Promise<T> {
  while (activeLocks.has(lockKey)) {
    await activeLocks.get(lockKey)?.catch(() => {});
  }
  let release!: () => void;
  const lockPromise = new Promise<void>((resolve) => {
    release = resolve;
  });
  activeLocks.set(lockKey, lockPromise);
  try {
    return await fn();
  } finally {
    activeLocks.delete(lockKey);
    release();
  }
}

function safeCompareHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function maskNpm(npm: string): string {
  const clean = npm.trim();
  if (clean.length <= 4) return clean.slice(0, 2) + '**';
  return clean.slice(0, 4) + '***' + clean.slice(-2);
}

// ============================================================================
// SESSION TOKEN SIGNING & HTTPONLY COOKIE HELPERS
// ============================================================================
interface SessionPayload {
  role: 'lecturer' | 'student';
  sub: string;
  name: string;
  className?: string;
  iat: number;
  exp: number;
}

function signSessionToken(payload: Omit<SessionPayload, 'iat' | 'exp'>, ttlSec = 86400 * 7): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    ...payload,
    iat: now,
    exp: now + ttlSec,
  };
  const dataB64 = Buffer.from(JSON.stringify(fullPayload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET_KEY).update(dataB64).digest('base64url');
  return `${dataB64}.${sig}`;
}

function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [dataB64, sig] = token.split('.');
  if (!dataB64 || !sig) return null;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET_KEY)
    .update(dataB64)
    .digest('base64url');
  if (!safeCompareHex(sig, expectedSig)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(dataB64, 'base64url').toString('utf8')) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!parsed.exp || parsed.exp < now) return null;
    return parsed;
  } catch {
    return null;
  }
}

function parseCookies(req: express.Request): Record<string, string> {
  const header = req.headers.cookie || '';
  const result: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      result[k] = decodeURIComponent(v);
    }
  }
  return result;
}

function isSecureRequest(req: express.Request): boolean {
  const proto = req.headers['x-forwarded-proto'];
  if (typeof proto === 'string' && proto.includes('https')) return true;
  return req.secure || process.env.NODE_ENV === 'production';
}

function setAuthCookie(
  req: express.Request,
  res: express.Response,
  cookieName: string,
  token: string,
  maxAgeSec = 86400 * 7
) {
  const parts = [
    `${cookieName}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSec}`,
  ];
  if (isSecureRequest(req)) {
    parts.push('Secure');
  }
  const existing = res.getHeader('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', [parts.join('; ')]);
  } else if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing.map(String), parts.join('; ')]);
  } else {
    res.setHeader('Set-Cookie', [String(existing), parts.join('; ')]);
  }
}

function clearAuthCookie(req: express.Request, res: express.Response, cookieName: string) {
  const parts = [`${cookieName}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (isSecureRequest(req)) {
    parts.push('Secure');
  }
  const existing = res.getHeader('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', [parts.join('; ')]);
  } else if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing.map(String), parts.join('; ')]);
  } else {
    res.setHeader('Set-Cookie', [String(existing), parts.join('; ')]);
  }
}

function getLecturerSession(req: express.Request): SessionPayload | null {
  const cookies = parseCookies(req);
  const fromCookie = verifySessionToken(cookies['hw_lecturer_session']);
  if (fromCookie && fromCookie.role === 'lecturer') return fromCookie;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const fromBearer = verifySessionToken(authHeader.slice(7).trim());
    if (fromBearer && fromBearer.role === 'lecturer') return fromBearer;
  }
  return null;
}

function getStudentSession(req: express.Request): SessionPayload | null {
  const cookies = parseCookies(req);
  const fromCookie = verifySessionToken(cookies['hw_student_session']);
  if (fromCookie && fromCookie.role === 'student') return fromCookie;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const fromBearer = verifySessionToken(authHeader.slice(7).trim());
    if (fromBearer && fromBearer.role === 'student') return fromBearer;
  }
  return null;
}

// ============================================================================
// LOGIN RATE LIMITER (PROTECTS TEACHER & STUDENT LOGIN FROM BRUTE FORCE)
// ============================================================================
interface RateLimitEntry {
  attempts: number;
  firstAttemptAt: number;
  blockedUntil: number;
}
const loginRateLimits = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_FAILED_ATTEMPTS = 5;

function getClientKey(req: express.Request, scope: string): string {
  const forwarded = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || 'local';
  const ip = Array.isArray(forwarded) ? forwarded[0] : String(forwarded).split(',')[0].trim();
  return `${scope}:${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = loginRateLimits.get(key);
  if (!entry) return { allowed: true, retryAfterSec: 0 };

  if (entry.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  if (now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    loginRateLimits.delete(key);
    return { allowed: true, retryAfterSec: 0 };
  }

  return { allowed: true, retryAfterSec: 0 };
}

function recordFailedAttempt(key: string, maxAllowed = MAX_FAILED_ATTEMPTS): void {
  const now = Date.now();
  const entry = loginRateLimits.get(key);
  if (!entry || now - entry.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    loginRateLimits.set(key, {
      attempts: 1,
      firstAttemptAt: now,
      blockedUntil: 0,
    });
    return;
  }
  entry.attempts += 1;
  if (entry.attempts >= maxAllowed) {
    entry.blockedUntil = now + RATE_LIMIT_WINDOW_MS;
  }
}

function clearFailedAttempts(key: string): void {
  loginRateLimits.delete(key);
}

// ============================================================================
// INITIAL UNIQUE STUDENT CODES SEED LIST
// ============================================================================
export const INITIAL_UNIQUE_STUDENT_CODES = [
  { code: 'ATLM-IKES-001', version: 1, assignedNpm: '24011001', assignedName: 'Aulia Rahma Putri' },
  { code: 'ATLM-IKES-002', version: 2, assignedNpm: '24011014', assignedName: 'Muhammad Farhan Pratama' },
  { code: 'ATLM-IKES-003', version: 3, assignedNpm: '24011028', assignedName: 'Siti Nabila Azzahra' },
  { code: 'ATLM-IKES-004', version: 4, assignedNpm: null, assignedName: null },
  { code: 'ATLM-IKES-005', version: 5, assignedNpm: null, assignedName: null },
  { code: 'ATLM-IKES-006', version: 6, assignedNpm: null, assignedName: null },
  { code: 'ATLM-IKES-007', version: 7, assignedNpm: null, assignedName: null },
  { code: 'ATLM-IKES-008', version: 8, assignedNpm: null, assignedName: null },
  { code: 'ATLM-IKES-009', version: 9, assignedNpm: null, assignedName: null },
  { code: 'ATLM-IKES-010', version: 10, assignedNpm: null, assignedName: null },
  { code: 'ATLM-IKES-011', version: 11, assignedNpm: null, assignedName: null },
  { code: 'ATLM-IKES-012', version: 12, assignedNpm: null, assignedName: null },
];

let isSeeded = false;
let seedingPromise: Promise<void> | null = null;

async function ensureDatabaseSeeded(): Promise<void> {
  if (isSeeded) return;
  if (seedingPromise) return seedingPromise;

  seedingPromise = (async () => {
    try {
      const configuredSecret = process.env.TEACHER_ACCESS_CODE?.trim();
      const targetPasswordHash = configuredSecret
        ? hashCode(configuredSecret)
        : DEFAULT_TEACHER_CODE_DIGEST;

      const existingLecturers = await db.select().from(lecturers).limit(1);
      if (existingLecturers.length === 0) {
        const lecturerUid = 'lecturer_dr_juwita_ikes';
        await db
          .insert(users)
          .values({
            uid: lecturerUid,
            email: 'juwita.ninda@ikesrajawali.ac.id',
            role: 'lecturer',
          })
          .onConflictDoNothing();

        await db.insert(lecturers).values({
          uid: lecturerUid,
          username: 'dr.juwita',
          fullName: 'dr. Juwita Ninda Suherman, M.Kes',
          title: 'Dosen Pengampu & Konsultan Hematologi Medik',
          institution: 'Institut Kesehatan Rajawali (IKES Rajawali) Bandung',
          passwordHash: targetPasswordHash,
          isBootstrapped: false,
        });
      } else if (!existingLecturers[0].isBootstrapped) {
        await db
          .update(lecturers)
          .set({ passwordHash: targetPasswordHash })
          .where(eq(lecturers.id, existingLecturers[0].id));
      }

      // Only remove a row if its codeHash literally equals the lecturer secret digest
      const existingCodes = await db.select().from(studentAccessCodes);
      for (const c of existingCodes) {
        if (c.codeHash === DEFAULT_TEACHER_CODE_DIGEST) {
          await db.delete(studentAccessCodes).where(eq(studentAccessCodes.id, c.id));
        } else {
          // Ensure codeHash is synchronized with the normalized raw code in codeDisplay
          const pureCode = extractRawCodeFromDisplay(c.codeDisplay);
          if (pureCode && pureCode.length >= 4) {
            const expectedHash = hashActivationCode(pureCode);
            if (c.codeHash !== expectedHash) {
              await db
                .update(studentAccessCodes)
                .set({ codeHash: expectedHash })
                .where(eq(studentAccessCodes.id, c.id));
            }
          }
        }
      }

      const refreshedCodes = await db.select().from(studentAccessCodes);
      if (refreshedCodes.length === 0) {
        for (const item of INITIAL_UNIQUE_STUDENT_CODES) {
          const isUsed = Boolean(item.assignedNpm);
          await db.insert(studentAccessCodes).values({
            codeHash: hashActivationCode(item.code),
            codeDisplay: isUsed
              ? `${item.code} • Digunakan oleh NPM ${item.assignedNpm} (${item.assignedName})`
              : `${item.code} • Kode Aktivasi Unik Mahasiswa (Tersedia - 1 Mahasiswa)`,
            version: item.version,
            className: isUsed
              ? `ATLM Reguler - IKES Rajawali [NPM:${item.assignedNpm}]`
              : 'ATLM Reguler - IKES Rajawali',
            isActive: !isUsed,
            activatedCount: isUsed ? 1 : 0,
            createdBy: 'dr. Juwita Ninda Suherman, M.Kes',
          });
        }
      }

      const existingSessions = await db.select().from(quizSessions).limit(1);
      if (existingSessions.length === 0) {
        await db.insert(quizSessions).values({
          sessionCode: 'ATLM-HEMATO-50',
          title: 'Ujian Kompetensi Hematologi & Indeks Eritrosit ATLM (50 Soal A-E)',
          mode: 'solo',
          timerSeconds: 60,
          isOpen: true,
        });
      }

      const existingQuestions = await db.select().from(questions);
      if (existingQuestions.length !== QUIZ_30_QUESTIONS.length) {
        await db.delete(answerOptions);
        await db.delete(questions);
        for (const q of QUIZ_30_QUESTIONS) {
          await db.insert(questions).values({
            questionNumber: q.questionNumber,
            category: q.category,
            subTopic: `[Bagian ${q.sectionCode}] ${q.topic}`,
            title: q.topic,
            anamnesis: q.caseTable?.anamnesis || null,
            physicalExam: q.caseTable?.physicalExam || null,
            labResults: q.caseTable?.labResults || null,
            questionText: q.questionText,
            correctOption: q.correctOption,
            explanationScientific: q.scientificExplanation,
            reasonA: q.options.A,
            reasonB: q.options.B,
            reasonC: q.options.C,
            reasonD: q.options.D,
            doctorExplanation: q.doctorClinicalExplanation,
            patientEducation: q.patientEducation,
            managementPlan: `${q.atlmProcedureAndDecision} | Alasan Pilihan Lain Keliru: ${q.whyOthersWrong}`,
            calculationSteps: q.calculationSteps || null,
            pdfPageRef: q.pdfPageRef,
          });

          const opts: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
          for (const key of opts) {
            await db.insert(answerOptions).values({
              questionNumber: q.questionNumber,
              optionKey: key,
              optionText: q.options[key],
            });
          }
        }
      }

      const existingModules = await db.select().from(learningModules).limit(1);
      if (existingModules.length === 0) {
        for (const m of HEMATOLOGY_MODULES) {
          await db.insert(learningModules).values({
            moduleNumber: m.moduleNumber,
            title: m.title,
            category: m.category,
            pdfPages: m.pdfPages.join(', '),
            summary: m.summary,
          });
        }
      }

      const existingGlossary = await db.select().from(glossaryTerms).limit(1);
      if (existingGlossary.length === 0) {
        for (const g of GLOSSARY_TERMS) {
          await db.insert(glossaryTerms).values({
            term: g.term,
            abbreviation: g.abbreviation || '-',
            englishTerm: g.englishTerm,
            category: g.category,
            definitionId: g.definition,
            roleFunction: g.functionRole,
            medicalExample: g.clinicalExample,
            hematologyRelation: g.hematologyRelation,
            pdfPageRef: String(g.pdfPageRef),
            isAdditionalMaterial: false,
          });
        }
      }

      const existingLeaderboard = await db.select().from(leaderboard).limit(1);
      if (existingLeaderboard.length === 0) {
        const seedStudents = [
          {
            npm: '24011001',
            fullName: 'Aulia Rahma Putri',
            className: 'ATLM Reguler A - IKES Rajawali',
            gender: 'female_atlm',
            codeUsed: 'ATLM-IKES-001',
            version: 1,
            score: 4860,
            clinicalScore: 20,
            theoryScore: 29,
            durationSec: 840,
            badgeTitle: 'Gold Hematology Champion & Erythrocyte Index Master',
          },
          {
            npm: '24011014',
            fullName: 'Muhammad Farhan Pratama',
            className: 'ATLM Reguler A - IKES Rajawali',
            gender: 'male_atlm',
            codeUsed: 'ATLM-IKES-002',
            version: 2,
            score: 4680,
            clinicalScore: 19,
            theoryScore: 28,
            durationSec: 910,
            badgeTitle: 'Silver Clinical Case Specialist',
          },
          {
            npm: '24011028',
            fullName: 'Siti Nabila Azzahra',
            className: 'ATLM Reguler B - IKES Rajawali',
            gender: 'female_atlm',
            codeUsed: 'ATLM-IKES-003',
            version: 3,
            score: 4520,
            clinicalScore: 18,
            theoryScore: 28,
            durationSec: 960,
            badgeTitle: 'Bronze Speed Diagnostic Star',
          },
        ];

        for (const s of seedStudents) {
          const token = `lifetime_${s.npm}_${hashActivationCode(s.codeUsed).slice(0, 12)}`;
          await db
            .insert(studentEntitlements)
            .values({
              npm: s.npm,
              studentName: s.fullName,
              activatedWithCodeVersion: s.version,
              activatedWithCodeDisplay: `${s.codeUsed} • Kode Aktivasi Unik Mahasiswa`,
              sessionToken: token,
              isLifetimeActive: true,
            })
            .onConflictDoNothing();

          await db
            .insert(studentProfiles)
            .values({
              npm: s.npm,
              fullName: s.fullName,
              className: s.className,
              xp: s.score,
              level: 5,
              highestScore: s.score,
              averageScore: s.score,
              quizCount: 1,
              completedModules: 10,
            })
            .onConflictDoNothing();

          await db.insert(leaderboard).values({
            npm: s.npm,
            studentName: s.fullName,
            gender: s.gender,
            bestScore: s.score,
            fastestDurationSeconds: s.durationSec,
            clinicalScore: s.clinicalScore,
            theoryScore: s.theoryScore,
            mcvScore: 5,
            mchScore: 5,
            mchcScore: 5,
            badgeTitle: s.badgeTitle,
          });
        }
      } else {
        // Self-healing migration for existing entitlements & profiles on startup
        const allEnts = await db.select().from(studentEntitlements);
        const allCodes = await db.select().from(studentAccessCodes);
        for (const ent of allEnts) {
          const normNpm = normalizeNpm(ent.npm);
          // Match bound code if version was out of sync
          const boundCode = allCodes.find(
            (c) =>
              c.className.includes(`[NPM:${normNpm}]`) ||
              c.codeDisplay.includes(`NPM ${normNpm}`)
          );
          const updates: Partial<typeof studentEntitlements.$inferInsert> = {};
          if (!ent.activatedWithCodeDisplay.startsWith('ATLM-')) {
            updates.activatedWithCodeDisplay = boundCode
              ? `${extractRawCodeFromDisplay(boundCode.codeDisplay)} • Kode Aktivasi Unik Mahasiswa`
              : `ATLM-IKES-00${ent.id} • Kode Aktivasi Unik Mahasiswa`;
          }
          if (boundCode && ent.activatedWithCodeVersion !== boundCode.version) {
            updates.activatedWithCodeVersion = boundCode.version;
          }
          if (Object.keys(updates).length > 0) {
            await db
              .update(studentEntitlements)
              .set(updates)
              .where(eq(studentEntitlements.id, ent.id));
          }
        }
      }

      isSeeded = true;
    } catch (error) {
      console.error('Database seed warning:', error);
    } finally {
      seedingPromise = null;
    }
  })();

  return seedingPromise;
}

/**
 * Self-Healing Account Integrity & Recovery Helper:
 * Ensures that if a student exists in ANY of studentEntitlements, studentProfiles, or
 * a used studentAccessCodes row, their complete account (users, studentEntitlements,
 * studentProfiles, avatarSettings) is repaired and synchronized in PostgreSQL.
 */
async function findAndHealStudentByNpm(rawNpm: string) {
  const cleanNpm = normalizeNpm(rawNpm);
  if (!cleanNpm) return null;

  // 1. Case-insensitive search in studentEntitlements
  const allEntitlements = await db
    .select()
    .from(studentEntitlements)
    .where(sql`UPPER(TRIM(${studentEntitlements.npm})) = ${cleanNpm}`);

  // 2. Case-insensitive search in studentProfiles
  const allProfiles = await db
    .select()
    .from(studentProfiles)
    .where(sql`UPPER(TRIM(${studentProfiles.npm})) = ${cleanNpm}`);

  // 3. Search in studentAccessCodes for any code bound to this NPM
  const allCodes = await db.select().from(studentAccessCodes);
  const boundCode = allCodes.find((c) => {
    const npmTag = c.className.match(/\[NPM:([^\]]+)\]/i)?.[1];
    const dispNpm = c.codeDisplay.match(/NPM\s+([A-Za-z0-9_-]+)/i)?.[1];
    return (
      (npmTag && normalizeNpm(npmTag) === cleanNpm) ||
      (dispNpm && normalizeNpm(dispNpm) === cleanNpm)
    );
  });

  if (allEntitlements.length === 0 && allProfiles.length === 0 && !boundCode) {
    return null;
  }

  let entitlement = allEntitlements[0] || null;
  let profile = allProfiles[0] || null;

  const resolvedNpm = entitlement?.npm || profile?.npm || cleanNpm;
  const resolvedName =
    profile?.fullName ||
    entitlement?.studentName ||
    boundCode?.codeDisplay.match(/\(([^)]+)\)\s*$/)?.[1] ||
    `Mahasiswa ATLM (${resolvedNpm})`;
  const resolvedClass =
    profile?.className ||
    boundCode?.className.split('[NPM:')[0].trim() ||
    'ATLM Reguler - IKES Rajawali';
  const resolvedVersion =
    boundCode?.version || entitlement?.activatedWithCodeVersion || 1;
  const resolvedCodeLabel = boundCode
    ? `${extractRawCodeFromDisplay(boundCode.codeDisplay)} • Kode Aktivasi Unik Mahasiswa`
    : entitlement?.activatedWithCodeDisplay || `ATLM-IKES-${String(resolvedVersion).padStart(3, '0')} • Kode Aktivasi Unik Mahasiswa`;

  // Auto-heal missing entitlement if student existed in profiles or bound code
  if (!entitlement) {
    const internalToken = `lifetime_${resolvedNpm}_${hashCode(resolvedCodeLabel).slice(0, 12)}`;
    const [insertedEnt] = await db
      .insert(studentEntitlements)
      .values({
        npm: resolvedNpm,
        studentName: resolvedName,
        activatedWithCodeVersion: resolvedVersion,
        activatedWithCodeDisplay: resolvedCodeLabel,
        sessionToken: internalToken,
        isLifetimeActive: true,
      })
      .onConflictDoNothing()
      .returning();

    if (insertedEnt) {
      entitlement = insertedEnt;
    } else {
      const refetched = await db
        .select()
        .from(studentEntitlements)
        .where(sql`UPPER(TRIM(${studentEntitlements.npm})) = ${cleanNpm}`)
        .limit(1);
      entitlement = refetched[0] || null;
    }
  }

  // Auto-heal missing profile if student existed in entitlement or bound code
  if (!profile) {
    const [insertedProf] = await db
      .insert(studentProfiles)
      .values({
        npm: resolvedNpm,
        fullName: resolvedName,
        className: resolvedClass,
        xp: 100,
        level: 1,
      })
      .onConflictDoNothing()
      .returning();
    profile = insertedProf || null;
  }

  // Ensure users & avatarSettings exist
  await db
    .insert(users)
    .values({
      uid: `student_${resolvedNpm}`,
      email: `${resolvedNpm.toLowerCase()}@student.ikesrajawali.ac.id`,
      role: 'student',
    })
    .onConflictDoNothing();

  await db
    .insert(avatarSettings)
    .values({
      npm: resolvedNpm,
      gender: 'female_atlm',
      hairStyle: 'modern',
      skinTone: '#f1c27d',
      uniformType: 'lab_coat',
      shoeColor: '#0f172a',
      accessory: 'ATLM IKES Rajawali',
    })
    .onConflictDoNothing();

  return {
    entitlement,
    profile,
    boundCode,
    resolvedNpm,
  };
}

// Helper to build detailed review from stored answers JSON
function buildDetailedReviewFromAnswers(
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

async function buildFullStudentPayload(npm: string) {
  const healed = await findAndHealStudentByNpm(npm);
  if (!healed || !healed.entitlement) return null;

  const ent = healed.entitlement;
  const cleanNpm = healed.resolvedNpm;
  const profile = healed.profile;

  const avatarRows = await db
    .select()
    .from(avatarSettings)
    .where(eq(avatarSettings.npm, cleanNpm))
    .limit(1);

  const studentBadges = await db
    .select()
    .from(achievements)
    .where(eq(achievements.npm, cleanNpm));

  const studentModProgress = await db
    .select()
    .from(studentProgress)
    .where(eq(studentProgress.npm, cleanNpm));

  const attempts = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.npm, cleanNpm))
    .orderBy(desc(quizAttempts.completedAt))
    .limit(20);

  const bestAccuracy =
    attempts.length > 0
      ? Math.max(
          ...attempts.map((a) =>
            Number(((a.correctCount / (a.totalQuestions || 50)) * 100).toFixed(1))
          )
        )
      : profile?.highestScore
      ? 92.0
      : 0;

  let latestSummary = null;
  let latestReview = null;
  if (attempts.length > 0) {
    const latest = attempts[0];
    let parsedAns: Array<{ questionNumber: number; selectedOption: string; timeSpentSec?: number }> = [];
    try {
      parsedAns = JSON.parse(latest.answersJson || '[]');
    } catch {
      parsedAns = [];
    }
    const rebuilt = buildDetailedReviewFromAnswers(parsedAns);
    const totalQ = latest.totalQuestions || QUIZ_30_QUESTIONS.length;
    const acc = Number(((latest.correctCount / totalQ) * 100).toFixed(1));
    let gradeLabel = 'Perlu Penguatan Kompetensi';
    if (acc >= 90) gradeLabel = 'A (Sangat Memuaskan — Hematology Expert)';
    else if (acc >= 80) gradeLabel = 'AB (Kompeten Tinggi — Senior Analyst)';
    else if (acc >= 70) gradeLabel = 'B (Kompeten — ATLM Praktisi)';
    else if (acc >= 60) gradeLabel = 'BC (Cukup Kompeten)';

    latestSummary = {
      npm: cleanNpm,
      fullName: profile?.fullName || ent.studentName,
      className: profile?.className || latest.className,
      totalQuestions: totalQ,
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

  const pureActivatedCode = extractRawCodeFromDisplay(ent.activatedWithCodeDisplay);

  return {
    npm: ent.npm,
    fullName: profile?.fullName || ent.studentName,
    className: profile?.className || 'ATLM Reguler - IKES Rajawali',
    avatarGender:
      avatarRows[0]?.gender === 'male_atlm' ? ('male_atlm' as const) : ('female_atlm' as const),
    xp: profile?.xp || 100,
    level: profile?.level || 1,
    highestScore: profile?.highestScore || 0,
    bestAccuracy,
    quizCount: attempts.length || profile?.quizCount || 0,
    isLifetimeActive: ent.isLifetimeActive,
    activatedWithVersion: ent.activatedWithCodeVersion,
    activatedWithCodeDisplay: pureActivatedCode,
    activatedCode: pureActivatedCode,
    activatedAt: ent.activatedAt,
    avatar: avatarRows[0] || null,
    achievements: studentBadges,
    completedModules: Array.from(new Set(studentModProgress.map((p) => p.moduleNumber))),
    quizHistory: attempts.map((a) => ({
      id: a.id,
      attemptUuid: a.attemptUuid,
      sessionCode: a.sessionCode,
      totalQuestions: a.totalQuestions || 50,
      correctCount: a.correctCount,
      wrongCount: a.wrongCount,
      accuracyPercent: Number(
        ((a.correctCount / (a.totalQuestions || 50)) * 100).toFixed(1)
      ),
      score: a.score,
      durationSeconds: a.durationSeconds,
      completedAt: a.completedAt,
    })),
    latestSummary,
    latestReview,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  app.use('/api', async (_req, _res, next) => {
    await ensureDatabaseSeeded();
    next();
  });

  // =========================================================================
  // 0. UNIFIED SESSION CHECK & LOGOUT (/api/auth/me, /api/auth/logout)
  // =========================================================================
  app.get('/api/auth/me', async (req, res) => {
    try {
      const lecturerSess = getLecturerSession(req);
      const studentSess = getStudentSession(req);

      let lecturerData = null;
      if (lecturerSess) {
        const allLecturers = await db.select().from(lecturers).limit(1);
        const l = allLecturers[0];
        lecturerData = {
          fullName: l?.fullName || lecturerSess.name,
          username: l?.username || lecturerSess.sub,
          institution: l?.institution || 'Institut Kesehatan Rajawali Bandung',
          bootstrapCompleted: l?.isBootstrapped ?? false,
        };
      }

      let studentData = null;
      if (studentSess) {
        const fullStudent = await buildFullStudentPayload(studentSess.sub);
        if (fullStudent && fullStudent.isLifetimeActive) {
          studentData = fullStudent;
        }
      }

      return res.json({
        authenticated: Boolean(lecturerData || studentData),
        lecturerAuthenticated: Boolean(lecturerData),
        studentAuthenticated: Boolean(studentData),
        role: lecturerData ? 'lecturer' : studentData ? 'student' : 'visitor',
        lecturer: lecturerData,
        student: studentData,
      });
    } catch (error) {
      console.error('Auth me error:', error);
      return res.status(500).json({ error: 'Gagal memeriksa sesi autentikasi.' });
    }
  });

  const handleLogout = (req: express.Request, res: express.Response) => {
    clearAuthCookie(req, res, 'hw_lecturer_session');
    clearAuthCookie(req, res, 'hw_student_session');
    return res.json({ success: true, message: 'Sesi berhasil diakhiri.' });
  };

  app.post('/api/auth/logout', handleLogout);
  app.post('/api/teacher-logout', handleLogout);
  app.post('/api/student-logout', handleLogout);

  // =========================================================================
  // 1. LECTURER AUTHENTICATION (/api/teacher-login & /api/auth/lecturer/login)
  // =========================================================================
  const handleLecturerLogin = async (req: express.Request, res: express.Response) => {
    const rateKey = getClientKey(req, 'teacher_login');
    const rateStatus = checkRateLimit(rateKey);
    if (!rateStatus.allowed) {
      return res.status(429).json({
        error: `Terlalu banyak percobaan login gagal. Silakan tunggu ${rateStatus.retryAfterSec} detik sebelum mencoba kembali.`,
      });
    }

    try {
      const { accessCode, bootstrapCode, username, password } = req.body || {};
      const codeInput = accessCode ?? bootstrapCode;
      const allLecturers = await db.select().from(lecturers).limit(1);
      const lecturer = allLecturers[0];

      const envSecret = process.env.TEACHER_ACCESS_CODE?.trim();
      const validHashes = new Set<string>([DEFAULT_TEACHER_CODE_DIGEST]);
      if (envSecret) validHashes.add(hashCode(envSecret));
      if (lecturer?.passwordHash) validHashes.add(lecturer.passwordHash);

      let isAuthenticated = false;

      if (codeInput && String(codeInput).trim().length > 0) {
        const inputHash = hashCode(String(codeInput));
        for (const h of validHashes) {
          if (safeCompareHex(inputHash, h)) {
            isAuthenticated = true;
            break;
          }
        }
      } else if (username && password && lecturer) {
        const cleanUser = String(username).trim().toLowerCase();
        const passHash = hashCode(String(password));
        if (cleanUser === lecturer.username.toLowerCase()) {
          for (const h of validHashes) {
            if (safeCompareHex(passHash, h)) {
              isAuthenticated = true;
              break;
            }
          }
        }
      }

      if (!isAuthenticated) {
        recordFailedAttempt(rateKey);
        return res.status(401).json({
          error: 'Kode akses atau kredensial dosen tidak valid.',
        });
      }

      clearFailedAttempts(rateKey);
      const fullName = lecturer?.fullName || 'dr. Juwita Ninda Suherman, M.Kes';
      const userSub = lecturer?.username || 'dr.juwita';
      const sessionToken = signSessionToken({
        role: 'lecturer',
        sub: userSub,
        name: fullName,
      });

      setAuthCookie(req, res, 'hw_lecturer_session', sessionToken, 86400 * 3);

      return res.json({
        success: true,
        role: 'lecturer',
        lecturer: {
          fullName,
          username: userSub,
          institution: lecturer?.institution || 'Institut Kesehatan Rajawali Bandung',
          bootstrapCompleted: lecturer?.isBootstrapped ?? false,
        },
      });
    } catch (error) {
      console.error('Lecturer login error:', error);
      return res.status(500).json({ error: 'Gagal memproses autentikasi dosen.' });
    }
  };

  app.post('/api/teacher-login', handleLecturerLogin);
  app.post('/api/auth/lecturer/login', handleLecturerLogin);

  // Middleware to strictly enforce Lecturer Authorization
  const requireLecturerAuth: express.RequestHandler = (req, res, next) => {
    const sess = getLecturerSession(req);
    if (!sess) {
      return res.status(401).json({
        error: 'Akses ditolak. Endpoint ini hanya dapat diakses oleh Dosen yang telah login.',
      });
    }
    next();
  };

  // Middleware to enforce Student or Lecturer Authorization
  const requireStudentOrLecturerAuth: express.RequestHandler = (req, res, next) => {
    const studentSess = getStudentSession(req);
    const lecturerSess = getLecturerSession(req);
    if (!studentSess && !lecturerSess) {
      return res.status(401).json({
        error: 'Sesi mahasiswa belum aktif. Silakan login atau aktifkan akun mahasiswa terlebih dahulu.',
      });
    }
    next();
  };

  app.post('/api/auth/lecturer/setup-credentials', requireLecturerAuth, async (req, res) => {
    try {
      const { newUsername, newPassword, fullName } = req.body;
      if (!newUsername || !newPassword || String(newPassword).trim().length < 6) {
        return res.status(400).json({
          error: 'Username dan kode/password baru minimal 6 karakter wajib diisi.',
        });
      }

      const allLecturers = await db.select().from(lecturers).limit(1);
      if (allLecturers.length > 0) {
        await db
          .update(lecturers)
          .set({
            username: String(newUsername).trim(),
            passwordHash: hashCode(String(newPassword)),
            fullName: fullName ? String(fullName).trim() : allLecturers[0].fullName,
            isBootstrapped: true,
          })
          .where(eq(lecturers.id, allLecturers[0].id));
      }

      return res.json({
        success: true,
        message: 'Kredensial pribadi dosen berhasil diperbarui dan diamankan.',
      });
    } catch (error) {
      console.error('Setup lecturer credentials error:', error);
      return res.status(500).json({ error: 'Gagal memperbarui kredensial dosen.' });
    }
  });

  // =========================================================================
  // 2. STUDENT LIFETIME ACCESS ACTIVATION & RETURNING LOGIN (ATOMIC & SELF-HEALING)
  // =========================================================================
  const handleStudentActivateOrLogin = async (req: express.Request, res: express.Response) => {
    const rawBody = req.body || {};
    const cleanNpm = normalizeNpm(rawBody.npm);
    const cleanName = String(rawBody.fullName || '').trim();
    const cleanClass = String(rawBody.className || 'ATLM Reguler - IKES Rajawali').trim();
    const cleanCode = normalizeActivationCode(rawBody.accessCode);
    const selectedGender = rawBody.avatarGender === 'male_atlm' ? 'male_atlm' : 'female_atlm';
    const mode = String(rawBody.mode || (cleanCode ? 'activate' : 'login')).toLowerCase();

    // Per-student rate limit key so classroom students on the same Wi-Fi/NAT do not block each other
    const rateKey = getClientKey(req, `student_auth:${cleanNpm || 'anon'}`);
    const rateStatus = checkRateLimit(rateKey);
    if (!rateStatus.allowed) {
      return res.status(429).json({
        error: `Terlalu banyak percobaan gagal untuk NPM ini. Silakan tunggu ${rateStatus.retryAfterSec} detik sebelum mencoba kembali.`,
      });
    }

    if (!cleanNpm || cleanNpm.length < 3) {
      return res.status(400).json({
        error: 'Nomor Pokok Mahasiswa (NPM) wajib diisi dengan benar.',
      });
    }

    // Serialize activation/login per code and per NPM to eliminate race conditions
    const lockKey = cleanCode ? `code:${cleanCode}` : `npm:${cleanNpm}`;

    return withAsyncLock(lockKey, async () => {
      try {
        // STEP 1: If an activation code was supplied, validate it against the main database
        let matchedCodeRecord: typeof studentAccessCodes.$inferSelect | null = null;
        if (cleanCode) {
          if (cleanCode.length < 4) {
            recordFailedAttempt(rateKey, 10);
            return res.status(400).json({
              error: 'Format kode aktivasi tidak sesuai. Pastikan kode minimal 4 karakter.',
            });
          }

          const inputCodeHash = hashActivationCode(cleanCode);
          const allCodes = await db.select().from(studentAccessCodes);

          // Match either by exact normalized SHA-256 hash OR by normalized pure code prefix in codeDisplay
          matchedCodeRecord =
            allCodes.find(
              (c) =>
                c.codeHash === inputCodeHash ||
                extractRawCodeFromDisplay(c.codeDisplay) === cleanCode
            ) || null;

          if (!matchedCodeRecord) {
            recordFailedAttempt(rateKey, 10);
            return res.status(401).json({
              error: 'Kode aktivasi tidak ditemukan. Pastikan kode sesuai dengan yang diterbitkan oleh Dosen.',
            });
          }

          // Auto-sync codeHash if it was matched by normalized display string
          if (matchedCodeRecord.codeHash !== inputCodeHash) {
            await db
              .update(studentAccessCodes)
              .set({ codeHash: inputCodeHash })
              .where(eq(studentAccessCodes.id, matchedCodeRecord.id));
            matchedCodeRecord.codeHash = inputCodeHash;
          }

          // Check if this code is already bound to another student's NPM
          const npmTagMatch = matchedCodeRecord.className.match(/\[NPM:([^\]]+)\]/i);
          const displayNpmMatch = matchedCodeRecord.codeDisplay.match(/NPM\s+([A-Za-z0-9_-]+)/i);
          const boundNpm = normalizeNpm(npmTagMatch?.[1] || displayNpmMatch?.[1] || '');

          if (boundNpm && boundNpm !== cleanNpm) {
            recordFailedAttempt(rateKey, 10);
            return res.status(403).json({
              error:
                'Kode aktivasi sudah digunakan oleh mahasiswa lain. Setiap kode aktivasi bersifat unik dan hanya berlaku untuk satu mahasiswa.',
            });
          }

          // Also check if another student entitlement already claimed this specific code display
          const pureCode = extractRawCodeFromDisplay(matchedCodeRecord.codeDisplay);
          const allEnts = await db.select().from(studentEntitlements);
          const otherOwner = allEnts.find(
            (e) =>
              normalizeNpm(e.npm) !== cleanNpm &&
              extractRawCodeFromDisplay(e.activatedWithCodeDisplay) === pureCode
          );
          if (otherOwner) {
            recordFailedAttempt(rateKey, 10);
            return res.status(403).json({
              error:
                'Kode aktivasi sudah digunakan oleh mahasiswa lain. Satu kode aktivasi tidak dapat dipakai untuk mengaktifkan akun mahasiswa berbeda.',
            });
          }
        }

        // STEP 2: Check if this student (NPM) ALREADY has an activated account (with self-healing across tables)
        const existingAccount = await findAndHealStudentByNpm(cleanNpm);

        if (existingAccount && existingAccount.entitlement) {
          const entitlement = existingAccount.entitlement;
          const resolvedNpm = existingAccount.resolvedNpm;

          if (!entitlement.isLifetimeActive) {
            return res.status(403).json({
              error: 'Status akun mahasiswa ini sedang dinonaktifkan sementara oleh Dosen Pengampu.',
            });
          }

          // If the student is already active and accidentally tried to use a DIFFERENT unused code on the activate tab,
          // do NOT consume the new code — inform them or log them in if they used their own code
          if (cleanCode && matchedCodeRecord) {
            const existingPureCode = extractRawCodeFromDisplay(entitlement.activatedWithCodeDisplay);
            const submittedPureCode = extractRawCodeFromDisplay(matchedCodeRecord.codeDisplay);

            if (
              existingPureCode &&
              submittedPureCode &&
              existingPureCode !== submittedPureCode &&
              matchedCodeRecord.activatedCount === 0
            ) {
              // Student is already active! Log them in without consuming the new unused code
              await db
                .update(studentEntitlements)
                .set({ lastAccessedAt: new Date() })
                .where(eq(studentEntitlements.id, entitlement.id));

              clearFailedAttempts(rateKey);
              const fullStudent = await buildFullStudentPayload(resolvedNpm);
              const sessionToken = signSessionToken({
                role: 'student',
                sub: resolvedNpm,
                name: fullStudent?.fullName || entitlement.studentName,
                className: fullStudent?.className || cleanClass,
              });
              setAuthCookie(req, res, 'hw_student_session', sessionToken, 86400 * 30);

              return res.json({
                success: true,
                isExistingLifetime: true,
                message: `Akun NPM ${resolvedNpm} sudah aktif permanen sebelumnya (Kode ${matchedCodeRecord ? submittedPureCode : ''} tidak dikonsumsi ulang). Selamat datang kembali, ${fullStudent?.fullName || entitlement.studentName}!`,
                student: fullStudent,
              });
            }
          }

          // Update profile name/class if supplied during re-login/recovery
          if (cleanName && cleanName.length >= 2 && existingAccount.profile) {
            await db
              .update(studentProfiles)
              .set({
                fullName: cleanName,
                className: cleanClass || existingAccount.profile.className,
                updatedAt: new Date(),
              })
              .where(eq(studentProfiles.id, existingAccount.profile.id));
          }

          await db
            .update(studentEntitlements)
            .set({ lastAccessedAt: new Date() })
            .where(eq(studentEntitlements.id, entitlement.id));

          clearFailedAttempts(rateKey);

          const fullStudent = await buildFullStudentPayload(resolvedNpm);
          const sessionToken = signSessionToken({
            role: 'student',
            sub: resolvedNpm,
            name: fullStudent?.fullName || entitlement.studentName,
            className: fullStudent?.className || cleanClass,
          });

          setAuthCookie(req, res, 'hw_student_session', sessionToken, 86400 * 30);

          return res.json({
            success: true,
            isExistingLifetime: true,
            message: `Selamat datang kembali, ${fullStudent?.fullName || entitlement.studentName}! Sesi Akses Seumur Hidup Anda aktif.`,
            student: fullStudent,
          });
        }

        // STEP 3: New Student Activation (Account does not exist yet)
        if (!cleanCode || !matchedCodeRecord) {
          recordFailedAttempt(rateKey, 10);
          return res.status(404).json({
            error:
              mode === 'login'
                ? `Akun mahasiswa dengan NPM ${cleanNpm} belum diaktifkan. Silakan lakukan aktivasi pertama kali menggunakan Kode Aktivasi Unik dari Dosen.`
                : 'Kode aktivasi wajib diisi untuk mengaktifkan akun mahasiswa baru.',
          });
        }

        if (matchedCodeRecord.activatedCount > 0) {
          recordFailedAttempt(rateKey, 10);
          return res.status(403).json({
            error:
              'Kode aktivasi sudah digunakan dan telah mencapai batas penggunaan (1 mahasiswa).',
          });
        }

        if (!matchedCodeRecord.isActive) {
          recordFailedAttempt(rateKey, 10);
          return res.status(403).json({
            error: 'Kode aktivasi telah dinonaktifkan oleh Dosen.',
          });
        }

        const effectiveName =
          cleanName && cleanName.length >= 2 ? cleanName : `Mahasiswa ATLM (${cleanNpm})`;
        const rawCodeLabel = extractRawCodeFromDisplay(matchedCodeRecord.codeDisplay) || cleanCode;
        const internalToken = `lifetime_${cleanNpm}_${hashActivationCode(rawCodeLabel).slice(0, 12)}`;

        // STEP 4: Execute Atomic Database Transaction for Code Consumption + Account & Profile Creation
        await db.transaction(async (tx) => {
          // Atomic conditional update: only succeeds if activated_count === 0 and is_active === true
          const claimedCodes = await tx
            .update(studentAccessCodes)
            .set({
              isActive: false,
              activatedCount: sql`${studentAccessCodes.activatedCount} + 1`,
              codeDisplay: `${rawCodeLabel} • Digunakan oleh NPM ${cleanNpm} (${effectiveName})`,
              className: `${cleanClass} [NPM:${cleanNpm}]`,
            })
            .where(
              and(
                eq(studentAccessCodes.id, matchedCodeRecord!.id),
                eq(studentAccessCodes.activatedCount, 0),
                eq(studentAccessCodes.isActive, true)
              )
            )
            .returning();

          if (claimedCodes.length === 0) {
            throw new Error('CODE_ALREADY_CLAIMED');
          }

          // Create authentication user record
          await tx
            .insert(users)
            .values({
              uid: `student_${cleanNpm}`,
              email: `${cleanNpm.toLowerCase()}@student.ikesrajawali.ac.id`,
              role: 'student',
            })
            .onConflictDoNothing();

          // Create permanent lifetime student entitlement linked to lecturer's code
          await tx
            .insert(studentEntitlements)
            .values({
              npm: cleanNpm,
              studentName: effectiveName,
              activatedWithCodeVersion: matchedCodeRecord!.version,
              activatedWithCodeDisplay: `${rawCodeLabel} • Kode Aktivasi Unik Mahasiswa`,
              sessionToken: internalToken,
              isLifetimeActive: true,
            })
            .onConflictDoUpdate({
              target: studentEntitlements.npm,
              set: {
                studentName: effectiveName,
                activatedWithCodeVersion: matchedCodeRecord!.version,
                activatedWithCodeDisplay: `${rawCodeLabel} • Kode Aktivasi Unik Mahasiswa`,
                isLifetimeActive: true,
                lastAccessedAt: new Date(),
              },
            });

          // Create permanent student profile
          await tx
            .insert(studentProfiles)
            .values({
              npm: cleanNpm,
              fullName: effectiveName,
              className: cleanClass,
              xp: 100,
              level: 1,
            })
            .onConflictDoUpdate({
              target: studentProfiles.npm,
              set: {
                fullName: effectiveName,
                className: cleanClass,
                updatedAt: new Date(),
              },
            });

          // Create student avatar settings
          await tx
            .insert(avatarSettings)
            .values({
              npm: cleanNpm,
              gender: selectedGender,
              hairStyle: 'modern',
              skinTone: '#f1c27d',
              uniformType: 'lab_coat',
              shoeColor: '#0f172a',
              accessory: 'ATLM IKES Rajawali',
            })
            .onConflictDoNothing();

          // Award lifetime activation badge
          await tx.insert(achievements).values({
            npm: cleanNpm,
            achievementCode: 'LIFETIME_ATLM_ACTIVATED',
            title: 'ATLM Cadet — Lifetime Access Activated',
          });
        });

        clearFailedAttempts(rateKey);

        const fullStudent = await buildFullStudentPayload(cleanNpm);
        const sessionToken = signSessionToken({
          role: 'student',
          sub: cleanNpm,
          name: effectiveName,
          className: cleanClass,
        });

        setAuthCookie(req, res, 'hw_student_session', sessionToken, 86400 * 30);

        return res.json({
          success: true,
          isExistingLifetime: false,
          message:
            'Aktivasi berhasil, akun mahasiswa telah dibuat dan terikat permanen seumur hidup dengan NPM Anda!',
          student: fullStudent,
        });
      } catch (error: any) {
        if (error?.message === 'CODE_ALREADY_CLAIMED') {
          recordFailedAttempt(rateKey, 10);
          return res.status(403).json({
            error:
              'Kode aktivasi sudah digunakan oleh mahasiswa lain secara bersamaan. Setiap kode hanya berlaku untuk satu mahasiswa.',
          });
        }
        console.error('Student activation/login error:', error);
        return res.status(500).json({
          error: 'Terjadi gangguan koneksi saat memproses aktivasi/login, silakan coba kembali.',
        });
      }
    });
  };

  app.post('/api/auth/student/activate', handleStudentActivateOrLogin);
  app.post('/api/student-login', handleStudentActivateOrLogin);
  app.post('/api/auth/student/session', handleStudentActivateOrLogin);

  // =========================================================================
  // 3. LECTURER ACCESS CODE MANAGEMENT (PROTECTED BY requireLecturerAuth)
  // =========================================================================
  app.get('/api/lecturer/access-codes', requireLecturerAuth, async (_req, res) => {
    try {
      const codes = await db
        .select()
        .from(studentAccessCodes)
        .orderBy(desc(studentAccessCodes.version));
      const entitlements = await db
        .select()
        .from(studentEntitlements)
        .orderBy(desc(studentEntitlements.activatedAt));

      return res.json({
        accessCodes: codes.map((c) => {
          const pureCode = extractRawCodeFromDisplay(c.codeDisplay);
          const matchedEnt = entitlements.find(
            (e) =>
              e.activatedWithCodeVersion === c.version ||
              extractRawCodeFromDisplay(e.activatedWithCodeDisplay) === pureCode
          );
          const npmTag = c.className.match(/\[NPM:([^\]]+)\]/i)?.[1];
          const dispNpm = c.codeDisplay.match(/NPM\s+([A-Za-z0-9_-]+)/i)?.[1];
          const dispName = c.codeDisplay.match(/\(([^)]+)\)\s*$/)?.[1];
          const isUsed = c.activatedCount > 0 || Boolean(matchedEnt);
          const statusLabel: 'Tersedia' | 'Sudah Digunakan' | 'Dinonaktifkan' = isUsed
            ? 'Sudah Digunakan'
            : c.isActive
            ? 'Tersedia'
            : 'Dinonaktifkan';
          const rawCategory = c.className.split('[NPM:')[0].trim() || 'ATLM Reguler - IKES Rajawali';
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
            usedByStudentNpm: isUsed ? matchedEnt?.npm || npmTag || dispNpm || null : null,
            usedByStudentName: isUsed ? matchedEnt?.studentName || dispName || null : null,
            createdBy: c.createdBy,
            createdAt: c.createdAt,
          };
        }),
        entitlements,
      });
    } catch (error) {
      console.error('Get access codes error:', error);
      return res.status(500).json({ error: 'Gagal memuat data kode aktivasi mahasiswa.' });
    }
  });

  app.post('/api/lecturer/access-codes', requireLecturerAuth, async (req, res) => {
    return withAsyncLock('lecturer_generate_codes', async () => {
      try {
        const { newCode, codeDisplay, codeLabel, label, batchCount } = req.body || {};
        const resolvedCode = newCode || codeDisplay;
        const resolvedLabel = String(codeLabel || label || 'Kode Aktivasi Unik Mahasiswa').trim();

        const existing = await db
          .select()
          .from(studentAccessCodes)
          .orderBy(desc(studentAccessCodes.version));
        let nextVersion =
          existing.length > 0 ? Math.max(...existing.map((c) => c.version)) + 1 : 1;

        const existingHashes = new Set(existing.map((c) => c.codeHash));
        const existingPureCodes = new Set(
          existing.map((c) => extractRawCodeFromDisplay(c.codeDisplay))
        );

        // Support generating a batch of unique 1-per-student codes atomically
        if (batchCount && Number(batchCount) > 0) {
          const count = Math.min(200, Math.max(1, Number(batchCount)));
          const generatedCodes: string[] = [];
          const createdRecords: Array<typeof studentAccessCodes.$inferSelect> = [];

          await db.transaction(async (tx) => {
            for (let i = 0; i < count; i++) {
              let uniqueCode = '';
              let codeHashVal = '';
              do {
                const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
                uniqueCode = normalizeActivationCode(
                  `ATLM-${String(nextVersion).padStart(3, '0')}-${suffix}`
                );
                codeHashVal = hashActivationCode(uniqueCode);
              } while (existingHashes.has(codeHashVal) || existingPureCodes.has(uniqueCode));

              existingHashes.add(codeHashVal);
              existingPureCodes.add(uniqueCode);

              const [inserted] = await tx
                .insert(studentAccessCodes)
                .values({
                  codeHash: codeHashVal,
                  codeDisplay: `${uniqueCode} • ${resolvedLabel} (Tersedia - 1 Mahasiswa)`,
                  version: nextVersion,
                  className: 'ATLM Reguler - IKES Rajawali',
                  isActive: true,
                  activatedCount: 0,
                  createdBy: 'dr. Juwita Ninda Suherman, M.Kes',
                })
                .returning();

              createdRecords.push(inserted);
              generatedCodes.push(uniqueCode);
              nextVersion++;
            }
          });

          return res.json({
            success: true,
            message: `${generatedCodes.length} Kode Aktivasi Unik (1 Kode = 1 Mahasiswa) berhasil diterbitkan dan tersimpan di database: ${generatedCodes.join(', ')}`,
            generatedCodes,
            accessCodes: createdRecords.map((c) => ({
              id: c.id,
              pureCode: extractRawCodeFromDisplay(c.codeDisplay),
              codeLabel: c.codeDisplay,
              version: c.version,
              isActive: c.isActive,
              activatedCount: c.activatedCount,
              createdBy: c.createdBy,
              createdAt: c.createdAt,
            })),
          });
        }

        const rawCode = normalizeActivationCode(resolvedCode);
        if (!rawCode || rawCode.length < 4) {
          return res
            .status(400)
            .json({ error: 'Kode aktivasi unik mahasiswa minimal 4 karakter.' });
        }

        const targetHash = hashActivationCode(rawCode);
        if (existingHashes.has(targetHash) || existingPureCodes.has(rawCode)) {
          return res.status(400).json({
            error: 'Kode aktivasi tersebut sudah pernah dibuat. Gunakan kode unik yang berbeda.',
          });
        }

        const [created] = await db
          .insert(studentAccessCodes)
          .values({
            codeHash: targetHash,
            codeDisplay: `${rawCode} • ${resolvedLabel} (Tersedia - 1 Mahasiswa)`,
            version: nextVersion,
            className: 'ATLM Reguler - IKES Rajawali',
            isActive: true,
            activatedCount: 0,
            createdBy: 'dr. Juwita Ninda Suherman, M.Kes',
          })
          .returning();

        return res.json({
          success: true,
          message: `Kode Aktivasi Unik ${rawCode} (Versi #${nextVersion}) berhasil diterbitkan dan siap digunakan oleh 1 mahasiswa.`,
          pureCode: rawCode,
          accessCode: {
            ...created,
            pureCode: rawCode,
            codeLabel: created.codeDisplay,
          },
        });
      } catch (error) {
        console.error('Create access code error:', error);
        return res.status(500).json({ error: 'Gagal menerbitkan kode aktivasi baru.' });
      }
    });
  });

  app.patch('/api/lecturer/access-codes/:id', requireLecturerAuth, async (req, res) => {
    try {
      const codeId = Number(req.params.id);
      const { isActive } = req.body;
      const existing = await db
        .select()
        .from(studentAccessCodes)
        .where(eq(studentAccessCodes.id, codeId))
        .limit(1);

      if (existing.length > 0 && existing[0].activatedCount > 0 && isActive) {
        return res.status(400).json({
          error:
            'Kode yang sudah digunakan oleh mahasiswa tidak dapat diaktifkan ulang untuk mahasiswa lain.',
        });
      }

      await db
        .update(studentAccessCodes)
        .set({ isActive: Boolean(isActive) })
        .where(eq(studentAccessCodes.id, codeId));

      return res.json({
        success: true,
        message:
          'Status kode aktivasi diperbarui tanpa memengaruhi akses seumur hidup mahasiswa yang sudah aktif.',
      });
    } catch (error) {
      console.error('Toggle access code error:', error);
      return res.status(500).json({ error: 'Gagal mengubah status kode aktivasi.' });
    }
  });

  // =========================================================================
  // 4. 50-QUESTION QUIZ ENGINE (OPTIONS A-E) & QUIZ HISTORY
  // =========================================================================
  app.get('/api/quiz/questions', async (_req, res) => {
    try {
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

      return res.json({
        totalQuestions: sanitizedQuestions.length,
        sectionACount: sanitizedQuestions.filter((q) => q.sectionCode === 'A').length,
        sectionBCount: sanitizedQuestions.filter((q) => q.sectionCode === 'B').length,
        sectionCCount: sanitizedQuestions.filter((q) => q.sectionCode === 'C').length,
        sectionDCount: sanitizedQuestions.filter((q) => q.sectionCode === 'D').length,
        questions: sanitizedQuestions,
      });
    } catch (error) {
      console.error('Get quiz questions error:', error);
      return res.status(500).json({ error: 'Gagal memuat 50 soal ujian hematologi ATLM.' });
    }
  });

  app.get('/api/student/quiz-history', requireStudentOrLecturerAuth, async (req, res) => {
    try {
      const studentSess = getStudentSession(req);
      const lecturerSess = getLecturerSession(req);
      const targetNpm = studentSess
        ? studentSess.sub
        : String(req.query.npm || '').trim();

      if (!targetNpm && !lecturerSess) {
        return res.status(400).json({ error: 'NPM mahasiswa tidak ditemukan.' });
      }

      const fullPayload = await buildFullStudentPayload(targetNpm);
      return res.json({
        success: true,
        history: fullPayload?.quizHistory || [],
        quizHistory: fullPayload?.quizHistory || [],
        latestSummary: fullPayload?.latestSummary || null,
        latestReview: fullPayload?.latestReview || [],
      });
    } catch (error) {
      console.error('Get student quiz history error:', error);
      return res.status(500).json({ error: 'Gagal memuat riwayat kuis mahasiswa.' });
    }
  });

  app.post('/api/quiz/submit', requireStudentOrLecturerAuth, async (req, res) => {
    try {
      const studentSess = getStudentSession(req);
      const { npm, fullName, className, avatarGender, mode, totalDurationSec, answers } =
        req.body || {};

      // Enforce verified student identity from session cookie so students cannot spoof another NPM
      const cleanNpm = studentSess ? studentSess.sub : String(npm || '24011001').trim();
      const cleanName = studentSess
        ? studentSess.name
        : String(fullName || 'Mahasiswa ATLM').trim();
      const cleanClass =
        studentSess?.className || String(className || 'ATLM Reguler - IKES Rajawali').trim();
      const cleanGender = avatarGender === 'male_atlm' ? 'male_atlm' : 'female_atlm';
      const duration = Math.max(30, Number(totalDurationSec) || 900);

      const rawAnswers = Array.isArray(answers) ? answers : [];
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
      } = buildDetailedReviewFromAnswers(rawAnswers);

      const accuracyPercent = Number(((correctCount / QUIZ_30_QUESTIONS.length) * 100).toFixed(1));
      const xpEarned = correctCount * 25 + maxStreak * 10 + (accuracyPercent >= 80 ? 150 : 50);

      let gradeLabel = 'Perlu Penguatan Kompetensi';
      if (accuracyPercent >= 90) gradeLabel = 'A (Sangat Memuaskan — Hematology Expert)';
      else if (accuracyPercent >= 80) gradeLabel = 'AB (Kompeten Tinggi — Senior Analyst)';
      else if (accuracyPercent >= 70) gradeLabel = 'B (Kompeten — ATLM Praktisi)';
      else if (accuracyPercent >= 60) gradeLabel = 'BC (Cukup Kompeten)';

      const attemptUuid = `attempt_${cleanNpm}_${Date.now()}`;

      const [attempt] = await db
        .insert(quizAttempts)
        .values({
          attemptUuid,
          npm: cleanNpm,
          studentName: cleanName,
          className: cleanClass,
          sessionCode: mode === 'live' ? 'ATLM-LIVE-50' : 'ATLM-SOLO-50',
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
        })
        .returning();

      for (const item of detailedReview) {
        await db.insert(studentAnswers).values({
          attemptUuid,
          npm: cleanNpm,
          questionNumber: item.questionNumber,
          selectedOption: item.studentAnswer,
          isCorrect: item.isCorrect,
          timeSpentSeconds: item.timeSpentSec,
        });
      }

      await db.insert(quizResults).values({
        attemptUuid,
        npm: cleanNpm,
        studentName: cleanName,
        score: totalScore,
        correctCount,
        wrongCount,
        durationSeconds: duration,
      });

      let badgeCategory = 'ATLM Clinical Analyst';
      if (accuracyPercent >= 90)
        badgeCategory = 'Gold Hematology Champion & Erythrocyte Index Master';
      else if (accuracyPercent >= 80 && duration <= 750) badgeCategory = 'Speed Diagnostic Star';
      else if (accuracyPercent >= 80) badgeCategory = 'Clinical Case Specialist';

      const existingLb = await db
        .select()
        .from(leaderboard)
        .where(eq(leaderboard.npm, cleanNpm))
        .limit(1);

      if (existingLb.length === 0) {
        await db.insert(leaderboard).values({
          npm: cleanNpm,
          studentName: cleanName,
          gender: cleanGender,
          bestScore: totalScore,
          fastestDurationSeconds: duration,
          clinicalScore: clinicalCorrect,
          theoryScore: theoryCorrect,
          mcvScore: mcvCorrect,
          mchScore: mchCorrect,
          mchcScore: mchcCorrect,
          badgeTitle: badgeCategory,
        });
      } else if (
        totalScore > existingLb[0].bestScore ||
        (totalScore === existingLb[0].bestScore && duration < existingLb[0].fastestDurationSeconds)
      ) {
        await db
          .update(leaderboard)
          .set({
            studentName: cleanName,
            gender: cleanGender,
            bestScore: totalScore,
            fastestDurationSeconds: duration,
            clinicalScore: clinicalCorrect,
            theoryScore: theoryCorrect,
            mcvScore: mcvCorrect,
            mchScore: mchCorrect,
            mchcScore: mchcCorrect,
            badgeTitle: badgeCategory,
            updatedAt: new Date(),
          })
          .where(eq(leaderboard.id, existingLb[0].id));
      }

      const existingProf = await db
        .select()
        .from(studentProfiles)
        .where(eq(studentProfiles.npm, cleanNpm))
        .limit(1);

      if (existingProf.length > 0) {
        const p = existingProf[0];
        const newXp = p.xp + xpEarned;
        const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);
        const newQuizCount = p.quizCount + 1;
        const newAvg = Math.round(
          (p.averageScore * p.quizCount + totalScore) / Math.max(1, newQuizCount)
        );
        await db
          .update(studentProfiles)
          .set({
            xp: newXp,
            level: newLevel,
            highestScore: Math.max(p.highestScore, totalScore),
            averageScore: newAvg,
            quizCount: newQuizCount,
            updatedAt: new Date(),
          })
          .where(eq(studentProfiles.id, p.id));
      }

      return res.json({
        success: true,
        attemptId: attempt.id,
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
    } catch (error) {
      console.error('Submit quiz error:', error);
      return res.status(500).json({ error: 'Gagal menyimpan dan menilai hasil kuis.' });
    }
  });

  // =========================================================================
  // 5. 3D PODIUM LEADERBOARD (REAL POSTGRESQL DATA)
  // =========================================================================
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const lecturerSess = getLecturerSession(req);
      const isLecturer = Boolean(lecturerSess && req.query.role === 'lecturer');
      const rows = await db
        .select()
        .from(leaderboard)
        .orderBy(desc(leaderboard.bestScore), asc(leaderboard.fastestDurationSeconds));

      const formatted = rows.map((r, index) => {
        const totalQ = QUIZ_30_QUESTIONS.length;
        const rawSum = r.clinicalScore + r.theoryScore;
        const correctEst =
          rawSum > 30
            ? Math.min(totalQ, rawSum)
            : Math.min(totalQ, Math.round((rawSum / 30) * totalQ) || 46);
        const accEst = Number(((correctEst / totalQ) * 100).toFixed(1));
        return {
          rank: index + 1,
          id: r.id,
          npm: isLecturer ? r.npm : maskNpm(r.npm),
          rawNpm: isLecturer ? r.npm : undefined,
          fullName: r.studentName,
          className: 'ATLM Reguler - IKES Rajawali',
          avatarGender: r.gender,
          score: r.bestScore,
          correctCount: correctEst,
          accuracyPercent: accEst,
          durationSec: r.fastestDurationSeconds,
          badgeCategory: r.badgeTitle,
          achievedAt: r.updatedAt,
        };
      });

      return res.json({ leaderboard: formatted });
    } catch (error) {
      console.error('Get leaderboard error:', error);
      return res.status(500).json({ error: 'Gagal memuat data leaderboard.' });
    }
  });

  // =========================================================================
  // 6. DIGITAL HEMATOLOGY CALCULATOR (MCV, MCH, MCHC)
  // =========================================================================
  app.post('/api/calculator/save', requireStudentOrLecturerAuth, async (req, res) => {
    try {
      const studentSess = getStudentSession(req);
      const { npm, hb, hct, rbc, mcv, mch, mchc, interpretation } = req.body;
      const targetNpm = studentSess ? studentSess.sub : String(npm || 'GUEST').trim();
      const targetName = studentSess ? studentSess.name : 'Mahasiswa ATLM';
      const mcvNum = Number(mcv);
      const mchcNum = Number(mchc);
      const [saved] = await db
        .insert(calculatorHistory)
        .values({
          npm: targetNpm,
          studentName: targetName,
          hb: Number(hb),
          hct: Number(hct),
          rbc: Number(rbc),
          mcv: mcvNum,
          mch: Number(mch),
          mchc: mchcNum,
          mcvClass: mcvNum < 80 ? 'Mikrositik' : mcvNum > 100 ? 'Makrositik' : 'Normositik',
          mchcClass:
            String(interpretation || '') ||
            (mchcNum < 32 ? 'Hipokromik' : mchcNum > 36 ? 'Meningkat' : 'Normokromik'),
        })
        .returning();

      return res.json({ success: true, item: saved });
    } catch (error) {
      console.error('Save calculator error:', error);
      return res.status(500).json({ error: 'Gagal menyimpan riwayat kalkulator.' });
    }
  });

  app.get('/api/calculator/history', async (req, res) => {
    try {
      const studentSess = getStudentSession(req);
      const npm = studentSess ? studentSess.sub : String(req.query.npm || '').trim();
      const rows = npm
        ? await db
            .select()
            .from(calculatorHistory)
            .where(eq(calculatorHistory.npm, npm))
            .orderBy(desc(calculatorHistory.createdAt))
            .limit(20)
        : await db
            .select()
            .from(calculatorHistory)
            .orderBy(desc(calculatorHistory.createdAt))
            .limit(20);

      const mapped = rows.map((r) => ({
        ...r,
        interpretation: `${r.mcvClass} - ${r.mchcClass}`,
      }));

      return res.json({ history: mapped });
    } catch (error) {
      console.error('Get calculator history error:', error);
      return res.status(500).json({ error: 'Gagal memuat riwayat kalkulator.' });
    }
  });

  // =========================================================================
  // 7. STUDENT PROGRESS, AVATAR SETTINGS & GLOSSARY
  // =========================================================================
  app.post('/api/student/progress', requireStudentOrLecturerAuth, async (req, res) => {
    try {
      const studentSess = getStudentSession(req);
      const { npm, moduleNumber } = req.body;
      const targetNpm = studentSess ? studentSess.sub : String(npm || '').trim();
      if (!targetNpm || !moduleNumber) {
        return res.status(400).json({ error: 'NPM dan nomor modul diperlukan.' });
      }

      await db.insert(studentProgress).values({
        npm: targetNpm,
        moduleNumber: Number(moduleNumber),
        itemType: 'module',
      });

      return res.json({ success: true });
    } catch (error) {
      console.error('Save student progress error:', error);
      return res.status(500).json({ error: 'Gagal menyimpan progres belajar.' });
    }
  });

  app.post('/api/student/avatar', requireStudentOrLecturerAuth, async (req, res) => {
    try {
      const studentSess = getStudentSession(req);
      const { npm, gender, hairStyle, skinTone, shoesColor, accessoryBadge } = req.body;
      const cleanNpm = studentSess ? studentSess.sub : String(npm || '').trim();
      if (!cleanNpm) return res.status(400).json({ error: 'NPM diperlukan.' });

      const cleanGender = gender === 'male_atlm' ? 'male_atlm' : 'female_atlm';

      const existing = await db
        .select()
        .from(avatarSettings)
        .where(eq(avatarSettings.npm, cleanNpm))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(avatarSettings).values({
          npm: cleanNpm,
          gender: cleanGender,
          hairStyle: hairStyle || 'modern',
          skinTone: skinTone || '#f1c27d',
          uniformType: 'lab_coat',
          shoeColor: shoesColor || '#0f172a',
          accessory: accessoryBadge || 'ATLM IKES Rajawali',
        });
      } else {
        await db
          .update(avatarSettings)
          .set({
            gender: cleanGender,
            hairStyle: hairStyle || existing[0].hairStyle,
            skinTone: skinTone || existing[0].skinTone,
            shoeColor: shoesColor || existing[0].shoeColor,
            accessory: accessoryBadge || existing[0].accessory,
            updatedAt: new Date(),
          })
          .where(eq(avatarSettings.npm, cleanNpm));
      }

      await db
        .update(leaderboard)
        .set({ gender: cleanGender })
        .where(eq(leaderboard.npm, cleanNpm));

      return res.json({ success: true });
    } catch (error) {
      console.error('Save avatar error:', error);
      return res.status(500).json({ error: 'Gagal menyimpan pengaturan avatar ATLM.' });
    }
  });

  app.get('/api/glossary', async (_req, res) => {
    try {
      const rows = await db.select().from(glossaryTerms).orderBy(asc(glossaryTerms.term));
      if (rows.length === 0) return res.json({ terms: GLOSSARY_TERMS });
      const mapped = rows.map((r) => ({
        id: r.id,
        term: r.term,
        abbreviation: r.abbreviation,
        englishTerm: r.englishTerm,
        category: r.category,
        definition: r.definitionId,
        functionRole: r.roleFunction,
        clinicalExample: r.medicalExample,
        hematologyRelation: r.hematologyRelation,
        pdfPageRef: Number(r.pdfPageRef) || 1,
      }));
      return res.json({ terms: mapped });
    } catch (error) {
      console.error('Get glossary error:', error);
      return res.json({ terms: GLOSSARY_TERMS });
    }
  });

  app.post('/api/glossary', requireLecturerAuth, async (req, res) => {
    try {
      const {
        term,
        abbreviation,
        englishTerm,
        category,
        definition,
        functionRole,
        clinicalExample,
        hematologyRelation,
        pdfPageRef,
      } = req.body;
      if (!term || !definition) {
        return res.status(400).json({ error: 'Istilah dan definisi wajib diisi.' });
      }
      const [created] = await db
        .insert(glossaryTerms)
        .values({
          term: String(term).trim(),
          abbreviation: abbreviation ? String(abbreviation).trim() : '-',
          englishTerm: String(englishTerm || term).trim(),
          category: String(category || 'Komponen darah').trim(),
          definitionId: String(definition).trim(),
          roleFunction: String(functionRole || '-').trim(),
          medicalExample: String(clinicalExample || '-').trim(),
          hematologyRelation: String(hematologyRelation || '-').trim(),
          pdfPageRef: String(pdfPageRef || '1'),
          isAdditionalMaterial: true,
        })
        .returning();

      return res.json({ success: true, term: created });
    } catch (error) {
      console.error('Add glossary term error:', error);
      return res.status(500).json({ error: 'Gagal menambahkan istilah glosarium.' });
    }
  });

  // =========================================================================
  // 8. LECTURER FULL DASHBOARD & CLASS ANALYTICS (PROTECTED)
  // =========================================================================
  app.get('/api/lecturer/dashboard', requireLecturerAuth, async (_req, res) => {
    try {
      const entitlements = await db
        .select()
        .from(studentEntitlements)
        .orderBy(desc(studentEntitlements.activatedAt));
      const profiles = await db.select().from(studentProfiles);
      const attempts = await db
        .select()
        .from(quizAttempts)
        .orderBy(desc(quizAttempts.completedAt));
      const codes = await db
        .select()
        .from(studentAccessCodes)
        .orderBy(desc(studentAccessCodes.version));
      const allStudentAnswers = await db.select().from(studentAnswers);
      const lbRows = await db
        .select()
        .from(leaderboard)
        .orderBy(desc(leaderboard.bestScore), asc(leaderboard.fastestDurationSeconds));

      const questionStats = QUIZ_30_QUESTIONS.map((q) => {
        const answersForQ = allStudentAnswers.filter((a) => a.questionNumber === q.questionNumber);
        const total = answersForQ.length;
        const correct = answersForQ.filter((a) => a.isCorrect).length;
        const accuracy = total > 0 ? Number(((correct / total) * 100).toFixed(1)) : 88.0;
        return {
          questionNumber: q.questionNumber,
          sectionCode: q.sectionCode,
          topic: q.topic,
          category: q.category,
          caseTable: q.caseTable || null,
          correctOption: q.correctOption,
          totalAttempts: total,
          correctCount: correct,
          accuracyPercent: accuracy,
          pdfPageRef: q.pdfPageRef,
          questionText: q.questionText,
          options: q.options,
          scientificExplanation: q.scientificExplanation,
          atlmProcedureAndDecision: q.atlmProcedureAndDecision,
          doctorClinicalExplanation: q.doctorClinicalExplanation,
          patientEducation: q.patientEducation,
          whyOthersWrong: q.whyOthersWrong,
          calculationSteps: q.calculationSteps || null,
        };
      });

      const highestScore = lbRows.length > 0 ? Math.max(...lbRows.map((r) => r.bestScore)) : 0;
      const lowestScore = lbRows.length > 0 ? Math.min(...lbRows.map((r) => r.bestScore)) : 0;
      const availableCodesCount = codes.filter((c) => c.isActive && c.activatedCount === 0).length;

      return res.json({
        metrics: {
          totalActivatedStudents: entitlements.length,
          totalQuizAttempts: attempts.length,
          averageAccuracyPercent:
            attempts.length > 0
              ? Number(
                  (
                    attempts.reduce(
                      (acc, a) => acc + (a.correctCount / (a.totalQuestions || 50)) * 100,
                      0
                    ) / attempts.length
                  ).toFixed(1)
                )
              : 91.2,
          highestScore,
          lowestScore,
          activeAccessCodeVersion: availableCodesCount,
        },
        entitlements: entitlements.map((e) => ({
          id: e.id,
          npm: e.npm,
          fullName: e.studentName,
          className:
            profiles.find((p) => p.npm === e.npm)?.className || 'ATLM Reguler - IKES Rajawali',
          activatedWithCodeVersion: e.activatedWithCodeVersion,
          activatedWithCodeDisplay: e.activatedWithCodeDisplay,
          lifetimeAccess: e.isLifetimeActive,
          revoked: !e.isLifetimeActive,
          activatedAt: e.activatedAt,
          lastLoginAt: e.lastAccessedAt,
        })),
        profiles,
        attempts: attempts.map((a) => {
          const denom = a.totalQuestions || QUIZ_30_QUESTIONS.length;
          return {
            id: a.id,
            npm: a.npm,
            fullName: a.studentName,
            className: a.className,
            mode: a.sessionCode.includes('LIVE') ? 'live' : 'solo',
            totalQuestions: denom,
            correctCount: a.correctCount,
            wrongCount: a.wrongCount,
            accuracyPercent: Number(((a.correctCount / denom) * 100).toFixed(1)),
            totalScore: a.score,
            durationSec: a.durationSeconds,
            completedAt: a.completedAt,
          };
        }),
        accessCodes: codes.map((c) => {
          const pureCode = extractRawCodeFromDisplay(c.codeDisplay);
          const matchedEnt = entitlements.find(
            (e) =>
              e.activatedWithCodeVersion === c.version ||
              extractRawCodeFromDisplay(e.activatedWithCodeDisplay) === pureCode
          );
          const npmTag = c.className.match(/\[NPM:([^\]]+)\]/i)?.[1];
          const dispNpm = c.codeDisplay.match(/NPM\s+([A-Za-z0-9_-]+)/i)?.[1];
          const dispName = c.codeDisplay.match(/\(([^)]+)\)\s*$/)?.[1];
          const isUsed = c.activatedCount > 0 || Boolean(matchedEnt);
          const statusLabel: 'Tersedia' | 'Sudah Digunakan' | 'Dinonaktifkan' = isUsed
            ? 'Sudah Digunakan'
            : c.isActive
            ? 'Tersedia'
            : 'Dinonaktifkan';
          const rawCategory = c.className.split('[NPM:')[0].trim() || 'ATLM Reguler - IKES Rajawali';
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
            usedByStudentNpm: isUsed ? matchedEnt?.npm || npmTag || dispNpm || null : null,
            usedByStudentName: isUsed ? matchedEnt?.studentName || dispName || null : null,
            createdBy: c.createdBy,
            createdAt: c.createdAt,
          };
        }),
        questionStats,
      });
    } catch (error) {
      console.error('Get lecturer dashboard error:', error);
      return res.status(500).json({ error: 'Gagal memuat data dashboard dosen.' });
    }
  });

  app.post('/api/lecturer/toggle-entitlement', requireLecturerAuth, async (req, res) => {
    try {
      const { npm, revoked } = req.body;
      const cleanNpm = normalizeNpm(npm);
      await db
        .update(studentEntitlements)
        .set({ isLifetimeActive: !revoked })
        .where(sql`UPPER(TRIM(${studentEntitlements.npm})) = ${cleanNpm}`);
      return res.json({ success: true });
    } catch (error) {
      console.error('Toggle entitlement error:', error);
      return res.status(500).json({ error: 'Gagal mengubah status akses NPM.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hematology World ATLM Academy Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
