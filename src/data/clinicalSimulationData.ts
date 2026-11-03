export interface LabEquipmentItem {
  id: string;
  name: string;
  indonesianName: string;
  category: string;
  position: [number, number, number];
  color: string;
  functionSummary: string;
  operatingPrinciple: string;
  atlmSOP: string[];
  clinicalApplication: string;
  pdfPageRef: number;
}

export interface NpcCharacterData {
  id: string;
  name: string;
  role: 'doctor' | 'specialist' | 'nurse' | 'patient' | 'staff';
  title: string;
  zone: string;
  position: [number, number, number];
  coatColor: string;
  scrubColor: string;
  hairColor: string;
  dialogues: {
    id: string;
    en: string;
    topic: string;
  }[];
}

export interface ClinicalSimulationCase {
  id: string;
  title: string;
  patientName: string;
  ageGender: string;
  chiefComplaint: string;
  anamnesis: string;
  physicalExam: {
    bp: string;
    hr: string;
    rr: string;
    temp: string;
    conjunctiva: string;
    spleenLiver: string;
  };
  specimenInfo: {
    tubeType: string;
    anticoagulant: string;
    volumeStatus: string;
    visualPlasma: string;
  };
  rawLabData: {
    hb: number;
    hct: number;
    rbc: number;
    wbc: number;
    plt: number;
    reticulocyte: number;
    ferritin?: number;
    bloodType: string;
  };
  expectedIndices: {
    mcv: number;
    mch: number;
    mchc: number;
    morphologyClassification: string;
  };
  smearFindings: string;
  atlmValidationNote: string;
  doctorInterpretation: string;
  patientEducation: string;
  therapyPlan: string;
  pdfPageRef: number;
}

export const LAB_EQUIPMENT_3D_ITEMS: LabEquipmentItem[] = [
  {
    id: 'hematology_analyzer',
    name: 'Automated 5-Diff Hematology Analyzer XN-9000',
    indonesianName: 'Alat Hematology Analyzer Otomatis 5-Diff',
    category: 'Instrumen Utama Analitik',
    position: [-8, 0, -6],
    color: '#0284c7',
    functionSummary:
      'Menghitung otomatis kadar Hb, Hct, jumlah Eritrosit, Leukosit (5-Diff), Trombosit, Retikulosit, serta indeks eritrosit (MCV, MCH, MCHC, RDW) dalam waktu < 60 detik.',
    operatingPrinciple:
      'Mengombinasikan metode Electrical Impedance (Coulter Principle) untuk menghitung ukuran/jumlah sel, Spectrophotometry Cyanmethemoglobin/SLS-Hb untuk kadar Hb, dan Fluorescence Flow Cytometry menggunakan sinar laser semikonduktor untuk membedakan 5 jenis leukosit serta retikulosit.',
    atlmSOP: [
      'Pastikan kontrol mutu internal (QC 3 level: Low, Normal, High) masuk dalam rentang ±2 SD grafik Levey-Jennings sebelum memeriksa sampel pasien.',
      'Homogenisasikan tabung K2EDTA secara inversi lembut 8–10 kali (jangan dikocok keras agar tidak hemolisis).',
      'Periksa tidak ada bekuan mikro (microclot) yang dapat menyumbat aperture probe.',
      'Perhatikan munculnya bendera peringatan (flagging) pada histogram RBC, WBC, atau PLT dan konfirmasi dengan Sediaan Apus Darah Tepi.',
    ],
    clinicalApplication:
      'Pemeriksaan Complete Blood Count (CBC) rutin, skrining anemia, pemantauan trombositopenia DBD, dan deteksi dini keganasan hematologi.',
    pdfPageRef: 6,
  },
  {
    id: 'digital_microscope',
    name: 'Binocular Digital Light Microscope Olympus CX43',
    indonesianName: 'Mikroskop Cahaya Binokuler & Kamera Digital SADT',
    category: 'Evaluasi Morfologi Seluler',
    position: [-4, 0, -6],
    color: '#0f766e',
    functionSummary:
      'Mengamati morfologi Sediaan Apus Darah Tepi (SADT): evaluasi 3S eritrosit (Size, Shape, Staining), hitung jenis leukosit manual, identifikasi sel muda/blas, dan estimasi jumlah trombosit.',
    operatingPrinciple:
      'Menggunakan lensa objektif perbesaran 10x (orientasi zona baca monolayer), 40x (estimasi leukosit & morfologi umum), dan 100x dengan minyak imersi (oil immersion) untuk detail granula sitoplasma, kromatin inti, dan central pallor eritrosit.',
    atlmSOP: [
      'Cari zona baca ideal (counting area / monolayer) di mana eritrosit tersebar merata dan tidak saling bertumpuk (rouleaux).',
      'Teteskan 1 tetes minyak imersi sebelum memutar lensa objektif 100x.',
      'Lakukan hitung jenis 100 sel leukosit dengan pola zig-zag (battlement track).',
      'Bersihkan lensa objektif 100x dengan tisu lensa setelah selesai digunakan.',
    ],
    clinicalApplication:
      'Konfirmasi emas (gold standard) mikrositik hipokromik, makrositik ovalosit, neutrofil hipersegmentasi, sel target, sferosit, dan clumping trombosit.',
    pdfPageRef: 13,
  },
  {
    id: 'centrifuge',
    name: 'Clinical Blood Centrifuge & Microhematocrit Rotor',
    indonesianName: 'Sentrifus Klinis Pemisah Plasma & Mikrohematokrit',
    category: 'Pemisahan Komponen Darah',
    position: [0, 0, -6],
    color: '#4f46e5',
    functionSummary:
      'Memisahkan sampel darah utuh berdasarkan berat jenis menjadi 3 lapisan: Plasma Darah (atas, ~55%), Buffy Coat (tengah, <1% berisi leukosit & trombosit), dan Eritrosit Pekat / Hematokrit (bawah, ~45%).',
    operatingPrinciple:
      'Gaya sentrifugal relatif (RCF) mendorong komponen seluler berdensitas tinggi (eritrosit mengandung hemoglobin & besi) ke dasar tabung, sementara plasma berada di lapisan supernatan.',
    atlmSOP: [
      'Seimbangkan beban tabung secara simetris berhadapan (balance tube) sebelum memutar rotor.',
      'Pastikan tutup sentrifus terkunci rapat dan atur kecepatan (RPM) serta waktu sesuai protokol (misal 3000 RPM selama 10–15 menit untuk plasma/serum).',
      'Amati warna plasma supernatan: normal kuning jerami jernih; merah muda menandakan hemolisis; putih susu menandakan lipemia; kuning pekat menandakan ikterik.',
    ],
    clinicalApplication:
      'Pengukuran nilai Hematokrit manual (PCV), persiapan plasma sitrat untuk pemeriksaan hemostasis (PT/APTT), dan pemisahan serum untuk panel besi.',
    pdfPageRef: 5,
  },
  {
    id: 'blood_cell_counter',
    name: 'Differential Blood Cell Counter 8-Key Tally',
    indonesianName: 'Alat Hitung Jenis Leukosit Manual (Diff Counter)',
    category: 'Evaluasi Morfologi Seluler',
    position: [4, 0, -6],
    color: '#0369a1',
    functionSummary:
      'Mencatat proporsi persentase 6 subpopulasi leukosit (Basofil, Eosinofil, Neutrofil Batang, Neutrofil Segmen, Limfosit, Monosit) saat pengamatan mikroskopis hingga mengunci otomatis pada total 100 sel.',
    operatingPrinciple:
      'Mekanisme pencacah mekanik/digital multi-kanal dengan bel peringatan otomatis setiap kelipatan 100 sel yang dihitung oleh ATLM.',
    atlmSOP: [
      'Nol-kan (reset) seluruh kanal angka sebelum memulai pembacaan preparat baru.',
      'Tekan tombol sesuai sel yang teridentifikasi di lapang pandang objektif 100x.',
      'Bila ditemukan eritroblas berinti (NRBC > 5 per 100 WBC), lakukan koreksi jumlah leukosit total.',
    ],
    clinicalApplication:
      'Menentukan adanya Neutrofilia (infeksi bakteri), Eosinofilia (alergi/parasit), Basofilia, Limfositosis (infeksi virus), atau pergeseran ke kiri (Shift to the Left).',
    pdfPageRef: 27,
  },
  {
    id: 'blood_smear_station',
    name: 'Peripheral Blood Smear & Romanowsky Staining Station',
    indonesianName: 'Meja Pembuatan & Pewarnaan Sediaan Apus Darah Tepi (SADT)',
    category: 'Preparasi Spesimen',
    position: [8, 0, -6],
    color: '#7c3aed',
    functionSummary:
      'Membuat apusan darah tipis berbentuk lidah api pada kaca objek dan mewarnainya dengan pewarnaan polikromatik Wright-Giemsa.',
    operatingPrinciple:
      'Zat warna basa (Methylene Blue / Azure B) mewarnai komponen asam sel (DNA inti dan RNA sitoplasma) menjadi biru-ungu, sedangkan zat warna asam (Eosin Y) mewarnai komponen basa (hemoglobin dan granula eosinofil) menjadi merah-oranye.',
    atlmSOP: [
      'Teteskan 1 tetes kecil darah EDTA (±1 cm dari ujung label kaca objek).',
      'Letakkan kaca penghapus (spreader slide) dengan sudut 30°–45°, tarik mundur hingga darah menyebar di tepi kaca, lalu dorong maju secara halus dan konsisten.',
      'Keringkan di udara, fiksasi dengan metanol absolut, lalu genangi larutan Wright/Giemsa dan buffer pH 6,8.',
    ],
    clinicalApplication:
      'Pewarnaan retikulosit (New Methylene Blue supravital) dan apusan darah tepi rutin.',
    pdfPageRef: 27,
  },
  {
    id: 'edta_tubes_rack',
    name: 'Vacutainer Specimen Rack (EDTA, Citrate, Plain SST)',
    indonesianName: 'Rak Tabung Vakum Spesimen Darah (Tutup Ungu, Biru, Merah)',
    category: 'Manajemen Pra-Analitik',
    position: [-8, 0, 2],
    color: '#9333ea',
    functionSummary:
      'Menyimpan dan mengorganisasikan tabung sampel darah vena sesuai jenis aditif antikoagulan dan urutan pengambilan darah (Order of Draw).',
    operatingPrinciple:
      'Tabung Tutup Ungu (K2EDTA/K3EDTA) mengikat ion Ca2+ untuk CBC rutin; Tabung Tutup Biru Muda (Natrium Sitrat 3,2% rasio 9:1) mengikat Ca2+ secara reversibel untuk koagulasi PT/APTT; Tabung Tutup Merah/Kuning (Tanpa antikoagulan / Clot Activator) untuk memanen serum.',
    atlmSOP: [
      'Cocokkan minimal 2 identitas pasien (Nama lengkap, NPM/No. RM, Tanggal Lahir) pada label tabung sebelum analitik.',
      'Pastikan volume darah mencapai garis batas (fill line) agar rasio darah:antikoagulan presisi.',
      'Tolak spesimen yang mengalami pembekuan (clotted) untuk pemeriksaan hematologi atau hemolisis berat.',
    ],
    clinicalApplication:
      'Menjamin akurasi pra-analitik agar tidak terjadi artefak MCV/MCHC palsu akibat underfilling EDTA.',
    pdfPageRef: 34,
  },
  {
    id: 'reagent_cabinet',
    name: 'Immunohematology ABO/Rh Antisera & Reagent Cabinet',
    indonesianName: 'Lemari Reagen Antisera Golongan Darah ABO & Rhesus',
    category: 'Imunohematologi & Reagensia',
    position: [-4, 0, 2],
    color: '#0284c7',
    functionSummary:
      'Menyimpan reagen monoklonal Anti-A (warna biru), Anti-B (warna kuning), Anti-AB (bening/merah muda), dan Anti-D IgM/IgG untuk pemeriksaan golongan darah ABO dan faktor Rhesus.',
    operatingPrinciple:
      'Reaksi hemaglutinasi langsung antara antibodi monoklonal spesifik dalam reagen dengan isoantigen glikolipid A, B, atau antigen D pada permukaan membran eritrosit.',
    atlmSOP: [
      'Biarkan reagen mencapai suhu ruang sebelum diteteskan pada kartu/bioplate golongan darah.',
      'Teteskan 1 tetes suspensi eritrosit pasien dan 1 tetes antisera, lalu goyangkan perlahan selama 1–2 menit.',
      'Amati ada tidaknya gumpalan (aglutinasi) secara makroskopis dan konfirmasi mikroskopis bila meragukan.',
    ],
    clinicalApplication:
      'Penentuan golongan darah ABO/Rh pra-transfusi dan skrining risiko inkompatibilitas Rhesus (HDN / Eritroblastosis Fetalis).',
    pdfPageRef: 42,
  },
  {
    id: 'blood_refrigerator',
    name: 'Medical Blood Bank Refrigerator (2°C – 6°C)',
    indonesianName: 'Pendingin Bank Darah Medis Berpemantau Suhu (2°C – 6°C)',
    category: 'Penyimpanan Komponen Darah',
    position: [0, 0, 2],
    color: '#dc2626',
    functionSummary:
      'Menyimpan kantong komponen eritrosit pekat (Packed Red Cells / PRC) dan Whole Blood pada suhu ketat 2°C hingga 6°C untuk menjaga viabilitas eritrosit dan kadar 2,3-BPG.',
    operatingPrinciple:
      'Sistem pendingin konveksi paksa dengan alarm suhu otomatis yang mencegah pembekuan eritrosit (yang memicu lisis membran) sekaligus menghambat pertumbuhan bakteri.',
    atlmSOP: [
      'Catat suhu lemari pendingin setiap shift (harus terjaga di 2°C – 6°C).',
      'Pisahkan kantong darah berdasarkan golongan ABO (O, A, B, AB) dan status Rhesus (Rh+ / Rh-).',
      'Lakukan inspeksi visual kantong darah terhadap perubahan warna plasma (tanda hemolisis atau kontaminasi bakteri) sebelum diserahkan.',
    ],
    clinicalApplication:
      'Pelayanan transfusi darah aman bagi pasien anemia berat (Hb < 7,0 g/dL) atau perdarahan akut masif.',
    pdfPageRef: 44,
  },
  {
    id: 'lis_computer',
    name: 'Laboratory Information System (LIS) Validation Terminal',
    indonesianName: 'Komputer Sistem Informasi Laboratorium (LIS) & Validasi ATLM',
    category: 'Pasca-Analitik & Pelaporan',
    position: [4, 0, 2],
    color: '#2563eb',
    functionSummary:
      'Menerima transmisi data otomatis dari Hematology Analyzer, memverifikasi konsistensi Rule of Three (Hb × 3 ≈ Hct ± 3), menghitung indeks eritrosit, dan mengirimkan laporan tervalidasi ke ruang dokter.',
    operatingPrinciple:
      'Integrasi dua arah (bidirectional interface) HL7 antara instrumen laboratorium dengan rekam medis elektronik rumah sakit.',
    atlmSOP: [
      'Periksa delta check (perbandingan hasil saat ini dengan riwayat pemeriksaan pasien sebelumnya).',
      'Verifikasi konsistensi nilai Hb, Hct, dan RBC serta periksa adanya nilai kritis (Critical Value: misal Hb < 7,0 g/dL atau Trombosit < 20.000/µL).',
      'Segera laporkan nilai kritis kepada Dokter Penanggung Jawab Pelayanan (DPJP) dan dokumentasikan waktu pelaporan.',
    ],
    clinicalApplication:
      'Menjamin ketepatan pelaporan hasil laboratorium untuk dasar keputusan diagnosis dan terapi oleh dokter.',
    pdfPageRef: 23,
  },
  {
    id: 'cbc_monitor',
    name: 'Holographic CBC & Erythrocyte Indices Display Panel',
    indonesianName: 'Layar Monitor Analisis Hasil CBC & Histogram Sel Darah',
    category: 'Visualisasi Diagnostik',
    position: [8, 0, 2],
    color: '#0d9488',
    functionSummary:
      'Menampilkan kurva distribusi volume sel (Histogram RBC, WBC, PLT), scattergram diferensial leukosit, dan kalkulasi langsung MCV, MCH, serta MCHC.',
    operatingPrinciple:
      'Pergeseran kurva histogram RBC ke kiri (<80 fL) menandakan populasi eritrosit mikrositik, sedangkan pergeseran ke kanan (>100 fL) menandakan populasi makrositik.',
    atlmSOP: [
      'Amati lebar kaki kurva histogram RBC yang berkorelasi dengan nilai RDW (anisositosis).',
      'Pastikan kurva dimulai dan berakhir di garis dasar (baseline); bila melayang di sisi kiri/kanan, curigai adanya mikro-eritrosit, fragmen sel, atau aglutinasi dingin.',
    ],
    clinicalApplication:
      'Analisis visual cepat oleh ATLM dan residen patologi klinik di laboratorium hematologi modern.',
    pdfPageRef: 24,
  },
];

export const HOSPITAL_NPCS: NpcCharacterData[] = [
  {
    id: 'npc_dr_juwita',
    name: 'dr. Juwita Ninda Suherman, M.Kes',
    role: 'specialist',
    title: 'Dosen Pembimbing Utama & Konsultan Akademik Hematologi — IKES Rajawali',
    zone: 'Lobby & Clinical Profile Center',
    position: [0, 0, 5],
    coatColor: '#ffffff',
    scrubColor: '#0284c7',
    hairColor: '#1e293b',
    dialogues: [
      {
        topic: 'Sambutan Akademik IKES Rajawali',
        id: 'Selamat datang di Hematology World — Institut Kesehatan Rajawali Bandung! Sebagai mahasiswa ATLM, ketelitian Anda dalam menghitung MCV, MCH, dan MCHC sangat menentukan ketepatan arah diagnosis klinis dokter.',
        en: 'Welcome to Hematology World — Institut Kesehatan Rajawali Bandung! As an ATLM student, your precision in calculating MCV, MCH, and MCHC directly shapes accurate clinical diagnosis.',
      },
      {
        topic: 'Kunci Penguasaan Indeks Eritrosit',
        id: 'Ingat selalu tiga rumus emas indeks eritrosit: MCV = (Hct × 10)/RBC dalam fL, MCH = (Hb × 10)/RBC dalam pg, dan MCHC = (Hb × 100)/Hct dalam g/dL. Jangan pernah tertukar pembilang dan penyebutnya!',
        en: 'Always remember the three golden erythrocyte formulas: MCV = (Hct × 10)/RBC in fL, MCH = (Hb × 10)/RBC in pg, and MCHC = (Hb × 100)/Hct in g/dL. Never mix up the numerators and denominators!',
      },
      {
        topic: 'Kolaborasi ATLM & Dokter',
        id: 'ATLM yang unggul tidak hanya menjalankan alat Hematology Analyzer, tetapi juga memvalidasi mutu sampel EDTA, mengevaluasi apusan darah tepi, dan mengomunikasikan nilai kritis secara profesional kepada dokter.',
        en: 'An outstanding Medical Laboratory Technologist does more than run the analyzer—they validate EDTA specimen quality, inspect peripheral blood smears, and communicate critical values to physicians.',
      },
    ],
  },
  {
    id: 'npc_dr_hendrawan',
    name: 'dr. Hendrawan Pratama, Sp.PK(K)',
    role: 'specialist',
    title: 'Dokter Spesialis Patologi Klinik Konsultan Hematologi',
    zone: 'Futuristic Hematology Lab',
    position: [-6, 0, -2],
    coatColor: '#ffffff',
    scrubColor: '#0f766e',
    hairColor: '#334155',
    dialogues: [
      {
        topic: 'Evaluasi MCHC Tinggi & Artefak',
        id: 'Rekan ATLM, jika Anda menemukan nilai MCHC > 36 g/dL pada alat analyzer, jangan langsung merilis hasilnya! Periksa apakah ada sferositosis herediter, atau artefak seperti cold agglutinin, lipemia, dan hemolisis in vitro.',
        en: 'Colleague, if you encounter an MCHC > 36 g/dL on the analyzer, do not release it blindly! Check for hereditary spherocytosis or pre-analytical artifacts like cold agglutinins, lipemia, or hemolysis.',
      },
      {
        topic: 'Anemia Mikrositik: Besi vs Thalassemia',
        id: 'Saat menjumpai anemia mikrositik hipokromik (MCV < 80 fL, MCHC < 32 g/dL), perhatikan jumlah RBC-nya. Pada Thalassemia minor, RBC sering tetap tinggi (>5,0 juta/µL) sehingga Indeks Mentzer (MCV/RBC) < 13.',
        en: 'When evaluating microcytic hypochromic anemia (MCV < 80 fL, MCHC < 32 g/dL), check the RBC count. In beta-thalassemia trait, RBC is often elevated (>5.0 million/µL), giving a Mentzer Index (MCV/RBC) < 13.',
      },
      {
        topic: 'Peran Hitung Retikulosit',
        id: 'Hitung retikulosit adalah jendela langsung untuk menilai respons sumsum tulang merah. Retikulosit masih menyimpan sisa RNA basofilik selama 1–2 hari setelah dilepaskan ke sirkulasi darah.',
        en: 'The reticulocyte count is our direct window into red bone marrow responsiveness. Reticulocytes retain residual basophilic RNA for 1–2 days after entering peripheral circulation.',
      },
    ],
  },
  {
    id: 'npc_dr_arasya',
    name: 'dr. Arasya Putri, Sp.PD-KHOM',
    role: 'doctor',
    title: 'Dokter Spesialis Penyakit Dalam — Konsultan Hematologi Onkologi Medik',
    zone: 'Doctor & Specialist Room',
    position: [6, 0, -2],
    coatColor: '#ffffff',
    scrubColor: '#1d4ed8',
    hairColor: '#1e1b4b',
    dialogues: [
      {
        topic: 'Ambang Anemia WHO 2024',
        id: 'Berdasarkan pedoman WHO 2024 di modul kita, ambang anemia ditetapkan pada Hb < 13,0 g/dL untuk pria dewasa, Hb < 12,0 g/dL untuk wanita tidak hamil, dan Hb < 10,5 g/dL pada kehamilan trimester II.',
        en: 'According to the WHO 2024 guidelines in our module, anemia cutoffs are Hb < 13.0 g/dL for adult men, Hb < 12.0 g/dL for non-pregnant women, and Hb < 10.5 g/dL in second-trimester pregnancy.',
      },
      {
        topic: 'Anemia pada Gagal Ginjal Kronis',
        id: 'Pasien gagal ginjal kronis sering datang dengan anemia normositik normokromik (MCV 80–100 fL, MCHC 32–36 g/dL) karena sel peritubular ginjal gagal memproduksi hormon Eritropoietin (EPO).',
        en: 'Chronic kidney disease patients frequently present with normocytic normochromic anemia (MCV 80–100 fL, MCHC 32–36 g/dL) due to impaired Erythropoietin (EPO) synthesis by renal peritubular cells.',
      },
      {
        topic: 'Edukasi Pasien Anemia Defisiensi Besi',
        id: 'Setelah hasil lab ATLM mengonfirmasi mikrositik hipokromik dengan ferritin rendah, saya mengedukasi pasien untuk mengonsumsi suplemen besi bersama vitamin C dan menjauhi teh saat makan.',
        en: 'Once ATLM lab results confirm microcytic hypochromic anemia with low ferritin, I educate patients to take iron supplements with vitamin C and avoid tea during meals.',
      },
    ],
  },
  {
    id: 'npc_atlm_senior',
    name: 'Raka Aditya, S.Tr.Kes (ATLM Senior)',
    role: 'staff',
    title: 'Koordinator Laboratorium Hematologi & Flebotomi',
    zone: 'Futuristic Hematology Lab',
    position: [2, 0, -3],
    coatColor: '#f8fafc',
    scrubColor: '#0284c7',
    hairColor: '#0f172a',
    dialogues: [
      {
        topic: 'Standar Tabung EDTA & Pra-Analitik',
        id: 'Halo rekan ATLM! Pastikan sampel darah pada tabung tutup ungu (K2EDTA) terisi sesuai tanda batas dan dihomogenkan 8–10 kali. Jika darah terlalu sedikit (underfilling), eritrosit akan mengkerut dan menurunkan MCV secara palsu.',
        en: 'Hello fellow ATLM! Always ensure purple-top K2EDTA tubes are filled to the mark and inverted 8–10 times. Underfilling causes osmotic shrinkage of RBCs and falsely lowers Hct and MCV.',
      },
      {
        topic: 'Aturan Tiga (Rule of Three)',
        id: 'Gunakan pemeriksaan cepat Rule of Three pada eritrosit normositik normokromik: nilai Hb × 3 seharusnya mendekati nilai Hematokrit (±3), dan RBC × 3 mendekati kadar Hb!',
        en: 'Use the Rule of Three quick check on normocytic normochromic samples: Hemoglobin × 3 should equal Hematocrit (±3%), and RBC × 3 should approximate Hemoglobin!',
      },
      {
        topic: 'Kapan Wajib Membuat SADT?',
        id: 'Jika trombosit di alat analyzer terbaca < 100.000/µL, kita wajib membuat Sediaan Apus Darah Tepi untuk memastikan tidak ada pseudotrombositopenia akibat clumping trombosit oleh EDTA.',
        en: 'Whenever the analyzer reports platelets < 100,000/µL, we must examine a peripheral blood smear to rule out EDTA-induced platelet clumping (pseudothrombocytopenia).',
      },
    ],
  },
  {
    id: 'npc_nurse_siti',
    name: 'Ns. Siti Rahmawati, S.Kep',
    role: 'nurse',
    title: 'Perawat Kepala Bangsal Rawat Inap & IGD',
    zone: 'IGD & Inpatient Ward',
    position: [-5, 0, 5],
    coatColor: '#e0f2fe',
    scrubColor: '#0369a1',
    hairColor: '#1e293b',
    dialogues: [
      {
        topic: 'Pemantauan Pasien DBD & Hemokonsentrasi',
        id: 'Di ruang IGD, kami memantau ketat hasil Hematokrit dan Trombosit dari laboratorium setiap 6–12 jam pada pasien Demam Berdarah. Peningkatan Hct > 20% menandakan kebocoran plasma yang harus segera diresusitasi cairan.',
        en: 'In the ER, we closely track Hematocrit and Platelet counts every 6–12 hours for Dengue patients. A >20% rise in Hct signals plasma leakage requiring immediate fluid therapy.',
      },
      {
        topic: 'Keselamatan Transfusi Golongan Darah',
        id: 'Sebelum memasang kantong darah PRC, perawat dan ATLM wajib melakukan verifikasi ganda kecocokan golongan darah ABO dan Rhesus untuk mencegah reaksi transfusi hemolitik akut.',
        en: 'Before starting any Packed Red Cell transfusion, nurses and lab technologists perform a strict double-check of ABO and Rhesus compatibility to prevent acute hemolytic reactions.',
      },
      {
        topic: 'Tanda Klinis Hipoksia Anemia',
        id: 'Pasien dengan Hb di bawah 8 g/dL sering mengeluhkan pusing saat berdiri, konjungtiva mata tampak sangat pucat, akral dingin, dan frekuensi nadi meningkat (takikardia).',
        en: 'Patients with Hemoglobin below 8 g/dL often experience dizziness upon standing, pale palpebral conjunctiva, cold extremities, and compensatory tachycardia.',
      },
    ],
  },
  {
    id: 'npc_patient_nadia',
    name: 'Nadia Putri (Pasien Poliklinik, 24 Tahun)',
    role: 'patient',
    title: 'Pasien Evaluasi Anemia Mikrositik',
    zone: 'Doctor & Specialist Room',
    position: [5, 0, 4],
    coatColor: '#fef3c7',
    scrubColor: '#d97706',
    hairColor: '#451a03',
    dialogues: [
      {
        topic: 'Keluhan Klinis Pasien Anemia',
        id: 'Kak ATLM, sudah tiga minggu ini saya merasa cepat lelah, sering pusing saat kuliah, dan wajah saya dibilang pucat. Tadi hasil lab saya Hb 9,5 g/dL dan MCV 72 fL. Apa artinya ya?',
        en: 'Hello ATLM, for the past three weeks I have felt exhausted, dizzy during lectures, and pale. My lab result shows Hb 9.5 g/dL and MCV 72 fL. What does that mean?',
      },
      {
        topic: 'Penjelasan Hasil & Edukasi',
        id: 'Terima kasih penjelasannya! Dokter juga menjelaskan bahwa MCV 72 fL berarti ukuran sel darah merah saya lebih kecil dari normal (mikrositik) karena cadangan zat besi (ferritin) saya rendah.',
        en: 'Thank you for explaining! The doctor also told me that an MCV of 72 fL means my red blood cells are smaller than normal (microcytic) due to low iron stores (ferritin).',
      },
    ],
  },
];

export const CLINICAL_SIMULATION_CASES: ClinicalSimulationCase[] = [
  {
    id: 'sim_case_1',
    title: 'Kasus Simulasi 1: Anemia Mikrositik Hipokromik pada Perempuan Usia Subur',
    patientName: 'Nn. Nadia Putri',
    ageGender: '24 Tahun / Perempuan (Tidak Hamil)',
    chiefComplaint: 'Mudah lelah, pusing berputar saat beraktivitas, dan tampak pucat sejak 1 bulan terakhir.',
    anamnesis:
      'Pasien mahasiswi dengan jadwal padat, jarang mengonsumsi daging merah/sayuran hijau, sering minum teh manis setiap selesai makan, dan memiliki riwayat menstruasi cukup banyak (menoragia) selama 7–8 hari tiap siklus.',
    physicalExam: {
      bp: '110/70 mmHg',
      hr: '96 x/menit (Takikardia ringan kompensasi)',
      rr: '18 x/menit',
      temp: '36,6 °C',
      conjunctiva: 'Konjungtiva palpebra inferior pucat (+/+), atrofi papil lidah ringan',
      spleenLiver: 'Hepar dan Lien tidak teraba membesar (normal)',
    },
    specimenInfo: {
      tubeType: 'Tabung Vacutainer Tutup Ungu (K2EDTA 3 mL)',
      anticoagulant: 'K2EDTA (Kelasi ion Ca2+)',
      volumeStatus: 'Volume sesuai garis batas (3,0 mL), homogenisasi inversi 8x, bebas bekuan',
      visualPlasma: 'Plasma jernih kekuningan, lapisan eritrosit pekat tampak menurun (<30%)',
    },
    rawLabData: {
      hb: 9.5,
      hct: 28.8,
      rbc: 4.0,
      wbc: 7200,
      plt: 340000,
      reticulocyte: 0.8,
      ferritin: 8.0,
      bloodType: 'O Rh Positif',
    },
    expectedIndices: {
      mcv: 72.0,
      mch: 23.75,
      mchc: 32.99,
      morphologyClassification: 'Mikrositik Hipokromik (MCV < 80 fL, MCH < 27 pg)',
    },
    smearFindings:
      'Eritrosit mikrositik hipokromik (central pallor melebar > 1/3 diameter sel), anisopoikilositosis ringan dengan sel pensil (pencil cells / eliptosit). Leukosit dan trombosit dalam batas normal.',
    atlmValidationNote:
      'Sampel EDTA memenuhi syarat pra-analitik. Perhitungan indeks eritrosit: MCV = (28,8 × 10)/4,0 = 72,0 fL (Mikrositik); MCH = (9,5 × 10)/4,0 = 23,8 pg (Menurun); MCHC = (9,5 × 100)/28,8 = 33,0 g/dL. Hasil SADT konsisten dengan mikrositosis dan ferritin 8 ng/mL sangat rendah.',
    doctorInterpretation:
      'Berdasarkan Hb 9,5 g/dL (<12,0 g/dL ambang WHO 2024 perempuan tidak hamil), MCV 72 fL (mikrositik), dan Ferritin 8 ng/mL, pasien didiagnosis mengalami Anemia Defisiensi Besi e.c. menoragia dan asupan besi inadekuat.',
    patientEducation:
      'Tingkatkan konsumsi sumber zat besi heme (daging sapi, hati, ikan) disertai buah kaya vitamin C (jeruk, jambu biji) untuk membantu penyerapan besi di duodenum. Hindari minum teh atau kopi dalam waktu 2 jam sekitar jam makan karena tanin menghambat absorbsi besi.',
    therapyPlan:
      'Pemberian preparat Sulfas Ferosus oral 2–3 x 200 mg/hari oleh dokter selama 3–6 bulan hingga cadangan ferritin pulih, konsultasi ginekologi bila menoragia berlanjut, dan kontrol Hb serta retikulosit dalam 2–4 minggu.',
    pdfPageRef: 23,
  },
  {
    id: 'sim_case_2',
    title: 'Kasus Simulasi 2: Anemia Makrositik Megaloblastik dengan Defisiensi B12/Folat',
    patientName: 'Tn. Bima Sakti',
    ageGender: '48 Tahun / Laki-laki',
    chiefComplaint: 'Kelelahan progresif, penurunan stamina kerja, dan kesemutan ringan pada ujung jari tangan sejak 2 bulan.',
    anamnesis:
      'Pasien menjalani diet vegan ketat tanpa suplementasi vitamin selama 4 tahun terakhir dan memiliki riwayat gastritis kronis.',
    physicalExam: {
      bp: '118/76 mmHg',
      hr: '88 x/menit',
      rr: '18 x/menit',
      temp: '36,7 °C',
      conjunctiva: 'Konjungtiva pucat (+/+), sklera tampak sub-ikterik sangat ringan, glositis (lidah merah halus)',
      spleenLiver: 'Tidak ada hepatosplenomegali',
    },
    specimenInfo: {
      tubeType: 'Tabung Vacutainer Tutup Ungu (K2EDTA 3 mL)',
      anticoagulant: 'K2EDTA',
      volumeStatus: 'Volume presisi, tidak ada hemolisis in vitro maupun lipemia',
      visualPlasma: 'Plasma kuning agak tua, buffy coat tipis',
    },
    rawLabData: {
      hb: 10.5,
      hct: 36.0,
      rbc: 3.2,
      wbc: 4600,
      plt: 145000,
      reticulocyte: 0.6,
      bloodType: 'A Rh Negatif',
    },
    expectedIndices: {
      mcv: 112.5,
      mch: 32.81,
      mchc: 29.17,
      morphologyClassification: 'Makrositik (MCV > 100 fL)',
    },
    smearFindings:
      'Tampak makrosit oval (macro-ovalocytes), anisositosis nyata, dan ditemukan Neutrofil Hipersegmentasi (inti memiliki 6–7 lobus).',
    atlmValidationNote:
      'Perhitungan indeks eritrosit: MCV = (36,0 × 10)/3,2 = 112,5 fL (> 100 fL, Makrositik jelas); MCH = (10,5 × 10)/3,2 = 32,8 pg; MCHC = (10,5 × 100)/36,0 = 29,2 g/dL. Temuan makrosit oval dan neutrofil hipersegmentasi pada SADT wajib dilaporkan ke dokter.',
    doctorInterpretation:
      'Hb 10,5 g/dL (<13,0 g/dL ambang WHO 2024 pria dewasa) disertai MCV 112,5 fL dan neutrofil hipersegmentasi menunjukkan Anemia Makrositik Megaloblastik akibat gangguan sintesis DNA eritroblas karena defisiensi Vitamin B12 (kobalamin) dan/atau Asam Folat.',
    patientEducation:
      'Menjelaskan bahwa Vitamin B12 hanya ditemukan secara alami pada produk hewani atau makanan fortifikasi/suplemen, serta sangat penting untuk pematangan sel darah di sumsum tulang dan pemeliharaan selubung mielin saraf.',
    therapyPlan:
      'Pemeriksaan kadar Vitamin B12 dan Folat serum, pemberian terapi pengganti Kobalamin (parenteral/oral dosis tinggi) dan Asam Folat oleh dokter, serta evaluasi faktor intrinsik lambung.',
    pdfPageRef: 24,
  },
  {
    id: 'sim_case_3',
    title: 'Kasus Simulasi 3: Anemia Normositik Normokromik pada Penyakit Ginjal Kronis',
    patientName: 'Tn. Hendra Wijaya',
    ageGender: '45 Tahun / Laki-laki',
    chiefComplaint: 'Badan terasa lemas dan cepat sesak saat menaiki tangga sejak 3 bulan terakhir.',
    anamnesis:
      'Pasien memiliki riwayat hipertensi lama dan Penyakit Ginjal Kronis (CKD stadium 4). Tidak ada riwayat BAB hitam (melena) maupun perdarahan gusi.',
    physicalExam: {
      bp: '150/92 mmHg',
      hr: '86 x/menit',
      rr: '20 x/menit',
      temp: '36,5 °C',
      conjunctiva: 'Konjungtiva pucat (+/+), edema pretibial ringan (+/+)',
      spleenLiver: 'Normal',
    },
    specimenInfo: {
      tubeType: 'Tabung Vacutainer Tutup Ungu (K2EDTA 3 mL)',
      anticoagulant: 'K2EDTA',
      volumeStatus: 'Volume 3,0 mL sesuai standar SOP',
      visualPlasma: 'Plasma jernih, proporsi eritrosit menurun (Hct 27%)',
    },
    rawLabData: {
      hb: 9.0,
      hct: 27.0,
      rbc: 3.0,
      wbc: 6800,
      plt: 230000,
      reticulocyte: 0.5,
      ferritin: 145.0,
      bloodType: 'B Rh Positif',
    },
    expectedIndices: {
      mcv: 90.0,
      mch: 30.0,
      mchc: 33.33,
      morphologyClassification: 'Normositik Normokromik (MCV 80–100 fL, MCHC 32–36 g/dL)',
    },
    smearFindings:
      'Populasi eritrosit tampak berukuran dan berwarna normal (normositik normokromik), ditemukan beberapa Burr cells (echinocytes) khas uremia. Retikulosit rendah (hipoproliferatif).',
    atlmValidationNote:
      'Rule of Three terpenuhi (Hb 9,0 × 3 = Hct 27%; RBC 3,0 × 3 = Hb 9,0). Indeks eritrosit: MCV = 270/3,0 = 90,0 fL; MCH = 90/3,0 = 30,0 pg; MCHC = 900/27,0 = 33,3 g/dL (Normositik Normokromik). Retikulosit rendah (0,5%) menunjukkan kurangnya stimulasi eritropoiesis.',
    doctorInterpretation:
      'Anemia Normositik Normokromik Hipoproliferatif sekunder akibat defisiensi hormon Eritropoietin (EPO) pada Penyakit Ginjal Kronis.',
    patientEducation:
      'Menjelaskan bahwa ginjal yang sehat memproduksi hormon Eritropoietin (EPO) untuk memberi perintah kepada sumsum tulang agar mencetak sel darah merah baru.',
    therapyPlan:
      'Evaluasi kecukupan status besi, terapi Erythropoiesis-Stimulating Agents (ESA / EPO rekombinan) oleh dokter spesialis penyakit dalam, dan pengendalian tekanan darah serta fungsi ginjal.',
    pdfPageRef: 18,
  },
];
