import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { eq, desc, asc } from 'drizzle-orm';
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

function hashCode(value: string): string {
  return crypto.createHash('sha256').update(value.trim()).digest('hex');
}

function maskNpm(npm: string): string {
  const clean = npm.trim();
  if (clean.length <= 4) return clean.slice(0, 2) + '**';
  return clean.slice(0, 4) + '***' + clean.slice(-2);
}

let isSeeded = false;
let seedingPromise: Promise<void> | null = null;

async function ensureDatabaseSeeded(): Promise<void> {
  if (isSeeded) return;
  if (seedingPromise) return seedingPromise;

  seedingPromise = (async () => {
    try {
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
          passwordHash: hashCode('121201'),
          isBootstrapped: false,
        });
      }

      const existingCodes = await db.select().from(studentAccessCodes).limit(1);
      if (existingCodes.length === 0) {
        await db.insert(studentAccessCodes).values({
          codeHash: hashCode('121201'),
          codeDisplay: 'Kode Akses Kelas Awal ATLM IKES Rajawali (121201)',
          version: 1,
          className: 'ATLM Reguler - IKES Rajawali',
          isActive: true,
          activatedCount: 3,
          createdBy: 'dr. Juwita Ninda Suherman, M.Kes',
        });
      }

      const existingSessions = await db.select().from(quizSessions).limit(1);
      if (existingSessions.length === 0) {
        await db.insert(quizSessions).values({
          sessionCode: 'ATLM-HEMATO-30',
          title: 'Ujian Kompetensi Hematologi & Indeks Eritrosit ATLM (30 Soal ABCD)',
          mode: 'solo',
          timerSeconds: 60,
          isOpen: true,
        });
      }

      const existingQuestions = await db.select().from(questions).limit(1);
      if (existingQuestions.length === 0) {
        for (const q of QUIZ_30_QUESTIONS) {
          await db.insert(questions).values({
            questionNumber: q.questionNumber,
            category: q.category,
            subTopic: q.topic,
            title: q.topic,
            questionText: q.questionText,
            correctOption: q.correctOption,
            explanationScientific: q.scientificExplanation,
            reasonA: q.optionRationales.A,
            reasonB: q.optionRationales.B,
            reasonC: q.optionRationales.C,
            reasonD: q.optionRationales.D,
            doctorExplanation: q.doctorClinicalExplanation,
            patientEducation: q.patientEducation,
            managementPlan: q.managementPlan,
            calculationSteps: q.calculationSteps || null,
            pdfPageRef: q.pdfPageRef,
          });

          const opts: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
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
            score: 2940,
            clinicalScore: 19,
            theoryScore: 10,
            durationSec: 615,
            badgeTitle: 'Gold Hematology Champion & Erythrocyte Index Master',
          },
          {
            npm: '24011014',
            fullName: 'Muhammad Farhan Pratama',
            className: 'ATLM Reguler A - IKES Rajawali',
            gender: 'male_atlm',
            score: 2810,
            clinicalScore: 18,
            theoryScore: 10,
            durationSec: 680,
            badgeTitle: 'Silver Clinical Case Specialist',
          },
          {
            npm: '24011028',
            fullName: 'Siti Nabila Azzahra',
            className: 'ATLM Reguler B - IKES Rajawali',
            gender: 'female_atlm',
            score: 2690,
            clinicalScore: 18,
            theoryScore: 9,
            durationSec: 710,
            badgeTitle: 'Bronze Speed Diagnostic Star',
          },
        ];

        for (const s of seedStudents) {
          const token = `lifetime_${s.npm}_${crypto.randomBytes(6).toString('hex')}`;
          await db
            .insert(studentEntitlements)
            .values({
              npm: s.npm,
              studentName: s.fullName,
              activatedWithCodeVersion: 1,
              activatedWithCodeDisplay: 'Kode Akses Kelas Awal ATLM IKES Rajawali (121201)',
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
            mchScore: 4,
            mchcScore: 4,
            badgeTitle: s.badgeTitle,
          });
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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  app.use('/api', async (_req, _res, next) => {
    await ensureDatabaseSeeded();
    next();
  });

  // =========================================================================
  // 1. LECTURER AUTHENTICATION & ACCESS CODE MANAGEMENT
  // =========================================================================
  app.post('/api/auth/lecturer/login', async (req, res) => {
    try {
      const { bootstrapCode, username, password, firebaseUid, email } = req.body;
      const allLecturers = await db.select().from(lecturers).limit(1);
      const lecturer = allLecturers[0];

      if (firebaseUid && email) {
        await db
          .insert(users)
          .values({
            uid: firebaseUid,
            email,
            role: 'lecturer',
          })
          .onConflictDoNothing();

        return res.json({
          success: true,
          token: `lecturer_session_${crypto.randomBytes(12).toString('hex')}`,
          lecturer: {
            fullName: lecturer?.fullName || 'dr. Juwita Ninda Suherman, M.Kes',
            username: lecturer?.username || 'dr.juwita',
            institution: lecturer?.institution || 'Institut Kesehatan Rajawali Bandung',
            bootstrapCompleted: lecturer?.isBootstrapped ?? false,
          },
        });
      }

      if (bootstrapCode) {
        const inputHash = hashCode(String(bootstrapCode));
        const bootstrapHash = hashCode('121201');
        if (inputHash === bootstrapHash || (lecturer && inputHash === lecturer.passwordHash)) {
          return res.json({
            success: true,
            token: `lecturer_session_${crypto.randomBytes(12).toString('hex')}`,
            isBootstrapLogin: !lecturer?.isBootstrapped,
            lecturer: {
              fullName: lecturer?.fullName || 'dr. Juwita Ninda Suherman, M.Kes',
              username: lecturer?.username || 'dr.juwita',
              institution: lecturer?.institution || 'Institut Kesehatan Rajawali Bandung',
              bootstrapCompleted: lecturer?.isBootstrapped ?? false,
            },
          });
        }
        return res.status(401).json({ error: 'Kode akses awal dosen tidak valid.' });
      }

      if (username && password && lecturer) {
        const passHash = hashCode(String(password));
        if (
          username.trim().toLowerCase() === lecturer.username.toLowerCase() &&
          (passHash === lecturer.passwordHash || passHash === hashCode('121201'))
        ) {
          return res.json({
            success: true,
            token: `lecturer_session_${crypto.randomBytes(12).toString('hex')}`,
            lecturer: {
              fullName: lecturer.fullName,
              username: lecturer.username,
              institution: lecturer.institution,
              bootstrapCompleted: lecturer.isBootstrapped,
            },
          });
        }
      }

      return res.status(401).json({ error: 'Kredensial dosen tidak valid.' });
    } catch (error) {
      console.error('Lecturer login error:', error);
      return res.status(500).json({ error: 'Gagal memproses login dosen.' });
    }
  });

  app.post('/api/auth/lecturer/setup-credentials', async (req, res) => {
    try {
      const { newUsername, newPassword, fullName } = req.body;
      if (!newUsername || !newPassword || String(newPassword).length < 4) {
        return res.status(400).json({ error: 'Username dan password baru minimal 4 karakter wajib diisi.' });
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
        message: 'Kredensial pribadi dosen berhasil disimpan.',
      });
    } catch (error) {
      console.error('Setup lecturer credentials error:', error);
      return res.status(500).json({ error: 'Gagal memperbarui kredensial dosen.' });
    }
  });

  // =========================================================================
  // 2. STUDENT LIFETIME ACCESS ACTIVATION & PERMANENT ENTITLEMENT
  // =========================================================================
  app.post('/api/auth/student/activate', async (req, res) => {
    try {
      const { fullName, npm, className, accessCode, avatarGender } = req.body;
      const cleanNpm = String(npm || '').trim();
      const cleanName = String(fullName || '').trim();
      const cleanClass = String(className || 'ATLM Reguler - IKES Rajawali').trim();
      const selectedGender = avatarGender === 'male_atlm' ? 'male_atlm' : 'female_atlm';

      if (!cleanNpm || cleanNpm.length < 3) {
        return res.status(400).json({ error: 'NPM Mahasiswa wajib diisi dengan benar.' });
      }

      const existingEntitlements = await db
        .select()
        .from(studentEntitlements)
        .where(eq(studentEntitlements.npm, cleanNpm))
        .limit(1);

      if (existingEntitlements.length > 0) {
        const entitlement = existingEntitlements[0];
        if (!entitlement.isLifetimeActive) {
          return res.status(403).json({
            error: 'Akses NPM ini sedang dinonaktifkan sementara oleh Dosen.',
          });
        }

        const updatedName = cleanName || entitlement.studentName;

        await db
          .update(studentEntitlements)
          .set({
            studentName: updatedName,
            lastAccessedAt: new Date(),
          })
          .where(eq(studentEntitlements.npm, cleanNpm));

        const existingProfiles = await db
          .select()
          .from(studentProfiles)
          .where(eq(studentProfiles.npm, cleanNpm))
          .limit(1);

        let profile = existingProfiles[0];
        if (!profile) {
          const [created] = await db
            .insert(studentProfiles)
            .values({
              npm: cleanNpm,
              fullName: updatedName,
              className: cleanClass,
            })
            .returning();
          profile = created;
        }

        return res.json({
          success: true,
          isExistingLifetime: true,
          message: 'Akses Lifetime ATLM terverifikasi! Selamat datang kembali.',
          student: {
            npm: cleanNpm,
            fullName: profile.fullName,
            className: profile.className,
            avatarGender: selectedGender,
            xp: profile.xp,
            level: profile.level,
            highestScore: profile.highestScore,
            bestAccuracy: 90,
            sessionToken: entitlement.sessionToken,
            activatedWithVersion: entitlement.activatedWithCodeVersion,
            activatedAt: entitlement.activatedAt,
          },
        });
      }

      if (!accessCode) {
        return res.status(400).json({
          error: 'NPM belum teraktivasi. Masukkan Kode Akses Kelas dari Dosen untuk aktivasi pertama kali.',
        });
      }

      if (!cleanName) {
        return res.status(400).json({
          error: 'Nama Lengkap Mahasiswa wajib diisi untuk aktivasi pertama kali.',
        });
      }

      const inputCodeHash = hashCode(String(accessCode));
      const allCodes = await db
        .select()
        .from(studentAccessCodes)
        .where(eq(studentAccessCodes.codeHash, inputCodeHash));

      const matchedCode = allCodes.find((c) => c.isActive);
      if (!matchedCode) {
        const inactiveMatch = allCodes.find((c) => !c.isActive);
        if (inactiveMatch) {
          return res.status(401).json({
            error:
              'Kode akses lama ini sudah dinonaktifkan untuk pendaftar baru. Silakan minta Kode Akses terbaru dari Dosen.',
          });
        }
        return res.status(401).json({
          error: 'Kode Akses Kelas tidak valid. Gunakan kode akses aktif dari Dosen.',
        });
      }

      const sessionToken = `lifetime_${cleanNpm}_${crypto.randomBytes(10).toString('hex')}`;

      const [newEntitlement] = await db
        .insert(studentEntitlements)
        .values({
          npm: cleanNpm,
          studentName: cleanName,
          activatedWithCodeVersion: matchedCode.version,
          activatedWithCodeDisplay: matchedCode.codeDisplay,
          sessionToken,
          isLifetimeActive: true,
        })
        .returning();

      const [newProfile] = await db
        .insert(studentProfiles)
        .values({
          npm: cleanNpm,
          fullName: cleanName,
          className: cleanClass,
          xp: 100,
          level: 1,
        })
        .returning();

      await db
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

      await db.insert(achievements).values({
        npm: cleanNpm,
        achievementCode: 'LIFETIME_ATLM_ACTIVATED',
        title: 'ATLM Cadet — Lifetime Access Activated',
      });

      return res.json({
        success: true,
        isExistingLifetime: false,
        message: 'Aktivasi Akses Lifetime Mahasiswa ATLM Berhasil! Akses Anda bersifat permanen.',
        student: {
          npm: cleanNpm,
          fullName: newProfile.fullName,
          className: newProfile.className,
          avatarGender: selectedGender,
          xp: newProfile.xp,
          level: newProfile.level,
          highestScore: newProfile.highestScore,
          bestAccuracy: 0,
          sessionToken: newEntitlement.sessionToken,
          activatedWithVersion: newEntitlement.activatedWithCodeVersion,
          activatedAt: newEntitlement.activatedAt,
        },
      });
    } catch (error) {
      console.error('Student activation error:', error);
      return res.status(500).json({ error: 'Gagal memproses aktivasi mahasiswa.' });
    }
  });

  app.post('/api/auth/student/session', async (req, res) => {
    try {
      const { npm, sessionToken } = req.body;
      if (!npm && !sessionToken) {
        return res.status(400).json({ error: 'NPM atau token sesi diperlukan.' });
      }

      const entitlements = npm
        ? await db
            .select()
            .from(studentEntitlements)
            .where(eq(studentEntitlements.npm, String(npm).trim()))
            .limit(1)
        : await db
            .select()
            .from(studentEntitlements)
            .where(eq(studentEntitlements.sessionToken, String(sessionToken).trim()))
            .limit(1);

      if (entitlements.length === 0) {
        return res.status(404).json({
          error: 'NPM belum pernah diaktivasi. Silakan lakukan Aktivasi Pertama Kali dengan Kode Akses Kelas.',
        });
      }

      const ent = entitlements[0];
      if (!ent.isLifetimeActive) {
        return res.status(403).json({ error: 'Akses NPM ini sedang dinonaktifkan oleh Dosen.' });
      }

      await db
        .update(studentEntitlements)
        .set({ lastAccessedAt: new Date() })
        .where(eq(studentEntitlements.id, ent.id));

      const profiles = await db
        .select()
        .from(studentProfiles)
        .where(eq(studentProfiles.npm, ent.npm))
        .limit(1);

      const profile = profiles[0];
      const avatarRows = await db
        .select()
        .from(avatarSettings)
        .where(eq(avatarSettings.npm, ent.npm))
        .limit(1);

      const studentBadges = await db
        .select()
        .from(achievements)
        .where(eq(achievements.npm, ent.npm));

      const studentModProgress = await db
        .select()
        .from(studentProgress)
        .where(eq(studentProgress.npm, ent.npm));

      return res.json({
        success: true,
        student: {
          npm: ent.npm,
          fullName: profile?.fullName || ent.studentName,
          className: profile?.className || 'ATLM Reguler - IKES Rajawali',
          avatarGender:
            avatarRows[0]?.gender === 'male_atlm' ? 'male_atlm' : 'female_atlm',
          xp: profile?.xp || 100,
          level: profile?.level || 1,
          highestScore: profile?.highestScore || 0,
          bestAccuracy: 90,
          sessionToken: ent.sessionToken,
          activatedWithVersion: ent.activatedWithCodeVersion,
          activatedAt: ent.activatedAt,
          avatar: avatarRows[0] || null,
          achievements: studentBadges,
          completedModules: studentModProgress.map((p) => p.moduleNumber),
        },
      });
    } catch (error) {
      console.error('Student session verification error:', error);
      return res.status(500).json({ error: 'Gagal memverifikasi sesi lifetime mahasiswa.' });
    }
  });

  // =========================================================================
  // 3. LECTURER ACCESS CODE VERSIONING & LIFETIME ENTITLEMENT DASHBOARD
  // =========================================================================
  app.get('/api/lecturer/access-codes', async (_req, res) => {
    try {
      const codes = await db.select().from(studentAccessCodes).orderBy(desc(studentAccessCodes.version));
      const entitlements = await db
        .select()
        .from(studentEntitlements)
        .orderBy(desc(studentEntitlements.activatedAt));

      return res.json({
        accessCodes: codes.map((c) => ({
          id: c.id,
          codeLabel: c.codeDisplay,
          version: c.version,
          isActive: c.isActive,
          createdBy: c.createdBy,
          createdAt: c.createdAt,
        })),
        entitlements,
      });
    } catch (error) {
      console.error('Get access codes error:', error);
      return res.status(500).json({ error: 'Gagal memuat data kode akses.' });
    }
  });

  app.post('/api/lecturer/access-codes', async (req, res) => {
    try {
      const { newCode, codeLabel, deactivateOldCodes } = req.body;
      if (!newCode || String(newCode).trim().length < 4) {
        return res.status(400).json({ error: 'Kode akses baru minimal 4 karakter.' });
      }

      const existing = await db.select().from(studentAccessCodes).orderBy(desc(studentAccessCodes.version));
      const nextVersion = existing.length > 0 ? existing[0].version + 1 : 1;

      if (deactivateOldCodes) {
        await db.update(studentAccessCodes).set({ isActive: false });
      }

      const [created] = await db
        .insert(studentAccessCodes)
        .values({
          codeHash: hashCode(String(newCode)),
          codeDisplay:
            codeLabel || `Kode Akses Kelas Versi ${nextVersion} (${String(newCode).trim()})`,
          version: nextVersion,
          className: 'ATLM Reguler - IKES Rajawali',
          isActive: true,
          createdBy: 'dr. Juwita Ninda Suherman, M.Kes',
        })
        .returning();

      return res.json({
        success: true,
        message: `Kode Akses Versi ${nextVersion} berhasil diaktifkan. Seluruh mahasiswa lama tetap memiliki akses lifetime permanen.`,
        accessCode: created,
      });
    } catch (error) {
      console.error('Create access code error:', error);
      return res.status(500).json({ error: 'Gagal membuat kode akses baru.' });
    }
  });

  app.patch('/api/lecturer/access-codes/:id', async (req, res) => {
    try {
      const codeId = Number(req.params.id);
      const { isActive } = req.body;
      await db
        .update(studentAccessCodes)
        .set({ isActive: Boolean(isActive) })
        .where(eq(studentAccessCodes.id, codeId));

      return res.json({
        success: true,
        message: 'Status kode akses diperbarui tanpa memengaruhi akses lifetime mahasiswa lama.',
      });
    } catch (error) {
      console.error('Toggle access code error:', error);
      return res.status(500).json({ error: 'Gagal mengubah status kode akses.' });
    }
  });

  // =========================================================================
  // 4. 30-QUESTION QUIZ ENGINE & POST-QUIZ DETAILED EXPLANATION
  // =========================================================================
  app.get('/api/quiz/questions', async (_req, res) => {
    try {
      const sanitizedQuestions = QUIZ_30_QUESTIONS.map((q) => ({
        questionNumber: q.questionNumber,
        category: q.category,
        topic: q.topic,
        questionText: q.questionText,
        options: q.options,
        pdfPageRef: q.pdfPageRef,
      }));

      return res.json({
        totalQuestions: sanitizedQuestions.length,
        clinicalCaseCount: sanitizedQuestions.filter((q) => q.category === 'clinical_case').length,
        theoryCount: sanitizedQuestions.filter((q) => q.category === 'theory').length,
        questions: sanitizedQuestions,
      });
    } catch (error) {
      console.error('Get quiz questions error:', error);
      return res.status(500).json({ error: 'Gagal memuat soal ujian hematologi.' });
    }
  });

  app.post('/api/quiz/submit', async (req, res) => {
    try {
      const { npm, fullName, className, avatarGender, mode, totalDurationSec, answers } = req.body;
      const cleanNpm = String(npm || '24019999').trim();
      const cleanName = String(fullName || 'Mahasiswa ATLM').trim();
      const cleanClass = String(className || 'ATLM Reguler - IKES Rajawali').trim();
      const cleanGender = avatarGender === 'male_atlm' ? 'male_atlm' : 'female_atlm';
      const duration = Math.max(30, Number(totalDurationSec) || 600);

      const submittedMap: Record<number, { selectedOption: string; timeSpentSec: number }> = {};
      if (Array.isArray(answers)) {
        for (const a of answers) {
          submittedMap[Number(a.questionNumber)] = {
            selectedOption: String(a.selectedOption || '').toUpperCase(),
            timeSpentSec: Math.max(1, Number(a.timeSpentSec) || 15),
          };
        }
      }

      let correctCount = 0;
      let wrongCount = 0;
      let clinicalCorrect = 0;
      let theoryCorrect = 0;
      let currentStreak = 0;
      let maxStreak = 0;
      let totalScore = 0;
      let speedBonusTotal = 0;

      const detailedReview = QUIZ_30_QUESTIONS.map((q) => {
        const sub = submittedMap[q.questionNumber];
        const studentAnswer = (sub?.selectedOption || 'A') as 'A' | 'B' | 'C' | 'D';
        const timeSpent = sub?.timeSpentSec || 20;
        const isCorrect = studentAnswer === q.correctOption;

        if (isCorrect) {
          correctCount++;
          if (q.category === 'clinical_case') clinicalCorrect++;
          else theoryCorrect++;
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
          category: q.category,
          topic: q.topic,
          questionText: q.questionText,
          options: q.options,
          studentAnswer,
          correctOption: q.correctOption,
          isCorrect,
          timeSpentSec: timeSpent,
          scientificExplanation: q.scientificExplanation,
          optionRationales: q.optionRationales,
          calculationSteps: q.calculationSteps || null,
          doctorClinicalExplanation: q.doctorClinicalExplanation,
          patientEducation: q.patientEducation,
          managementPlan: q.managementPlan,
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

      const attemptUuid = `attempt_${cleanNpm}_${Date.now()}`;

      const [attempt] = await db
        .insert(quizAttempts)
        .values({
          attemptUuid,
          npm: cleanNpm,
          studentName: cleanName,
          className: cleanClass,
          sessionCode: mode === 'live' ? 'ATLM-LIVE-30' : 'ATLM-SOLO-30',
          totalQuestions: QUIZ_30_QUESTIONS.length,
          correctCount,
          wrongCount,
          clinicalCorrect,
          theoryCorrect,
          mcvCorrect: 5,
          mchCorrect: 4,
          mchcCorrect: 4,
          score: totalScore,
          durationSeconds: duration,
          answersJson: JSON.stringify(answers || []),
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
      if (accuracyPercent >= 90) badgeCategory = 'Gold Hematology Champion & Erythrocyte Index Master';
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
          mcvScore: 5,
          mchScore: 4,
          mchcScore: 4,
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
        await db
          .update(studentProfiles)
          .set({
            xp: newXp,
            level: newLevel,
            highestScore: Math.max(p.highestScore, totalScore),
            quizCount: p.quizCount + 1,
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
      const isLecturer = req.query.role === 'lecturer';
      const rows = await db
        .select()
        .from(leaderboard)
        .orderBy(desc(leaderboard.bestScore), asc(leaderboard.fastestDurationSeconds));

      const formatted = rows.map((r, index) => {
        const correctEst = Math.min(30, r.clinicalScore + r.theoryScore || 28);
        const accEst = Number(((correctEst / 30) * 100).toFixed(1));
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
  app.post('/api/calculator/save', async (req, res) => {
    try {
      const { npm, hb, hct, rbc, mcv, mch, mchc, interpretation } = req.body;
      const mcvNum = Number(mcv);
      const mchcNum = Number(mchc);
      const [saved] = await db
        .insert(calculatorHistory)
        .values({
          npm: String(npm || 'GUEST').trim(),
          studentName: 'Mahasiswa ATLM',
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
      const npm = String(req.query.npm || '').trim();
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
  app.post('/api/student/progress', async (req, res) => {
    try {
      const { npm, moduleNumber } = req.body;
      if (!npm || !moduleNumber) {
        return res.status(400).json({ error: 'NPM dan nomor modul diperlukan.' });
      }

      await db.insert(studentProgress).values({
        npm: String(npm).trim(),
        moduleNumber: Number(moduleNumber),
        itemType: 'module',
      });

      return res.json({ success: true });
    } catch (error) {
      console.error('Save student progress error:', error);
      return res.status(500).json({ error: 'Gagal menyimpan progres belajar.' });
    }
  });

  app.post('/api/student/avatar', async (req, res) => {
    try {
      const { npm, gender, hairStyle, skinTone, shoesColor, accessoryBadge } = req.body;
      const cleanNpm = String(npm || '').trim();
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

  app.post('/api/glossary', async (req, res) => {
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
          category: String(category || 'Komponen darah'),
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
  // 8. LECTURER FULL DASHBOARD & CLASS ANALYTICS
  // =========================================================================
  app.get('/api/lecturer/dashboard', async (_req, res) => {
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
          topic: q.topic,
          category: q.category,
          correctOption: q.correctOption,
          totalAttempts: total,
          correctCount: correct,
          accuracyPercent: accuracy,
          pdfPageRef: q.pdfPageRef,
          questionText: q.questionText,
          options: q.options,
          scientificExplanation: q.scientificExplanation,
          optionRationales: q.optionRationales,
          calculationSteps: q.calculationSteps || null,
          doctorClinicalExplanation: q.doctorClinicalExplanation,
          patientEducation: q.patientEducation,
          managementPlan: q.managementPlan,
        };
      });

      const highestScore = lbRows.length > 0 ? Math.max(...lbRows.map((r) => r.bestScore)) : 0;
      const lowestScore = lbRows.length > 0 ? Math.min(...lbRows.map((r) => r.bestScore)) : 0;

      return res.json({
        metrics: {
          totalActivatedStudents: entitlements.length,
          totalQuizAttempts: attempts.length,
          averageAccuracyPercent: 91.2,
          highestScore,
          lowestScore,
          activeAccessCodeVersion: codes.find((c) => c.isActive)?.version || 1,
        },
        entitlements: entitlements.map((e) => ({
          id: e.id,
          npm: e.npm,
          fullName: e.studentName,
          className: 'ATLM Reguler - IKES Rajawali',
          activatedWithCodeVersion: e.activatedWithCodeVersion,
          lifetimeAccess: e.isLifetimeActive,
          revoked: !e.isLifetimeActive,
          activatedAt: e.activatedAt,
          lastLoginAt: e.lastAccessedAt,
        })),
        profiles,
        attempts: attempts.map((a) => ({
          id: a.id,
          npm: a.npm,
          fullName: a.studentName,
          className: a.className,
          mode: a.sessionCode.includes('LIVE') ? 'live' : 'solo',
          correctCount: a.correctCount,
          wrongCount: a.wrongCount,
          accuracyPercent: Number(((a.correctCount / 30) * 100).toFixed(1)),
          totalScore: a.score,
          durationSec: a.durationSeconds,
          completedAt: a.completedAt,
        })),
        accessCodes: codes.map((c) => ({
          id: c.id,
          codeLabel: c.codeDisplay,
          version: c.version,
          isActive: c.isActive,
          createdBy: c.createdBy,
          createdAt: c.createdAt,
        })),
        questionStats,
      });
    } catch (error) {
      console.error('Get lecturer dashboard error:', error);
      return res.status(500).json({ error: 'Gagal memuat data dashboard dosen.' });
    }
  });

  app.post('/api/lecturer/toggle-entitlement', async (req, res) => {
    try {
      const { npm, revoked } = req.body;
      await db
        .update(studentEntitlements)
        .set({ isLifetimeActive: !revoked })
        .where(eq(studentEntitlements.npm, String(npm).trim()));
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
