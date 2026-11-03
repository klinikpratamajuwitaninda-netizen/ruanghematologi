export interface QuizQuestionItem {
  questionNumber: number;
  category: 'clinical_case' | 'theory';
  topic: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  scientificExplanation: string;
  optionRationales: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  calculationSteps?: string;
  doctorClinicalExplanation: string;
  patientEducation: string;
  managementPlan: string;
  pdfPageRef: string;
}

export const QUIZ_30_QUESTIONS: QuizQuestionItem[] = [
  {
    questionNumber: 1,
    category: 'clinical_case',
    topic: 'Kasus 1 — Anemia dengan Mikrositosis (Perhitungan MCV)',
    questionText:
      'Seorang perempuan berusia 24 tahun datang ke poliklinik dengan keluhan mudah lelah, pusing, dan tampak pucat sejak beberapa minggu. Dokter melakukan anamnesis mengenai pola makan, riwayat menstruasi, dan kemungkinan perdarahan. Pada pemeriksaan fisik ditemukan konjungtiva pucat; tanda vital stabil. Hasil laboratorium: Hb 9,5 g/dL, hematokrit 28,8%, RBC 4,0 juta/µL, dan ferritin 8 ng/mL. Dokter menjelaskan bahwa indeks eritrosit diperlukan untuk mengelompokkan pola anemia sebelum penyebab dipastikan. Berapakah MCV pasien dan klasifikasi ukurannya?',
    options: {
      A: '62 fL — mikrositik',
      B: '72 fL — mikrositik',
      C: '80 fL — normositik',
      D: '96 fL — normositik',
    },
    correctOption: 'B',
    scientificExplanation:
      'MCV (Mean Corpuscular Volume) menyatakan volume rata-rata satu sel eritrosit dalam satuan femtoliter (fL). Dengan Hct 28,8% dan RBC 4,0 juta/µL, diperoleh MCV = 72 fL. Karena berada di bawah rentang normal (80–100 fL), morfologi ukuran eritrosit diklasifikasikan sebagai mikrositik. Kadar ferritin 8 ng/mL (<15 ng/mL) mengonfirmasi cadangan besi tubuh yang terkuras.',
    optionRationales: {
      A: 'Tidak tepat: 62 fL tidak sesuai dengan substitusi data; hasil pembagian 288 / 4,0 adalah 72 fL.',
      B: 'Tepat: 72 fL diperoleh dari (28,8 × 10) / 4,0 = 288 / 4,0 = 72 fL dan berada di bawah 80 fL (mikrositik).',
      C: 'Tidak tepat: 80 fL bukan hasil perhitungan pasien, melainkan batas bawah rentang normositik.',
      D: 'Tidak tepat: 96 fL tidak sesuai dengan hasil perhitungan dan termasuk rentang normositik.',
    },
    calculationSteps: 'Rumus: MCV = (Hct (%) × 10) / RBC (juta/µL) = (28,8 × 10) / 4,0 = 288 / 4,0 = 72 fL (< 80 fL → Mikrositik).',
    doctorClinicalExplanation:
      'Dokter menginterpretasikan temuan Hb 9,5 g/dL (<12,0 g/dL), MCV 72 fL (mikrositik), dan ferritin 8 ng/mL sebagai Anemia Defisiensi Besi yang kemungkinan dipicu oleh menoragia atau kurangnya asupan besi.',
    patientEducation:
      'Dokter mengedukasi pasien untuk mengonsumsi makanan tinggi zat besi heme (daging merah, hati, ikan) disertai vitamin C (jeruk) untuk meningkatkan absorbsi besi, serta menghindari minum teh/kopi bersamaan dengan waktu makan.',
    managementPlan:
      'Pemberian suplementasi preparat besi oral oleh dokter, evaluasi sumber kehilangan darah menstruasi, dan pemantauan ulang Hb serta retikulosit setelah 2–4 minggu terapi.',
    pdfPageRef: 'Halaman 23, 38, 40, dan 42',
  },
  {
    questionNumber: 2,
    category: 'clinical_case',
    topic: 'Kasus 2 — Perhitungan MCH pada Pasien Anemia',
    questionText:
      'Seorang laki-laki berusia 35 tahun mengeluhkan penurunan stamina dan mudah lelah. Dokter menanyakan riwayat penyakit, asupan nutrisi, dan perdarahan. Pemeriksaan fisik menunjukkan konjungtiva agak pucat tanpa perdarahan aktif. Hasil CBC: Hb 8,4 g/dL, Hct 27%, RBC 3,5 juta/µL. Dokter meminta ATLM menghitung jumlah rata-rata hemoglobin per eritrosit (MCH), bukan ukuran selnya. Berapakah nilai MCH?',
    options: {
      A: '20 pg',
      B: '24 pg',
      C: '27 pg',
      D: '30 pg',
    },
    correctOption: 'B',
    scientificExplanation:
      'MCH (Mean Corpuscular Hemoglobin) menggambarkan bobot/massa rata-rata hemoglobin di dalam satu sel darah merah dalam satuan pikogram (pg), berbeda dari MCV yang mengukur volume sel.',
    optionRationales: {
      A: 'Tidak tepat: 20 pg tidak diperoleh dari pembagian 84 oleh 3,5.',
      B: 'Tepat: 24 pg merupakan hasil perhitungan (8,4 × 10) / 3,5 = 84 / 3,5 = 24 pg (di bawah rentang normal 27–33 pg).',
      C: 'Tidak tepat: 27 adalah angka Hematokrit (27%) pasien, bukan hasil perhitungan MCH.',
      D: 'Tidak tepat: 30 pg tidak sesuai dengan pembagian Hb × 10 oleh jumlah RBC.',
    },
    calculationSteps: 'Rumus: MCH = (Hb (g/dL) × 10) / RBC (juta/µL) = (8,4 × 10) / 3,5 = 84 / 3,5 = 24 pg (< 27 pg → Menurun).',
    doctorClinicalExplanation:
      'Nilai MCH 24 pg menunjukkan penurunan bobot hemoglobin rata-rata per sel eritrosit seiring dengan MCV pasien (270/3,5 = 77,1 fL) yang mikrositik.',
    patientEducation:
      'Menjelaskan bahwa keluhan mudah lelah terjadi karena setiap sel darah merah membawa muatan hemoglobin pengikat oksigen yang lebih sedikit dari normal.',
    managementPlan:
      'Pemeriksaan Sediaan Apus Darah Tepi (SADT), panel besi (SI, TIBC, Ferritin), dan skrining darah samar feses (FOBT) untuk mencari sumber perdarahan kronis.',
    pdfPageRef: 'Halaman 23, 39–40',
  },
  {
    questionNumber: 3,
    category: 'clinical_case',
    topic: 'Kasus 3 — Konsentrasi Hemoglobin Eritrosit (MCHC)',
    questionText:
      'Seorang perempuan berusia 29 tahun datang dengan keluhan lemah dan cepat lelah. Dokter melakukan anamnesis dan menemukan keluhan berlangsung satu bulan. Pemeriksaan fisik menunjukkan pucat ringan. Hasil laboratorium: Hb 9,6 g/dL, Hct 30%, RBC 4,0 juta/µL. Dokter meminta mahasiswa menentukan konsentrasi hemoglobin rata-rata dalam volume eritrosit. Berapakah MCHC pasien?',
    options: {
      A: '28 g/dL',
      B: '30 g/dL',
      C: '32 g/dL',
      D: '36 g/dL',
    },
    correctOption: 'C',
    scientificExplanation:
      'MCHC (Mean Corpuscular Hemoglobin Concentration) menilai konsentrasi rata-rata hemoglobin per satuan volume eritrosit pekat (g/dL) dengan membandingkan kadar Hb terhadap Hematokrit.',
    optionRationales: {
      A: 'Tidak tepat: 28 g/dL tidak sesuai dengan hasil 960 dibagi 30.',
      B: 'Tidak tepat: 30 merupakan nilai Hematokrit (30%), bukan hasil perhitungan MCHC.',
      C: 'Tepat: 32 g/dL diperoleh dari (9,6 × 100) / 30 = 960 / 30 = 32 g/dL (tepat pada batas bawah rentang normal 32–36 g/dL).',
      D: 'Tidak tepat: 36 g/dL merupakan batas atas rentang normal, bukan hasil perhitungan pasien.',
    },
    calculationSteps: 'Rumus: MCHC = (Hb (g/dL) × 100) / Hct (%) = (9,6 × 100) / 30 = 960 / 30 = 32 g/dL.',
    doctorClinicalExplanation:
      'Meskipun MCHC berada tepat di batas bawah normal (32 g/dL), MCV pasien adalah (30×10)/4,0 = 75 fL (mikrositik) dan MCH = 24 pg, sehingga menunjukkan transisi menuju anemia mikrositik hipokromik.',
    patientEducation:
      'Edukasi pentingnya kepatuhan pemeriksaan lanjutan dan perbaikan pola konsumsi nutrisi kaya zat besi dan protein.',
    managementPlan:
      'Konfirmasi morfologi eritrosit pada apusan darah tepi dan pemeriksaan profil besi serum.',
    pdfPageRef: 'Halaman 23, 39–40',
  },
  {
    questionNumber: 4,
    category: 'clinical_case',
    topic: 'Kasus 4 — Interpretasi Gabungan Tiga Indeks Eritrosit',
    questionText:
      'Seorang pasien perempuan berusia 32 tahun datang dengan keluhan lemah. Dokter meminta pemeriksaan darah lengkap. Hasil: Hb 8,4 g/dL, Hct 28%, RBC 3,5 juta/µL. Mahasiswa harus menghitung ketiga indeks eritrosit sebelum memberikan interpretasi. Kombinasi hasil yang paling tepat adalah:',
    options: {
      A: 'MCV 80 fL; MCH 24 pg; MCHC 30 g/dL',
      B: 'MCV 70 fL; MCH 30 pg; MCHC 36 g/dL',
      C: 'MCV 90 fL; MCH 24 pg; MCHC 32 g/dL',
      D: 'MCV 100 fL; MCH 27 pg; MCHC 36 g/dL',
    },
    correctOption: 'A',
    scientificExplanation:
      'Perhitungan serentak ketiga indeks eritrosit wajib dilakukan ATLM untuk memberikan gambaran utuh ukuran (MCV), bobot Hb per sel (MCH), dan kepekatan warna Hb per volume eritrosit (MCHC).',
    optionRationales: {
      A: 'Tepat: MCV = 280/3,5 = 80 fL; MCH = 84/3,5 = 24 pg; MCHC = 840/28 = 30 g/dL.',
      B: 'Tidak tepat: Ketiga angka MCV 70, MCH 30, dan MCHC 36 tidak sesuai dengan substitusi rumus.',
      C: 'Tidak tepat: Hanya MCH 24 pg yang benar; MCV 90 dan MCHC 32 keliru.',
      D: 'Tidak tepat: Ketiga nilai merupakan angka batas normal umum, bukan hasil perhitungan pasien.',
    },
    calculationSteps:
      'MCV = (28 × 10) / 3,5 = 80 fL | MCH = (8,4 × 10) / 3,5 = 24 pg | MCHC = (8,4 × 100) / 28 = 30 g/dL.',
    doctorClinicalExplanation:
      'MCV berada tepat di batas bawah normositik (80 fL), namun MCH (24 pg) dan MCHC (30 g/dL) sudah menurun jelas (hipokromik), mencerminkan gangguan pengisian hemoglobin.',
    patientEducation:
      'Penjelasan mengenai arti hasil laboratorium secara menyeluruh dan perlunya investigasi penyebab defisiensi hemoglobin.',
    managementPlan:
      'Evaluasi apusan darah tepi (melihat pelebaran central pallor > 1/3 diameter sel) dan pemeriksaan status besi.',
    pdfPageRef: 'Halaman 23, 38–40',
  },
  {
    questionNumber: 5,
    category: 'clinical_case',
    topic: 'Kasus 5 — Makrositosis Berdasarkan MCV',
    questionText:
      'Seorang laki-laki berusia 48 tahun datang dengan keluhan kelelahan dan penurunan aktivitas. Dokter menanyakan riwayat penyakit serta obat yang digunakan. Pemeriksaan fisik menunjukkan pucat. CBC: Hb 10,5 g/dL, Hct 36%, RBC 3,2 juta/µL. Dokter meminta mahasiswa menghitung MCV untuk menilai ukuran rata-rata eritrosit. Hasil dan klasifikasi yang tepat adalah:',
    options: {
      A: 'MCV 90 fL — normositik',
      B: 'MCV 100 fL — normositik',
      C: 'MCV 112,5 fL — makrositik',
      D: 'MCV 125 fL — makrositik',
    },
    correctOption: 'C',
    scientificExplanation:
      'Nilai MCV > 100 fL diklasifikasikan sebagai makrositik. Pada pasien ini, penurunan jumlah RBC (3,2 juta/µL) yang lebih tajam dibanding penurunan Hct (36%) menghasilkan volume rata-rata sel yang membesar (112,5 fL).',
    optionRationales: {
      A: 'Tidak tepat: 90 fL tidak sesuai dengan pembagian 360 oleh 3,2.',
      B: 'Tidak tepat: 100 fL adalah batas atas rentang normositik, bukan hasil hitung pasien.',
      C: 'Tepat: MCV = (36 × 10) / 3,2 = 360 / 3,2 = 112,5 fL (> 100 fL → makrositik).',
      D: 'Tidak tepat: 125 fL tidak sesuai dengan perhitungan matematis.',
    },
    calculationSteps: 'Rumus: MCV = (Hct × 10) / RBC = (36 × 10) / 3,2 = 360 / 3,2 = 112,5 fL (> 100 fL → Makrositik).',
    doctorClinicalExplanation:
      'Anemia makrositik (MCV 112,5 fL) mengarahkan kecurigaan klinis pada gangguan sintesis DNA eritroblas akibat defisiensi Vitamin B12 (kobalamin), defisiensi Asam Folat, efek obat kemoterapi/antikonvulsan, atau penyakit hati kronis.',
    patientEducation:
      'Edukasi mengenai pentingnya vitamin B12 (produk hewani) dan asam folat (sayuran hijau) dalam pematangan sel darah merah di sumsum tulang.',
    managementPlan:
      'Pemeriksaan SADT untuk mencari makrosit oval dan neutrofil hipersegmentasi (>5 lobus), serta pengukuran kadar Vitamin B12 dan Folat serum.',
    pdfPageRef: 'Halaman 24, 38, dan 40',
  },
  {
    questionNumber: 6,
    category: 'clinical_case',
    topic: 'Kasus 6 — Perhitungan MCH pada Pasien dengan Keluhan Pucat',
    questionText:
      'Seorang perempuan berusia 41 tahun datang ke dokter dengan keluhan mudah lelah dan berdebar saat beraktivitas. Anamnesis mencakup riwayat menstruasi dan pola makan. Pemeriksaan fisik menemukan konjungtiva pucat. Hasil CBC: Hb 10,8 g/dL, Hct 32,4%, RBC 4,5 juta/µL. Berapakah MCH berdasarkan data tersebut?',
    options: {
      A: '20 pg',
      B: '22 pg',
      C: '24 pg',
      D: '27 pg',
    },
    correctOption: 'C',
    scientificExplanation:
      'MCH dihitung dengan mengalikan Hb (10,8 g/dL) dengan 10 lalu dibagi jumlah RBC (4,5 juta/µL), menghasilkan 24 pg.',
    optionRationales: {
      A: 'Tidak tepat: 20 pg tidak sesuai dengan pembagian 108 oleh 4,5.',
      B: 'Tidak tepat: 22 pg bukan hasil pembagian 108 oleh 4,5.',
      C: 'Tepat: (10,8 × 10) / 4,5 = 108 / 4,5 = 24 pg.',
      D: 'Tidak tepat: 27 pg merupakan batas bawah nilai rujukan normal, bukan hasil pasien.',
    },
    calculationSteps: 'Rumus: MCH = (10,8 × 10) / 4,5 = 108 / 4,5 = 24 pg.',
    doctorClinicalExplanation:
      'Pasien mengalami penurunan Hb (10,8 g/dL) dengan MCH rendah (24 pg) dan MCV rendah ((32,4×10)/4,5 = 72 fL), konsisten dengan gambaran anemia mikrositik.',
    patientEducation:
      'Menjelaskan hubungan keluhan berdebar (kompensasi jantung memompa lebih cepat) dengan rendahnya kadar hemoglobin pengangkut oksigen.',
    managementPlan:
      'Evaluasi profil besi dan tata laksana kausal sesuai temuan klinis dokter.',
    pdfPageRef: 'Halaman 23, 39–40',
  },
  {
    questionNumber: 7,
    category: 'clinical_case',
    topic: 'Kasus 7 — Evaluasi MCHC Rendah (Hipokromia)',
    questionText:
      'Seorang pasien berusia 38 tahun menjalani pemeriksaan karena kelelahan. Dokter melakukan anamnesis mengenai penyakit terdahulu dan kemungkinan kehilangan darah. Pemeriksaan fisik menunjukkan pucat. Hasil laboratorium: Hb 10,2 g/dL, Hct 34%, RBC 3,8 juta/µL. Berapakah MCHC dan interpretasi terhadap konsentrasi hemoglobin eritrosit?',
    options: {
      A: '25 g/dL — rendah',
      B: '30 g/dL — rendah',
      C: '34 g/dL — normal',
      D: '38 g/dL — tinggi',
    },
    correctOption: 'B',
    scientificExplanation:
      'Substitusi Hb 10,2 g/dL dan Hct 34% ke dalam rumus MCHC menghasilkan 30 g/dL. Karena rentang rujukan MCHC adalah 32–36 g/dL, maka nilai 30 g/dL diinterpretasikan rendah (hipokromik).',
    optionRationales: {
      A: 'Tidak tepat: 25 g/dL bukan hasil pembagian 1020 oleh 34.',
      B: 'Tepat: MCHC = (10,2 × 100) / 34 = 1020 / 34 = 30 g/dL (rendah / di bawah 32–36 g/dL).',
      C: 'Tidak tepat: 34 adalah angka Hematokrit (34%), bukan MCHC.',
      D: 'Tidak tepat: 38 g/dL tidak sesuai perhitungan dan bernilai tinggi.',
    },
    calculationSteps: 'Rumus: MCHC = (Hb × 100) / Hct = (10,2 × 100) / 34 = 1020 / 34 = 30 g/dL (< 32 g/dL → Rendah/Hipokromik).',
    doctorClinicalExplanation:
      'Penurunan MCHC (30 g/dL) menunjukkan kepekatan hemoglobin di dalam eritrosit berkurang sehingga sel tampak lebih pucat pada pewarnaan apusan darah tepi.',
    patientEducation:
      'Edukasi mengenai pentingnya pemenuhan zat besi dan nutrisi pembentuk hemoglobin.',
    managementPlan:
      'Pemeriksaan morfologi darah tepi dan uji status besi serum.',
    pdfPageRef: 'Halaman 23, 39–40',
  },
  {
    questionNumber: 8,
    category: 'clinical_case',
    topic: 'Kasus 8 — MCV pada Pasien dengan RBC Relatif Tinggi',
    questionText:
      'Seorang laki-laki berusia 27 tahun datang untuk evaluasi karena hasil skrining menunjukkan Hb rendah. Ia tidak melaporkan perdarahan aktif. Pemeriksaan fisik menunjukkan pucat ringan. Hasil CBC: Hb 11,5 g/dL, Hct 33%, RBC 4,4 juta/µL. Berapakah MCV dan klasifikasi ukuran eritrositnya?',
    options: {
      A: '65 fL — mikrositik',
      B: '75 fL — mikrositik',
      C: '85 fL — normositik',
      D: '100 fL — normositik',
    },
    correctOption: 'B',
    scientificExplanation:
      'Dengan Hct 33% dan RBC 4,4 juta/µL, nilai MCV adalah 330 / 4,4 = 75 fL. Nilai di bawah 80 fL menunjukkan mikrositosis.',
    optionRationales: {
      A: 'Tidak tepat: 65 fL tidak sesuai dengan hasil pembagian 330 oleh 4,4.',
      B: 'Tepat: 75 fL merupakan hasil perhitungan (33 × 10) / 4,4 dan berada di bawah 80 fL (mikrositik).',
      C: 'Tidak tepat: 85 fL termasuk normositik dan bukan hasil perhitungan pasien.',
      D: 'Tidak tepat: 100 fL bukan hasil perhitungan pasien.',
    },
    calculationSteps: 'Rumus: MCV = (33 × 10) / 4,4 = 330 / 4,4 = 75 fL (< 80 fL → Mikrositik).',
    doctorClinicalExplanation:
      'Anemia ringan pada pria dewasa (Hb 11,5 g/dL < 13,0 g/dL) dengan mikrositosis (75 fL) tanpa riwayat perdarahan memerlukan evaluasi banding antara defisiensi besi dan karier thalassemia minor.',
    patientEducation:
      'Menjelaskan bahwa ukuran sel darah merah yang kecil dapat disebabkan oleh faktor nutrisi (zat besi) maupun pembawa sifat genetik hemoglobin (thalassemia trait).',
    managementPlan:
      'Pemeriksaan ferritin serum terlebih dahulu; bila status besi normal, dilanjutkan analisis Hb (HPLC/elektroforesis Hb).',
    pdfPageRef: 'Halaman 23, 38, dan 40',
  },
  {
    questionNumber: 9,
    category: 'clinical_case',
    topic: 'Kasus 9 — Perhitungan MCH pada Hasil CBC Normal-Bawah',
    questionText:
      'Seorang perempuan berusia 34 tahun mengeluhkan kelelahan. Dokter meminta CBC dan menjelaskan bahwa indeks eritrosit membantu menggambarkan karakteristik sel darah merah. Hasil: Hb 12,6 g/dL, Hct 37,8%, RBC 4,2 juta/µL. Berapakah MCH pasien?',
    options: {
      A: '24 pg',
      B: '27 pg',
      C: '30 pg',
      D: '33 pg',
    },
    correctOption: 'C',
    scientificExplanation:
      'MCH dihitung dari (Hb × 10) / RBC = (12,6 × 10) / 4,2 = 126 / 4,2 = 30 pg. Nilai ini berada dalam rentang normal (27–33 pg).',
    optionRationales: {
      A: 'Tidak tepat: 24 pg tidak sesuai dengan pembagian 126 oleh 4,2.',
      B: 'Tidak tepat: 27 pg bukan hasil perhitungan dari data pasien.',
      C: 'Tepat: 30 pg adalah hasil pembagian 126 oleh 4,2 yang tepat.',
      D: 'Tidak tepat: 33 pg tidak sesuai dengan data pasien.',
    },
    calculationSteps: 'Rumus: MCH = (12,6 × 10) / 4,2 = 126 / 4,2 = 30 pg (Normal: 27–33 pg).',
    doctorClinicalExplanation:
      'Kadar Hb (12,6 g/dL), Hct (37,8%), MCV (90 fL), dan MCH (30 pg) pasien seluruhnya berada dalam batas normal untuk perempuan tidak hamil, sehingga keluhan kelelahan perlu dicari penyebab non-anemianya.',
    patientEducation:
      'Menyampaikan kabar baik bahwa profil sel darah merah normal, serta menyarankan evaluasi pola tidur, hidrasi, aktivitas fisik, atau fungsi tiroid/metabolik.',
    managementPlan:
      'Evaluasi klinis umum tanpa perlu suplementasi besi agresif.',
    pdfPageRef: 'Halaman 23, 39–40',
  },
  {
    questionNumber: 10,
    category: 'clinical_case',
    topic: 'Kasus 10 — Perhitungan MCHC dengan Pembulatan Desimal',
    questionText:
      'Seorang pasien perempuan berusia 30 tahun menjalani pemeriksaan darah lengkap. Hasil laboratorium: Hb 12,0 g/dL, Hct 36%, RBC 4,0 juta/µL. Dokter meminta mahasiswa menghitung MCHC dan menjelaskan parameter yang diwakilinya. Hasil MCHC yang benar adalah:',
    options: {
      A: '30 g/dL',
      B: '32 g/dL',
      C: '33,3 g/dL',
      D: '36 g/dL',
    },
    correctOption: 'C',
    scientificExplanation:
      'MCHC = (12,0 × 100) / 36 = 1200 / 36 = 33,33 g/dL, dibulatkan satu angka di belakang koma menjadi 33,3 g/dL (normokromik).',
    optionRationales: {
      A: 'Tidak tepat: 30 g/dL adalah nilai MCH (30 pg) jika salah menggunakan rumus, bukan MCHC.',
      B: 'Tidak tepat: 32 g/dL bukan hasil pembagian 1200 oleh 36.',
      C: 'Tepat: 33,3 g/dL merupakan hasil pembagian 1200 / 36 yang dibulatkan satu desimal.',
      D: 'Tidak tepat: 36 adalah angka Hematokrit (36%), bukan MCHC.',
    },
    calculationSteps: 'Rumus: MCHC = (12,0 × 100) / 36 = 1200 / 36 = 33,3 g/dL (Normal: 32–36 g/dL).',
    doctorClinicalExplanation:
      'Konsentrasi hemoglobin rata-rata di dalam volume eritrosit pasien normal (normokromik, 33,3 g/dL).',
    patientEducation:
      'Menjelaskan bahwa warna dan kepekatan hemoglobin di dalam sel darah merah pasien berada pada kisaran sehat.',
    managementPlan:
      'Pemeliharaan gaya hidup sehat dan gizi seimbang.',
    pdfPageRef: 'Halaman 23, 39–40',
  },
  {
    questionNumber: 11,
    category: 'clinical_case',
    topic: 'Kasus 11 — Anemia dengan Indeks Normositik Normokromik',
    questionText:
      'Seorang laki-laki berusia 45 tahun mengeluhkan lelah. Dokter melakukan anamnesis dan pemeriksaan fisik, kemudian meminta CBC. Hasil: Hb 9,0 g/dL, Hct 27%, RBC 3,0 juta/µL. Mahasiswa diminta menghitung MCV, MCH, dan MCHC. Kombinasi interpretasi yang paling tepat adalah:',
    options: {
      A: 'MCV 90 fL, MCH 30 pg, MCHC 33,3 g/dL — normositik normokromik',
      B: 'MCV 70 fL, MCH 20 pg, MCHC 25 g/dL — mikrositik hipokromik',
      C: 'MCV 110 fL, MCH 35 pg, MCHC 40 g/dL — makrositik hiperkromik',
      D: 'MCV 80 fL, MCH 27 pg, MCHC 36 g/dL — seluruhnya rendah',
    },
    correctOption: 'A',
    scientificExplanation:
      'Ketika Hb, Hct, dan RBC menurun secara proporsional, ketiga indeks eritrosit tetap berada di rentang normal: MCV = 270/3 = 90 fL (normositik), MCH = 90/3 = 30 pg (normal), dan MCHC = 900/27 = 33,3 g/dL (normokromik).',
    optionRationales: {
      A: 'Tepat: Ketiga nilai sesuai perhitungan matematis dan diklasifikasikan sebagai normositik normokromik.',
      B: 'Tidak tepat: Angka tidak sesuai perhitungan data pasien.',
      C: 'Tidak tepat: Angka tidak sesuai perhitungan dan MCHC 40 g/dL tidak akurat.',
      D: 'Tidak tepat: Hasil hitung yang benar adalah MCV 90 fL, MCH 30 pg, MCHC 33,3 g/dL.',
    },
    calculationSteps:
      'MCV = (27 × 10)/3,0 = 90 fL | MCH = (9,0 × 10)/3,0 = 30 pg | MCHC = (9,0 × 100)/27 = 33,3 g/dL.',
    doctorClinicalExplanation:
      'Anemia normositik normokromik (Hb 9,0 g/dL) pada laki-laki dewasa memerlukan evaluasi fungsi ginjal (ureum/kreatinin untuk menilai kemungkinan defisiensi EPO pada CKD), penyakit inflamasi kronis, atau perdarahan akut.',
    patientEducation:
      'Menjelaskan bahwa ukuran dan kepekatan tiap sel darah merah normal, namun jumlah total sel yang diproduksi atau beredar di tubuh berkurang.',
    managementPlan:
      'Pemeriksaan hitung Retikulosit, fungsi ginjal (eGFR), dan evaluasi penyakit kronis.',
    pdfPageRef: 'Halaman 23, 38–41',
  },
  {
    questionNumber: 12,
    category: 'clinical_case',
    topic: 'Kasus 12 — Ambang Hemoglobin WHO 2024 pada Pria Dewasa',
    questionText:
      'Seorang laki-laki berusia 32 tahun datang untuk pemeriksaan kesehatan. Ia mengeluhkan mudah lelah tetapi tidak mengalami perdarahan yang diketahui. Pemeriksaan fisik menunjukkan keadaan umum stabil. Hasil Hb 12,7 g/dL. Materi mencantumkan ambang WHO 2024 untuk anemia pada pria dewasa sebesar Hb <13,0 g/dL. Interpretasi paling tepat adalah:',
    options: {
      A: 'Tidak memenuhi ambang anemia karena Hb lebih dari 12,0 g/dL',
      B: 'Memenuhi ambang anemia berdasarkan Hb; penyebab belum dapat ditentukan dari Hb saja',
      C: 'Pasti mengalami anemia defisiensi besi',
      D: 'Pasti mengalami leukemia',
    },
    correctOption: 'B',
    scientificExplanation:
      'Menurut pedoman WHO 2024 pada materi PDF, batas (cutoff) anemia untuk pria dewasa (≥15 tahun) adalah Hb < 13,0 g/dL. Kadar Hb 12,7 g/dL sudah memenuhi kriteria anemia ringan secara laboratorium, namun satu parameter Hb saja tidak dapat memastikan etiologi/penyebabnya.',
    optionRationales: {
      A: 'Tidak tepat: Ambang 12,0 g/dL adalah batas untuk perempuan tidak hamil, bukan pria dewasa.',
      B: 'Tepat: Hb 12,7 g/dL berada di bawah ambang 13,0 g/dL untuk pria dewasa, dan penentuan penyebab memerlukan indeks eritrosit serta pemeriksaan penunjang.',
      C: 'Tidak tepat: Defisiensi besi tidak boleh ditegakkan hanya dari nilai Hb tanpa MCV dan ferritin.',
      D: 'Tidak tepat: Hb rendah semata tidak cukup untuk mendiagnosis leukemia.',
    },
    doctorClinicalExplanation:
      'Dokter menjelaskan bahwa pada pria dewasa karena pengaruh hormon testosteron yang menstimulasi eritropoietin, batas normal Hb lebih tinggi (≥13,0 g/dL) dibanding wanita.',
    patientEducation:
      'Menjelaskan bahwa penurunan Hb sedikit di bawah 13,0 g/dL adalah sinyal awal yang perlu dievaluasi pola makan dan indeks sel darah merahnya.',
    managementPlan:
      'Melengkapi pemeriksaan CBC lengkap (MCV, MCH, MCHC, RDW) dan evaluasi nutrisi.',
    pdfPageRef: 'Halaman 41',
  },
  {
    questionNumber: 13,
    category: 'clinical_case',
    topic: 'Kasus 13 — Ambang Hemoglobin WHO 2024 pada Perempuan Tidak Hamil',
    questionText:
      'Seorang perempuan berusia 28 tahun yang tidak sedang hamil datang dengan keluhan lemah. Dokter menanyakan riwayat menstruasi, pola makan, dan penyakit terdahulu. Pemeriksaan fisik menemukan konjungtiva agak pucat. Hb pasien 11,7 g/dL. Berdasarkan ambang WHO 2024 yang dicantumkan dalam materi untuk perempuan tidak hamil, kesimpulan paling tepat adalah:',
    options: {
      A: 'Tidak memenuhi ambang anemia karena Hb masih di atas 10,0 g/dL',
      B: 'Memenuhi ambang anemia berdasarkan Hb <12,0 g/dL; etiologi perlu dievaluasi',
      C: 'Pasti mengalami anemia makrositik',
      D: 'Pasti mengalami gangguan koagulasi',
    },
    correctOption: 'B',
    scientificExplanation:
      'Ambang WHO 2024 untuk perempuan dewasa tidak hamil adalah Hb < 12,0 g/dL. Nilai Hb 11,7 g/dL berada di bawah ambang tersebut sehingga dikategorikan anemia, namun klasifikasi morfologi dan etiologi membutuhkan data MCV, MCH, MCHC, serta status besi.',
    optionRationales: {
      A: 'Tidak tepat: Ambang untuk perempuan tidak hamil adalah 12,0 g/dL, bukan 10,0 g/dL.',
      B: 'Tepat: Sesuai ambang Hb < 12,0 g/dL pada materi dan secara ilmiah tidak melampaui bukti.',
      C: 'Tidak tepat: Klasifikasi makrositik memerlukan perhitungan MCV (>100 fL).',
      D: 'Tidak tepat: Kadar Hb tidak mengukur fungsi faktor koagulasi darah.',
    },
    doctorClinicalExplanation:
      'Pasien mengalami anemia ringan (Hb 11,7 g/dL) yang memerlukan penelusuran indeks eritrosit dan riwayat siklus menstruasi.',
    patientEducation:
      'Edukasi mengenai kebutuhan zat besi harian pada perempuan usia subur untuk menggantikan kehilangan darah saat menstruasi.',
    managementPlan:
      'Pemeriksaan indeks eritrosit dan ferritin serum.',
    pdfPageRef: 'Halaman 41',
  },
  {
    questionNumber: 14,
    category: 'clinical_case',
    topic: 'Kasus 14 — Ambang Anemia pada Kehamilan Trimester II (WHO 2024)',
    questionText:
      'Seorang perempuan hamil trimester II berusia 26 tahun datang untuk pemeriksaan antenatal. Ia mengeluhkan mudah lelah. Dokter melakukan anamnesis dan pemeriksaan fisik, lalu meminta CBC. Hb pasien 10,3 g/dL. Materi mencantumkan ambang anemia trimester II sebesar Hb <10,5 g/dL. Interpretasi yang tepat adalah:',
    options: {
      A: 'Tidak anemia karena Hb di atas 10,0 g/dL',
      B: 'Memenuhi ambang anemia trimester II berdasarkan Hb; perlu evaluasi penyebab',
      C: 'Pasti mengalami anemia defisiensi besi',
      D: 'Pasti mengalami anemia makrositik',
    },
    correctOption: 'B',
    scientificExplanation:
      'Pada kehamilan trimester II terjadi hemodilusi fisiologis (peningkatan volume plasma lebih besar dibanding peningkatan massa eritrosit), sehingga ambang anemia WHO 2024 disesuaikan menjadi Hb < 10,5 g/dL (sedangkan trimester I dan III < 11,0 g/dL). Nilai Hb 10,3 g/dL berada di bawah 10,5 g/dL.',
    optionRationales: {
      A: 'Tidak tepat: Ambang trimester II adalah 10,5 g/dL, bukan 10,0 g/dL.',
      B: 'Tepat: Hb 10,3 g/dL memenuhi kriteria anemia kehamilan trimester II (<10,5 g/dL) dan memerlukan evaluasi penyebab.',
      C: 'Tidak tepat: Meskipun defisiensi besi dan folat sering terjadi pada kehamilan, Hb saja belum memastikan etiologi.',
      D: 'Tidak tepat: MCV diperlukan untuk menentukan ada tidaknya makrositosis.',
    },
    doctorClinicalExplanation:
      'Dokter menjelaskan bahwa bahkan dengan memperhitungkan pengenceran darah fisiologis trimester II, Hb 10,3 g/dL tetap tergolong anemia yang harus ditangani agar pertumbuhan janin optimal.',
    patientEducation:
      'Edukasi kepatuhan konsumsi tablet tambah darah (zat besi dan asam folat) selama masa kehamilan serta nutrisi tinggi protein.',
    managementPlan:
      'Evaluasi indeks eritrosit, pemberian suplementasi besi-folat antenatal sesuai pedoman dokter kebidanan, dan pemantauan Hb berkala.',
    pdfPageRef: 'Halaman 41',
  },
  {
    questionNumber: 15,
    category: 'clinical_case',
    topic: 'Kasus 15 — Trombositopenia dan Gangguan Hemostasis Primer',
    questionText:
      'Seorang pasien berusia 22 tahun datang dengan keluhan petekie pada tungkai dan gusi mudah berdarah. Dokter melakukan anamnesis mengenai perdarahan, obat, dan riwayat penyakit. Pemeriksaan fisik menemukan petekie dan perdarahan gusi. Hasil CBC: trombosit 48.000/µL, Hb 12,5 g/dL, leukosit 7.500/µL. Komponen yang paling langsung terganggu dalam pembentukan sumbat awal hemostasis adalah:',
    options: {
      A: 'Albumin',
      B: 'Eritrosit',
      C: 'Trombosit',
      D: 'Limfosit B',
    },
    correctOption: 'C',
    scientificExplanation:
      'Trombosit (normal 150.000–400.000/µL atau 150.000–450.000/µL) berperan langsung dalam hemostasis primer melalui proses adhesi pada kolagen endotel yang rusak, reaksi pelepasan granula (ADP, tromboksan A2, serotonin), dan agregasi membentuk sumbat trombosit (platelet plug).',
    optionRationales: {
      A: 'Tidak tepat: Albumin mempertahankan tekanan osmotik koloid plasma, bukan pembentuk sumbat trombosit.',
      B: 'Tidak tepat: Eritrosit berfungsi mengangkut oksigen dan karbon dioksida.',
      C: 'Tepat: Trombosit (48.000/µL, trombositopenia) adalah komponen utama pembentuk sumbat hemostasis primer.',
      D: 'Tidak tepat: Limfosit B berperan dalam produksi antibodi (imunitas humoral).',
    },
    doctorClinicalExplanation:
      'Penurunan trombosit hingga 48.000/µL menyebabkan kapiler kecil kehilangan perlindungan sumbat trombosit sehingga muncul bintik perdarahan bawah kulit (petekie) dan perdarahan mukosa gusi.',
    patientEducation:
      'Edukasi pasien untuk menggunakan sikat gigi berbulu lembut, menghindari aktivitas berisiko benturan/trauma, dan tidak mengonsumsi obat pereda nyeri golongan NSAID/aspirin tanpa instruksi dokter.',
    managementPlan:
      'Konfirmasi jumlah trombosit pada Sediaan Apus Darah Tepi (menyingkirkan pseudotrombositopenia akibat clumping EDTA) dan mencari penyebab trombositopenia (infeksi virus seperti dengue atau ITP).',
    pdfPageRef: 'Halaman 26, 29–35',
  },
  {
    questionNumber: 16,
    category: 'clinical_case',
    topic: 'Kasus 16 — Leukositosis dengan Dominasi Neutrofil (Neutrofilia)',
    questionText:
      'Seorang pasien berusia 30 tahun datang dengan demam dan luka yang tampak meradang. Dokter menanyakan onset demam dan riwayat luka. Pemeriksaan fisik menemukan area luka kemerahan. CBC menunjukkan leukosit 15.500/µL dan neutrofil 82%. Dokter menjelaskan bahwa neutrofil merupakan bagian penting dari pertahanan awal terhadap bakteri. Fungsi sel yang paling sesuai adalah:',
    options: {
      A: 'Menghasilkan antibodi spesifik sebagai sel plasma',
      B: 'Melakukan fagositosis terhadap bakteri dan sisa sel',
      C: 'Menghasilkan histamin sebagai mediator alergi utama',
      D: 'Mengubah fibrinogen menjadi fibrin',
    },
    correctOption: 'B',
    scientificExplanation:
      'Neutrofil (normal 60–70% dari total leukosit) merupakan granulosit lini pertama yang bermigrasi cepat ke area infeksi (kemotaksis & diapedesis) untuk melakukan fagositosis aktif terhadap bakteri piogenik dan melepaskan enzim lisozim serta defensin.',
    optionRationales: {
      A: 'Tidak tepat: Produksi antibodi spesifik oleh sel plasma merupakan fungsi diferensiasi Limfosit B.',
      B: 'Tepat: Fagositosis bakteri dan sisa sel mati merupakan fungsi utama neutrofil.',
      C: 'Tidak tepat: Pelepasan histamin sebagai mediator alergi merupakan fungsi Basofil dan sel mast.',
      D: 'Tidak tepat: Pengubahan fibrinogen menjadi fibrin dilakukan oleh enzim Trombin pada kaskade koagulasi.',
    },
    doctorClinicalExplanation:
      'Leukositosis (15.500/µL; normal 5.000–10.000/µL) disertai neutrofilia (82%) menunjukkan respons imun bawaan yang aktif terhadap infeksi bakteri akut pada jaringan luka.',
    patientEducation:
      'Edukasi perawatan kebersihan luka secara aseptik dan kepatuhan terapi yang diresepkan dokter.',
    managementPlan:
      'Perawatan luka (wound care), evaluasi apusan darah untuk melihat adanya neutrofil batang (shift to the left) atau granula toksik, serta terapi antimikroba sesuai indikasi klinis dokter.',
    pdfPageRef: 'Halaman 21–24, 27',
  },
  {
    questionNumber: 17,
    category: 'clinical_case',
    topic: 'Kasus 17 — Eosinofilia pada Pasien dengan Riwayat Alergi',
    questionText:
      'Seorang perempuan berusia 25 tahun mengeluhkan gatal berulang dan memiliki riwayat reaksi alergi. Dokter melakukan anamnesis paparan alergen dan pemeriksaan fisik kulit. Hasil hitung jenis leukosit menunjukkan eosinofil 9%. Total leukosit 9.000/µL. Sel yang mengalami peningkatan dan paling berkaitan dengan parasit serta reaksi alergi adalah:',
    options: {
      A: 'Neutrofil',
      B: 'Basofil',
      C: 'Eosinofil',
      D: 'Monosit',
    },
    correctOption: 'C',
    scientificExplanation:
      'Eosinofil (normal 2–4% dari total leukosit) memiliki granula merah-oranye besar yang mengandung histaminase (meredam mediator inflamasi alergi) dan protein sitotoksik terhadap parasit cacing (helmintiasis). Persentase 9% menunjukkan eosinofilia.',
    optionRationales: {
      A: 'Tidak tepat: Neutrofil berperan utama dalam fagositosis bakteri akut.',
      B: 'Tidak tepat: Basofil melepaskan histamin dan heparin, sedangkan sel yang meningkat 9% pada kasus ini adalah eosinofil.',
      C: 'Tepat: Eosinofil berkaitan erat dengan reaksi hipersensitivitas/alergi dan infeksi parasit.',
      D: 'Tidak tepat: Monosit berdiferensiasi menjadi makrofag untuk fagositosis kronis.',
    },
    doctorClinicalExplanation:
      'Peningkatan eosinofil (9%) mendukung adanya proses alergi aktif (seperti dermatitis atopik/urtikaria) atau kemungkinan investasi parasit yang perlu dikonfirmasi secara klinis.',
    patientEducation:
      'Edukasi untuk mengidentifikasi dan menghindari pemicu alergen (debu, makanan tertentu, bulu hewan) serta menjaga higienitas.',
    managementPlan:
      'Tata laksana simtomatik alergi oleh dokter dan pemeriksaan feses rutin bila dicurigai infeksi kecacingan.',
    pdfPageRef: 'Halaman 19, 24, dan 27',
  },
  {
    questionNumber: 18,
    category: 'clinical_case',
    topic: 'Kasus 18 — Identifikasi Morfologi dan Fungsi Basofil',
    questionText:
      'Pasien dengan riwayat reaksi alergi menjalani pemeriksaan darah lengkap. Hasil hitung jenis menunjukkan basofil 2%. Pada diskusi kasus, dokter meminta mahasiswa menghubungkan morfologi dan fungsi basofil. Pernyataan yang paling tepat adalah:',
    options: {
      A: 'Basofil memiliki granula besar berwarna biru dan berkaitan dengan pelepasan histamin',
      B: 'Basofil merupakan fragmen megakariosit tanpa inti',
      C: 'Basofil merupakan sel bikonkaf yang mengandung hemoglobin',
      D: 'Basofil berdiferensiasi menjadi eritrosit matur',
    },
    correctOption: 'A',
    scientificExplanation:
      'Basofil adalah granulosit paling langka (0,5–1% dari total leukosit) yang dicirikan oleh granula sitoplasma bulat besar berwarna biru-ungu tua (basofilik) yang sering menutupi inti, serta berfungsi melepaskan histamin, heparin, dan serotonin pada reaksi alergi/inflamasi.',
    optionRationales: {
      A: 'Tepat: Sesuai ciri morfologi granula biru-ungu basofil dan fungsi pelepasan histamin.',
      B: 'Tidak tepat: Fragmen sitoplasma megakariosit tanpa inti adalah Trombosit.',
      C: 'Tidak tepat: Sel cakram bikonkaf pengandung hemoglobin adalah Eritrosit.',
      D: 'Tidak tepat: Basofil berasal dari jalur mieloid granulositik dan tidak berubah menjadi eritrosit.',
    },
    doctorClinicalExplanation:
      'Basofil 2% sedikit meningkat di atas rentang normal (0,5–1%) dan berkorelasi dengan keterlibatan reseptor IgE serta degranulasi histamin pada reaksi alergi pasien.',
    patientEducation:
      'Menjelaskan peran sel basofil dan histamin dalam memicu gejala gatal serta kemerahan saat tubuh terpapar alergen.',
    managementPlan:
      'Korelasi klinis dengan manifestasi alergi dan pemantauan hitung jenis leukosit.',
    pdfPageRef: 'Halaman 18, 24, dan 27',
  },
  {
    questionNumber: 19,
    category: 'clinical_case',
    topic: 'Kasus 19 — Pemeriksaan Retikulosit dan Respons Sumsum Tulang',
    questionText:
      'Seorang pasien dengan Hb rendah menjalani pemeriksaan lanjutan. Dokter menjelaskan bahwa jumlah retikulosit dapat membantu menilai respons produksi eritrosit oleh sumsum tulang. Mahasiswa diminta menjelaskan tujuan pemeriksaan retikulosit dalam konteks anemia. Pernyataan yang paling tepat adalah:',
    options: {
      A: 'Menilai variasi ukuran eritrosit secara langsung',
      B: 'Menilai respons produksi eritrosit oleh sumsum tulang',
      C: 'Mengukur konsentrasi fibrinogen plasma',
      D: 'Menentukan antigen ABO pada permukaan eritrosit',
    },
    correctOption: 'B',
    scientificExplanation:
      'Retikulosit adalah eritrosit muda yang baru dilepaskan sumsum tulang ke darah tepi (masih menyisakan RNA ribosom selama 1–2 hari). Hitung retikulosit (normal 0,5–1,5% atau 0,5–2,5%) mencerminkan secara langsung kecepatan dan efektivitas regenerasi eritropoiesis di sumsum tulang merah.',
    optionRationales: {
      A: 'Tidak tepat: Variasi ukuran eritrosit (anisositosis) diukur menggunakan parameter RDW (Red Cell Distribution Width).',
      B: 'Tepat: Retikulosit merupakan indikator langsung respons produksi eritrosit oleh sumsum tulang terhadap kondisi anemia/hipoksia.',
      C: 'Tidak tepat: Konsentrasi fibrinogen diukur pada pemeriksaan koagulasi plasma.',
      D: 'Tidak tepat: Antigen ABO ditentukan melalui pemeriksaan imunohematologi golongan darah.',
    },
    doctorClinicalExplanation:
      'Jika pasien anemia memiliki retikulosit tinggi (retikulositosis), berarti sumsum tulang merespons secara aktif (misal pasca-perdarahan akut atau anemia hemolitik). Jika retikulosit rendah, berarti terdapat gangguan produksi di sumsum tulang (misal anemia aplastik atau defisiensi bahan baku besi/B12).',
    patientEducation:
      'Menjelaskan bahwa tes retikulosit ibarat memeriksa "pabrik sel darah merah" di sumsum tulang apakah bekerja aktif mencetak sel baru atau sedang melambat.',
    managementPlan:
      'Menggunakan nilai retikulosit untuk memandu algoritma diagnostik anemia hipoproliferatif vs hiperproliferatif.',
    pdfPageRef: 'Halaman 17 dan 38',
  },
  {
    questionNumber: 20,
    category: 'clinical_case',
    topic: 'Kasus 20 — Interpretasi Golongan Darah ABO dan Rhesus',
    questionText:
      'Seorang pasien akan menjalani pemeriksaan golongan darah sebelum tindakan medis. Pada uji forward grouping, reaksi dengan anti-A positif dan anti-B negatif. Pemeriksaan antigen D menunjukkan hasil negatif. Dokter menjelaskan bahwa golongan ABO ditentukan oleh antigen pada permukaan eritrosit dan Rh negatif berarti antigen D tidak terdeteksi. Interpretasi yang tepat adalah:',
    options: {
      A: 'A Rh positif',
      B: 'B Rh negatif',
      C: 'AB Rh negatif',
      D: 'A Rh negatif',
    },
    correctOption: 'D',
    scientificExplanation:
      'Aglutinasi positif pada reagen antisera Anti-A menunjukkan adanya Antigen A pada membran eritrosit, sedangkan negatif pada Anti-B menunjukkan tidak adanya Antigen B (Golongan A). Hasil negatif pada antisera Anti-D menunjukkan tidak terdeteksinya antigen D Rhesus (Rh negatif).',
    optionRationales: {
      A: 'Tidak tepat: Golongan A benar, tetapi hasil antigen D negatif berarti Rh negatif, bukan Rh positif.',
      B: 'Tidak tepat: Reaksi Anti-B negatif dan Anti-A positif menunjukkan golongan A, bukan B.',
      C: 'Tidak tepat: Golongan AB hanya terjadi jika reaksi Anti-A dan Anti-B keduanya positif.',
      D: 'Tepat: Reaksi Anti-A (+), Anti-B (-), dan Anti-D (-) menetapkan golongan darah A Rh negatif.',
    },
    doctorClinicalExplanation:
      'Pasien bergolongan darah A Rh negatif memiliki Antigen A di eritrosit dan antibodi Anti-B di plasma, serta tidak memiliki antigen Rh (D). Status Rh negatif sangat penting diperhatikan dalam penyediaan komponen darah dan kehamilan.',
    patientEducation:
      'Memberikan kartu identitas golongan darah kepada pasien dan menjelaskan bahwa golongan darah Rh negatif cukup jarang di populasi Indonesia sehingga perlu dicatat dalam rekam medis.',
    managementPlan:
      'Melakukan konfirmasi reverse/serum grouping dan uji silang serasi (crossmatch) di Bank Darah bila diperlukan transfusi.',
    pdfPageRef: 'Halaman 35–36, 42–45',
  },
  {
    questionNumber: 21,
    category: 'theory',
    topic: 'Teori 1 — Hierarki Diferensiasi Jalur Hematopoiesis',
    questionText:
      'Diagram hematopoiesis dalam materi membagi diferensiasi sel punca hematopoietik menjadi jalur mieloid dan limfoid. Kombinasi produk diferensiasi yang paling tepat adalah:',
    options: {
      A: 'Mieloid: eritrosit, neutrofil/monosit, trombosit; limfoid: limfosit B, limfosit T, dan sel NK',
      B: 'Mieloid: limfosit B dan T; limfoid: eritrosit dan trombosit',
      C: 'Mieloid: hanya eritrosit; limfoid: neutrofil, eosinofil, dan basofil',
      D: 'Mieloid: trombosit dan limfosit T; limfoid: eritrosit dan monosit',
    },
    correctOption: 'A',
    scientificExplanation:
      'Pluripotent Hematopoietic Stem Cell di sumsum tulang merah bercabang menjadi dua garis keturunan: (1) Myeloid Stem Cell yang menghasilkan eritrosit, megakariosit (trombosit), granulosit (neutrofil, eosinofil, basofil), dan monosit; serta (2) Lymphoid Stem Cell yang menghasilkan limfosit B, limfosit T, dan sel Natural Killer (NK).',
    optionRationales: {
      A: 'Tepat: Seluruh produk seluler jalur mieloid dan limfoid sesuai dengan diagram hematopoiesis.',
      B: 'Tidak tepat: Membalik produk jalur mieloid dan limfoid.',
      C: 'Tidak tepat: Neutrofil, eosinofil, dan basofil berasal dari jalur mieloid, bukan limfoid.',
      D: 'Tidak tepat: Limfosit T berasal dari jalur limfoid, sedangkan eritrosit dan monosit berasal dari jalur mieloid.',
    },
    doctorClinicalExplanation:
      'Pemahaman garis keturunan mieloid vs limfoid sangat esensial dalam klasifikasi keganasan hematologi (Leukemia Mieloid vs Leukemia Limfoid).',
    patientEducation:
      'Menjelaskan bagaimana satu jenis sel induk di sumsum tulang mampu melahirkan seluruh variasi sel darah manusia.',
    managementPlan:
      'Aplikasi pengetahuan dasar dalam pembacaan aspirasi sumsum tulang dan sitometri aliran.',
    pdfPageRef: 'Halaman 11–14',
  },
  {
    questionNumber: 22,
    category: 'theory',
    topic: 'Teori 2 — Urutan Tahapan Pematangan Eritropoiesis',
    questionText:
      'Materi menggambarkan eritropoiesis sebagai proses dari sel punca menuju eritrosit matur. Urutan yang paling sesuai dengan diagram dan uraian materi adalah:',
    options: {
      A: 'Sel punca hematopoietik → CFU-E/committed progenitor → proeritroblas → tahap eritroblas → retikulosit → eritrosit matur',
      B: 'Megakariosit → mieloblas → monosit → retikulosit → eritrosit',
      C: 'Limfoblas → proeritroblas → trombosit → eritrosit matur',
      D: 'Eritrosit matur → retikulosit → proeritroblas → sel punca',
    },
    correctOption: 'A',
    scientificExplanation:
      'Eritropoiesis berawal dari sel punca hematopoietik -> progenitor eritroid berkomitmen (CFU-E) -> proeritroblas -> tahapan eritroblas (sintesis hemoglobin dan pengeluaran inti sel/ekstrusi nukleus) -> retikulosit -> eritrosit matang di sirkulasi darah.',
    optionRationales: {
      A: 'Tepat: Urutan diferensiasi eritroid dari sel punca hingga eritrosit matur sepenuhnya akurat.',
      B: 'Tidak tepat: Mencampurkan jalur megakariosit (trombosit) dan monosit.',
      C: 'Tidak tepat: Limfoblas dan trombosit tidak berada dalam jalur eritropoiesis.',
      D: 'Tidak tepat: Urutan terbalik dari sel matang ke sel punca.',
    },
    doctorClinicalExplanation:
      'Hormon Eritropoietin (EPO) dari ginjal bekerja mempercepat proliferasi dan pematangan CFU-E serta proeritroblas menjadi retikulosit.',
    patientEducation:
      'Menjelaskan bahwa pembentukan sel darah merah membutuhkan waktu beberapa hari di sumsum tulang sebelum siap mengedarkan oksigen.',
    managementPlan:
      'Evaluasi pematangan eritroid pada kondisi anemia hipoproliferatif.',
    pdfPageRef: 'Halaman 11–12, 17',
  },
  {
    questionNumber: 23,
    category: 'theory',
    topic: 'Teori 3 — Karakteristik Struktural & Fisiologis Eritrosit Matang',
    questionText:
      'Eritrosit matang mempunyai karakteristik yang memungkinkan pengangkutan oksigen dan deformabilitas ketika melewati mikrosirkulasi. Pernyataan yang paling tepat berdasarkan materi adalah:',
    options: {
      A: 'Berinti, memiliki mitokondria, dan melakukan sintesis protein secara aktif',
      B: 'Bikonkaf, elastis, tidak berinti, tidak memiliki mitokondria dan ribosom, serta berumur sekitar 120 hari',
      C: 'Bergranula, berinti bersegmen, dan melakukan fagositosis',
      D: 'Merupakan fragmen sel besar yang tidak mengandung hemoglobin',
    },
    correctOption: 'B',
    scientificExplanation:
      'Eritrosit matang berbentuk cakram bikonkaf (memperluas rasio luas permukaan terhadap volume untuk difusi gas dan memberikan fleksibilitas melewati kapiler sempit), tidak berinti, tidak memiliki mitokondria (menghasilkan ATP secara anaerob sehingga tidak mengonsumsi O2 yang diangkutnya), dan hidup ±120 hari.',
    optionRationales: {
      A: 'Tidak tepat: Eritrosit matang telah kehilangan inti, mitokondria, dan ribosomnya.',
      B: 'Tepat: Mencakup seluruh ciri anatomi dan fisiologi eritrosit matang secara akurat.',
      C: 'Tidak tepat: Merupakan ciri granulosit neutrofil, bukan eritrosit.',
      D: 'Tidak tepat: Fragmen sel tanpa hemoglobin adalah trombosit.',
    },
    doctorClinicalExplanation:
      'Karena tidak memiliki inti dan organel untuk memperbaiki membran selnya, membran eritrosit menjadi rapuh setelah 120 hari dan difagositosis oleh makrofag di limpa dan hati.',
    patientEducation:
      'Menjelaskan mengapa tubuh terus-menerus membutuhkan zat gizi setiap hari karena sel darah merah diperbarui setiap 4 bulan (120 hari).',
    managementPlan:
      'Pemahaman dasar fisiologi umur eritrosit dalam pemeriksaan HbA1c dan anemia hemolitik.',
    pdfPageRef: 'Halaman 13–16',
  },
  {
    questionNumber: 24,
    category: 'theory',
    topic: 'Teori 4 — Struktur Molekuler Hemoglobin (Heme & Globin)',
    questionText:
      'Hemoglobin merupakan komponen utama eritrosit untuk mengikat oksigen. Materi menjelaskan bahwa hemoglobin tersusun atas bagian heme dan globin. Pernyataan yang paling tepat adalah:',
    options: {
      A: 'Heme merupakan bagian protein, sedangkan globin merupakan cincin porfirin tanpa besi',
      B: 'Heme mengandung protoporfirin dan besi, sedangkan globin merupakan bagian protein dengan dua rantai alfa dan dua rantai beta',
      C: 'Heme tersusun atas albumin dan fibrinogen, sedangkan globin merupakan enzim G6PD',
      D: 'Heme dan globin merupakan dua jenis leukosit',
    },
    correctOption: 'B',
    scientificExplanation:
      'Setiap molekul hemoglobin dewasa (HbA) terdiri atas bagian protein Globin (4 rantai polipeptida: 2 alfa dan 2 beta) serta 4 gugus pigmen non-protein Heme (cincin protoporfirin dengan 1 ion besi Fe2+ di tengahnya yang mampu mengikat 1 molekul O2).',
    optionRationales: {
      A: 'Tidak tepat: Membalik pengertian heme dan globin serta meniadakan ion besi.',
      B: 'Tepat: Heme adalah cincin protoporfirin + besi, sedangkan globin adalah protein 2 rantai alfa dan 2 rantai beta.',
      C: 'Tidak tepat: Albumin dan fibrinogen adalah protein plasma, bukan penyusun hemoglobin.',
      D: 'Tidak tepat: Heme dan globin adalah komponen molekul hemoglobin di dalam eritrosit.',
    },
    doctorClinicalExplanation:
      'Gangguan ketersediaan besi merusak pembentukan Heme (Anemia Defisiensi Besi), sedangkan mutasi genetik sintesis rantai alfa/beta merusak pembentukan Globin (Thalassemia).',
    patientEducation:
      'Menjelaskan mengapa pembentukan hemoglobin membutuhkan zat besi sekaligus asupan protein yang cukup.',
    managementPlan:
      'Dasar biokimiawi pemisahan diagnosis defisiensi besi vs hemoglobinopati.',
    pdfPageRef: 'Halaman 9, 14–15',
  },
  {
    questionNumber: 25,
    category: 'theory',
    topic: 'Teori 5 — Fungsi Spesifik Protein Plasma Darah',
    questionText:
      'Plasma darah mengandung beberapa protein yang mempunyai fungsi berbeda. Kombinasi fungsi yang paling tepat adalah:',
    options: {
      A: 'Albumin: mempertahankan tekanan onkotik; globulin: terkait sistem imun; fibrinogen: berperan dalam pembekuan',
      B: 'Albumin: fagositosis; globulin: mengangkut oksigen; fibrinogen: membentuk leukosit',
      C: 'Albumin: pembentukan trombosit; globulin: mengubah protrombin; fibrinogen: mengikat oksigen',
      D: 'Albumin: pembentukan antibodi; globulin: pembentukan eritrosit; fibrinogen: pengaturan suhu saja',
    },
    correctOption: 'A',
    scientificExplanation:
      'Tiga fraksi utama protein plasma (~7% dari plasma) adalah: Albumin (54%, menjaga tekanan osmotik koloid/onkotik dan transpor molekul), Globulin (38%, mencakup alfa/beta globulin pengangkut dan gamma globulin/imunoglobulin untuk kekebalan tubuh), serta Fibrinogen (7%, prekursor benang fibrin pada koagulasi darah).',
    optionRationales: {
      A: 'Tepat: Memasangkan fungsi albumin, globulin, dan fibrinogen secara akurat.',
      B: 'Tidak tepat: Fagositosis dilakukan leukosit dan oksigen diangkut hemoglobin.',
      C: 'Tidak tepat: Tidak sesuai dengan fungsi fisiologis protein plasma.',
      D: 'Tidak tepat: Antibodi adalah fraksi gamma-globulin, bukan albumin.',
    },
    doctorClinicalExplanation:
      'Kerusakan hati kronis menurunkan sintesis albumin (memicu edema/asites) dan fibrinogen (memicu gangguan pembekuan darah).',
    patientEducation:
      'Menjelaskan peran bagian cair darah (plasma) dalam menjaga keseimbangan cairan tubuh dan kekebalan.',
    managementPlan:
      'Evaluasi fraksi protein serum (Albumin/Globulin ratio) dan fungsi hemostasis pada penyakit hepatobilier.',
    pdfPageRef: 'Halaman 7–9',
  },
  {
    questionNumber: 26,
    category: 'theory',
    topic: 'Teori 6 — Klasifikasi Morfologi Leukosit (Granulosit vs Agranulosit)',
    questionText:
      'Dalam klasifikasi leukosit, granulosit dibedakan dari agranulosit berdasarkan karakteristik granula sitoplasma. Kombinasi klasifikasi yang benar adalah:',
    options: {
      A: 'Granulosit: neutrofil, eosinofil, basofil; agranulosit: limfosit dan monosit',
      B: 'Granulosit: limfosit dan monosit; agranulosit: neutrofil, eosinofil, basofil',
      C: 'Granulosit: eritrosit dan trombosit; agranulosit: limfosit dan basofil',
      D: 'Granulosit: monosit, basofil, dan limfosit; agranulosit: neutrofil dan eosinofil',
    },
    correctOption: 'A',
    scientificExplanation:
      'Berdasarkan ada tidaknya granula spesifik yang mencolok di sitoplasma bawah mikroskop cahaya pasca-pewarnaan Romanowsky, leukosit dibagi menjadi Granulosit (Neutrofil, Eosinofil, Basofil) dan Agranulosit (Limfosit dan Monosit).',
    optionRationales: {
      A: 'Tepat: Mengelompokkan ketiga granulosit dan kedua agranulosit dengan benar.',
      B: 'Tidak tepat: Membalik kelompok granulosit dan agranulosit.',
      C: 'Tidak tepat: Eritrosit dan trombosit bukan merupakan bagian dari leukosit.',
      D: 'Tidak tepat: Monosit dan limfosit adalah agranulosit.',
    },
    doctorClinicalExplanation:
      'Klasifikasi 5 jenis leukosit ini menjadi dasar pelaporan Differential Count (Hitung Jenis Leukosit) 5-Diff pada Hematology Analyzer maupun pembacaan mikroskopis manual.',
    patientEducation:
      'Menjelaskan bahwa sel darah putih terdiri atas lima pasukan berbeda yang masing-masing memiliki spesialisasi melawan kuman.',
    managementPlan:
      'Standar kompetensi identifikasi morfologi sel darah putih bagi ATLM.',
    pdfPageRef: 'Halaman 21–28',
  },
  {
    questionNumber: 27,
    category: 'theory',
    topic: 'Teori 7 — Fungsi Subpopulasi Limfosit (Sel B, CD4+, CD8+, NK)',
    questionText:
      'Tiga kelompok limfosit yang dijelaskan dalam materi mempunyai fungsi berbeda. Pernyataan yang paling tepat adalah:',
    options: {
      A: 'Sel B menghasilkan antibodi; CD4+ membantu mengoordinasikan respons imun; CD8+ membunuh sel terinfeksi; NK membunuh sel abnormal',
      B: 'Sel B melakukan pembekuan; CD4+ mengangkut oksigen; CD8+ menghasilkan albumin; NK membentuk trombosit',
      C: 'Sel B menjadi neutrofil; CD4+ menghasilkan fibrin; CD8+ menjadi eritrosit; NK menghasilkan hemoglobin',
      D: 'Sel B dan T hanya melakukan fagositosis, sedangkan NK menghasilkan antibodi',
    },
    correctOption: 'A',
    scientificExplanation:
      'Limfosit terdiri atas: Limfosit B (berdiferensiasi menjadi sel plasma penghasil antibodi/imunitas humoral), Limfosit T Helper CD4+ (mengatur dan mengoordinasikan respons imun), Limfosit T Sitotoksik CD8+ (menghancurkan sel tubuh yang terinfeksi virus/patogen intraseluler), dan Sel NK (membunuh sel terinfeksi dan sel tumor secara langsung).',
    optionRationales: {
      A: 'Tepat: Menjelaskan peran spesifik Sel B, Sel T CD4+, Sel T CD8+, dan Sel NK secara tepat.',
      B: 'Tidak tepat: Mencampurkan fungsi trombosit, eritrosit, dan hepatosit.',
      C: 'Tidak tepat: Limfosit tidak berubah menjadi eritrosit atau neutrofil.',
      D: 'Tidak tepat: Penghasil antibodi adalah Sel B (sel plasma), bukan Sel NK.',
    },
    doctorClinicalExplanation:
      'Pemeriksaan rasio limfosit CD4+ dan CD8+ dengan flow cytometry digunakan secara luas dalam pemantauan status imunologi pasien (seperti pada infeksi HIV).',
    patientEducation:
      'Menjelaskan cara kerja sistem kekebalan spesifik dan pembentukan antibodi pasca-infeksi atau vaksinasi.',
    managementPlan:
      'Aplikasi imunologi hematologi pada laboratorium klinik.',
    pdfPageRef: 'Halaman 21–25, 28',
  },
  {
    questionNumber: 28,
    category: 'theory',
    topic: 'Teori 8 — Mekanisme Trombopoiesis dari Megakariosit',
    questionText:
      'Trombosit merupakan fragmen sel kecil tanpa inti yang berasal dari sel besar di sumsum tulang. Jalur pembentukan yang paling tepat adalah:',
    options: {
      A: 'Megakariosit mengalami fragmentasi dan melepaskan trombosit',
      B: 'Limfoblas membelah menjadi trombosit',
      C: 'Retikulosit kehilangan hemoglobin dan menjadi trombosit',
      D: 'Neutrofil mengalami fagositosis dan berubah menjadi trombosit',
    },
    correctOption: 'A',
    scientificExplanation:
      'Di bawah pengaruh hormon Trombopoietin (TPO), sel punca mieloid berdiferensiasi menjadi megakarioblas lalu matang menjadi sel raksasa Megakariosit di sumsum tulang. Sitoplasma megakariosit menjulur dan mengalami fragmentasi menjadi 2.000–3.000 keping trombosit yang masuk ke aliran darah.',
    optionRationales: {
      A: 'Tepat: Trombosit terbentuk dari fragmentasi sitoplasma megakariosit.',
      B: 'Tidak tepat: Limfoblas adalah prekursor limfosit.',
      C: 'Tidak tepat: Retikulosit matang menjadi eritrosit, bukan trombosit.',
      D: 'Tidak tepat: Neutrofil adalah leukosit matang dan tidak membentuk trombosit.',
    },
    doctorClinicalExplanation:
      'Karena trombosit berasal dari megakariosit di sumsum tulang, evaluasi aspirasi sumsum tulang pada trombositopenia berat bertujuan melihat apakah jumlah megakariosit meningkat (destruksi perifer seperti ITP) atau menurun (kegagalan sumsum tulang).',
    patientEducation:
      'Menjelaskan bahwa keping darah diproduksi terus-menerus oleh sel induk raksasa di sumsum tulang dan memiliki masa hidup sekitar 5–9 hari.',
    managementPlan:
      'Evaluasi MPV (Mean Platelet Volume) dan jumlah trombosit pada CBC.',
    pdfPageRef: 'Halaman 26 dan 32',
  },
  {
    questionNumber: 29,
    category: 'theory',
    topic: 'Teori 9 — Urutan Fisiologis Tahapan Hemostasis & Resolusi',
    questionText:
      'Ketika pembuluh darah mengalami cedera, materi menjelaskan respons bertahap untuk menghentikan perdarahan. Urutan yang benar adalah:',
    options: {
      A: 'Vasokonstriksi → sumbat trombosit → koagulasi → resolusi',
      B: 'Koagulasi → vasokonstriksi → resolusi → sumbat trombosit',
      C: 'Sumbat trombosit → resolusi → vasokonstriksi → koagulasi',
      D: 'Resolusi → fibrinolisis → vasokonstriksi → aktivasi trombosit',
    },
    correctOption: 'A',
    scientificExplanation:
      'Saat pembuluh darah cedera, respons hemostasis berlangsung berurutan: (1) Vasokonstriksi (spasme vaskular otot polos untuk mengurangi aliran darah), (2) Pembentukan sumbat trombosit (hemostasis primer: adhesi, aktivasi/pelepasan, agregasi), (3) Koagulasi darah (hemostasis sekunder: pembentukan jaring benang fibrin tidak larut), dan (4) Resolusi/Fibrinolisis (pelarutan bekuan oleh plasmin setelah jaringan sembuh).',
    optionRationales: {
      A: 'Tepat: Urutan keempat fase hemostasis hingga resolusi sesuai dengan diagram fisiologi.',
      B: 'Tidak tepat: Koagulasi fibrin terjadi setelah vasokonstriksi dan sumbat trombosit.',
      C: 'Tidak tepat: Resolusi adalah tahap paling akhir setelah pembuluh darah pulih.',
      D: 'Tidak tepat: Menempatkan resolusi dan fibrinolisis di urutan awal.',
    },
    doctorClinicalExplanation:
      'Keseimbangan antara pembentukan bekuan (koagulasi) dan pelarutan bekuan (fibrinolisis) mencegah perdarahan masif sekaligus mencegah trombosis patologis.',
    patientEducation:
      'Menjelaskan bagaimana tubuh secara otomatis menyempitkan pembuluh darah dan menambal luka dalam hitungan menit.',
    managementPlan:
      'Pemilihan tes laboratorium hemostasis sesuai tahapan yang dicurigai mengalami gangguan.',
    pdfPageRef: 'Halaman 29–40',
  },
  {
    questionNumber: 30,
    category: 'theory',
    topic: 'Teori 10 — Genetika & Antigen Sistem Golongan Darah ABO dan Rhesus',
    questionText:
      'Golongan darah ABO ditentukan oleh antigen pada permukaan eritrosit. Antigen A dan B bersifat kodominan. Faktor Rh positif berkaitan dengan keberadaan antigen D. Pernyataan yang benar adalah:',
    options: {
      A: 'Golongan AB memiliki antigen A dan B; Rh positif menunjukkan antigen D terdeteksi',
      B: 'Golongan O memiliki antigen A dan B; Rh negatif menunjukkan antigen D terdeteksi',
      C: 'Golongan A tidak memiliki antigen A; Rh positif berarti tidak ada antigen D',
      D: 'Golongan B memiliki antigen A dan B; Rh negatif selalu berarti golongan O',
    },
    correctOption: 'A',
    scientificExplanation:
      'Karena alel A dan B bersifat kodominan, individu bergolongan darah AB mengekspresikan baik Antigen A maupun Antigen B pada membran eritrositnya (serta tidak memiliki antibodi anti-A maupun anti-B di plasma). Pada sistem Rhesus, terdeteksinya antigen D pada permukaan eritrosit menetapkan status Rh positif.',
    optionRationales: {
      A: 'Tepat: Golongan AB memiliki antigen A & B, dan Rh positif berarti antigen D terdeteksi.',
      B: 'Tidak tepat: Golongan O tidak memiliki antigen A maupun B, dan Rh negatif berarti antigen D tidak ada.',
      C: 'Tidak tepat: Golongan A memiliki antigen A, dan Rh positif memiliki antigen D.',
      D: 'Tidak tepat: Golongan B hanya memiliki antigen B, dan sistem Rhesus diwariskan secara independen dari sistem ABO.',
    },
    doctorClinicalExplanation:
      'Pemahaman ekspresi antigen permukaan eritrosit dan antibodi plasma mendasari keselamatan transfusi darah untuk mencegah reaksi hemolitik akut.',
    patientEducation:
      'Menjelaskan pewarisan sifat golongan darah ABO dan Rhesus dari orang tua kepada anak.',
    managementPlan:
      'Prosedur baku imunohematologi pra-transfusi di instalasi laboratorium medik.',
    pdfPageRef: 'Halaman 35–36, 42–45',
  },
];
