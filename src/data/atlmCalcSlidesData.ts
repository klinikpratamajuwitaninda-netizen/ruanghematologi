/**
 * Data Lengkap 24 Slide Materi Hematologi ATLM:
 * "PERHITUNGAN PARAMETER HEMATOLOGI & KORELASI KLINIS"
 * Berdasarkan PDF Resmi: Materi_Hematologi_ATLM_Lengkap_Font_Besar-1_-_Copy__2__b5855000.pdf
 * Dosen Pengampu & Pemegang Hak Cipta: dr. Juwita Ninda Suherman, M.Kes
 */

export interface AtlmSlideItem {
  slideNumber: number;
  totalSlides: number;
  title: string;
  category: 'Kamar Hitung' | 'Hitung Sel Darah' | 'Indeks Eritrosit' | 'Anemia & Polisitemia' | 'Leukosit & Morfologi' | 'Hemostasis & Koagulasi';
  imageSrc: string;
  summary: string;
  formula?: string;
  bulletPoints: string[];
  calculationExample?: {
    input: string;
    formulaApplied: string;
    result: string;
  };
  referenceRanges: Array<{ label: string; range: string }>;
  clinicalNotes: string[];
  narrationScript: string;
}

export const ATLM_CALC_24_SLIDES: AtlmSlideItem[] = [
  {
    slideNumber: 1,
    totalSlides: 24,
    title: 'Perhitungan Parameter Hematologi',
    category: 'Hitung Sel Darah',
    imageSrc: '/assets/pdf/atlm_calc_slide_01.png',
    summary: 'Materi kuliah komprehensif mahasiswa Teknologi Laboratorium Medik (ATLM) mengenai perhitungan seluruh parameter hematologi manual dan otomatis, dilengkapi rumus baku, contoh kasus, dan nilai rujukan dewasa.',
    bulletPoints: [
      'Cakupan Parameter: RBC, WBC, Trombosit, Hematokrit (HCT), Hemoglobin (Hb).',
      'Hitung Jenis Leukosit (Diff Count), Retikulosit, Indeks Eritrosit (MCV, MCH, MCHC), dan ANC.',
      'Dilengkapi panduan evaluasi mikroskopik kamar hitung Improved Neubauer dan korelasi klinis.',
    ],
    referenceRanges: [
      { label: 'Standar Pembelajaran', range: 'Kurikulum Nasional ATLM' },
      { label: 'Dosen Pengampu', range: 'dr. Juwita Ninda Suherman, M.Kes' },
    ],
    clinicalNotes: [
      'Ketepatan perhitungan parameter hematologi merupakan fondasi utama diagnosis kelainan darah di laboratorium medik.',
    ],
    narrationScript: 'Selamat datang pada presentasi Perhitungan Parameter Hematologi untuk mahasiswa Teknologi Laboratorium Medik. Pada modul ini, kita akan mempelajari rumus perhitungan sel darah, kamar hitung Improved Neubauer, indeks eritrosit, klasifikasi anemia, hingga kaskade hemostasis bersama dr. Juwita Ninda Suherman, M.Kes.',
  },
  {
    slideNumber: 2,
    totalSlides: 24,
    title: 'Kamar Hitung Improved Neubauer',
    category: 'Kamar Hitung',
    imageSrc: '/assets/pdf/atlm_calc_slide_02.png',
    summary: 'Mengenal struktur fisik, dimensi, dan volume bilik hitung Improved Neubauer sebelum melakukan estimasi jumlah sel darah secara manual.',
    bulletPoints: [
      'Kedalaman Kamar Hitung: 0,1 mm antara kaca penutup (cover glass) dan dasar bilik.',
      '1 Kotak Besar (Sudut): Ukuran 1 mm × 1 mm × 0,1 mm = 0,1 mm³.',
      '4 Kotak Sudut (Area Leukosit - WBC): Volume total = 4 × 0,1 mm³ = 0,4 mm³.',
      '5 Kotak Kecil di Tengah (Area Eritrosit - RBC): Volume total = 0,02 mm³.',
      'Area Trombosit (PLT): Seluruh kotak tengah seluas 1 mm² (volume 0,1 mm³).',
    ],
    referenceRanges: [
      { label: 'Kedalaman Bilik', range: '0,1 mm' },
      { label: 'Volume 4 Kotak Sudut (WBC)', range: '0,4 mm³' },
      { label: 'Volume 5 Kotak Tengah (RBC)', range: '0,02 mm³' },
      { label: 'Volume Kotak Tengah (PLT)', range: '0,1 mm³' },
    ],
    clinicalNotes: [
      'Gunakan cover glass khusus hemositometer berpermukaan rata sempurna untuk menjamin volume kamar hitung tepat 0,1 mm.',
    ],
    narrationScript: 'Kamar hitung Improved Neubauer memiliki kedalaman nol koma satu milimeter. Area sudut berwarna biru terdiri atas empat kotak besar bervolume total nol koma empat milimeter kubik untuk leukosit. Sementara lima kotak kecil di bagian tengah berwarna merah bervolume nol koma nol dua milimeter kubik digunakan untuk menghitung eritrosit.',
  },
  {
    slideNumber: 3,
    totalSlides: 24,
    title: 'Hitung Jumlah Eritrosit (RBC)',
    category: 'Hitung Sel Darah',
    imageSrc: '/assets/pdf/atlm_calc_slide_03.png',
    summary: 'Metode manual estimasi konsentrasi eritrosit menggunakan larutan pengencer Hayem dan bilik hitung Improved Neubauer dengan pengenceran standar 1:200.',
    formula: 'RBC = N × 10.000 (sel/µL)',
    bulletPoints: [
      'Prinsip: Darah diencerkan 1:200 dengan larutan Hayem (atau larutan pengencer tervalidasi).',
      'Area Hitung: 5 kotak kecil di bagian tengah kamar hitung (volume 0,02 mm³).',
      'Faktor Perhitungan: Pengenceran 200 ÷ volume 0,02 mm³ = 10.000.',
      'N = Jumlah eritrosit yang terhitung pada kelima kotak kecil.',
    ],
    calculationExample: {
      input: 'Ditemukan N = 450 eritrosit pada 5 kotak kecil tengah.',
      formulaApplied: 'RBC = 450 × 10.000',
      result: '4.500.000 sel/µL (4,5 juta/µL)',
    },
    referenceRanges: [
      { label: 'Laki-laki Dewasa', range: '4,5 – 5,9 juta/µL' },
      { label: 'Perempuan Dewasa', range: '4,1 – 5,1 juta/µL' },
    ],
    clinicalNotes: [
      'Hindari gelembung udara pada pipet Thoma eritrosit; kocok pipet secara horizontal membentuk angka delapan selama 3 menit sebelum meneteskan ke bilik hitung.',
    ],
    narrationScript: 'Untuk menghitung jumlah eritrosit manual, gunakan pengenceran satu banding dua ratus dengan larutan Hayem. Hitung sel pada lima kotak kecil di tengah. Kalikan jumlah sel N dengan sepuluh ribu. Contohnya, jika ditemukan empat ratus lima puluh eritrosit, hasilnya adalah empat koma lima juta sel per mikroliter.',
  },
  {
    slideNumber: 4,
    totalSlides: 24,
    title: 'Hitung Jumlah Leukosit (WBC)',
    category: 'Hitung Sel Darah',
    imageSrc: '/assets/pdf/atlm_calc_slide_04.png',
    summary: 'Metode manual perhitungan konsentrasi leukosit darah lengkap menggunakan larutan Turk pada pengenceran 1:20.',
    formula: 'WBC = N × 50 (sel/µL)',
    bulletPoints: [
      'Prinsip: Larutan Turk melisiskan seluruh eritrosit (kandungan asam asetat glasial) dan mewarnai inti leukosit dengan gentian violet.',
      'Area Hitung: 4 kotak besar di sudut kamar hitung (volume total 0,4 mm³).',
      'Faktor Perhitungan: Pengenceran 20 ÷ volume 0,4 mm³ = 50.',
      'N = Jumlah total leukosit yang terhitung pada 4 kotak besar sudut.',
    ],
    calculationExample: {
      input: 'Ditemukan N = 150 leukosit pada 4 kotak sudut.',
      formulaApplied: 'WBC = 150 × 50',
      result: '7.500 sel/µL',
    },
    referenceRanges: [
      { label: 'Dewasa Normal', range: '4.000 – 10.000 sel/µL' },
    ],
    clinicalNotes: [
      'Bila ditemukan eritrosit berinti (normoblas) dalam jumlah tinggi pada apusan darah tepi, hasil hitung leukosit harus dikoreksi.',
    ],
    narrationScript: 'Hitung leukosit manual menggunakan larutan Turk dengan pengenceran satu banding dua puluh. Asam asetat glasial melisiskan eritrosit sehingga leukosit terlihat jelas pada empat kotak sudut. Kalikan jumlah sel N dengan lima puluh. Misalnya, seratus lima puluh leukosit menghasilkan tujuh ribu lima ratus sel per mikroliter.',
  },
  {
    slideNumber: 5,
    totalSlides: 24,
    title: 'Hitung Jumlah Trombosit (PLT)',
    category: 'Hitung Sel Darah',
    imageSrc: '/assets/pdf/atlm_calc_slide_05.png',
    summary: 'Metode manual perhitungan trombosit menggunakan larutan amonium oksalat 1% atau Rees-Ecker pada kamar hitung Improved Neubauer.',
    formula: 'PLT = N × 1.000 (sel/µL)',
    bulletPoints: [
      'Prinsip: Darah diencerkan 1:100 dengan amonium oksalat 1% untuk melisiskan eritrosit.',
      'Area Hitung: Seluruh kotak tengah seluas 1 mm² (volume = 1 mm² × 0,1 mm = 0,1 mm³).',
      'Faktor Perhitungan: Pengenceran 100 ÷ volume 0,1 mm³ = 1.000.',
      'N = Jumlah trombosit pada seluruh kotak tengah.',
    ],
    calculationExample: {
      input: 'Ditemukan N = 250 trombosit pada kotak tengah.',
      formulaApplied: 'PLT = 250 × 1.000',
      result: '250.000 sel/µL',
    },
    referenceRanges: [
      { label: 'Trombosit Normal', range: '150.000 – 400.000 /µL (atau hingga 450.000 /µL)' },
    ],
    clinicalNotes: [
      'Bilik hitung harus diinkubasi dalam cawan petri beralas kapas basah selama 15 menit agar trombosit mengendap sempurna tanpa mengering sebelum diamati di bawah mikroskop perbesaran 40x.',
    ],
    narrationScript: 'Pada hitung trombosit manual dengan pengenceran satu banding seratus menggunakan amonium oksalat satu persen, seluruh kotak tengah seluas satu milimeter persegi diamati. Faktor pengalinya adalah seribu. Jika dijumpai dua ratus lima puluh trombosit, maka jumlahnya adalah dua ratus lima puluh ribu sel per mikroliter.',
  },
  {
    slideNumber: 6,
    totalSlides: 24,
    title: 'Hematokrit (HCT) dan Hemoglobin (Hb)',
    category: 'Indeks Eritrosit',
    imageSrc: '/assets/pdf/atlm_calc_slide_06.png',
    summary: 'Penetapan fraksi volume eritrosit terhadap darah utuh (HCT) serta pengukuran kadar protein pengangkut oksigen (Hb).',
    formula: 'HCT (%) = (Tinggi Kolom Eritrosit ÷ Tinggi Seluruh Darah) × 100%',
    bulletPoints: [
      'Metode Mikrohematokrit: Tabung kapiler kapiler heparin/plain disentrifugasi 11.000–12.000 rpm selama 5 menit.',
      'Pembacaan: Menggunakan skala baca mikrohematokrit dari dasar eritrosit hingga batas buffy coat.',
      'Hemoglobin (Hb): Diukur dengan metode sianmethemoglobin fotometri atau cell counter otomatis.',
    ],
    calculationExample: {
      input: 'Tinggi kolom eritrosit = 45 mm, tinggi seluruh darah = 100 mm.',
      formulaApplied: 'HCT = (45 ÷ 100) × 100%',
      result: '45%',
    },
    referenceRanges: [
      { label: 'HCT Laki-laki Dewasa', range: '41 – 53%' },
      { label: 'HCT Perempuan Dewasa', range: '36 – 46%' },
      { label: 'Hb Laki-laki Dewasa', range: '13,5 – 17,5 g/dL' },
      { label: 'Hb Perempuan Dewasa', range: '12,0 – 15,5 g/dL' },
    ],
    clinicalNotes: [
      'Kaidah Tiga (Rule of Three): Pada eritrosit normositer normokrom, nilai Hematokrit kira-kira setara dengan 3 kali nilai Hemoglobin (HCT ≈ 3 × Hb).',
    ],
    narrationScript: 'Hematokrit diukur dari perbandingan tinggi kolom eritrosit mampat terhadap volume total darah dikalikan seratus persen. Pada sampel dengan tinggi eritrosit empat puluh lima milimeter dari seratus milimeter darah, nilai HCT adalah empat puluh lima persen. Nilai rujukan pria adalah empat puluh satu hingga lima puluh tiga persen.',
  },
  {
    slideNumber: 7,
    totalSlides: 24,
    title: 'Hitung Jenis Leukosit (Differential Count)',
    category: 'Leukosit & Morfologi',
    imageSrc: '/assets/pdf/atlm_calc_slide_07.png',
    summary: 'Menghitung proporsi persentase 5 jenis leukosit matur pada 100 sel leukosit apusan darah tepi (SADT) di zona baca ideal.',
    formula: '% Jenis = (Jumlah Jenis ÷ Total 100 Sel) × 100%',
    bulletPoints: [
      'Metode: Evaluasi mikroskopik pada sediaan apus darah tepi (SADT) dengan pewarnaan Wright atau Giemsa.',
      'Arah Pembacaan: Pola meander (zig-zag) pada zona monolayer (zona IV/V).',
      'Distribusi 5 Jenis: Neutrofil (batang & segmen), Limfosit, Monosit, Eosinofil, dan Basofil.',
    ],
    calculationExample: {
      input: 'Pada 100 leukosit ditemukan: Neutrofil 60, Limfosit 30, Monosit 5, Eosinofil 4, Basofil 1.',
      formulaApplied: '% = (Jumlah ÷ 100) × 100%',
      result: 'Neutrofil 60%, Limfosit 30%, Monosit 5%, Eosinofil 4%, Basofil 1%',
    },
    referenceRanges: [
      { label: 'Neutrofil (Segmen + Batang)', range: '40 – 70%' },
      { label: 'Limfosit', range: '20 – 40%' },
      { label: 'Monosit', range: '2 – 8%' },
      { label: 'Eosinofil', range: '1 – 4%' },
      { label: 'Basofil', range: '0 – 1%' },
    ],
    clinicalNotes: [
      'Pergeseran ke kiri (Shift to the left): Peningkatan proporsi neutrofil batang (>5%) menandakan respon infeksi bakteri akut atau sepsis.',
    ],
    narrationScript: 'Hitung jenis leukosit atau differential count dilakukan dengan menghitung seratus leukosit pada zona baca apusan darah tepi. Persentase normal dewasa adalah neutrofil empat puluh hingga tujuh puluh persen, limfosit dua puluh hingga empat puluh persen, monosit dua hingga delapan persen, eosinofil satu hingga empat persen, dan basofil nol hingga satu persen.',
  },
  {
    slideNumber: 8,
    totalSlides: 24,
    title: 'Hitung Retikulosit',
    category: 'Indeks Eritrosit',
    imageSrc: '/assets/pdf/atlm_calc_slide_08.png',
    summary: 'Evaluasi proporsi eritrosit muda anukleat yang masih mengandung sisa asam ribonukleat (RNA) ribosomal untuk menilai aktivitas eritropoiesis sumsum tulang.',
    formula: 'Retikulosit (%) = (Jumlah Retikulosit ÷ Total Eritrosit Dihitung) × 100%',
    bulletPoints: [
      'Prinsip Pewarnaan Supravital: Menggunakan Brilliant Cresyl Blue (BCB) atau New Methylene Blue (NMB) pada sel hidup sebelum difiksasi.',
      'Morfologi: Tampak anyaman jala atau granula biru tua di dalam eritrosit muda.',
      'Jumlah Dihitung: Minimal 1.000 eritrosit dihitung secara cermat di bawah mikroskop lensa imersi 100x.',
    ],
    calculationExample: {
      input: 'Ditemukan 20 retikulosit dalam 1.000 eritrosit yang dihitung.',
      formulaApplied: 'Retikulosit = (20 ÷ 1.000) × 100%',
      result: '2,0%',
    },
    referenceRanges: [
      { label: 'Retikulosit Normal Dewasa', range: '0,5 – 2,5%' },
    ],
    clinicalNotes: [
      'Retikulositosis (>2,5%) mengindikasikan hiperaktivitas sumsum tulang seperti pada anemia hemolitik atau respon terapi besi/vitamin B12.',
    ],
    narrationScript: 'Retikulosit adalah eritrosit muda yang masih menyimpan sisa asam ribonukleat. Dengan pewarnaan supravital Brilliant Cresyl Blue, hitung retikulosit di antara seribu eritrosit. Jika ditemukan dua puluh retikulosit, persentasenya adalah dua persen, berada dalam rentang normal nol koma lima hingga dua koma lima persen.',
  },
  {
    slideNumber: 9,
    totalSlides: 24,
    title: 'Indeks Eritrosit: MCV, MCH, dan MCHC',
    category: 'Indeks Eritrosit',
    imageSrc: '/assets/pdf/atlm_calc_slide_09.png',
    summary: 'Tiga parameter matematis esensial penentu morfologi eritrosit untuk diagnosis diferensial anemia (mikrositik, normositik, makrositik, hipokromik, normokromik).',
    formula: 'MCV = (HCT × 10) ÷ RBC (fL) | MCH = (Hb × 10) ÷ RBC (pg) | MCHC = (Hb × 100) ÷ HCT (g/dL)',
    bulletPoints: [
      'MCV (Mean Corpuscular Volume): Mengukur volume rata-rata satu sel eritrosit (satuan femtoliter / fL).',
      'MCH (Mean Corpuscular Hemoglobin): Mengukur bobot massa rata-rata hemoglobin per eritrosit (satuan pikogram / pg).',
      'MCHC (Mean Corpuscular Hemoglobin Concentration): Mengukur konsentrasi rata-rata hemoglobin dalam volume eritrosit tertentu (satuan g/dL atau %).',
    ],
    calculationExample: {
      input: 'Data Pasien: Hb = 15 g/dL, HCT = 45%, RBC = 5,0 juta/µL.',
      formulaApplied: 'MCV = (45 × 10)/5 = 90 fL | MCH = (15 × 10)/5 = 30 pg | MCHC = (15 × 100)/45 = 33,3 g/dL',
      result: 'MCV: 90 fL (Normositik) | MCH: 30 pg (Normokrom) | MCHC: 33,3 g/dL (Normokrom)',
    },
    referenceRanges: [
      { label: 'MCV Normal', range: '80 – 100 fL' },
      { label: 'MCH Normal', range: '27 – 33 pg' },
      { label: 'MCHC Normal', range: '32 – 36 g/dL' },
    ],
    clinicalNotes: [
      'Nilai MCHC > 36 g/dL sangat jarang secara fisiologis; curigai adanya sferositosis herediter, aglutinasi dingin (cold agglutinin), atau lipemia pada sampel plasma.',
    ],
    narrationScript: 'Tiga indeks eritrosit adalah MCV, MCH, dan MCHC. MCV dihitung dari hematokrit kali sepuluh dibagi RBC, menghasilkan volume rata-rata sembilan puluh femtoliter. MCH dihitung dari hemoglobin kali sepuluh dibagi RBC, dan MCHC dihitung dari hemoglobin kali seratus dibagi hematokrit.',
  },
  {
    slideNumber: 10,
    totalSlides: 24,
    title: 'Perhitungan Lanjutan: ANC dan Retikulosit Terkoreksi',
    category: 'Indeks Eritrosit',
    imageSrc: '/assets/pdf/atlm_calc_slide_10.png',
    summary: 'Perhitungan lanjutan untuk mengukur resiko infeksi klinis (ANC) dan mengoreksi respon retikulosit pada kondisi anemia berat (CRC & RPI).',
    formula: 'ANC = WBC × (%Segmen + %Band) ÷ 100 | CRC = Retikulosit% × (HCT Pasien ÷ HCT Normal 45%)',
    bulletPoints: [
      'ANC (Absolute Neutrophil Count): Parameter kritis pasien kemoterapi, leukemia, dan neutropenia febril.',
      'CRC (Corrected Reticulocyte Count): Mengompensasi pengenceran eritrosit akibat anemia.',
      'RPI (Reticulocyte Production Index): CRC dibagi faktor masa hidup maturasi retikulosit di darah tepi.',
    ],
    calculationExample: {
      input: 'ANC: WBC = 8.000 sel/µL, Segmen = 60%, Band = 5%. | CRC: Retikulosit = 4%, HCT Pasien = 24%, HCT Normal = 45%.',
      formulaApplied: 'ANC = 8.000 × (60 + 5)/100 = 5.200 sel/µL | CRC = 4% × (24 ÷ 45) = 2,13%',
      result: 'ANC = 5.200 sel/µL | CRC = 2,13%',
    },
    referenceRanges: [
      { label: 'ANC Normal Dewasa', range: '1.500 – 7.500 sel/µL' },
      { label: 'Neutropenia Berat', range: 'ANC < 500 sel/µL' },
      { label: 'RPI Adekuat', range: '> 2 (Respon Sumsum Tulang Baik)' },
    ],
    clinicalNotes: [
      'Bila nilai ANC < 500 sel/µL, pasien berada dalam kondisi darurat neutropenia berat dan rentan mengalami infeksi bakterial oportunistik fatal.',
    ],
    narrationScript: 'Perhitungan lanjutan meliputi Absolute Neutrophil Count atau ANC dan Retikulosit Terkoreksi. ANC dihitung dari leukosit dikali total persentase neutrofil segmen dan batang. Pada WBC delapan ribu dengan segmen enam puluh dan batang lima persen, ANC adalah lima ribu dua ratus sel per mikroliter.',
  },
  {
    slideNumber: 11,
    totalSlides: 24,
    title: 'Ringkasan Nilai Rujukan Hematologi Dewasa',
    category: 'Hitung Sel Darah',
    imageSrc: '/assets/pdf/atlm_calc_slide_11.png',
    summary: 'Tabel komprehensif rentang rujukan fisiologis parameter hematologi lengkap dewasa untuk pedoman verifikasi teknis hasil uji laboratorium.',
    bulletPoints: [
      'Parameter Eritrosit: RBC Pria 4,5–5,9 juta/µL, Wanita 4,1–5,1 juta/µL; Hb Pria 13,5–17,5 g/dL, Wanita 12,0–15,5 g/dL; HCT Pria 41–53%, Wanita 36–46%.',
      'Leukosit & Trombosit: WBC 4.000–10.000 sel/µL; PLT 150.000–400.000 /µL.',
      'Hitung Jenis: Neutrofil 40–70%, Limfosit 20–40%, Monosit 2–8%, Eosinofil 1–4%, Basofil 0–1%.',
      'Indeks & Lanjutan: MCV 80–100 fL, MCH 27–33 pg, MCHC 32–36 g/dL, Retikulosit 0,5–2,5%, ANC 1.500–7.500 sel/µL.',
    ],
    referenceRanges: [
      { label: 'MCV / MCH / MCHC', range: '80–100 fL / 27–33 pg / 32–36 g/dL' },
      { label: 'WBC & PLT', range: '4.000–10.000 /µL & 150.000–400.000 /µL' },
    ],
    clinicalNotes: [
      'Hb umumnya diukur secara fotometrik, bukan dihitung manual. Parameter RDW, MPV, PDW, dan PCT dihasilkan oleh hematology analyzer.',
    ],
    narrationScript: 'Tabel ringkasan nilai rujukan hematologi dewasa merangkum rentang normal RBC, WBC, trombosit, hematokrit, hemoglobin, hitung jenis leukosit, indeks eritrosit, dan ANC. Setiap laboratorium menetapkan nilai rujukan tervalidasi yang disesuaikan dengan populasi dan alat setempat.',
  },
  {
    slideNumber: 12,
    totalSlides: 24,
    title: 'Macam-Macam Anemia: Klasifikasi Morfologis & Etiologis',
    category: 'Anemia & Polisitemia',
    imageSrc: '/assets/pdf/atlm_calc_slide_12.png',
    summary: 'Klasifikasi sistematis anemia berdasarkan indeks volume eritrosit (MCV) serta mekanisme fisiopatologis penurunan massa hemoglobin tubuh.',
    bulletPoints: [
      'Mikrositik (MCV < 80 fL): Gangguan sintesis hemoglobin; contohnya Anemia Defisiensi Besi (ADB) dan Talasemia.',
      'Normositik (MCV 80–100 fL): Sel berukuran normal; contohnya Perdarahan Akut, Anemia Hemolitik, dan Anemia Penyakit Kronis.',
      'Makrositik (MCV > 100 fL): Gangguan sintesis DNA inti sel; contohnya Defisiensi Vitamin B12 atau Asam Folat (Anemia Megaloblastik).',
      'Klasifikasi Etiologis: (1) Gangguan produksi eritrosit di sumsum tulang, (2) Kehilangan darah akut/kronis, dan (3) Peningkatan destruksi/hemolisis.',
    ],
    referenceRanges: [
      { label: 'Mikrositik', range: 'MCV < 80 fL' },
      { label: 'Normositik', range: 'MCV 80 – 100 fL' },
      { label: 'Makrositik', range: 'MCV > 100 fL' },
    ],
    clinicalNotes: [
      'Pemeriksaan apusan darah tepi (SADT) wajib dilakukan untuk mengonfirmasi variasi ukuran (anisositosis) dan bentuk (poikilositosis).',
    ],
    narrationScript: 'Anemia diklasifikasikan menjadi tiga kategori berdasarkan MCV. Anemia mikrositik dengan MCV di bawah delapan puluh femtoliter mencakup defisiensi besi dan talasemia. Anemia normositik memiliki MCV delapan puluh hingga seratus femtoliter, dan anemia makrositik memiliki MCV di atas seratus femtoliter.',
  },
  {
    slideNumber: 13,
    totalSlides: 24,
    title: 'Jenis Anemia dan Gambaran Laboratorium',
    category: 'Anemia & Polisitemia',
    imageSrc: '/assets/pdf/atlm_calc_slide_13.png',
    summary: 'Tabel diagnosis banding profil laboratorium lengkap untuk membedakan anemia defisiensi besi, talasemia, anemia megaloblastik, penyakit kronis, hemolitik, dan aplastik.',
    bulletPoints: [
      'Defisiensi Besi: Mikrositik-hipokrom; Hb turun, MCV turun, MCH turun, Ferritin turun, RDW meningkat.',
      'Talasemia: Mikrositik-hipokrom; MCV sangat rendah tetapi jumlah RBC sering normal atau relatif tinggi; dijumpai target cells.',
      'Defisiensi B12/Folat: Makrositik megaloblastik; MCV meningkat tajam, makro-ovalosit, neutrofil hipersegmentasi (>5 lobus).',
      'Penyakit Kronis: Sering normositik; besi serum rendah, namun cadangan ferritin normal atau meningkat karena reaksi fase akut inflamasi.',
      'Anemia Hemolitik: Normositik; retikulosit meningkat tajam, bilirubin indirek naik, LDH naik, haptoglobin menurun.',
      'Anemia Aplastik: Hipoplasia sumsum tulang; retikulosit sangat rendah dan sering disertai pansitopenia (leukopenia dan trombositopenia).',
    ],
    referenceRanges: [
      { label: 'Ferritin Normal', range: '30 – 300 ng/mL' },
      { label: 'Haptoglobin Normal', range: '30 – 200 mg/dL' },
    ],
    clinicalNotes: [
      'RDW (Red Cell Distribution Width) sangat berguna: RDW tinggi khas pada defisiensi besi, sedangkan pada talasemia minor RDW umumnya normal.',
    ],
    narrationScript: 'Tabel jenis anemia dan temuan laboratorium memperlihatkan perbedaan pola parameter. Defisiensi besi ditandai penurunan ferritin dan peningkatan RDW. Talasemia memperlihatkan MCV rendah dengan jumlah RBC relatif tinggi. Pada anemia hemolitik, retikulosit dan bilirubin indirek meningkat sementara haptoglobin menurun.',
  },
  {
    slideNumber: 14,
    totalSlides: 24,
    title: 'Pendekatan Membaca Hasil Laboratorium Anemia',
    category: 'Anemia & Polisitemia',
    imageSrc: '/assets/pdf/atlm_calc_slide_14.png',
    summary: 'Algoritma 5 langkah praktis membaca dan menginterpretasikan hasil laboratorium anemia dari data skrining hingga uji konfirmasi lanjutan.',
    bulletPoints: [
      'Langkah 1: Konfirmasi nilai Hemoglobin (Hb) berada di bawah nilai rujukan sesuai usia dan jenis kelamin.',
      'Langkah 2: Evaluasi MCV untuk menentukan klasifikasi morfologis (mikrositik, normositik, atau makrositik).',
      'Langkah 3: Telaah nilai MCH/MCHC dan konfirmasi morfologi eritrosit pada sediaan apus darah tepi.',
      'Langkah 4: Evaluasi respon sumsum tulang melalui hitung retikulosit atau CRC (adekuat atau hipoproliferatif).',
      'Langkah 5: Tentukan pemeriksaan lanjutan: Ferritin/SI/TIBC, Analisis Hb Elektroforesis, B12/Folat, Profil Ginjal, atau Uji Hemolisis (Coombs test).',
    ],
    referenceRanges: [
      { label: 'Langkah Pertama', range: 'Verifikasi Kadar Hb' },
      { label: 'Langkah Penentu', range: 'Indeks MCV & Retikulosit' },
    ],
    clinicalNotes: [
      'Jangan menetapkan diagnosis hanya dari satu parameter tunggal; integrasikan riwayat klinis pasien dengan hasil konfirmasi laboratorium.',
    ],
    narrationScript: 'Pendekatan membaca hasil anemia dimulai dari konfirmasi nilai hemoglobin yang rendah. Selanjutnya periksa nilai MCV untuk membedakan ukuran eritrosit. Nilai retikulosit mencerminkan respon sumsum tulang. Jika MCV rendah dengan ferritin rendah, pertimbangkan defisiensi besi. Jika MCV tinggi dengan neutrofil hipersegmentasi, curigai defisiensi B12 atau folat.',
  },
  {
    slideNumber: 15,
    totalSlides: 24,
    title: 'Polisitemia: Relatif, Primer, dan Sekunder',
    category: 'Anemia & Polisitemia',
    imageSrc: '/assets/pdf/atlm_calc_slide_15.png',
    summary: 'Kelainan peningkatan konsentrasi hemoglobin dan hematokrit darah, serta diagnosis diferensial hemokonsentrasi versus kelainan mieloproliferatif.',
    bulletPoints: [
      'Polisitemia Relatif: Volume plasma menurun (dehidrasi, luka bakar, hemokonsentrasi); massa eritrosit sebenarnya normal.',
      'Polisitemia Absolut Primer (Polycythemia Vera): Kelainan klonal stem cell sumsum tulang; mutasi genetik JAK2 V617F (>95% kasus); kadar EPO serum tersupresi/rendah.',
      'Polisitemia Absolut Sekunder: Stimulasi fisiologis respon hipoksia jaringan (PPOK, merokok, penyakit jantung bawaan, dataran tinggi) yang memicu peningkatan hormon Eritropoietin (EPO) dari ginjal.',
    ],
    referenceRanges: [
      { label: 'Kriteria Polisitemia Pria', range: 'Hb > 18,5 g/dL atau HCT > 52%' },
      { label: 'Kriteria Polisitemia Wanita', range: 'Hb > 16,5 g/dL atau HCT > 48%' },
    ],
    clinicalNotes: [
      'Pemeriksaan saturasi oksigen, kadar hormon EPO, mutasi JAK2, dan biopsi sumsum tulang membedakan Polisitemia Vera dari bentuk sekunder.',
    ],
    narrationScript: 'Polisitemia ditandai peningkatan hemoglobin dan hematokrit. Polisitemia relatif terjadi akibat dehidrasi atau penurunan volume plasma. Polisitemia absolut primer seperti polycythemia vera merupakan kelainan klonal sumsum tulang yang terkait mutasi JAK2 dengan kadar EPO rendah, sedangkan polisitemia sekunder dipicu hipoksia jaringan dengan EPO meningkat.',
  },
  {
    slideNumber: 16,
    totalSlides: 24,
    title: 'Gangguan pada Leukosit: Kuantitas dan Etiologi',
    category: 'Leukosit & Morfologi',
    imageSrc: '/assets/pdf/atlm_calc_slide_16.png',
    summary: 'Klasifikasi gangguan kuantitatif leukosit darah (leukositosis, leukopenia, neutrofilia, neutropenia, limfositosis, eosinofilia, monositosis).',
    bulletPoints: [
      'Leukositosis (WBC > 10.000 /µL): Respon infeksi bakteri, inflamasi jaringan, nekrosis, stres fisiologis, leukemia.',
      'Leukopenia (WBC < 4.000 /µL): Infeksi virus (DBD, influenza), obat kemoterapi, kegagalan sumsum tulang, lupus/autoimun.',
      'Neutrofilia: Infeksi bakteri piogenik akut, sepsis, pemberian glukokortikoid.',
      'Neutropenia: Efek obat antitiroid/sitostatika, infeksi tifoid berat, sindrom mielodisplasia.',
      'Limfositosis: Infeksi virus akut (EBV, CMV), pertusis, leukemia limfositik kronik (CLL).',
      'Eosinofilia: Reaksi alergi, asma bronkial, dermatitis atopi, infeksi parasit cacing (helmintiasis).',
      'Monositosis: Infeksi kronis seperti Tuberkulosis (TBC), endokarditis bakterial subakut.',
    ],
    referenceRanges: [
      { label: 'Leukosit Normal', range: '4.000 – 10.000 /µL' },
      { label: 'Eosinofil Normal', range: '1 – 4% (50 – 400 /µL)' },
    ],
    clinicalNotes: [
      'Basofilia jarang terjadi; bila dijumpai basofil > 2%, pertimbangkan kecurigaan sindrom mieloproliferatif seperti Chronic Myelogenous Leukemia (CML).',
    ],
    narrationScript: 'Gangguan kuantitatif leukosit meliputi leukositosis saat sel darah putih meningkat akibat infeksi bakteri atau stres fisik, dan leukopenia akibat infeksi virus atau kemoterapi. Neutrofilia sering menandakan infeksi bakteri, limfositosis terjadi pada infeksi virus, dan eosinofilia meningkat pada reaksi alergi atau infeksi parasit.',
  },
  {
    slideNumber: 17,
    totalSlides: 24,
    title: 'Kelainan Morfologi Leukosit pada Apusan Darah',
    category: 'Leukosit & Morfologi',
    imageSrc: '/assets/pdf/atlm_calc_slide_17.png',
    summary: 'Identifikasi perubahan sitologis penting pada sel leukosit apusan darah tepi untuk mendeteksi infeksi berat, keganasan, dan defisiensi mikronutrien.',
    bulletPoints: [
      'Neutrofil Hipersegmentasi: Neutrofil dengan 6 lobus inti atau lebih; patognomonik untuk anemia megaloblastik (defisiensi B12/asam folat).',
      'Granulasi Toksik: Granula primer berwarna biru-ungu gelap kasar di sitoplasma neutrofil pada infeksi bakteri berat atau sepsis.',
      'Badan Döhle: Inklusi sitoplasma biru muda keabu-abuan (sisa retikulum endoplasma) pada kondisi inflamasi toksik.',
      'Vakuolisasi Sitoplasma: Lubang-lubang vakuol pada fagositosis bakteri aktif.',
      'Limfosit Reaktif (Atipikal): Limfosit berukuran besar dengan sitoplasma biru tua yang lentur menyusup di antara eritrosit pada infeksi mononukleosis virus.',
      'Sel Blast (Mieloblas/Limfoblas): Sel imatur berinti besar dengan anak inti (nukleoli) dan kromatin halus; tanda bahaya leukemia akut.',
    ],
    referenceRanges: [
      { label: 'Lobus Neutrofil Normal', range: '2 – 5 Lobus' },
      { label: 'Sel Blast Darah Tepi', range: '0% (Harus Negatif)' },
    ],
    clinicalNotes: [
      'Penemuan sel blast berapapun persentasenya pada darah tepi merupakan nilai kritis yang memerlukan verifikasi segera dan konfirmasi konsultan hematologi.',
    ],
    narrationScript: 'Pada evaluasi apusan darah tepi, kelainan morfologi leukosit memberikan petunjuk berharga. Neutrofil hipersegmentasi dijumpai pada anemia megaloblastik. Granulasi toksik, badan Dohle, dan vakuolisasi sitoplasma muncul pada infeksi berat. Kehadiran sel blast merupakan indikasi keganasan hematologi yang memerlukan evaluasi segera.',
  },
  {
    slideNumber: 18,
    totalSlides: 24,
    title: 'Gangguan pada Trombosit: Kuantitatif & Kualitatif',
    category: 'Hemostasis & Koagulasi',
    imageSrc: '/assets/pdf/atlm_calc_slide_18.png',
    summary: 'Kelainan jumlah trombosit (trombositopenia, trombositosis, pseudotrombositopenia) dan gangguan fungsi fungsional adhesi/agregasi trombosit.',
    bulletPoints: [
      'Trombositopenia (PLT < 150.000 /µL): Penurunan produksi (anemia aplastik), peningkatan destruksi (ITP, SLE), atau sekuestrasi di limpa splenomegali.',
      'Trombositosis (PLT > 400.000 /µL): Bersifat reaktif (infeksi, defisiensi besi, pasca-splenektomi) atau esensial klonal (Essential Thrombocythemia).',
      'Pseudotrombositopenia: Pembacaan hematology analyzer palsu akibat aglutinasi trombosit in-vitro terinduksi antikoagulan EDTA; konfirmasi dengan tabung sitrat atau apusan darah.',
      'Gangguan Adhesi: Defisiensi reseptor glikoprotein Ib pada Sindrom Bernard-Soulier.',
      'Gangguan Agregasi: Defisiensi reseptor glikoprotein IIb/IIIa pada Trombastenia Glanzmann.',
      'Gejala Klinis: Perdarahan tipe mukokutan berupa petekie, purpura, ekimosis, epistaksis, perdarahan gusi, dan menoragia.',
    ],
    referenceRanges: [
      { label: 'PLT Normal', range: '150.000 – 400.000 /µL' },
      { label: 'Batas Resiko Perdarahan Spontan', range: 'PLT < 20.000 /µL' },
    ],
    clinicalNotes: [
      'Sebelum melaporkan trombositopenia kritis, selalu periksa preparat apusan darah tepi di bagian tepi kaca untuk menyingkirkan adanya gumpalan trombosit (platelet clumping).',
    ],
    narrationScript: 'Gangguan trombosit meliputi trombositopenia bila jumlah di bawah seratus lima puluh ribu, trombositosis bila di atas empat ratus ribu, serta pseudotrombositopenia akibat penggumpalan in vitro pada tabung EDTA. Gangguan fungsi adhesi terjadi pada sindrom Bernard Soulier dan agregasi pada trombastenia Glanzmann.',
  },
  {
    slideNumber: 19,
    totalSlides: 24,
    title: 'Empat Fase Proses Hemostasis',
    category: 'Hemostasis & Koagulasi',
    imageSrc: '/assets/pdf/atlm_calc_slide_19.png',
    summary: 'Mekanisme terkoordinasi penghentian perdarahan saat dinding pembuluh darah cedera tanpa menyumbat sirkulasi pembuluh darah utuh.',
    bulletPoints: [
      'Fase 1 - Vasokonstriksi Vaskular: Penyempitan lumen pembuluh darah segera secara refleks miogenik dan pelepasan endotelin untuk meminimalkan kehilangan darah.',
      'Fase 2 - Hemostasis Primer: Adhesi trombosit pada kolagen subendotel, aktivasi sekresi granula, dan agregasi membentuk sumbat trombosit primer (platelet plug).',
      'Fase 3 - Hemostasis Sekunder: Aktivasi kaskade faktor koagulasi enzimatik menghasilkan benang-benang fibrin yang memperkuat dan menstabilkan sumbat trombosit.',
      'Fase 4 - Fibrinolisis: Penguraian bekuan fibrin secara terkontrol oleh enzim plasmin setelah perbaikan jaringan endotel pembuluh darah selesai.',
    ],
    referenceRanges: [
      { label: 'Komponen Utama', range: 'Endotel • Trombosit • Koagulasi • Fibrinolisis' },
    ],
    clinicalNotes: [
      'Keseimbangan antara faktor prokoagulan dan antikoagulan alami (Protein C, Protein S, Antitrombin) mencegah trombosis patologis intravaskular.',
    ],
    narrationScript: 'Proses hemostasis berlangsung dalam empat tahapan terpadu. Diawali vasokonstriksi untuk mempersempit pembuluh darah yang cedera, diikuti hemostasis primer di mana trombosit membentuk sumbat primer. Hemostasis sekunder memperkuat sumbat dengan jaring fibrin, dan fibrinolisis menguraikan bekuan setelah jaringan pembuluh darah pulih.',
  },
  {
    slideNumber: 20,
    totalSlides: 24,
    title: 'Hemostasis Primer: Pembentukan Sumbat Trombosit',
    category: 'Hemostasis & Koagulasi',
    imageSrc: '/assets/pdf/atlm_calc_slide_20.png',
    summary: 'Rangkaian molekuler adhesi, aktivasi, dan agregasi trombosit darah pada matriks subendotel pembuluh darah yang cedera.',
    bulletPoints: [
      'Adhesi: Faktor von Willebrand (vWF) berfungsi sebagai jembatan perekat antara serat kolagen subendotel yang terpapar dengan reseptor Glikoprotein Ib (GPIb) trombosit.',
      'Aktivasi: Trombosit berubah bentuk dari cakram menjadi pseudopodia (dendritik) dan melepaskan isi granula: ADP, Tromboksan A2 (TXA2), serotonin, dan ion kalsium.',
      'Agregasi: Molekul Fibrinogen plasma menjembatani ikatan antar-reseptor Glikoprotein IIb/IIIa (GPIIb/IIIa) yang telah aktif pada permukaan trombosit yang bertetangga.',
      'Pemeriksaan Laboratorium: Jumlah trombosit, evaluasi SADT, masa perdarahan (Bleeding Time), dan Platelet Function Analyzer (PFA-100).',
    ],
    referenceRanges: [
      { label: 'Bleeding Time Ivy Normal', range: '2 – 7 Menit' },
      { label: 'PFA Closure Time', range: 'Tervalidasi sesuai reagen kolagen/ADP' },
    ],
    clinicalNotes: [
      'Uji skrining PT dan aPTT mengukur faktor pembekuan plasma sekunder dan TIDAK menilai fungsi hemostasis primer trombosit.',
    ],
    narrationScript: 'Pada hemostasis primer, cedera endotel memaparkan kolagen subendotel. Faktor von Willebrand membantu perlekatan trombosit melalui reseptor GPIb. Trombosit aktif melepaskan mediator ADP dan tromboksan A2, lalu fibrinogen mengikat reseptor GPIIb/IIIa membentuk sumbat trombosit primer.',
  },
  {
    slideNumber: 21,
    totalSlides: 24,
    title: 'Kaskade Koagulasi: Jalur Intrinsik, Ekstrinsik, dan Bersama',
    category: 'Hemostasis & Koagulasi',
    imageSrc: '/assets/pdf/atlm_calc_slide_21.png',
    summary: 'Rangkaian aktivasi zimogen enzimatis kaskade pembekuan darah darah tepi melalui jalur intrinsik, ekstrinsik, dan konvergensinya pada jalur bersama.',
    bulletPoints: [
      'Jalur Ekstrinsik (Inisiasi Cepat): Dipicu pelepasan Tissue Factor (Faktor III) pada cedera endotel yang mengaktifkan Faktor VII menjadi VIIa. Dievaluasi dengan uji PT (Prothrombin Time) / INR.',
      'Jalur Intrinsik: Melibatkan aktivasi kontak Faktor XII -> XI -> IX -> membentuk kompleks tenase intrinsik (IXa + VIIIa + Ca²⁺ + Fosfolipid) untuk mengaktifkan Faktor X. Dievaluasi dengan aPTT (activated Partial Thromboplastin Time).',
      'Jalur Bersama (Common Pathway): Faktor Xa bersama kofaktor Va, Ca²⁺, dan fosfolipid membentuk kompleks protrombinase yang mengubah Protrombin (II) menjadi Trombin (IIa). Trombin kemudian mengubah Fibrinogen larut (I) menjadi benang Fibrin tidak larut.',
    ],
    referenceRanges: [
      { label: 'Uji Jalur Ekstrinsik', range: 'PT / INR (Faktor VII, X, V, II, I)' },
      { label: 'Uji Jalur Intrinsik', range: 'aPTT (Faktor XII, XI, IX, VIII, X, V, II, I)' },
    ],
    clinicalNotes: [
      'Hemofilia A disebabkan defisiensi Faktor VIII (aPTT memanjang, PT normal), sedangkan Hemofilia B disebabkan defisiensi Faktor IX.',
    ],
    narrationScript: 'Kaskade koagulasi terdiri atas jalur ekstrinsik dan intrinsik yang bertemu pada jalur bersama. Jalur ekstrinsik dipicu Tissue Factor dan faktor tujuh, dinilai melalui PT dan INR. Jalur intrinsik melibatkan faktor dua belas, sebelas, sembilan, dan delapan, dinilai melalui aPTT. Keduanya mengaktifkan faktor sepuluh menuju jalur bersama.',
  },
  {
    slideNumber: 22,
    totalSlides: 24,
    title: 'Jalur Bersama dan Nomenklatur Faktor Koagulasi',
    category: 'Hemostasis & Koagulasi',
    imageSrc: '/assets/pdf/atlm_calc_slide_22.png',
    summary: 'Rincian enzimatis jalur bersama pembentukan bekuan fibrin yang stabil serta daftar 13 nama resmi faktor pembekuan darah internasional.',
    bulletPoints: [
      'Tahap 1: Aktivasi Faktor X menjadi Xa oleh tenase intrinsik maupun ekstrinsik.',
      'Tahap 2: Pembentukan Kompleks Protrombinase (Xa + Va + Ion Kalsium Ca²⁺ + Fosfolipid membran trombosit).',
      'Tahap 3: Konversi Protrombin (Faktor II) menjadi enzim aktif Trombin (Faktor IIa).',
      'Tahap 4: Pembelahan Fibrinogen (Faktor I) oleh trombin menjadi monomer fibrin yang berpolimerisasi.',
      'Tahap 5: Stabilisasi bekuan oleh Faktor XIIIa (Fibrin Stabilizing Factor) melalui pembentukan ikatan kovalen silang.',
      'Nomenklatur Kunci: Faktor I = Fibrinogen; II = Protrombin; III = Tissue Factor; IV = Kalsium; V = Proakselerin; VII = Prokonvertin; VIII = Antihemophilic Factor; IX = Christmas Factor; X = Stuart-Prower; XI = PTA; XII = Hageman; XIII = FSF.',
    ],
    referenceRanges: [
      { label: 'Faktor Dependen Vitamin K', range: 'Faktor II, VII, IX, X, Protein C & S' },
    ],
    clinicalNotes: [
      'Terapi antikoagulan Warfarin menghambat sintesis faktor dependen vitamin K (II, VII, IX, X) dan dipantau menggunakan nilai PT/INR.',
    ],
    narrationScript: 'Pada jalur bersama, faktor Xa bersama faktor Va, kalsium, dan fosfolipid membentuk kompleks protrombinase yang mengubah protrombin menjadi trombin. Trombin kemudian mengubah fibrinogen menjadi fibrin, dan faktor tiga belas aktif membentuk ikatan silang yang menstabilkan bekuan darah.',
  },
  {
    slideNumber: 23,
    totalSlides: 24,
    title: 'Pemeriksaan Laboratorium Hemostasis & Interpretasi',
    category: 'Hemostasis & Koagulasi',
    imageSrc: '/assets/pdf/atlm_calc_slide_23.png',
    summary: 'Parameter tes skrining laboratorium koagulasi (PT, aPTT, TT, Fibrinogen, D-Dimer, PLT) dan interpretasi klinis pemanjangan masa pembekuan.',
    bulletPoints: [
      'PT / INR: Menilai jalur ekstrinsik dan bersama; memanjang pada defisiensi VII, X, V, II, fibrinogen, penyakit hati, defisiensi vit K, atau terapi warfarin.',
      'aPTT: Menilai jalur intrinsik dan bersama; memanjang pada hemofilia A (FVIII), hemofilia B (FIX), defisiensi FXI/FXII, terapi heparin unfractionated, atau lupus antikoagulan.',
      'TT (Thrombin Time): Menilai konversi langsung fibrinogen menjadi fibrin; memanjang bila ada heparin atau hipofibrinogenemia.',
      'Kadar Fibrinogen: Menilai kuantitas protein prekursor fibrin; menurun pada DIC konsumtif atau penyakit hati berat.',
      'D-Dimer: Produk degradasi pemecahan bekuan fibrin berikatan silang oleh plasmin; penanda sensitif aktivasi koagulasi dan lisis bekuan pada DVT, emboli paru, dan DIC.',
      'Hitung Trombosit: Menilai kuantitas trombosit untuk hemostasis primer.',
    ],
    referenceRanges: [
      { label: 'PT Normal', range: '11 – 15 Detik (INR 0,8 – 1,2)' },
      { label: 'aPTT Normal', range: '25 – 38 Detik' },
      { label: 'Fibrinogen Normal', range: '200 – 400 mg/dL' },
      { label: 'D-Dimer Normal', range: '< 500 ng/mL FEU' },
    ],
    clinicalNotes: [
      'Sampel darah koagulasi wajib menggunakan tabung natrium sitrat 3,2% dengan perbandingan volume darah dan antikoagulan tepat 9:1.',
    ],
    narrationScript: 'Pemeriksaan hemostasis mencakup PT untuk jalur ekstrinsik, aPTT untuk jalur intrinsik, Thrombin Time untuk konversi fibrinogen, serta D-dimer sebagai penanda degradasi fibrin. Rasio antikoagulan natrium sitrat sembilan banding satu wajib dipatuhi untuk akurasi pengujian hemostasis.',
  },
  {
    slideNumber: 24,
    totalSlides: 24,
    title: 'Ringkasan Materi dan Poin Penting Hematologi ATLM',
    category: 'Hemostasis & Koagulasi',
    imageSrc: '/assets/pdf/atlm_calc_slide_24.png',
    summary: 'Rangkuman intisari kompetensi hematologi: integrasi data numerik kuantitatif alat, konfirmasi morfologi mikroskopik, dan interpretasi klinis terpadu.',
    bulletPoints: [
      'Kelainan Eritrosit: Klasifikasi anemia berbasis MCV dan respon retikulosit; bedakan polisitemia relatif dengan polisitemia primer/sekunder.',
      'Kelainan Leukosit: Evaluasi leukositosis/leukopenia, hitung jenis (diff count), dan identifikasi kelainan morfologi toksik atau blast.',
      'Kelainan Trombosit: Trombositopenia/trombositosis, waspadai pseudotrombositopenia pada EDTA, dan evaluasi potensi kelainan fungsi adhesi/agregasi.',
      'Mekanisme Hemostasis: Hemostasis primer (trombosit & vWF), hemostasis sekunder (kaskade enzimatis intrinsik, ekstrinsik, bersama menghasilkan fibrin stabil), serta fibrinolisis.',
    ],
    referenceRanges: [
      { label: 'Kompetensi Utama ATLM', range: 'Analitik • Quality Control • Validasi Klinis' },
      { label: 'Sumber Materi Kuliah', range: 'dr. Juwita Ninda Suherman, M.Kes' },
    ],
    clinicalNotes: [
      'Selalu lakukan korelasi silang (cross-check) antara hitung alat otomatis, apusan darah tepi, dan kondisi klinis pasien sebelum memvalidasi hasil laboratorium.',
    ],
    narrationScript: 'Sebagai rangkuman materi perkuliahan Hematologi ATLM: gabungkan selalu data hitung darah lengkap, indeks eritrosit, pengamatan morfologi apusan darah tepi, dan pemeriksaan hemostasis. Selamat belajar dan sukses mempersiapkan kompetensi teknologi laboratorium medik bersama dr. Juwita Ninda Suherman, M.Kes.',
  },
];
