import { integer, pgTable, serial, text, timestamp, boolean, doublePrecision } from 'drizzle-orm/pg-core';

// Required users table for Firebase Authentication integration
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  role: text('role').default('lecturer').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 1. Lecturers
export const lecturers = pgTable('lecturers', {
  id: serial('id').primaryKey(),
  uid: text('uid').unique(),
  username: text('username').notNull().unique(),
  fullName: text('full_name').notNull(),
  title: text('title').notNull(),
  institution: text('institution').notNull(),
  passwordHash: text('password_hash').notNull(),
  isBootstrapped: boolean('is_bootstrapped').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Student Access Codes (Versioned, Lifetime Rule)
export const studentAccessCodes = pgTable('student_access_codes', {
  id: serial('id').primaryKey(),
  codeHash: text('code_hash').notNull(),
  codeDisplay: text('code_display').notNull(),
  version: integer('version').notNull(),
  className: text('class_name').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  activatedCount: integer('activated_count').default(0).notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Student Entitlements (Permanent Lifetime Access bound to NPM, decoupled from old code deactivation)
export const studentEntitlements = pgTable('student_entitlements', {
  id: serial('id').primaryKey(),
  npm: text('npm').notNull().unique(),
  studentName: text('student_name').notNull(),
  activatedWithCodeVersion: integer('activated_with_code_version').notNull(),
  activatedWithCodeDisplay: text('activated_with_code_display').notNull(),
  sessionToken: text('session_token').notNull(),
  isLifetimeActive: boolean('is_lifetime_active').default(true).notNull(),
  activatedAt: timestamp('activated_at').defaultNow(),
  lastAccessedAt: timestamp('last_accessed_at').defaultNow(),
});

// 4. Student Profiles
export const studentProfiles = pgTable('student_profiles', {
  id: serial('id').primaryKey(),
  npm: text('npm').notNull().unique(),
  fullName: text('full_name').notNull(),
  className: text('class_name').default('ATLM Reguler').notNull(),
  level: integer('level').default(1).notNull(),
  xp: integer('xp').default(100).notNull(),
  highestScore: doublePrecision('highest_score').default(0).notNull(),
  averageScore: doublePrecision('average_score').default(0).notNull(),
  quizCount: integer('quiz_count').default(0).notNull(),
  completedModules: integer('completed_modules').default(0).notNull(),
  completedCases: integer('completed_cases').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 5. Quiz Sessions (Solo & Live Quiz with Lecturer)
export const quizSessions = pgTable('quiz_sessions', {
  id: serial('id').primaryKey(),
  sessionCode: text('session_code').notNull().unique(),
  title: text('title').notNull(),
  mode: text('mode').default('solo').notNull(), // 'solo' | 'live'
  timerSeconds: integer('timer_seconds').default(60).notNull(),
  shuffleQuestions: boolean('shuffle_questions').default(false).notNull(),
  shuffleOptions: boolean('shuffle_options').default(false).notNull(),
  showExplanation: boolean('show_explanation').default(true).notNull(),
  isOpen: boolean('is_open').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Quiz Attempts (Every attempt stored separately, never overwriting previous scores)
export const quizAttempts = pgTable('quiz_attempts', {
  id: serial('id').primaryKey(),
  attemptUuid: text('attempt_uuid').notNull().unique(),
  npm: text('npm').notNull(),
  studentName: text('student_name').notNull(),
  className: text('class_name').default('ATLM Reguler').notNull(),
  sessionCode: text('session_code').default('DEFAULT-30').notNull(),
  totalQuestions: integer('total_questions').default(30).notNull(),
  correctCount: integer('correct_count').notNull(),
  wrongCount: integer('wrong_count').notNull(),
  clinicalCorrect: integer('clinical_correct').default(0).notNull(),
  theoryCorrect: integer('theory_correct').default(0).notNull(),
  mcvCorrect: integer('mcv_correct').default(0).notNull(),
  mchCorrect: integer('mch_correct').default(0).notNull(),
  mchcCorrect: integer('mchc_correct').default(0).notNull(),
  score: doublePrecision('score').notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  answersJson: text('answers_json').notNull(),
  completedAt: timestamp('completed_at').defaultNow(),
});

// 7. Questions
export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  questionNumber: integer('question_number').notNull().unique(),
  category: text('category').notNull(), // 'clinical' | 'theory'
  subTopic: text('sub_topic').notNull(),
  title: text('title').notNull(),
  patientIdentity: text('patient_identity'),
  anamnesis: text('anamnesis'),
  physicalExam: text('physical_exam'),
  labResults: text('lab_results'),
  questionText: text('question_text').notNull(),
  correctOption: text('correct_option').notNull(), // 'A' | 'B' | 'C' | 'D'
  explanationScientific: text('explanation_scientific').notNull(),
  reasonA: text('reason_a').notNull(),
  reasonB: text('reason_b').notNull(),
  reasonC: text('reason_c').notNull(),
  reasonD: text('reason_d').notNull(),
  doctorExplanation: text('doctor_explanation'),
  patientEducation: text('patient_education'),
  managementPlan: text('management_plan'),
  calculationSteps: text('calculation_steps'),
  pdfPageRef: text('pdf_page_ref').notNull(),
});

// 8. Answer Options
export const answerOptions = pgTable('answer_options', {
  id: serial('id').primaryKey(),
  questionNumber: integer('question_number').notNull(),
  optionKey: text('option_key').notNull(), // 'A' | 'B' | 'C' | 'D'
  optionText: text('option_text').notNull(),
});

// 9. Student Answers
export const studentAnswers = pgTable('student_answers', {
  id: serial('id').primaryKey(),
  attemptUuid: text('attempt_uuid').notNull(),
  npm: text('npm').notNull(),
  questionNumber: integer('question_number').notNull(),
  selectedOption: text('selected_option').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  timeSpentSeconds: integer('time_spent_seconds').default(0).notNull(),
});

// 10. Quiz Results Summary
export const quizResults = pgTable('quiz_results', {
  id: serial('id').primaryKey(),
  attemptUuid: text('attempt_uuid').notNull().unique(),
  npm: text('npm').notNull(),
  studentName: text('student_name').notNull(),
  score: doublePrecision('score').notNull(),
  correctCount: integer('correct_count').notNull(),
  wrongCount: integer('wrong_count').notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 11. Leaderboard (Best Performance per Student NPM)
export const leaderboard = pgTable('leaderboard', {
  id: serial('id').primaryKey(),
  npm: text('npm').notNull().unique(),
  studentName: text('student_name').notNull(),
  gender: text('gender').default('female').notNull(),
  bestScore: doublePrecision('best_score').notNull(),
  fastestDurationSeconds: integer('fastest_duration_seconds').notNull(),
  clinicalScore: integer('clinical_score').default(0).notNull(),
  theoryScore: integer('theory_score').default(0).notNull(),
  mcvScore: integer('mcv_score').default(0).notNull(),
  mchScore: integer('mch_score').default(0).notNull(),
  mchcScore: integer('mchc_score').default(0).notNull(),
  badgeTitle: text('badge_title').default('ATLM Scholar').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 12. Learning Modules
export const learningModules = pgTable('learning_modules', {
  id: serial('id').primaryKey(),
  moduleNumber: integer('module_number').notNull().unique(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  pdfPages: text('pdf_pages').notNull(),
  summary: text('summary').notNull(),
});

// 13. Student Progress
export const studentProgress = pgTable('student_progress', {
  id: serial('id').primaryKey(),
  npm: text('npm').notNull(),
  moduleNumber: integer('module_number').notNull(),
  itemType: text('item_type').default('module').notNull(), // 'module' | 'case'
  completedAt: timestamp('completed_at').defaultNow(),
});

// 14. Glossary Terms
export const glossaryTerms = pgTable('glossary_terms', {
  id: serial('id').primaryKey(),
  term: text('term').notNull().unique(),
  abbreviation: text('abbreviation').notNull(),
  englishTerm: text('english_term').notNull(),
  category: text('category').notNull(),
  definitionId: text('definition_id').notNull(),
  roleFunction: text('role_function').notNull(),
  medicalExample: text('medical_example').notNull(),
  hematologyRelation: text('hematology_relation').notNull(),
  pdfPageRef: text('pdf_page_ref').notNull(),
  isAdditionalMaterial: boolean('is_additional_material').default(false).notNull(),
});

// 15. Calculator History
export const calculatorHistory = pgTable('calculator_history', {
  id: serial('id').primaryKey(),
  npm: text('npm').default('GUEST').notNull(),
  studentName: text('student_name').default('Mahasiswa ATLM').notNull(),
  hb: doublePrecision('hb').notNull(),
  hct: doublePrecision('hct').notNull(),
  rbc: doublePrecision('rbc').notNull(),
  mcv: doublePrecision('mcv').notNull(),
  mch: doublePrecision('mch').notNull(),
  mchc: doublePrecision('mchc').notNull(),
  mcvClass: text('mcv_class').notNull(),
  mchcClass: text('mchc_class').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 16. Achievements
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  npm: text('npm').notNull(),
  achievementCode: text('achievement_code').notNull(),
  title: text('title').notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow(),
});

// 17. Avatar Settings
export const avatarSettings = pgTable('avatar_settings', {
  id: serial('id').primaryKey(),
  npm: text('npm').notNull().unique(),
  gender: text('gender').default('female').notNull(), // 'male' | 'female'
  hairStyle: text('hair_style').default('modern').notNull(),
  skinTone: text('skin_tone').default('#F5CBA7').notNull(),
  uniformType: text('uniform_type').default('lab_coat').notNull(),
  shoeColor: text('shoe_color').default('#FFFFFF').notNull(),
  accessory: text('accessory').default('id_badge_microscope').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
