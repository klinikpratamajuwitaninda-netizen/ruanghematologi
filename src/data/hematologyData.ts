export interface LearningModuleData {
  moduleNumber: number;
  title: string;
  category: 'Konsep Dasar' | 'Eritrosit & Hb' | 'Hematopoiesis' | 'Leukosit & Imun' | 'Trombosit & Hemostasis' | 'Sirkulasi & Golongan Darah' | 'Pemeriksaan Lab & Klinis';
  pdfPages: number[];
  primaryImagePage: number;
  secondaryImagePages?: number[];
  caption: string;
  summary: string;
  detailedContent: string[];
  keyTakeaways: string[];
  formulas?: { name: string; formula: string; unit: string; normalRange: string }[];
  practiceQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const HEMATOLOGY_MODULES: LearningModuleData[] = [
  {
    moduleNumber: 1,
    title: 'Sejarah Hematologi',
    category: 'Konsep Dasar',
    pdfPages: [1, 2, 3],
    primaryImagePage: 2,
    secondaryImagePages: [1, 3],
    caption: 'Linimasa Sejarah Hematologi: Dari Sirkulasi Darah (1628) hingga Golongan Darah ABO (1901) dan Era Kedokteran Modern (Sumber: PDF ANFIS Darah dr. Juwita Ninda Suherman, M.Kes — Hal. 1–3)',
    summary: 'Landasan ilmu hematologi dibangun melalui observasi anatomi sirkulasi darah dan kemajuan mikroskopi menuju diagnosis seluler modern.',
    detailedContent: [
      'Pada tahun 1628, William Harvey menjelaskan secara ilmiah bahwa darah dipompa oleh jantung dalam suatu sistem sirkulasi tertutup.',
      'Pada tahun 1674, Antonie van Leeuwenhoek mendeskripsikan sel darah merah (eritrosit) untuk pertama kalinya melalui pengamatan mikroskop.',
      'Pada tahun 1868, Ernst Neumann dan Giulio Bizzozero menghubungkan sumsum tulang sebagai organ utama pembentukan sel darah (hematopoiesis).',
      'Pada tahun 1901, Karl Landsteiner mengidentifikasi sistem kelompok golongan darah ABO yang menjadi fondasi transfusi darah yang aman.',
      'Memasuki era modern (Hal. 3), hematologi berkembang melalui tiga pilar utama: (1) Mikroskopi (identifikasi bentuk eritrosit, leukosit, trombosit), (2) Laboratorium (hitung darah lengkap/CBC, apusan darah, pemeriksaan koagulasi), dan (3) Kedokteran Modern (terapi penyakit darah, transfusi aman, dan transplantasi sel punca).'
    ],
    keyTakeaways: [
      '1628: William Harvey — Sirkulasi darah dipompa jantung',
      '1674: A. van Leeuwenhoek — Deskripsi mikroskopis eritrosit',
      '1868: Neumann & Bizzozero — Peran sumsum tulang dalam hematopoiesis',
      '1901: Karl Landsteiner — Identifikasi golongan darah ABO'
    ],
    practiceQuestion: {
      question: 'Siapakah tokoh pada tahun 1868 yang menghubungkan sumsum tulang dengan pembentukan sel darah?',
      options: ['William Harvey', 'A. van Leeuwenhoek', 'Neumann dan Bizzozero', 'Karl Landsteiner'],
      correctIndex: 2,
      explanation: 'Neumann dan Bizzozero (1868) menemukan hubungan antara sumsum tulang dan pembentukan sel darah (PDF Hal. 2).'
    }
  },
  {
    moduleNumber: 2,
    title: 'Pengantar Sistem Hematologi',
    category: 'Konsep Dasar',
    pdfPages: [4, 5],
    primaryImagePage: 5,
    secondaryImagePages: [4],
    caption: 'Konsep Dasar Sistem Hematologi dan Organ Pendukungnya (Sumber: PDF ANFIS Darah Hal. 4–5)',
    summary: 'Sistem hematologi mencakup darah, proses pembentukan sel darah, serta organ-organ yang menunjang fungsi dan regulasinya.',
    detailedContent: [
      'Tujuan pembelajaran utama meliputi kemampuan menjelaskan sejarah, fungsi, dan komposisi darah; mengidentifikasi organ pembentuk darah serta karakteristik sel; dan menghubungkan proses fisiologi dengan pemeriksaan klinis.',
      'Sistem hematologi terdiri atas empat komponen terintegrasi: (1) Darah sebagai medium transport dan perlindungan, (2) Sumsum Tulang sebagai pabrik utama sel darah, (3) Limpa & Nodus Limfa untuk penyaringan darah dan fungsi imun, serta (4) Ginjal & Hati untuk pengaturan faktor pertumbuhan hematopoietik (seperti EPO dan TPO) serta sintesis protein plasma.'
    ],
    keyTakeaways: [
      'Darah: Medium transport dan perlindungan',
      'Sumsum tulang: Pabrik utama sel darah',
      'Limpa & nodus limfa: Penyaringan dan fungsi imun',
      'Ginjal & hati: Pengaturan faktor pertumbuhan dan protein'
    ],
    practiceQuestion: {
      question: 'Organ manakah yang berperan sebagai pabrik utama pembentukan sel darah pada orang dewasa?',
      options: ['Limpa', 'Sumsum tulang', 'Ginjal', 'Nodus limfa'],
      correctIndex: 1,
      explanation: 'Sumsum tulang merah merupakan pabrik utama pembentukan sel darah (PDF Hal. 5).'
    }
  },
  {
    moduleNumber: 3,
    title: 'Fungsi Utama Darah',
    category: 'Konsep Dasar',
    pdfPages: [6],
    primaryImagePage: 6,
    caption: 'Tiga Fungsi Utama Darah: Transportasi, Perlindungan, dan Regulasi (Sumber: PDF ANFIS Darah Hal. 6)',
    summary: 'Darah menjalankan tiga peran fisiologis esensial: transportasi zat, perlindungan imun/hemostasis, dan regulasi homeostasis internal.',
    detailedContent: [
      '1. Transportasi: Mengangkut oksigen (O2) dari paru ke jaringan, karbon dioksida (CO2) dari jaringan ke paru, serta mendistribusikan nutrisi, metabolit, dan hormon ke seluruh tubuh.',
      '2. Perlindungan: Leukosit beserta antibodi melawan infeksi patogen, sedangkan trombosit dan faktor koagulasi membantu menghentikan perdarahan saat pembuluh darah cedera.',
      '3. Regulasi: Menjaga keseimbangan pH tubuh melalui sistem penyangga (buffer), mengatur suhu tubuh melalui distribusi panas, serta mempertahankan tekanan onkotik dan keseimbangan cairan intravaskular.'
    ],
    keyTakeaways: [
      'Transportasi: O2, CO2, nutrisi, hormon',
      'Perlindungan: Leukosit (imun) & trombosit (hemostasis)',
      'Regulasi: pH, suhu tubuh, dan keseimbangan cairan'
    ],
    practiceQuestion: {
      question: 'Manakah yang termasuk fungsi regulasi dari darah menurut materi perkuliahan?',
      options: ['Mengikat oksigen di paru-paru', 'Fagositosis bakteri oleh neutrofil', 'Menjaga pH, suhu tubuh, dan keseimbangan cairan', 'Membentuk sumbat trombosit primer'],
      correctIndex: 2,
      explanation: 'Fungsi regulasi darah meliputi pemeliharaan pH, suhu tubuh, dan keseimbangan cairan (PDF Hal. 6).'
    }
  },
  {
    moduleNumber: 4,
    title: 'Komposisi Darah',
    category: 'Konsep Dasar',
    pdfPages: [7, 8],
    primaryImagePage: 7,
    secondaryImagePages: [8],
    caption: 'Fraksi Komponen Darah Setelah Sentrifugasi: Plasma, Buffy Coat, dan Eritrosit (Sumber: PDF ANFIS Darah Hal. 7–8)',
    summary: 'Darah yang diberi antikoagulan dan disentrifugasi terpisah menjadi tiga lapisan berdasarkan densitas: plasma (±55%), buffy coat (<1%), dan eritrosit (±45%).',
    detailedContent: [
      'Plasma (±55%): Lapisan cair berwarna kekuningan di bagian paling atas yang tersusun atas air, protein plasma, dan zat terlarut.',
      'Buffy Coat (<1%): Lapisan tipis berwarna putih keabu-abuan di bagian tengah antara plasma dan eritrosit yang memuat leukosit (sel darah putih) dan trombosit (keping darah).',
      'Eritrosit (±45%): Bagian terbesar dari unsur berbentuk (formed elements) yang mengendap di bagian bawah tabung. Proporsi volume eritrosit terhadap volume darah total dikenal sebagai hematokrit (Hct).'
    ],
    keyTakeaways: [
      'Plasma: ±55% (bagian atas)',
      'Buffy coat: <1% (leukosit & trombosit di bagian tengah)',
      'Eritrosit: ±45% (unsur berbentuk terbesar di bagian bawah)'
    ],
    practiceQuestion: {
      question: 'Komponen apakah yang menyusun lapisan tipis buffy coat (<1%) setelah darah berantikoagulan disentrifugasi?',
      options: ['Albumin dan globulin', 'Eritrosit dan retikulosit', 'Leukosit dan trombosit', 'Fibrinogen dan air'],
      correctIndex: 2,
      explanation: 'Buffy coat (<1%) terdiri atas leukosit dan trombosit (PDF Hal. 7–8).'
    }
  },
  {
    moduleNumber: 5,
    title: 'Plasma Darah & Protein Plasma',
    category: 'Konsep Dasar',
    pdfPages: [9],
    primaryImagePage: 9,
    caption: 'Komposisi Plasma Darah dan Tiga Protein Utama: Albumin, Globulin, Fibrinogen (Sumber: PDF ANFIS Darah Hal. 9)',
    summary: 'Sekitar 90% plasma adalah air yang menjadi medium pengangkut, dilengkapi tiga protein utama: albumin, globulin, dan fibrinogen.',
    detailedContent: [
      'Plasma darah mengandung sekitar 90% air yang berfungsi sebagai pelarut dan medium transpor serta menjaga tekanan osmotik vaskular.',
      'Albumin: Protein plasma dengan proporsi terbesar yang berfungsi mempertahankan tekanan onkotik koloid intravaskular (mencegah edema) dan mengangkut berbagai molekul (bilirubin, asam lemak, obat).',
      'Globulin: Kelompok protein (alfa, beta, dan gama globulin/imunoglobulin) yang terlibat langsung dalam sistem pertahanan imun dan transport protein spesifik.',
      'Fibrinogen: Protein koagulasi penting yang disintesis di hati dan diubah oleh trombin menjadi jalinan benang fibrin saat proses pembekuan darah.'
    ],
    keyTakeaways: [
      '±90% komposisi plasma adalah air',
      'Albumin: Tekanan onkotik & pengangkut molekul',
      'Globulin: Sistem imun (antibodi) & transport protein',
      'Fibrinogen: Prekursor fibrin dalam pembekuan darah'
    ],
    practiceQuestion: {
      question: 'Protein plasma manakah yang berperan utama mempertahankan tekanan onkotik intravaskular?',
      options: ['Fibrinogen', 'Albumin', 'Imunoglobulin', 'Hemoglobin'],
      correctIndex: 1,
      explanation: 'Albumin mempertahankan tekanan onkotik dan mengangkut molekul dalam plasma (PDF Hal. 9).'
    }
  },
  {
    moduleNumber: 6,
    title: 'Eritrosit (Sel Darah Merah)',
    category: 'Eritrosit & Hb',
    pdfPages: [15, 16, 17],
    primaryImagePage: 15,
    secondaryImagePages: [16, 17],
    caption: 'Karakteristik Eritrosit Matang, Variasi Morfologi Klinis, dan Gambaran Apusan Darah Tepi (Sumber: PDF ANFIS Darah Hal. 15–17)',
    summary: 'Eritrosit matang berbentuk cakram bikonkaf tanpa inti dengan diameter 7–8 µm dan masa hidup ±120 hari untuk mengoptimalkan transpor oksigen.',
    detailedContent: [
      'Diameter rerata eritrosit normal adalah 7–8 µm dengan bentuk cakram bikonkaf (cekung di kedua sisi) dan area pucat sentral (central pallor) kurang dari 1/3 diameter sel.',
      'Eritrosit matang tidak memiliki inti sel (anukleat), mitokondria, maupun ribosom, sehingga ruang sitoplasmanya optimal untuk memuat molekul hemoglobin dan tidak mengonsumsi oksigen yang dibawanya.',
      'Bentuk bikonkaf memberikan rasio luas permukaan terhadap volume yang tinggi untuk mempercepat difusi gas serta fleksibilitas (deformabilitas) tinggi saat melintasi kapiler mikro.',
      'Pada halaman 16–17 ditampilkan variasi morfologi eritrosit pada kondisi patologis seperti sel sabit (sickle cell), sferosit (hereditary spherocytosis — ditunjuk panah merah pada Hal. 17 tanpa central pallor), sel target (thalassemia), akantosit, dan skistosit (DIC/TTP).'
    ],
    keyTakeaways: [
      'Bentuk cakram bikonkaf, diameter rerata 7–8 µm',
      'Tanpa inti (anukleat) saat matang',
      'Masa hidup ±120 hari dalam sirkulasi',
      'Mengandung hemoglobin pengikat oksigen'
    ],
    practiceQuestion: {
      question: 'Berapakah diameter rerata dan masa hidup eritrosit matang normal di dalam sirkulasi?',
      options: ['2–4 µm dan ±10 hari', '7–8 µm dan ±120 hari', '12–15 µm dan ±30 hari', '15–20 µm dan ±365 hari'],
      correctIndex: 1,
      explanation: 'Eritrosit matang berdiameter rerata 7–8 µm dengan masa hidup ±120 hari (PDF Hal. 15).'
    }
  },
  {
    moduleNumber: 7,
    title: 'Hemoglobin & Transport Oksigen',
    category: 'Eritrosit & Hb',
    pdfPages: [18],
    primaryImagePage: 18,
    caption: 'Mekanisme Hemoglobin Mengangkut Oksigen dari Paru-paru ke Jaringan (Sumber: PDF ANFIS Darah Hal. 18)',
    summary: 'Hemoglobin mengikat oksigen secara reversibel melalui gugus Heme + Besi (Fe2+) dari paru-paru dan melepaskannya di jaringan.',
    detailedContent: [
      'Hemoglobin (Hb) tersusun atas empat subunit protein globin (pada HbA dewasa: 2 rantai alfa dan 2 rantai beta) serta empat gugus prostetik heme yang masing-masing mengandung satu atom besi fero (Fe2+).',
      'Alur fisiologis transpor oksigen: (1) Paru-paru: Oksigen dari alveolus berdifusi masuk ke dalam kapiler darah paru, (2) Eritrosit: Hemoglobin mengikat O2 membentuk oksihemoglobin dan membawanya dalam sirkulasi, (3) Jaringan: Oksigen dilepaskan dari Hb menuju sel-sel jaringan yang membutuhkan untuk respirasi seluler.',
      'Kunci utama pengikatan oksigen oleh hemoglobin adalah keberadaan gugus Heme + Besi (Fe).'
    ],
    keyTakeaways: [
      'Struktur Hb: Gugus Heme (protoporfirin + besi) dan protein Globin',
      'Alur: Paru-paru → Eritrosit (Hb mengikat O2) → Jaringan (O2 dilepas)',
      'Kunci pengikatan O2: Heme + Besi'
    ],
    practiceQuestion: {
      question: 'Komponen kunci apakah pada molekul hemoglobin yang secara langsung mengikat molekul oksigen?',
      options: ['Albumin dan kalsium', 'Heme dan besi (Fe)', 'Fibrinogen dan trombin', 'Globulin dan kalium'],
      correctIndex: 1,
      explanation: 'Kunci pengikatan oksigen pada hemoglobin adalah gugus Heme + Besi (PDF Hal. 18).'
    }
  },
  {
    moduleNumber: 8,
    title: 'Sumsum Tulang & Hematopoiesis',
    category: 'Hematopoiesis',
    pdfPages: [10, 11, 12, 13, 14],
    primaryImagePage: 12,
    secondaryImagePages: [10, 11, 13, 14],
    caption: 'Lokasi Sumsum Tulang Merah Dewasa dan Bagan Diferensiasi Sel Punca Hematopoietik (Sumber: PDF ANFIS Darah Hal. 10–14)',
    summary: 'Pada orang dewasa, hematopoiesis berlangsung di sumsum tulang merah (sternum, vertebra, pelvis) dari Sel Punca Hematopoietik menjadi jalur mieloid dan limfoid.',
    detailedContent: [
      'Pada orang dewasa, hematopoiesis aktif terutama terjadi di sumsum tulang merah (red bone marrow) yang berlokasi pada tulang pipih dan aksial: Sternum (tulang dada), Vertebra (tulang belakang), dan Pelvis (tulang panggul) serta epifisis tulang panjang (Hal. 10–11).',
      'Seluruh sel darah berasal dari satu prekursor utama yaitu Sel Punca Hematopoietik (Hematopoietic Stem Cell / Hemocytoblast).',
      'Urutan pematangan dasar: Sel Punca → Sel Progenitor → Sel Prekursor/Blas → Sel Matang.',
      'Jalur Mieloid (Common Myeloid Progenitor) menghasilkan: Eritrosit, Megakariosit/Trombosit, Granulosit (Neutrofil, Eosinofil, Basofil), dan Monosit/Makrofag.',
      'Jalur Limfoid (Common Lymphoid Progenitor) menghasilkan: Limfosit B (sel plasma), Limfosit T, dan Sel NK (Natural Killer).'
    ],
    keyTakeaways: [
      'Lokasi utama dewasa: Sternum, Vertebra, dan Pelvis',
      'Jalur Mieloid: Eritrosit, Neutrofil/Eosinofil/Basofil, Monosit, Trombosit',
      'Jalur Limfoid: Limfosit B, Limfosit T, dan Sel NK'
    ],
    practiceQuestion: {
      question: 'Kombinasi sel darah manakah yang seluruhnya berasal dari jalur mieloid?',
      options: ['Limfosit B, Limfosit T, dan Sel NK', 'Eritrosit, Neutrofil, Monosit, dan Trombosit', 'Eritrosit, Limfosit B, dan Sel Plasma', 'Trombosit, Limfosit T, dan Sel NK'],
      correctIndex: 1,
      explanation: 'Jalur mieloid menghasilkan eritrosit, granulosit (neutrofil, eosinofil, basofil), monosit, dan trombosit (PDF Hal. 12–14).'
    }
  },
  {
    moduleNumber: 9,
    title: 'Eritropoiesis & Siklus Hidup Eritrosit',
    category: 'Hematopoiesis',
    pdfPages: [19, 20],
    primaryImagePage: 19,
    secondaryImagePages: [20],
    caption: 'Siklus Hidup Eritrosit dan Regulasi Hormon Eritropoietin (EPO) (Sumber: PDF ANFIS Darah Hal. 19–20)',
    summary: 'Hipoksia jaringan merangsang ginjal memproduksi EPO yang memicu eritropoiesis di sumsum tulang; setelah ±120 hari, eritrosit tua diurai di limpa dan hati.',
    detailedContent: [
      'Tahap 01 (Ginjal): Penurunan oksigen jaringan (hipoksia) dideteksi oleh ginjal yang kemudian merangsang produksi hormon Eritropoietin (EPO).',
      'Tahap 02 (Sumsum Tulang): EPO mengalir melalui darah menuju sumsum tulang merah dan memicu diferensiasi progenitor eritroid (proeritroblas → eritroblas → retikulosit → eritrosit) dengan dukungan zat besi, tembaga, vitamin B12, dan asam folat (Hal. 20).',
      'Tahap 03 (Sirkulasi): Eritrosit matang dilepaskan ke aliran darah dan bekerja mengangkut oksigen selama sekitar 120 hari.',
      'Tahap 04 (Limpa & Hati): Eritrosit yang menua dan kehilangan elastisitasnya difagositosis oleh makrofag di limpa dan hati; komponen globin dipecah menjadi asam amino, cincin porfirin menjadi bilirubin, dan zat besi (Fe) didaur ulang untuk eritropoiesis baru.'
    ],
    keyTakeaways: [
      'Stimulus utama: Hipoksia jaringan → Ginjal melepas EPO',
      'Nutrisi esensial: Zat besi (Fe), tembaga, vitamin B12, folat',
      'Destruksi & daur ulang besi: Limpa dan Hati setelah ±120 hari'
    ],
    practiceQuestion: {
      question: 'Apakah stimulus fisiologis utama yang merangsang ginjal memproduksi hormon eritropoietin (EPO)?',
      options: ['Peningkatan kadar trombosit', 'Hipoksia (penurunan oksigen jaringan)', 'Infeksi bakteri akut', 'Peningkatan tekanan onkotik plasma'],
      correctIndex: 1,
      explanation: 'Hipoksia merangsang ginjal memproduksi EPO untuk memicu pembentukan eritrosit di sumsum tulang (PDF Hal. 19–20).'
    }
  },
  {
    moduleNumber: 10,
    title: 'Leukosit: Penjaga Pertahanan Tubuh',
    category: 'Leukosit & Imun',
    pdfPages: [21, 22, 23],
    primaryImagePage: 21,
    secondaryImagePages: [22, 23],
    caption: 'Peran Utama Leukosit dan Klasifikasi Morfologis Sel Darah Putih (Sumber: PDF ANFIS Darah Hal. 21–23)',
    summary: 'Leukosit melindungi tubuh melalui tiga mekanisme utama: fagositosis, imunitas adaptif spesifik, dan regulasi respons inflamasi.',
    detailedContent: [
      '1. Fagositosis: Neutrofil dan monosit/makrofag mengenali, menelan, dan menghancurkan patogen ekstraseluler serta debris sel.',
      '2. Imunitas Adaptif: Limfosit B dan Limfosit T mengenali antigen spesifik patogen dan membangun memori imunologis.',
      '3. Respons Inflamasi: Pelepasan mediator kimiawi oleh sel imun (seperti histamin dan sitokin) mengatur vasodilatasi dan rekrutmen sel pertahanan ke lokasi infeksi atau cedera jaringan.'
    ],
    keyTakeaways: [
      'Fagositosis: Neutrofil dan monosit menelan patogen',
      'Imunitas adaptif: Limfosit B dan T mengenali target spesifik',
      'Respons inflamasi: Mediator sel imun mengoordinasikan pertahanan'
    ],
    practiceQuestion: {
      question: 'Pasangan sel leukosit manakah yang memiliki fungsi utama melakukan fagositosis terhadap patogen?',
      options: ['Limfosit B dan Sel NK', 'Neutrofil dan Monosit', 'Basofil dan Limfosit T', 'Eritrosit dan Trombosit'],
      correctIndex: 1,
      explanation: 'Neutrofil dan monosit (yang menjadi makrofag) adalah fagosit utama dalam darah (PDF Hal. 21).'
    }
  },
  {
    moduleNumber: 11,
    title: 'Granulosit (Neutrofil, Eosinofil, Basofil)',
    category: 'Leukosit & Imun',
    pdfPages: [24],
    primaryImagePage: 24,
    secondaryImagePages: [23],
    caption: 'Tiga Jenis Granulosit dan Fungsi Spesifiknya (Sumber: PDF ANFIS Darah Hal. 24)',
    summary: 'Granulosit memiliki inti berlobus (polimorfonuklear) dan granula sitoplasma spesifik: Neutrofil, Eosinofil, dan Basofil.',
    detailedContent: [
      'Granulosit dibedakan berdasarkan afinitas pewarnaan granula sitoplasmanya pada apusan darah tepi (pewarnaan Romanowsky/Giemsa/Wright).',
      'Neutrofil: Memiliki inti bersegmen (3–5 lobus) dengan granula halus netral; berfungsi sebagai pertahanan awal terhadap infeksi bakteri.',
      'Eosinofil: Memiliki inti bilobus dan granula kasar berwarna merah-oranye terang (mengikat zat warna asam/eosin); berperan pada infeksi parasit dan reaksi alergi.',
      'Basofil: Memiliki granula besar berwarna biru-ungu gelap (mengikat zat warna basa) yang sering menutupi inti; melepas mediator inflamasi seperti histamin dan heparin.'
    ],
    keyTakeaways: [
      'Granulosit mencakup Neutrofil, Eosinofil, dan Basofil',
      'Memiliki granula spesifik di sitoplasma dan inti berlobus'
    ],
    practiceQuestion: {
      question: 'Kelompok leukosit manakah yang seluruhnya tergolong ke dalam granulosit?',
      options: ['Neutrofil, Limfosit, Monosit', 'Neutrofil, Eosinofil, Basofil', 'Limfosit, Monosit, Makrofag', 'Eosinofil, Basofil, Trombosit'],
      correctIndex: 1,
      explanation: 'Granulosit terdiri atas neutrofil, eosinofil, dan basofil (PDF Hal. 24).'
    }
  },
  {
    moduleNumber: 12,
    title: 'Agranulosit (Limfosit dan Monosit)',
    category: 'Leukosit & Imun',
    pdfPages: [25],
    primaryImagePage: 25,
    secondaryImagePages: [22],
    caption: 'Agranulosit: Karakteristik dan Peran Limfosit serta Monosit (Sumber: PDF ANFIS Darah Hal. 25)',
    summary: 'Agranulosit adalah leukosit mononuklear tanpa granula spesifik mencolok di sitoplasma, terdiri atas Limfosit dan Monosit.',
    detailedContent: [
      'Limfosit: Memiliki inti bulat padat dengan sitoplasma tipis berwarna biru muda; mencakup Sel B (membuat antibodi), Sel T (mengatur imun dan membunuh sel terinfeksi), serta Sel NK (membunuh sel abnormal/tumor/terinfeksi virus).',
      'Monosit: Leukosit berukuran paling besar dengan inti berbentuk menyerupai ginjal atau tapal kuda; beredar di darah lalu bermigrasi masuk ke jaringan untuk berdiferensiasi menjadi makrofag jaringan yang aktif melakukan fagositosis.'
    ],
    keyTakeaways: [
      'Agranulosit terdiri atas Limfosit dan Monosit',
      'Limfosit berperan dalam imunitas spesifik & sel NK',
      'Monosit berdiferensiasi menjadi makrofag di jaringan'
    ],
    practiceQuestion: {
      question: 'Sel darah putih yang termasuk kelompok agranulosit adalah...',
      options: ['Neutrofil dan Eosinofil', 'Limfosit dan Monosit', 'Basofil dan Monosit', 'Neutrofil dan Limfosit'],
      correctIndex: 1,
      explanation: 'Agranulosit terdiri atas limfosit dan monosit (PDF Hal. 25).'
    }
  },
  {
    moduleNumber: 13,
    title: 'Neutrofil: Pertahanan Bakteri Akut',
    category: 'Leukosit & Imun',
    pdfPages: [21, 23, 24],
    primaryImagePage: 21,
    secondaryImagePages: [24],
    caption: 'Morfologi Mikroskopis Neutrofil Segmen pada Apusan Darah Tepi (Sumber: PDF ANFIS Darah Hal. 21 & 24)',
    summary: 'Neutrofil adalah populasi leukosit terbanyak (50–70%) yang bermigrasi cepat ke lokasi infeksi bakteri akut untuk melakukan fagositosis.',
    detailedContent: [
      'Pada apusan darah tepi (Hal. 21 & 23), neutrofil segmen tampak jelas dengan inti multilobus yang dihubungkan oleh filamen kromatin tipis dan sitoplasma bergranula halus merah-muda keunguan.',
      'Neutrofil merupakan lini pertama pertahanan tubuh terhadap invasi bakteri piogenik melalui kemotaksis, opsonisasi, fagositosis, dan degranulasi enzim lisosom.',
      'Peningkatan jumlah neutrofil absolut (neutrofilia) lazim ditemukan pada infeksi bakteri akut dan inflamasi jaringan.'
    ],
    keyTakeaways: [
      'Populasi leukosit terbanyak di darah tepi',
      'Inti bersegmen khas (3–5 lobus)',
      'Fungsi utama: Fagositosis bakteri pada fase akut'
    ],
    practiceQuestion: {
      question: 'Pada infeksi bakteri akut, jenis leukosit manakah yang menjadi lini pertahanan fagositik awal paling dominan?',
      options: ['Eosinofil', 'Basofil', 'Neutrofil', 'Limfosit B'],
      correctIndex: 2,
      explanation: 'Neutrofil adalah pertahanan awal utama terhadap infeksi bakteri melalui fagositosis (PDF Hal. 21 & 24).'
    }
  },
  {
    moduleNumber: 14,
    title: 'Eosinofil: Respons Parasit & Alergi',
    category: 'Leukosit & Imun',
    pdfPages: [22, 23, 24],
    primaryImagePage: 24,
    secondaryImagePages: [23],
    caption: 'Karakteristik Eosinofil dengan Granula Merah-Oranye Spesifik (Sumber: PDF ANFIS Darah Hal. 23–24)',
    summary: 'Eosinofil memiliki inti bilobus dan granula asidofilik merah-terang yang berperan penting pada infeksi parasit (helminth) dan modulasi reaksi alergi.',
    detailedContent: [
      'Granula eosinofil mengandung protein sitotoksik (seperti Major Basic Protein) yang efektif merusak dinding parasit multiseluler (cacing/helminth).',
      'Selain pertahanan antiparasit, eosinofil terlibat aktif dalam reaksi hipersensitivitas/alergi (seperti asma alergi, rinitis alergi, dan dermatitis atopik).',
      'Jumlah normal eosinofil dalam hitung jenis leukosit berkisar sekitar 1–4%.'
    ],
    keyTakeaways: [
      'Granula berwarna merah-oranye terang dengan pewarnaan eosin',
      'Meningkat (eosinofilia) pada infeksi parasit dan reaksi alergi'
    ],
    practiceQuestion: {
      question: 'Seorang pasien mengalami gatal alergi berulang dan infeksi kecacingan. Leukosit manakah yang paling khas meningkat?',
      options: ['Neutrofil', 'Eosinofil', 'Monosit', 'Basofil'],
      correctIndex: 1,
      explanation: 'Eosinofil berperan utama pada infeksi parasit dan reaksi alergi (PDF Hal. 24).'
    }
  },
  {
    moduleNumber: 15,
    title: 'Basofil: Mediator Histamin & Alergi',
    category: 'Leukosit & Imun',
    pdfPages: [22, 23, 24],
    primaryImagePage: 24,
    secondaryImagePages: [23],
    caption: 'Morfologi Basofil dengan Granula Basofilik Biru Gelap (Sumber: PDF ANFIS Darah Hal. 23–24)',
    summary: 'Basofil adalah granulosit paling jarang (<1%) dengan granula biru-ungu besar yang melepaskan histamin dan heparin pada respons alergi.',
    detailedContent: [
      'Basofil memiliki reseptor IgE afinitas tinggi pada membran selnya. Ketika alergen berikatan silang dengan IgE, basofil mengalami degranulasi.',
      'Granula basofil melepaskan histamin (vasodilator yang meningkatkan permeabilitas vaskular pada reaksi alergi/anafilaksis) serta heparin (antikoagulan alami).'
    ],
    keyTakeaways: [
      'Granula kasar berwarna biru-ungu gelap',
      'Melepaskan mediator histamin dan heparin'
    ],
    practiceQuestion: {
      question: 'Leukosit yang memiliki granula besar berwarna biru gelap dan melepaskan histamin adalah...',
      options: ['Eosinofil', 'Neutrofil', 'Basofil', 'Limfosit T'],
      correctIndex: 2,
      explanation: 'Basofil memiliki granula biru gelap dan melepaskan mediator seperti histamin (PDF Hal. 24).'
    }
  },
  {
    moduleNumber: 16,
    title: 'Limfosit (Sel B, Sel T, dan Sel NK)',
    category: 'Leukosit & Imun',
    pdfPages: [12, 22, 25],
    primaryImagePage: 25,
    secondaryImagePages: [12, 22],
    caption: 'Subpopulasi Limfosit: Sel B, Sel T, dan Sel NK (Sumber: PDF ANFIS Darah Hal. 12 & 25)',
    summary: 'Limfosit terbagi menjadi tiga kelompok fungsional: Sel B (imunitas humoral/antibodi), Sel T (imunitas seluler), dan Sel NK (imunitas bawaan terhadap sel abnormal).',
    detailedContent: [
      'Limfosit B: Berdiferensiasi menjadi sel plasma (plasma cell) yang memproduksi dan mensekresikan antibodi (imunoglobulin) spesifik untuk menetralkan antigen patogen.',
      'Limfosit T: Mengalami pematangan di timus; mencakup sel T helper (CD4+) yang mengoordinasikan respons imun dan sel T sitotoksik (CD8+) yang membunuh sel tubuh yang terinfeksi patogen intraseluler/virus.',
      'Sel NK (Natural Killer): Limfosit granular besar yang mampu mengenali dan melisiskan sel abnormal (sel kanker atau sel terinfeksi virus) secara langsung tanpa memerlukan aktivasi antigen spesifik sebelumnya.'
    ],
    keyTakeaways: [
      'Sel B → berdiferensiasi menjadi sel plasma pembuat antibodi',
      'Sel T → mengatur respons imun (CD4+) & membunuh sel terinfeksi (CD8+)',
      'Sel NK → membunuh sel abnormal/tumor'
    ],
    practiceQuestion: {
      question: 'Subpopulasi limfosit manakah yang berdiferensiasi menjadi sel plasma untuk menghasilkan antibodi?',
      options: ['Sel NK', 'Limfosit T sitotoksik', 'Limfosit B', 'Monosit'],
      correctIndex: 2,
      explanation: 'Limfosit B berkembang menjadi sel plasma yang membuat antibodi spesifik (PDF Hal. 14 & 25).'
    }
  },
  {
    moduleNumber: 17,
    title: 'Monosit & Makrofag Jaringan',
    category: 'Leukosit & Imun',
    pdfPages: [14, 22, 25],
    primaryImagePage: 25,
    secondaryImagePages: [14, 22],
    caption: 'Diferensiasi Monosit Menjadi Makrofag dan Sel Dendritik di Jaringan (Sumber: PDF ANFIS Darah Hal. 14, 22, 25)',
    summary: 'Monosit beredar di aliran darah dan kemudian bermigrasi ke jaringan untuk berkembang menjadi makrofag dan sel dendritik yang berperan sebagai fagosit dan penyaji antigen.',
    detailedContent: [
      'Monosit merupakan agranulosit terbesar dalam darah tepi. Setelah beredar di sirkulasi selama beberapa jam hingga hari, monosit melakukan diapedesis masuk ke jaringan ikat dan organ.',
      'Di dalam jaringan, monosit matang menjadi makrofag (atau sel dendritik) yang memiliki kapasitas fagositosis sangat kuat terhadap mikroorganisme, sel mati, serta eritrosit tua, sekaligus menyajikan antigen (Antigen Presenting Cell) kepada limfosit T.'
    ],
    keyTakeaways: [
      'Monosit di sirkulasi → Makrofag di jaringan',
      'Berfungsi dalam fagositosis lanjutan dan presentasi antigen'
    ],
    practiceQuestion: {
      question: 'Monosit yang keluar dari pembuluh darah dan masuk ke dalam jaringan akan mengalami pematangan menjadi...',
      options: ['Megakariosit', 'Retikulosit', 'Makrofag', 'Eritroblas'],
      correctIndex: 2,
      explanation: 'Monosit masuk ke jaringan dan berkembang menjadi makrofag yang melakukan fagositosis (PDF Hal. 25).'
    }
  },
  {
    moduleNumber: 18,
    title: 'Trombosit (Platelet)',
    category: 'Trombosit & Hemostasis',
    pdfPages: [26, 27, 28],
    primaryImagePage: 26,
    secondaryImagePages: [27, 28],
    caption: 'Trombosit: Komponen Awal Hemostasis dan Nilai Rujukan Normal (Sumber: PDF ANFIS Darah Hal. 26–28)',
    summary: 'Trombosit adalah fragmen sel kecil tanpa inti (150.000–450.000/µL) yang berperan krusial pada tahap awal penghentian perdarahan.',
    detailedContent: [
      'Trombosit bukanlah sel utuh berinti, melainkan fragmen sitoplasma berukuran kecil (2–4 µm) tanpa inti yang dilepaskan ke sirkulasi.',
      'Kisaran nilai rujukan umum jumlah trombosit pada orang dewasa adalah 150.000–450.000 per µL darah (150–450 ribu/µL), meskipun rentang spesifik dapat sedikit berbeda antar-laboratorium.',
      'Pada apusan darah tepi (Hal. 27–28), trombosit tampak sebagai kepingan kecil berwarna ungu kebiruan yang tersebar di antara eritrosit.'
    ],
    keyTakeaways: [
      'Fragmen sel kecil tanpa inti',
      'Nilai rujukan umum: 150.000–450.000 /µL darah',
      'Komponen utama hemostasis primer'
    ],
    practiceQuestion: {
      question: 'Berapakah kisaran nilai rujukan umum jumlah trombosit per µL darah menurut materi perkuliahan?',
      options: ['4.000–11.000 /µL', '50.000–100.000 /µL', '150.000–450.000 /µL', '500.000–1.000.000 /µL'],
      correctIndex: 2,
      explanation: 'Kisaran rujukan umum trombosit adalah 150–450 ribu (150.000–450.000) per µL darah (PDF Hal. 26).'
    }
  },
  {
    moduleNumber: 19,
    title: 'Trombopoiesis (Megakariosit)',
    category: 'Trombosit & Hemostasis',
    pdfPages: [13, 14, 26],
    primaryImagePage: 26,
    secondaryImagePages: [13, 14],
    caption: 'Proses Fragmentasi Megakariosit Menjadi Trombosit di Sumsum Tulang (Sumber: PDF ANFIS Darah Hal. 13 & 26)',
    summary: 'Trombopoiesis berlangsung di sumsum tulang merah di mana megakariosit raksasa mengalami fragmentasi sitoplasma menjadi ribuan trombosit.',
    detailedContent: [
      'Jalur pembentukan trombosit dimulai dari sel punca hematopoietik → progenitor mieloid → megakarioblas → megakariosit.',
      'Megakariosit adalah sel berukuran sangat besar dan poliploid di sumsum tulang merah. Sitoplasma megakariosit membentuk juluran proplatelet yang kemudian mengalami fragmentasi dan melepaskan ribuan fragmen trombosit matang ke sinusoid sumsum tulang.'
    ],
    keyTakeaways: [
      'Urutan: Sel punca → Megakarioblas → Megakariosit → Trombosit',
      'Satu megakariosit menghasilkan ribuan fragmen trombosit'
    ],
    practiceQuestion: {
      question: 'Trombosit di dalam sirkulasi darah berasal dari fragmentasi sel besar di sumsum tulang yang disebut...',
      options: ['Proeritroblas', 'Mieloblas', 'Megakariosit', 'Limfoblas'],
      correctIndex: 2,
      explanation: 'Trombosit berasal dari fragmentasi sitoplasma megakariosit di sumsum tulang (PDF Hal. 26).'
    }
  },
  {
    moduleNumber: 20,
    title: 'Tahapan Hemostasis',
    category: 'Trombosit & Hemostasis',
    pdfPages: [29, 30],
    primaryImagePage: 29,
    secondaryImagePages: [30],
    caption: 'Empat Tahap Respons Hemostasis Saat Pembuluh Darah Cedera (Sumber: PDF ANFIS Darah Hal. 29–30)',
    summary: 'Ketika pembuluh darah cedera, tubuh menjalankan empat tahap hemostasis berurutan: Vasokonstriksi, Sumbat Trombosit, Koagulasi, dan Resolusi.',
    detailedContent: [
      'Tahap 1 — Vasokonstriksi (Vessel Constriction): Otot polos dinding pembuluh darah yang cedera segera menyempit secara refleks untuk mengurangi aliran dan kehilangan darah.',
      'Tahap 2 — Sumbat Trombosit (Primary Hemostasis): Trombosit melekat pada kolagen subendotel yang terbuka (adhesi dengan bantuan vWF), mengalami aktivasi, dan saling berkumpul (agregasi) membentuk sumbat trombosit awal.',
      'Tahap 3 — Koagulasi (Secondary Hemostasis): Faktor-faktor pembekuan plasma diaktifkan secara berantai untuk mengubah fibrinogen menjadi jalinan benang fibrin yang memperkuat dan menstabilkan sumbat trombosit.',
      'Tahap 4 — Resolusi (Fibrinolisis): Setelah dinding pembuluh darah pulih, bekuan fibrin diuraikan secara enzimatik (oleh plasmin) agar aliran darah kembali lancar.'
    ],
    keyTakeaways: [
      'Urutan 4 tahap: 1. Vasokonstriksi → 2. Sumbat Trombosit → 3. Koagulasi → 4. Resolusi',
      'Hemostasis primer = sumbat trombosit; Hemostasis sekunder = bekuan fibrin'
    ],
    practiceQuestion: {
      question: 'Bagaimanakah urutan empat tahapan hemostasis yang benar saat pembuluh darah mengalami cedera?',
      options: [
        'Koagulasi → Vasokonstriksi → Sumbat trombosit → Resolusi',
        'Vasokonstriksi → Sumbat trombosit → Koagulasi → Resolusi',
        'Sumbat trombosit → Vasokonstriksi → Resolusi → Koagulasi',
        'Resolusi → Vasokonstriksi → Sumbat trombosit → Koagulasi'
      ],
      correctIndex: 1,
      explanation: 'Urutan tahapan hemostasis adalah: 1. Vasokonstriksi → 2. Sumbat trombosit → 3. Koagulasi → 4. Resolusi (PDF Hal. 29–30).'
    }
  },
  {
    moduleNumber: 21,
    title: 'Kaskade Koagulasi & Pembentukan Fibrin',
    category: 'Trombosit & Hemostasis',
    pdfPages: [31, 32],
    primaryImagePage: 31,
    secondaryImagePages: [32],
    caption: 'Kaskade Koagulasi (Jalur Ekstrinsik, Intrinsik, dan Bersama) serta Stabilisasi Fibrin (Sumber: PDF ANFIS Darah Hal. 31–32)',
    summary: 'Kaskade koagulasi mengaktifkan faktor pembekuan hingga membentuk kompleks protrombinase yang mengubah protrombin menjadi trombin, lalu fibrinogen menjadi fibrin.',
    detailedContent: [
      'Jalur Ekstrinsik (Extrinsic Pathway): Dipicu oleh cedera jaringan yang melepaskan Tissue Factor (Faktor III) dan mengaktifkan Faktor VII → VIIa.',
      'Jalur Intrinsik (Intrinsic Pathway): Dipicu oleh kontak darah dengan kolagen subendotel yang mengaktifkan Faktor XII → XI → IX beserta kofaktor Faktor VIIIa.',
      'Jalur Bersama (Common Pathway): Kedua jalur bertemu pada aktivasi Faktor X menjadi Faktor Xa. Kompleks protrombinase (Xa + Va + Ca2+ + fosfolipid) mengubah Protrombin (Faktor II) menjadi Trombin (Faktor IIa).',
      'Trombin kemudian mengubah Fibrinogen (Faktor I larut) menjadi monomer Fibrin (Faktor Ia), yang selanjutnya diikat silang oleh Faktor XIIIa menjadi jalinan fibrin stabil (Cross-linked Fibrin Mesh).'
    ],
    keyTakeaways: [
      '01. Paparan faktor jaringan memicu kaskade koagulasi',
      '02. Protrombin (Faktor II) diubah menjadi Trombin (Faktor IIa)',
      '03. Trombin mengubah Fibrinogen (Faktor I) menjadi jalinan Fibrin stabil',
      'Fibrinolisis menguraikan bekuan setelah jaringan pulih'
    ],
    practiceQuestion: {
      question: 'Pada jalur bersama (common pathway) kaskade koagulasi, enzim apakah yang secara langsung mengubah fibrinogen menjadi fibrin?',
      options: ['Protrombin', 'Trombin (Faktor IIa)', 'Faktor Jaringan (Tissue Factor)', 'Plasminogen'],
      correctIndex: 1,
      explanation: 'Protrombin diubah menjadi trombin, lalu trombin mengubah fibrinogen menjadi fibrin (PDF Hal. 31–32).'
    }
  },
  {
    moduleNumber: 22,
    title: 'Sirkulasi Darah & Pertukaran Gas',
    category: 'Sirkulasi & Golongan Darah',
    pdfPages: [33, 34],
    primaryImagePage: 33,
    secondaryImagePages: [34],
    caption: 'Integrasi Sistem Kardiovaskular dan Sistem Hematologi dalam Sirkulasi Paru dan Sistemik (Sumber: PDF ANFIS Darah Hal. 33–34)',
    summary: 'Sistem kardiovaskular dan sistem hematologi bekerja terintegrasi memompa darah melalui sirkulasi paru (pertukaran gas) dan sirkulasi sistemik (distribusi ke jaringan).',
    detailedContent: [
      'Paru-paru: Darah deoksigenasi dari ventrikel kanan dipompa melalui arteri pulmonalis ke kapiler paru untuk melepaskan CO2 dan memperoleh O2.',
      'Jantung: Darah kaya O2 kembali melalui vena pulmonalis ke atrium kiri dan ventrikel kiri, lalu dipompa melalui aorta ke seluruh sirkulasi sistemik.',
      'Jaringan: O2 dan nutrisi disalurkan melalui kapiler sistemik ke sel-sel tubuh, sedangkan CO2 diangkut kembali melalui vena cava superior dan inferior menuju atrium kanan jantung.'
    ],
    keyTakeaways: [
      'Sirkulasi Paru: Ventrikel kanan → Arteri pulmonalis → Paru-paru → Vena pulmonalis → Atrium kiri',
      'Sirkulasi Sistemik: Ventrikel kiri → Aorta → Kapiler jaringan → Vena cava → Atrium kanan',
      'Sistem Kardiovaskular + Sistem Hematologi = Transport Terintegrasi'
    ],
    practiceQuestion: {
      question: 'Pernyataan manakah yang paling tepat mengenai sirkulasi darah dan pertukaran gas?',
      options: [
        'Darah memperoleh O2 di limpa lalu dipompa ke paru-paru',
        'Darah memperoleh O2 dan melepas CO2 di paru-paru, lalu dipompa jantung ke jaringan',
        'Arteri pulmonalis membawa darah kaya O2 dari paru-paru ke atrium kiri',
        'Leukosit mengikat sebagian besar O2 di kapiler paru'
      ],
      correctIndex: 1,
      explanation: 'Di paru-paru darah memperoleh O2 dan melepas CO2, kemudian jantung memompa darah ke jaringan tubuh (PDF Hal. 33–34).'
    }
  },
  {
    moduleNumber: 23,
    title: 'Sistem Golongan Darah ABO',
    category: 'Sirkulasi & Golongan Darah',
    pdfPages: [35, 36],
    primaryImagePage: 36,
    secondaryImagePages: [35],
    caption: 'Antigen Permukaan Eritrosit dan Antibodi Plasma pada Sistem Golongan Darah ABO (Sumber: PDF ANFIS Darah Hal. 35–36)',
    summary: 'Golongan darah ABO ditentukan oleh keberadaan antigen A dan/atau B pada permukaan eritrosit serta antibodi alami (anti-A / anti-B) di dalam plasma.',
    detailedContent: [
      'Golongan A: Memiliki Antigen A pada permukaan eritrosit dan Antibodi Anti-B di dalam plasma.',
      'Golongan B: Memiliki Antigen B pada permukaan eritrosit dan Antibodi Anti-A di dalam plasma.',
      'Golongan AB: Memiliki Antigen A dan Antigen B pada permukaan eritrosit, serta tidak memiliki antibodi Anti-A maupun Anti-B di dalam plasma.',
      'Golongan O: Tidak memiliki Antigen A maupun Antigen B pada permukaan eritrosit, tetapi memiliki Antibodi Anti-A dan Anti-B di dalam plasma.'
    ],
    keyTakeaways: [
      'Golongan A: Antigen A | Antibodi Anti-B',
      'Golongan B: Antigen B | Antibodi Anti-A',
      'Golongan AB: Antigen A & B | Tanpa Anti-A/Anti-B',
      'Golongan O: Tanpa Antigen A/B | Antibodi Anti-A & Anti-B'
    ],
    practiceQuestion: {
      question: 'Seseorang dengan golongan darah B memiliki kombinasi antigen eritrosit dan antibodi plasma...',
      options: [
        'Antigen A di eritrosit dan Anti-B di plasma',
        'Antigen B di eritrosit dan Anti-A di plasma',
        'Antigen A dan B di eritrosit tanpa antibodi plasma',
        'Tanpa antigen A/B di eritrosit dan Anti-A serta Anti-B di plasma'
      ],
      correctIndex: 1,
      explanation: 'Golongan darah B memiliki antigen B pada permukaan eritrosit dan antibodi Anti-A di dalam plasma (PDF Hal. 35–36).'
    }
  },
  {
    moduleNumber: 24,
    title: 'Sistem Golongan Darah Rhesus (Rh)',
    category: 'Sirkulasi & Golongan Darah',
    pdfPages: [35],
    primaryImagePage: 35,
    caption: 'Penentuan Status Rhesus Positif dan Rhesus Negatif Berdasarkan Antigen D (Sumber: PDF ANFIS Darah Hal. 35)',
    summary: 'Status Rhesus (Rh) ditentukan oleh keberadaan antigen D pada permukaan membran eritrosit.',
    detailedContent: [
      'Rh Positif (Rh+): Antigen D terdeteksi (ada) pada permukaan eritrosit.',
      'Rh Negatif (Rh−): Antigen D tidak terdeteksi (tidak ada) pada permukaan eritrosit.',
      'Pemeriksaan golongan darah ABO dan Rhesus wajib dilakukan secara akurat menggunakan antisera standar (Anti-A, Anti-B, dan Anti-D) sebelum tindakan transfusi darah maupun pada pelayanan antenatal.'
    ],
    keyTakeaways: [
      'Rh positif (+): Antigen D ada pada eritrosit',
      'Rh negatif (−): Antigen D tidak ada pada eritrosit'
    ],
    practiceQuestion: {
      question: 'Pada pemeriksaan forward grouping, eritrosit pasien mengalami aglutinasi pada penambahan Anti-A, tidak aglutinasi pada Anti-B, dan tidak aglutinasi pada Anti-D. Apakah golongan darah pasien?',
      options: ['A Rh positif', 'B Rh negatif', 'AB Rh negatif', 'A Rh negatif'],
      correctIndex: 3,
      explanation: 'Anti-A positif = Golongan A; Anti-B negatif; Anti-D negatif = Rh negatif. Jadi golongan darahnya adalah A Rh negatif (PDF Hal. 35).'
    }
  },
  {
    moduleNumber: 25,
    title: 'Pemeriksaan Hitung Darah Lengkap (CBC)',
    category: 'Pemeriksaan Lab & Klinis',
    pdfPages: [37],
    primaryImagePage: 37,
    caption: 'Parameter Utama yang Dinilai pada Hitung Darah Lengkap / Complete Blood Count (Sumber: PDF ANFIS Darah Hal. 37)',
    summary: 'Hitung darah lengkap (CBC) mengevaluasi empat pilar seluler utama: Hemoglobin (Hb), Eritrosit (RBC), Leukosit (WBC), dan Trombosit (PLT).',
    detailedContent: [
      '1. Hemoglobin (Hb): Menilai kapasitas pengangkutan oksigen (O2) dalam darah (satuan g/dL).',
      '2. Eritrosit (RBC) & Hematokrit (Hct): Menilai jumlah sel darah merah (juta/µL), proporsi volume eritrosit (%), serta karakteristik indeks sel darah merah.',
      '3. Leukosit (WBC): Menilai jumlah sel pertahanan tubuh (/µL) beserta hitung jenis leukosit (differential count) untuk mengevaluasi respons infeksi atau inflamasi.',
      '4. Trombosit (PLT): Menilai jumlah komponen hemostasis primer (/µL) untuk mengevaluasi risiko perdarahan atau trombosis.'
    ],
    keyTakeaways: [
      'Hb: Kapasitas pengangkutan O2',
      'Eritrosit: Jumlah dan karakteristik sel darah merah',
      'Leukosit: Jumlah sel pertahanan tubuh',
      'Trombosit: Jumlah komponen hemostasis'
    ],
    practiceQuestion: {
      question: 'Pada pemeriksaan hitung darah lengkap (CBC), parameter apakah yang secara langsung menilai kapasitas pengangkutan oksigen darah?',
      options: ['Trombosit (PLT)', 'Leukosit (WBC)', 'Hemoglobin (Hb)', 'Fibrinogen'],
      correctIndex: 2,
      explanation: 'Hemoglobin (Hb) menilai kapasitas pengangkutan O2 dalam darah (PDF Hal. 37).'
    }
  },
  {
    moduleNumber: 26,
    title: 'Indeks Eritrosit & Retikulosit',
    category: 'Pemeriksaan Lab & Klinis',
    pdfPages: [38, 39, 40],
    primaryImagePage: 38,
    secondaryImagePages: [39, 40],
    caption: 'Indeks Eritrosit (MCV, MCH, MCHC, RDW) dan Peran Retikulosit dalam Evaluasi Anemia (Sumber: PDF ANFIS Darah Hal. 38–40)',
    summary: 'Indeks eritrosit membantu membaca pola morfologi anemia berdasarkan ukuran sel (MCV), bobot Hb per sel (MCH), konsentrasi Hb (MCHC), variasi ukuran (RDW), serta respons sumsum tulang (Retikulosit).',
    detailedContent: [
      'Setelah melihat kadar Hb yang rendah, langkah sistematis berikutnya adalah memeriksa indeks eritrosit: MCV (ukuran rata-rata eritrosit), MCH (jumlah/bobot rata-rata Hb per sel), MCHC (konsentrasi Hb dalam volume eritrosit), dan RDW (variasi ukuran eritrosit / anisositosis).',
      'Retikulosit (eritrosit muda yang masih mengandung sisa RNA ribosom basofilik selama 1–2 hari di darah tepi) sangat penting untuk menilai respons produksi eritrosit oleh sumsum tulang (membedakan anemia hipoproliferatif dari hemolisis/perdarahan akut).'
    ],
    keyTakeaways: [
      'MCV = Size (ukuran/volume sel)',
      'MCH = Amount of Hb (bobot Hb per sel)',
      'MCHC = Concentration of Hb (konsentrasi/warna Hb dalam sel)',
      'Retikulosit = Respons produksi eritrosit oleh sumsum tulang'
    ],
    formulas: [
      { name: 'MCV', formula: '(Hematokrit (%) × 10) / RBC (juta/µL)', unit: 'fL', normalRange: '80 – 100 fL' },
      { name: 'MCH', formula: '(Hb (g/dL) × 10) / RBC (juta/µL)', unit: 'pg', normalRange: '27 – 33 pg' },
      { name: 'MCHC', formula: '(Hb (g/dL) × 100) / Hematokrit (%)', unit: 'g/dL', normalRange: '32 – 36 g/dL' }
    ],
    practiceQuestion: {
      question: 'Pemeriksaan laboratorium apakah yang digunakan untuk menilai respons produksi eritrosit baru oleh sumsum tulang?',
      options: ['RDW', 'Hitung Retikulosit', 'Kadar Albumin', 'Waktu Protrombin (PT)'],
      correctIndex: 1,
      explanation: 'Retikulosit membantu menilai respons produksi eritrosit oleh sumsum tulang (PDF Hal. 38).'
    }
  },
  {
    moduleNumber: 27,
    title: 'MCV (Mean Corpuscular Volume)',
    category: 'Pemeriksaan Lab & Klinis',
    pdfPages: [38, 39, 40],
    primaryImagePage: 39,
    secondaryImagePages: [38, 40],
    caption: 'Rumus, Satuan, dan Klasifikasi Klinis MCV (Sumber: PDF ANFIS Darah Hal. 38–40)',
    summary: 'MCV mengukur volume atau ukuran rata-rata satu sel darah merah dalam satuan femtoliter (fL), mengelompokkan eritrosit menjadi mikrositik, normositik, atau makrositik.',
    detailedContent: [
      'Rumus MCV (fL) = [Hematokrit (%) × 10] / Jumlah RBC (juta/µL).',
      'Rentang rujukan dewasa umum: 80 – 100 fL.',
      'MCV < 80 fL disebut Mikrositik (ukuran sel kecil), lazim ditemukan pada anemia defisiensi besi dan talasemia.',
      'MCV 80 – 100 fL disebut Normositik (ukuran sel normal), lazim pada perdarahan akut, penyakit kronis awal, atau hemolisis.',
      'MCV > 100 fL disebut Makrositik (ukuran sel besar), lazim ditemukan pada anemia megaloblastik akibat defisiensi vitamin B12 atau asam folat.'
    ],
    keyTakeaways: [
      'Rumus: MCV = (Hct × 10) / RBC',
      '< 80 fL = Mikrositik | 80–100 fL = Normositik | > 100 fL = Makrositik'
    ],
    formulas: [
      { name: 'MCV', formula: '(Hematokrit (%) × 10) / RBC (juta/µL)', unit: 'fL', normalRange: '80 – 100 fL' }
    ],
    practiceQuestion: {
      question: 'Seorang pasien memiliki Hematokrit 28,8% dan RBC 4,0 juta/µL. Berapakah nilai MCV dan klasifikasinya?',
      options: ['62 fL — mikrositik', '72 fL — mikrositik', '80 fL — normositik', '96 fL — normositik'],
      correctIndex: 1,
      explanation: 'MCV = (28,8 × 10) / 4,0 = 288 / 4,0 = 72 fL. Karena < 80 fL, diklasifikasikan sebagai mikrositik (PDF Hal. 38–40).'
    }
  },
  {
    moduleNumber: 28,
    title: 'MCH (Mean Corpuscular Hemoglobin)',
    category: 'Pemeriksaan Lab & Klinis',
    pdfPages: [39, 40],
    primaryImagePage: 39,
    secondaryImagePages: [40],
    caption: 'Rumus dan Interpretasi MCH / Mean Corpuscular Hemoglobin (Sumber: PDF ANFIS Darah Hal. 39–40)',
    summary: 'MCH mengukur bobot atau massa rata-rata hemoglobin di dalam satu sel darah merah dalam satuan pikogram (pg).',
    detailedContent: [
      'Rumus MCH (pg) = [Hemoglobin (g/dL) × 10] / Jumlah RBC (juta/µL).',
      'Rentang rujukan dewasa umum: 27 – 33 pg.',
      'Nilai MCH rendah (< 27 pg) biasanya sejalan dengan MCV rendah (mikrositik) dan hipokromia karena sel yang lebih kecil memuat jumlah hemoglobin yang lebih sedikit.',
      'Nilai MCH tinggi (> 33 pg) sering mengikuti peningkatan volume sel pada makrositosis.'
    ],
    keyTakeaways: [
      'Rumus: MCH = (Hb × 10) / RBC',
      'Satuan: pikogram (pg)',
      'Rentang umum: 27 – 33 pg'
    ],
    formulas: [
      { name: 'MCH', formula: '(Hb (g/dL) × 10) / RBC (juta/µL)', unit: 'pg', normalRange: '27 – 33 pg' }
    ],
    practiceQuestion: {
      question: 'Hasil CBC menunjukkan Hb 8,4 g/dL dan RBC 3,5 juta/µL. Berapakah nilai MCH pasien?',
      options: ['20 pg', '24 pg', '27 pg', '30 pg'],
      correctIndex: 1,
      explanation: 'MCH = (8,4 × 10) / 3,5 = 84 / 3,5 = 24 pg (PDF Hal. 39–40).'
    }
  },
  {
    moduleNumber: 29,
    title: 'MCHC (Mean Corpuscular Hemoglobin Concentration)',
    category: 'Pemeriksaan Lab & Klinis',
    pdfPages: [38, 39, 40],
    primaryImagePage: 40,
    secondaryImagePages: [38, 39],
    caption: 'Rumus dan Interpretasi MCHC dalam Menilai Pola Hipokromik vs Normokromik (Sumber: PDF ANFIS Darah Hal. 38–40)',
    summary: 'MCHC mengukur konsentrasi rata-rata hemoglobin per satuan volume eritrosit dalam satuan g/dL (rentang umum 32–36 g/dL).',
    detailedContent: [
      'Rumus MCHC (g/dL) = [Hemoglobin (g/dL) × 100] / Hematokrit (%).',
      'Rentang rujukan dewasa umum: 32 – 36 g/dL.',
      'MCHC rendah (< 32 g/dL) mendukung pola Hipokromik (sel tampak lebih pucat dengan area central pallor melebar > 1/3 diameter sel, seperti pada defisiensi besi).',
      'MCHC dalam rentang 32 – 36 g/dL menunjukkan pola Normokromik.',
      'MCHC meningkat (> 36 g/dL) jarang terjadi secara fisiologis kecuali pada sferositosis herediter atau adanya interferensi analitik (aglutinasi dingin, lipemia, hemolisis in-vitro) yang wajib diverifikasi oleh ATLM.'
    ],
    keyTakeaways: [
      'Rumus: MCHC = (Hb × 100) / Hct',
      'Satuan: g/dL | Rentang umum: 32 – 36 g/dL',
      'Nilai rendah mendukung pola hipokromik'
    ],
    formulas: [
      { name: 'MCHC', formula: '(Hb (g/dL) × 100) / Hematokrit (%)', unit: 'g/dL', normalRange: '32 – 36 g/dL' }
    ],
    practiceQuestion: {
      question: 'Seorang pasien memiliki Hb 9,6 g/dL dan Hematokrit 30%. Berapakah nilai MCHC pasien?',
      options: ['28 g/dL', '30 g/dL', '32 g/dL', '36 g/dL'],
      correctIndex: 2,
      explanation: 'MCHC = (9,6 × 100) / 30 = 960 / 30 = 32 g/dL (PDF Hal. 39–40).'
    }
  },
  {
    moduleNumber: 30,
    title: 'RDW (Red Cell Distribution Width)',
    category: 'Pemeriksaan Lab & Klinis',
    pdfPages: [38, 40],
    primaryImagePage: 38,
    secondaryImagePages: [40],
    caption: 'Parameter RDW untuk Mengukur Variasi Ukuran Eritrosit / Anisositosis (Sumber: PDF ANFIS Darah Hal. 38 & 40)',
    summary: 'RDW mengukur derajat variasi ukuran eritrosit (anisositosis); peningkatan RDW menunjukkan perbedaan ukuran sel darah merah yang semakin lebar.',
    detailedContent: [
      'Rumus RDW-CV (%) = (Standar Deviasi Volume Eritrosit / MCV) × 100.',
      'Rentang rujukan dewasa umum pada infografik (Hal. 40): 11,5 – 14,5%.',
      'Peningkatan RDW menandakan adanya populasi eritrosit dengan ukuran yang bervariasi (anisositosis), misalnya pada anemia defisiensi besi yang sedang berkembang atau pasca-terapi nutrisi, sedangkan pada trait talasemia tanpa komplikasi nilai RDW sering kali normal atau hampir normal.'
    ],
    keyTakeaways: [
      'RDW menilai variasi ukuran eritrosit (anisositosis)',
      'Rentang rujukan umum RDW-CV: 11,5 – 14,5%'
    ],
    formulas: [
      { name: 'RDW-CV', formula: '(SD of RBC Volume / MCV) × 100', unit: '%', normalRange: '11,5 – 14,5%' }
    ],
    practiceQuestion: {
      question: 'Parameter indeks eritrosit manakah yang secara spesifik menggambarkan variasi ukuran eritrosit (anisositosis)?',
      options: ['MCV', 'MCH', 'MCHC', 'RDW'],
      correctIndex: 3,
      explanation: 'RDW (Red Cell Distribution Width) mengukur variasi ukuran eritrosit (PDF Hal. 38 & 40).'
    }
  },
  {
    moduleNumber: 31,
    title: 'Anemia & Ambang Hemoglobin WHO 2024',
    category: 'Pemeriksaan Lab & Klinis',
    pdfPages: [41, 43],
    primaryImagePage: 41,
    secondaryImagePages: [43],
    caption: 'Ambang Hemoglobin untuk Definisi Anemia Berdasarkan Pedoman WHO 2024 (Sumber: PDF ANFIS Darah Hal. 41 & 43)',
    summary: 'Menurut pedoman WHO 2024, ambang Hb untuk anemia adalah <13,0 g/dL pada pria dewasa, <12,0 g/dL pada wanita tidak hamil, dan <10,5 g/dL pada kehamilan trimester II.',
    detailedContent: [
      'Anemia didefinisikan sebagai penurunan kadar hemoglobin di bawah ambang rujukan sesuai usia, jenis kelamin, dan status kehamilan sehingga kapasitas pengangkutan oksigen darah menurun.',
      'Berdasarkan Pedoman WHO 2024 (Hal. 41):',
      '• Pria Dewasa: Anemia bila Hb < 13,0 g/dL.',
      '• Wanita Tidak Hamil: Anemia bila Hb < 12,0 g/dL.',
      '• Ibu Hamil Trimester I dan III: Anemia bila Hb < 11,0 g/dL.',
      '• Ibu Hamil Trimester II: Anemia bila Hb < 10,5 g/dL (lebih rendah karena hemodilusi fisiologis kehamilan).',
      'Penting: Memenuhi ambang Hb untuk anemia baru merupakan langkah awal; penetapan penyebab (etiologi) wajib dilengkapi evaluasi indeks eritrosit, apusan darah, status besi, dan penilaian klinis dokter.'
    ],
    keyTakeaways: [
      'Pria dewasa: Hb < 13,0 g/dL',
      'Wanita tidak hamil: Hb < 12,0 g/dL',
      'Hamil Trimester II: Hb < 10,5 g/dL',
      'Hamil Trimester I & III: Hb < 11,0 g/dL'
    ],
    practiceQuestion: {
      question: 'Berdasarkan pedoman WHO 2024 pada materi perkuliahan, berapakah ambang kadar hemoglobin untuk menyatakan anemia pada ibu hamil trimester II?',
      options: ['< 13,0 g/dL', '< 12,0 g/dL', '< 11,0 g/dL', '< 10,5 g/dL'],
      correctIndex: 3,
      explanation: 'Ambang Hb anemia menurut WHO 2024 untuk kehamilan trimester II adalah < 10,5 g/dL, sedangkan trimester I dan III adalah < 11,0 g/dL (PDF Hal. 41).'
    }
  },
  {
    moduleNumber: 32,
    title: 'Leukemia: Keganasan Sel Pembentuk Darah',
    category: 'Pemeriksaan Lab & Klinis',
    pdfPages: [43],
    primaryImagePage: 43,
    caption: 'Relevansi Klinis: Leukemia dan Kelompok Gangguan Sistem Hematologi (Sumber: PDF ANFIS Darah Hal. 43)',
    summary: 'Leukemia merupakan keganasan hematologis yang melibatkan proliferasi tidak terkendali dari sel pembentuk darah di sumsum tulang.',
    detailedContent: [
      'Leukemia terjadi ketika sel prekursor hematopoietik (mieloid maupun limfoid) mengalami transformasi ganas dan proliferasi klonal yang menekan produksi sel darah normal di sumsum tulang.',
      'Akibat infiltrasi sumsum tulang, pasien leukemia sering mengalami sitopenia (anemia, trombositopenia, dan neutropenia fungsional) yang bermanifestasi sebagai pucat, kelelahan, perdarahan mukosa/petekie, serta demam atau infeksi berulang.',
      'Di laboratorium, pemeriksaan CBC dan apusan darah tepi berperan penting mendeteksi keberadaan sel blas atau leukosit abnormal untuk segera dilaporkan kepada dokter spesialis.'
    ],
    keyTakeaways: [
      'Keganasan yang melibatkan sel pembentuk darah di sumsum tulang',
      'Dapat mengganggu produksi eritrosit, trombosit, dan leukosit matur normal'
    ],
    practiceQuestion: {
      question: 'Kelainan sistem hematologi yang ditandai oleh keganasan pada sel pembentuk darah disebut...',
      options: ['Trombositopenia', 'Anemia mikrositik', 'Leukemia', 'Hemofilia'],
      correctIndex: 2,
      explanation: 'Leukemia adalah keganasan yang melibatkan sel pembentuk darah (PDF Hal. 43).'
    }
  },
  {
    moduleNumber: 33,
    title: 'Trombositopenia & Risiko Perdarahan',
    category: 'Pemeriksaan Lab & Klinis',
    pdfPages: [26, 43],
    primaryImagePage: 43,
    secondaryImagePages: [26],
    caption: 'Trombositopenia dan Implikasinya pada Hemostasis Primer (Sumber: PDF ANFIS Darah Hal. 26 & 43)',
    summary: 'Trombositopenia adalah penurunan jumlah trombosit di bawah batas rujukan (<150.000/µL) yang meningkatkan risiko perdarahan kulit dan mukosa.',
    detailedContent: [
      'Karena trombosit merupakan komponen utama pembentukan sumbat hemostasis primer, penurunan jumlah trombosit (trombositopenia) menyebabkan gangguan penghentian awal perdarahan pada kapiler dan pembuluh darah kecil.',
      'Manifestasi klinis khas trombositopenia meliputi petekie (bintik perdarahan kecil di kulit), purpura, ekimosis (memar), epistaksis (mimisan), dan perdarahan gusi.',
      'ATLM wajib memverifikasi hasil trombosit rendah dengan memeriksa kondisi sampel (menyingkirkan bekuan mikro atau pseudotrombositopenia akibat penggumpalan EDTA pada apusan darah tepi) sebelum melaporkan hasil kritis kepada dokter.'
    ],
    keyTakeaways: [
      'Trombositopenia: Jumlah trombosit menurun (< 150.000 /µL)',
      'Mengganggu pembentukan sumbat trombosit (hemostasis primer)',
      'Meningkatkan risiko perdarahan mukokutan (petekie, gusi berdarah)'
    ],
    practiceQuestion: {
      question: 'Seorang pasien datang dengan petekie dan gusi berdarah, dengan hasil trombosit 48.000/µL. Tahap hemostasis manakah yang paling langsung terganggu?',
      options: ['Fibrinolisis akhir', 'Pembentukan sumbat trombosit awal (hemostasis primer)', 'Sintesis albumin di hati', 'Transportasi oksigen oleh hemoglobin'],
      correctIndex: 1,
      explanation: 'Trombositopenia mengganggu pembentukan sumbat trombosit pada hemostasis primer (PDF Hal. 26, 29, 43).'
    }
  },
  {
    moduleNumber: 34,
    title: 'Gangguan Koagulasi',
    category: 'Pemeriksaan Lab & Klinis',
    pdfPages: [31, 32, 43],
    primaryImagePage: 32,
    secondaryImagePages: [31, 43],
    caption: 'Gangguan Koagulasi pada Jalur Pembentukan dan Pengaturan Bekuan Fibrin (Sumber: PDF ANFIS Darah Hal. 31–32 & 43)',
    summary: 'Gangguan koagulasi terjadi akibat kelainan proses pembentukan, stabilisasi, atau pengaturan bekuan fibrin pada hemostasis sekunder.',
    detailedContent: [
      'Gangguan koagulasi melibatkan defisiensi atau disfungsi faktor-faktor pembekuan plasma, baik yang bersifat herediter (seperti Hemofilia A akibat defisiensi Faktor VIII, Hemofilia B akibat defisiensi Faktor IX, atau penyakit von Willebrand) maupun didapat (seperti penyakit hati, defisiensi vitamin K, penggunaan antikoagulan, atau DIC).',
      'Berbeda dengan gangguan trombosit yang umumnya menimbulkan petekie superfisial, gangguan faktor koagulasi sekunder tidak mampu membentuk jalinan fibrin yang stabil sehingga sering menyebabkan perdarahan jaringan dalam seperti hemartrosis (perdarahan sendi) atau hematoma otot.',
      'Pemeriksaan laboratorium koagulasi meliputi PT (Prothrombin Time / INR) untuk menilai jalur ekstrinsik dan bersama, aPTT (activated Partial Thromboplastin Time) untuk menilai jalur intrinsik dan bersama, serta kadar fibrinogen dan D-dimer.'
    ],
    keyTakeaways: [
      'Kelainan pembentukan atau pengaturan bekuan fibrin (hemostasis sekunder)',
      'Dievaluasi melalui pemeriksaan PT/INR, aPTT, fibrinogen, dan faktor koagulasi'
    ],
    practiceQuestion: {
      question: 'Kelainan pada proses perubahan fibrinogen menjadi jalinan fibrin stabil tergolong dalam kelompok...',
      options: ['Anemia aplastik', 'Gangguan koagulasi (hemostasis sekunder)', 'Leukositosis reaktif', 'Inkompatibilitas ABO'],
      correctIndex: 1,
      explanation: 'Gangguan koagulasi adalah kelainan proses pembentukan atau pengaturan bekuan fibrin (PDF Hal. 31 & 43).'
    }
  },
  {
    moduleNumber: 35,
    title: 'Studi Kasus & Penerapan Klinis Terintegrasi',
    category: 'Pemeriksaan Lab & Klinis',
    pdfPages: [42, 44, 45, 46, 47],
    primaryImagePage: 42,
    secondaryImagePages: [44, 45, 46, 47],
    caption: 'Studi Kasus Ilustratif Membaca Hasil Laboratorium dan Intisari Sistem Hematologi (Sumber: PDF ANFIS Darah Hal. 42–47)',
    summary: 'Integrasi anamnesis, pemeriksaan fisik, dan pembacaan sistematis hasil CBC (Hb, MCV, Ferritin) pada kasus anemia mikrositik serta empat konsep inti hematologi.',
    detailedContent: [
      'Studi Kasus Ilustratif (Hal. 42): Seorang perempuan berusia 24 tahun datang dengan keluhan mudah lelah dan pusing.',
      'Hasil Laboratorium: Hb = 9,5 g/dL (di bawah ambang WHO 2024 wanita tidak hamil <12,0 g/dL → Anemia), MCV = 72 fL (di bawah 80 fL → Mikrositik), dan Ferritin = 8 ng/mL (rendah, menunjukkan cadangan besi tubuh menurun).',
      'Kesimpulan Klinis: Pola laboratorium mengarah ke anemia mikrositik dengan defisiensi besi yang memerlukan evaluasi penyebab kehilangan darah atau asupan nutrisi oleh dokter.',
      'Empat Konsep Inti yang Perlu Diingat (Hal. 44): (01) Darah sebagai media transport, pertahanan, dan regulasi; (02) Sumsum Tulang sebagai tempat utama pembentukan sel darah; (03) Sel Darah (eritrosit, leukosit, trombosit) memiliki fungsi spesifik berbeda; (04) Hemostasis melibatkan kerja sama trombosit dan koagulasi dalam mengendalikan perdarahan.'
    ],
    keyTakeaways: [
      'Kasus Perempuan 24 thn: Hb 9,5 g/dL + MCV 72 fL + Ferritin 8 ng/mL → Pola anemia mikrositik',
      'Satu angka laboratorium tidak pernah berdiri sendiri; selalu integrasikan dengan konteks klinis',
      'Keputusan diagnosis etiologis dan terapi merupakan kewenangan dokter'
    ],
    practiceQuestion: {
      question: 'Pada studi kasus perempuan 24 tahun dengan keluhan mudah lelah, hasil Hb 9,5 g/dL, MCV 72 fL, dan ferritin 8 ng/mL menunjukkan pola...',
      options: [
        'Polisitemia normositik',
        'Anemia makrositik hiperkromik',
        'Anemia mikrositik yang memerlukan evaluasi penyebab defisiensi besi',
        'Leukemia akut dengan trombositosis'
      ],
      correctIndex: 2,
      explanation: 'Hb 9,5 g/dL (<12,0 g/dL) menunjukkan anemia, MCV 72 fL (<80 fL) menunjukkan mikrositik, dan ferritin 8 ng/mL mendukung evaluasi defisiensi besi (PDF Hal. 42).'
    }
  }
];
