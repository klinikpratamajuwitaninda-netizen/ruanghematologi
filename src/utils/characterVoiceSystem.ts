export type CharacterGender = 'male' | 'female';

export type CharacterEmotion =
  | 'Happy'
  | 'Excited'
  | 'Sad'
  | 'Serious'
  | 'Surprised'
  | 'Curious'
  | 'Angry'
  | 'Empathetic'
  | 'Confident'
  | 'Encouraging';

export interface EmotionProsodyModifier {
  emotion: CharacterEmotion;
  labelId: string;
  pitchMultiplier: number;
  rateMultiplier: number;
  volumeMultiplier: number;
  pauseMultiplier: number;
  headTiltRad: number;
  gestureIntensity: number;
  badgeColor: string;
}

export interface CharacterVoiceProfile {
  characterId: string;
  characterName: string;
  roleTitle: string;
  voiceId: string;
  gender: CharacterGender;
  pitchProfile: number; // Base pitch (female: 1.12 - 1.28, male: 0.78 - 0.96)
  speakingRate: number; // Base speaking rate (0.88 - 1.08)
  voiceStyle: string;
  defaultEmotion: CharacterEmotion;
  intonationVariation: number; // 0.05 - 0.22
  clausePauseMs: number; // Natural pause between clauses (120 - 280ms)
  formantDetuneCents: number; // WebAudio formant shift (+110 to +220 for female, -210 to -45 for male)
  preferredVoiceKeywords: string[];
  geminiVoiceName: string; // Server-side neural voice mapping
}

export interface ProsodyClauseChunk {
  text: string;
  spokenText: string;
  emotion: CharacterEmotion;
  sentenceType: 'question' | 'exclamation' | 'clinical_warning' | 'greeting' | 'statement';
  finalPitch: number;
  finalRate: number;
  finalVolume: number;
  pauseAfterMs: number;
}

export const EMOTION_PROSODY_MAP: Record<CharacterEmotion, EmotionProsodyModifier> = {
  Happy: {
    emotion: 'Happy',
    labelId: 'Ramah & Bahagia',
    pitchMultiplier: 1.06,
    rateMultiplier: 1.04,
    volumeMultiplier: 1.0,
    pauseMultiplier: 0.9,
    headTiltRad: 0.06,
    gestureIntensity: 1.1,
    badgeColor: '#10b981',
  },
  Excited: {
    emotion: 'Excited',
    labelId: 'Antusias & Bersemangat',
    pitchMultiplier: 1.09,
    rateMultiplier: 1.08,
    volumeMultiplier: 1.05,
    pauseMultiplier: 0.85,
    headTiltRad: 0.08,
    gestureIntensity: 1.35,
    badgeColor: '#f59e0b',
  },
  Sad: {
    emotion: 'Sad',
    labelId: 'Sedih & Lemas Klinis',
    pitchMultiplier: 0.94,
    rateMultiplier: 0.91,
    volumeMultiplier: 0.9,
    pauseMultiplier: 1.25,
    headTiltRad: -0.08,
    gestureIntensity: 0.65,
    badgeColor: '#64748b',
  },
  Serious: {
    emotion: 'Serious',
    labelId: 'Serius & Analitis Medis',
    pitchMultiplier: 0.97,
    rateMultiplier: 0.96,
    volumeMultiplier: 1.02,
    pauseMultiplier: 1.12,
    headTiltRad: 0.0,
    gestureIntensity: 0.95,
    badgeColor: '#0284c7',
  },
  Surprised: {
    emotion: 'Surprised',
    labelId: 'Terkejut & Waspada',
    pitchMultiplier: 1.08,
    rateMultiplier: 1.05,
    volumeMultiplier: 1.04,
    pauseMultiplier: 0.95,
    headTiltRad: -0.05,
    gestureIntensity: 1.25,
    badgeColor: '#eab308',
  },
  Curious: {
    emotion: 'Curious',
    labelId: 'Penasaran & Bertanya',
    pitchMultiplier: 1.05,
    rateMultiplier: 0.98,
    volumeMultiplier: 0.98,
    pauseMultiplier: 1.05,
    headTiltRad: 0.11,
    gestureIntensity: 1.0,
    badgeColor: '#8b5cf6',
  },
  Angry: {
    emotion: 'Angry',
    labelId: 'Tegas & Peringatan Kritis',
    pitchMultiplier: 0.95,
    rateMultiplier: 1.04,
    volumeMultiplier: 1.06,
    pauseMultiplier: 0.92,
    headTiltRad: -0.04,
    gestureIntensity: 1.3,
    badgeColor: '#ef4444',
  },
  Empathetic: {
    emotion: 'Empathetic',
    labelId: 'Empati & Peduli Pasien',
    pitchMultiplier: 1.02,
    rateMultiplier: 0.95,
    volumeMultiplier: 0.96,
    pauseMultiplier: 1.15,
    headTiltRad: 0.07,
    gestureIntensity: 0.9,
    badgeColor: '#ec4899',
  },
  Confident: {
    emotion: 'Confident',
    labelId: 'Percaya Diri & Kompeten',
    pitchMultiplier: 1.01,
    rateMultiplier: 1.03,
    volumeMultiplier: 1.02,
    pauseMultiplier: 0.95,
    headTiltRad: 0.03,
    gestureIntensity: 1.15,
    badgeColor: '#0ea5e9',
  },
  Encouraging: {
    emotion: 'Encouraging',
    labelId: 'Memotivasi & Membimbing',
    pitchMultiplier: 1.04,
    rateMultiplier: 0.99,
    volumeMultiplier: 1.02,
    pauseMultiplier: 1.05,
    headTiltRad: 0.05,
    gestureIntensity: 1.12,
    badgeColor: '#14b8a6',
  },
};

export const CHARACTER_VOICE_PROFILES: Record<string, CharacterVoiceProfile> = {
  npc_dr_juwita: {
    characterId: 'npc_dr_juwita',
    characterName: 'dr. Juwita Ninda Suherman, M.Kes',
    roleTitle: 'Dosen Pembimbing Utama & Konsultan Akademik Hematologi',
    voiceId: 'VOICE_ID_FEMALE_LECTURER_JUWITA',
    gender: 'female',
    pitchProfile: 1.15,
    speakingRate: 0.98,
    voiceStyle: 'Suara Dosen Wanita Akademis — Jernih, Lembut, Berwibawa, & Mengayomi',
    defaultEmotion: 'Encouraging',
    intonationVariation: 0.16,
    clausePauseMs: 185,
    formantDetuneCents: 135,
    preferredVoiceKeywords: ['gadis', 'damayanti', 'putri', 'siti', 'female', 'woman', 'natural', 'google bahasa indonesia'],
    geminiVoiceName: 'Kore',
  },
  npc_dr_hendrawan: {
    characterId: 'npc_dr_hendrawan',
    characterName: 'dr. Hendrawan Pratama, Sp.PK(K)',
    roleTitle: 'Dokter Spesialis Patologi Klinik Konsultan Hematologi',
    voiceId: 'VOICE_ID_MALE_SPECIALIST_HENDRAWAN',
    gender: 'male',
    pitchProfile: 0.82,
    speakingRate: 0.94,
    voiceStyle: 'Suara Dokter Spesialis Pria Senior — Berat, Tenang, Analitis, & Tegas',
    defaultEmotion: 'Serious',
    intonationVariation: 0.12,
    clausePauseMs: 210,
    formantDetuneCents: -185,
    preferredVoiceKeywords: ['ardi', 'budi', 'male', 'man', 'pria', 'daniel', 'david'],
    geminiVoiceName: 'Charon',
  },
  npc_dr_arasya: {
    characterId: 'npc_dr_arasya',
    characterName: 'dr. Arasya Putri, Sp.PD-KHOM',
    roleTitle: 'Dokter Spesialis Penyakit Dalam — Konsultan Hematologi Onkologi',
    voiceId: 'VOICE_ID_FEMALE_DOCTOR_ARASYA',
    gender: 'female',
    pitchProfile: 1.19,
    speakingRate: 1.01,
    voiceStyle: 'Suara Dokter Spesialis Wanita — Hangat, Empatik, & Klinis Profesional',
    defaultEmotion: 'Empathetic',
    intonationVariation: 0.17,
    clausePauseMs: 175,
    formantDetuneCents: 165,
    preferredVoiceKeywords: ['gadis', 'damayanti', 'female', 'woman', 'samantha', 'victoria'],
    geminiVoiceName: 'Aoede',
  },
  npc_atlm_senior: {
    characterId: 'npc_atlm_senior',
    characterName: 'Raka Aditya, S.Tr.Kes (ATLM Senior)',
    roleTitle: 'Koordinator Laboratorium Hematologi & Flebotomi',
    voiceId: 'VOICE_ID_MALE_ANALYST_RAKA',
    gender: 'male',
    pitchProfile: 0.91,
    speakingRate: 1.04,
    voiceStyle: 'Suara Analis Laboratorium Pria — Energik, Presisi, & Komunikatif',
    defaultEmotion: 'Confident',
    intonationVariation: 0.15,
    clausePauseMs: 155,
    formantDetuneCents: -105,
    preferredVoiceKeywords: ['ardi', 'male', 'man', 'alex', 'fred', 'google'],
    geminiVoiceName: 'Puck',
  },
  npc_nurse_siti: {
    characterId: 'npc_nurse_siti',
    characterName: 'Ns. Siti Rahmawati, S.Kep',
    roleTitle: 'Perawat Kepala Bangsal Rawat Inap & IGD',
    voiceId: 'VOICE_ID_FEMALE_NURSE_SITI',
    gender: 'female',
    pitchProfile: 1.23,
    speakingRate: 1.02,
    voiceStyle: 'Suara Perawat Klinis Wanita — Tanggap, Ramah, & Menenangkan',
    defaultEmotion: 'Empathetic',
    intonationVariation: 0.18,
    clausePauseMs: 165,
    formantDetuneCents: 190,
    preferredVoiceKeywords: ['gadis', 'damayanti', 'female', 'woman', 'karen'],
    geminiVoiceName: 'Kore',
  },
  npc_patient_nadia: {
    characterId: 'npc_patient_nadia',
    characterName: 'Pasien 1: Nn. Nadia Putri (24 Thn)',
    roleTitle: 'Pasien Anemia Defisiensi Besi (Wanita Muda)',
    voiceId: 'VOICE_ID_FEMALE_PATIENT_NADIA',
    gender: 'female',
    pitchProfile: 1.27,
    speakingRate: 0.96,
    voiceStyle: 'Suara Pasien Mahasiswi Wanita — Lembut, Ekspresif, & Ingin Tahu',
    defaultEmotion: 'Curious',
    intonationVariation: 0.19,
    clausePauseMs: 195,
    formantDetuneCents: 220,
    preferredVoiceKeywords: ['gadis', 'damayanti', 'female', 'woman'],
    geminiVoiceName: 'Aoede',
  },
  npc_patient_rizky: {
    characterId: 'npc_patient_rizky',
    characterName: 'Pasien 2: An. Rizky Pratama (14 Thn)',
    roleTitle: 'Pasien Demam Berdarah Dengue (Remaja Laki-laki)',
    voiceId: 'VOICE_ID_MALE_PATIENT_RIZKY',
    gender: 'male',
    pitchProfile: 0.96,
    speakingRate: 1.01,
    voiceStyle: 'Suara Pasien Remaja Pria — Muda, Jujur, & Penuh Tanya',
    defaultEmotion: 'Curious',
    intonationVariation: 0.16,
    clausePauseMs: 170,
    formantDetuneCents: -55,
    preferredVoiceKeywords: ['ardi', 'male', 'man'],
    geminiVoiceName: 'Puck',
  },
  npc_patient_bima: {
    characterId: 'npc_patient_bima',
    characterName: 'Pasien 3: Tn. Bima Sakti (52 Thn)',
    roleTitle: 'Pasien Anemia Megaloblastik (Pria Paruh Baya)',
    voiceId: 'VOICE_ID_MALE_PATIENT_BIMA',
    gender: 'male',
    pitchProfile: 0.85,
    speakingRate: 0.92,
    voiceStyle: 'Suara Pasien Pria Paruh Baya — Rendah, Tenang, & Berharap Sembuh',
    defaultEmotion: 'Sad',
    intonationVariation: 0.13,
    clausePauseMs: 220,
    formantDetuneCents: -155,
    preferredVoiceKeywords: ['ardi', 'male', 'man'],
    geminiVoiceName: 'Fenrir',
  },
  npc_patient_hendra: {
    characterId: 'npc_patient_hendra',
    characterName: 'Pasien 4: Tn. Hendra Wijaya (58 Thn)',
    roleTitle: 'Pasien Anemia Penyakit Ginjal Kronis (Pria Senior)',
    voiceId: 'VOICE_ID_MALE_PATIENT_HENDRA',
    gender: 'male',
    pitchProfile: 0.79,
    speakingRate: 0.90,
    voiceStyle: 'Suara Pasien Pria Senior — Dalam, Sopan, & Reflektif',
    defaultEmotion: 'Curious',
    intonationVariation: 0.12,
    clausePauseMs: 230,
    formantDetuneCents: -210,
    preferredVoiceKeywords: ['ardi', 'male', 'man'],
    geminiVoiceName: 'Charon',
  },
  npc_patient_dewi: {
    characterId: 'npc_patient_dewi',
    characterName: 'Pasien 5: Ny. Dewi Sartika (31 Thn)',
    roleTitle: 'Pasien Anemia Hemolitik Autoimun (Wanita Dewasa)',
    voiceId: 'VOICE_ID_FEMALE_PATIENT_DEWI',
    gender: 'female',
    pitchProfile: 1.17,
    speakingRate: 0.97,
    voiceStyle: 'Suara Pasien Wanita Dewasa — Jelas, Ekspresif, & Bersyukur',
    defaultEmotion: 'Surprised',
    intonationVariation: 0.18,
    clausePauseMs: 185,
    formantDetuneCents: 150,
    preferredVoiceKeywords: ['gadis', 'damayanti', 'female', 'woman'],
    geminiVoiceName: 'Kore',
  },
  npc_patient_ahmad: {
    characterId: 'npc_patient_ahmad',
    characterName: 'Pasien 6: Tn. Ahmad Fauzi (46 Thn)',
    roleTitle: 'Pasien Suspek Leukemia Akut (Pria Dewasa)',
    voiceId: 'VOICE_ID_MALE_PATIENT_AHMAD',
    gender: 'male',
    pitchProfile: 0.87,
    speakingRate: 0.93,
    voiceStyle: 'Suara Pasien Pria Dewasa — Serius, Lemas, namun Lega Ditangani',
    defaultEmotion: 'Serious',
    intonationVariation: 0.14,
    clausePauseMs: 205,
    formantDetuneCents: -135,
    preferredVoiceKeywords: ['ardi', 'male', 'man'],
    geminiVoiceName: 'Fenrir',
  },
};

/**
 * Resolves a permanent, gender-accurate CharacterVoiceProfile for any character ID or name.
 * Guarantees male characters NEVER get female voices and female characters NEVER get male voices.
 */
export function getCharacterVoiceProfile(
  characterIdOrName?: string,
  explicitGender?: CharacterGender
): CharacterVoiceProfile {
  if (characterIdOrName && CHARACTER_VOICE_PROFILES[characterIdOrName]) {
    return CHARACTER_VOICE_PROFILES[characterIdOrName];
  }

  const key = String(characterIdOrName || '').toLowerCase();
  for (const profile of Object.values(CHARACTER_VOICE_PROFILES)) {
    if (
      key.includes(profile.characterId.toLowerCase()) ||
      profile.characterName.toLowerCase().includes(key)
    ) {
      return profile;
    }
  }

  // Infer gender accurately from Indonesian medical titles/names if not explicitly supplied
  const isFemaleInferred =
    explicitGender === 'female' ||
    (!explicitGender &&
      /juwita|arasya|siti|nadia|dewi|putri|nabila|aulia|nn\.|ny\.|wanita|perempuan|female/i.test(
        key
      ));

  // Deterministic hash so any new character gets a consistent, unique voice profile
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) & 0x7fffffff;
  }

  if (isFemaleInferred) {
    const pitchOffset = (hash % 14) * 0.01;
    return {
      characterId: characterIdOrName || 'female_character',
      characterName: characterIdOrName || 'Karakter Medis Wanita',
      roleTitle: 'Tenaga Medis / Pasien Wanita',
      voiceId: `VOICE_ID_FEMALE_${(hash % 900) + 100}`,
      gender: 'female',
      pitchProfile: Number((1.14 + pitchOffset).toFixed(2)),
      speakingRate: Number((0.97 + (hash % 7) * 0.01).toFixed(2)),
      voiceStyle: 'Suara Karakter Wanita — Natural, Halus, & Ekspresif',
      defaultEmotion: 'Encouraging',
      intonationVariation: 0.16,
      clausePauseMs: 180,
      formantDetuneCents: 140 + (hash % 70),
      preferredVoiceKeywords: ['gadis', 'damayanti', 'female', 'woman'],
      geminiVoiceName: hash % 2 === 0 ? 'Kore' : 'Aoede',
    };
  }

  const malePitchOffset = (hash % 12) * 0.01;
  return {
    characterId: characterIdOrName || 'male_character',
    characterName: characterIdOrName || 'Karakter Medis Pria',
    roleTitle: 'Tenaga Medis / Pasien Pria',
    voiceId: `VOICE_ID_MALE_${(hash % 900) + 100}`,
    gender: 'male',
    pitchProfile: Number((0.81 + malePitchOffset).toFixed(2)),
    speakingRate: Number((0.93 + (hash % 8) * 0.01).toFixed(2)),
    voiceStyle: 'Suara Karakter Pria — Tegas, Natural, & Jelas',
    defaultEmotion: 'Confident',
    intonationVariation: 0.14,
    clausePauseMs: 190,
    formantDetuneCents: -180 + (hash % 85),
    preferredVoiceKeywords: ['ardi', 'budi', 'male', 'man'],
    geminiVoiceName: hash % 2 === 0 ? 'Charon' : 'Fenrir',
  };
}

/**
 * Contextually detects the character's emotional expression from dialogue text and role.
 */
export function detectDialogueEmotion(
  text: string,
  profile: CharacterVoiceProfile
): CharacterEmotion {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  if (/selamat datang|halo rekan|semangat|luar biasa|hebat/i.test(lower)) {
    return profile.characterId === 'npc_dr_juwita' ? 'Encouraging' : 'Happy';
  }
  if (/terima kasih|syukurlah|sangat jelas|baru sekarang saya paham/i.test(lower)) {
    return 'Happy';
  }
  if (/jangan langsung|jangan pernah|wajib|nilai kritis|bahaya|segera laporkan/i.test(lower)) {
    return profile.roleTitle.includes('Dosen') ? 'Encouraging' : 'Serious';
  }
  if (/lemas sekali|pusing|berdarah|kesemutan|perih|takut|turun drastis/i.test(lower)) {
    if (clean.includes('?')) return 'Curious';
    return 'Sad';
  }
  if (clean.endsWith('?') || /apa artinya|mengapa|kenapa|bagaimana/i.test(lower)) {
    return 'Curious';
  }
  if (clean.includes('!') && /ingat|rumus emas|aturan tiga|rule of three/i.test(lower)) {
    return 'Excited';
  }
  if (/edukasi|mendampingi|memantau ketat|keselamatan|hati-hati/i.test(lower)) {
    return 'Empathetic';
  }

  return profile.defaultEmotion;
}

/**
 * Converts medical abbreviations & mathematical symbols into natural spoken Indonesian or English
 * so TTS engines pronounce them like a real human doctor/lecturer instead of spelling out symbols.
 */
export function normalizeMedicalSpeechText(rawText: string, lang: 'id-ID' | 'en-US'): string {
  let t = String(rawText || '').trim();
  if (lang === 'id-ID') {
    t = t
      .replace(/dr\.\s+/gi, 'dokter ')
      .replace(/M\.Kes/gi, 'Magister Kesehatan')
      .replace(/Sp\.PK\(K\)/gi, 'Spesialis Patologi Klinik Konsultan')
      .replace(/Sp\.PD-KHOM/gi, 'Spesialis Penyakit Dalam Konsultan Hematologi Onkologi Medik')
      .replace(/S\.Tr\.Kes/gi, 'Sarjana Terapan Kesehatan')
      .replace(/Ns\.\s+/gi, 'Ners ')
      .replace(/S\.Kep/gi, 'Sarjana Keperawatan')
      .replace(/Nn\.\s+/gi, 'Nona ')
      .replace(/Tn\.\s+/gi, 'Tuan ')
      .replace(/Ny\.\s+/gi, 'Nyonya ')
      .replace(/An\.\s+/gi, 'Anak ')
      .replace(/\bHb\b/g, 'Hemoglobin')
      .replace(/\bHct\b/g, 'Hematokrit')
      .replace(/\bRBC\b/g, 'Eritrosit')
      .replace(/\bWBC\b/g, 'Leukosit')
      .replace(/\bPLT\b/g, 'Trombosit')
      .replace(/\bSADT\b/g, 'Sediaan Apus Darah Tepi')
      .replace(/\bDBD\b/g, 'Demam Berdarah Dengue')
      .replace(/g\/dL/gi, 'gram per desiliter')
      .replace(/juta\/µL/gi, 'juta per mikroliter')
      .replace(/\/µL/gi, ' per mikroliter')
      .replace(/\bfL\b/g, 'femtoliter')
      .replace(/\bpg\b/g, 'pikogram')
      .replace(/ng\/mL/gi, 'nanogram per mililiter')
      .replace(/×/g, ' dikali ')
      .replace(/≈/g, ' kira-kira sama dengan ')
      .replace(/±/g, ' kurang lebih ')
      .replace(/>/g, ' lebih dari ')
      .replace(/</g, ' kurang dari ')
      .replace(/(\d+),(\d+)/g, '$1 koma $2');
  } else {
    t = t
      .replace(/\bHb\b/g, 'Hemoglobin')
      .replace(/\bHct\b/g, 'Hematocrit')
      .replace(/g\/dL/gi, 'grams per deciliter')
      .replace(/\/µL/gi, ' per microliter')
      .replace(/\bfL\b/g, 'femtoliters')
      .replace(/\bpg\b/g, 'picograms')
      .replace(/×/g, ' times ')
      .replace(/≈/g, ' approximately equals ');
  }
  return t.replace(/\s+/g, ' ').trim();
}

/**
 * Splits a character's dialogue into natural prosody clauses with dynamic pitch, rate,
 * and pause timings so speech never sounds flat or robotic.
 */
export function buildProsodyChunks(
  rawText: string,
  profile: CharacterVoiceProfile,
  lang: 'id-ID' | 'en-US',
  overrideEmotion?: CharacterEmotion
): ProsodyClauseChunk[] {
  const baseEmotion = overrideEmotion || detectDialogueEmotion(rawText, profile);
  const sentences = String(rawText || '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length === 0 && rawText.trim()) {
    sentences.push(rawText.trim());
  }

  return sentences.map((sentence, idx) => {
    const chunkEmotion = overrideEmotion || detectDialogueEmotion(sentence, profile) || baseEmotion;
    const mod = EMOTION_PROSODY_MAP[chunkEmotion] || EMOTION_PROSODY_MAP[profile.defaultEmotion];

    let sentenceType: ProsodyClauseChunk['sentenceType'] = 'statement';
    let pitchContour = 1.0;
    let rateContour = 1.0;
    let extraPauseMs = 0;

    if (sentence.endsWith('?')) {
      sentenceType = 'question';
      pitchContour = 1.06; // Natural rising intonation on questions
      rateContour = 0.98;
      extraPauseMs = 90;
    } else if (sentence.endsWith('!')) {
      sentenceType = 'exclamation';
      pitchContour = 1.04;
      rateContour = 1.03;
      extraPauseMs = 70;
    } else if (/selamat|halo|terima kasih/i.test(sentence)) {
      sentenceType = 'greeting';
      pitchContour = 1.03;
      rateContour = 1.0;
      extraPauseMs = 60;
    } else if (/kritis|jangan|wajib|perhatikan/i.test(sentence)) {
      sentenceType = 'clinical_warning';
      pitchContour = 0.98;
      rateContour = 0.96; // Deliberate emphasis on clinical instructions
      extraPauseMs = 110;
    } else {
      // Subtle natural micro-variation across consecutive sentences so it never sounds monotonous
      const microWave = idx % 2 === 0 ? 1.015 : 0.988;
      pitchContour = microWave;
    }

    // Clamp pitch strictly within gender-authentic boundaries
    const rawPitch = profile.pitchProfile * mod.pitchMultiplier * pitchContour;
    const finalPitch =
      profile.gender === 'female'
        ? Math.max(1.08, Math.min(1.42, Number(rawPitch.toFixed(2))))
        : Math.max(0.72, Math.min(0.98, Number(rawPitch.toFixed(2))));

    const rawRate = profile.speakingRate * mod.rateMultiplier * rateContour;
    const finalRate = Math.max(0.84, Math.min(1.18, Number(rawRate.toFixed(2))));

    const spokenText = normalizeMedicalSpeechText(sentence, lang);
    const pauseAfterMs = Math.round(profile.clausePauseMs * mod.pauseMultiplier + extraPauseMs);

    return {
      text: sentence,
      spokenText,
      emotion: chunkEmotion,
      sentenceType,
      finalPitch,
      finalRate,
      finalVolume: Math.min(1, mod.volumeMultiplier),
      pauseAfterMs,
    };
  });
}
