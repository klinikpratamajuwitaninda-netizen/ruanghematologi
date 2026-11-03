export type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E';

export interface ClinicalCaseTable {
  anamnesis: string;
  physicalExam: string;
  doctorOrder: string;
  labResults: string;
  medicationContext: string;
}

export interface QuizQuestionItem {
  questionNumber: number;
  sectionCode: 'A' | 'B' | 'C' | 'D';
  category: 'theory' | 'combined' | 'clinical_case' | 'calculation';
  topic: string;
  caseTable?: ClinicalCaseTable;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctOption: OptionKey;
  scientificExplanation: string;
  atlmProcedureAndDecision: string;
  doctorClinicalExplanation: string;
  patientEducation: string;
  whyOthersWrong: string;
  calculationSteps?: string;
  pdfPageRef: string;
}

export const QUIZ_30_QUESTIONS: QuizQuestionItem[] = [
  // ===========================================================================
  // BAGIAN A: 10 SOAL TEORI (NOMOR 01 - 10)
  // Dasar hematologi, specimen handling, morfologi, dan mutu hasil
  // ===========================================================================
  {
    questionNumber: 1,
    sectionCode: 'A',
    category: 'theory',
    topic: 'SOAL 01 | Antikoagulan untuk hitung darah lengkap',
    questionText:
      'Pada pengambilan sampel untuk pemeriksaan CBC, tujuan utama penggunaan K2EDTA ialah ...',
    options: {
      A: 'Meningkatkan kadar hemoglobin melalui reaksi oksidasi',
      B: 'Mengikat ion kalsium sehingga darah tidak membeku dan sel tetap dapat dihitung',
      C: 'Mengubah fibrinogen menjadi fibrin',
      D: 'Mencegah seluruh perubahan morfologi selama waktu tak terbatas',
      E: 'Meningkatkan konsentrasi trombosit dengan memecah agregat',
    },
    correctOption: 'B',
    scientificExplanation:
      'EDTA mengkelat kalsium yang diperlukan untuk koagulasi. Tabung EDTA sesuai untuk CBC, tetapi volume, pencampuran, waktu dan stabilitas sampel tetap harus mengikuti prosedur. EDTA kadang memicu agregasi trombosit in vitro sehingga hitung trombosit otomatis dapat tampak rendah palsu.',
    atlmProcedureAndDecision:
      'Pastikan tabung K2EDTA terisi sesuai tanda batas dan dihomogenkan secara inversi lembut 8–10 kali. Periksa ada tidaknya mikro-bekuan sebelum sampel dianalisis.',
    doctorClinicalExplanation:
      'Kualitas sampel EDTA yang bebas bekuan menjamin akurasi nilai Hb, jumlah leukosit, dan trombosit yang digunakan dokter dalam pengambilan keputusan klinis.',
    patientEducation:
      'Penjelasan bahwa darah diambil menggunakan tabung bertutup ungu khusus agar darah tetap cair saat diperiksa oleh alat laboratorium.',
    whyOthersWrong:
      'A salah karena EDTA bukan reagen oksidasi Hb; C adalah peran trombin; D salah karena stabilitas morfologi dalam EDTA memiliki batas waktu (umumnya <2–4 jam untuk apusan optimal); E salah karena EDTA justru dapat memicu clumping trombosit pada sebagian kecil pasien.',
    pdfPageRef: 'Acuan: M1 (PDF ANFIS Darah dr. Juwita Ninda, M.Kes); R2',
  },
  {
    questionNumber: 2,
    sectionCode: 'A',
    category: 'theory',
    topic: 'SOAL 02 | Tabung untuk uji koagulasi',
    questionText:
      'Untuk pemeriksaan PT dan aPTT pada pasien dengan hematokrit biasa, prinsip pengambilan darah yang tepat adalah ...',
    options: {
      A: 'Tabung serum tanpa antikoagulan',
      B: 'Tabung EDTA dengan rasio darah berapa saja',
      C: 'Tabung sitrat 3,2% dengan rasio darah terhadap sitrat sekitar 9:1',
      D: 'Tabung heparin dengan volume bebas',
      E: 'Tabung fluorida untuk mempertahankan faktor koagulasi',
    },
    correctOption: 'C',
    scientificExplanation:
      'Uji PT/aPTT menggunakan plasma sitrat. Perbandingan darah dengan antikoagulan sekitar 9:1 menjadi penting karena sitrat berlebih pada tabung kurang terisi bisa memperpanjang hasil secara artifisial. Pada hematokrit sangat tinggi, volume sitrat perlu disesuaikan berdasarkan prosedur tervalidasi.',
    atlmProcedureAndDecision:
      'Gunakan tabung tutup biru muda (Natrium Sitrat 3,2%) dan verifikasi volume darah mencapai garis batas (toleransi ±10%) sebelum sentrifugasi untuk mendapatkan Platelet-Poor Plasma (PPP).',
    doctorClinicalExplanation:
      'Rasio 9:1 memungkinkan penambahan kembali kalsium secara presisi di alat koagulasi untuk mengukur waktu pembentukan bekuan fibrin jalur ekstrinsik (PT) dan intrinsik (aPTT).',
    patientEducation:
      'Edukasi bahwa volume darah pada tabung koagulasi harus pas sesuai takaran agar hasil pemantauan pengencer darah akurat.',
    whyOthersWrong:
      'A salah karena serum sudah kehilangan fibrinogen dan faktor pembekuan; B dan D menghambat koagulasi secara tidak sesuai untuk uji PT/aPTT; E digunakan untuk menghambat glikolisis pada pemeriksaan glukosa.',
    pdfPageRef: 'Acuan: R2 (ICSH Coagulation Collection)',
  },
  {
    questionNumber: 3,
    sectionCode: 'A',
    category: 'theory',
    topic: 'SOAL 03 | Perbedaan plasma dan serum',
    questionText:
      'Perbedaan paling bermakna antara plasma dan serum untuk kajian hemostasis ialah ...',
    options: {
      A: 'Serum mempertahankan fibrinogen dalam kadar sama dengan plasma',
      B: 'Plasma tidak mengandung protein sama sekali',
      C: 'Serum mengandung lebih banyak eritrosit dibanding plasma',
      D: 'Plasma mengandung faktor koagulasi termasuk fibrinogen, sedangkan serum diperoleh setelah pembekuan',
      E: 'Keduanya hanya dibedakan oleh warna tabung',
    },
    correctOption: 'D',
    scientificExplanation:
      'Plasma diperoleh dengan pemisahan darah berantikoagulan sehingga masih memiliki fibrinogen. Serum merupakan cairan setelah darah mengalami pembekuan; fibrinogen telah banyak digunakan pada pembentukan bekuan. Karena itu serum tidak dipakai untuk PT dan aPTT.',
    atlmProcedureAndDecision:
      'ATLM wajib memilih plasma sitrat (bukan serum) untuk seluruh pemeriksaan fungsi faktor pembekuan darah dan kadar fibrinogen.',
    doctorClinicalExplanation:
      'Keberadaan fibrinogen utuh di dalam plasma merupakan syarat mutlak untuk menilai pembentukan jaring fibrin akhir pada kaskade koagulasi.',
    patientEducation:
      'Menjelaskan perbedaan komponen cair darah sebelum dan sesudah proses pembekuan.',
    whyOthersWrong:
      'A salah karena fibrinogen habis terpakai menjadi fibrin saat darah membeku menjadi serum; B salah karena plasma mengandung ~7% protein (albumin, globulin, fibrinogen); C dan E tidak tepat secara ilmiah.',
    pdfPageRef: 'Acuan: M1 (PDF ANFIS Darah Hal. 7 & 34)',
  },
  {
    questionNumber: 4,
    sectionCode: 'A',
    category: 'theory',
    topic: 'SOAL 04 | Lapisan buffy coat',
    questionText:
      'Setelah sentrifugasi darah berantikoagulan, lapisan buffy coat terutama mengandung ...',
    options: {
      A: 'Leukosit dan trombosit',
      B: 'Hanya albumin',
      C: 'Hanya retikulosit',
      D: 'Fibrin yang telah menggumpal',
      E: 'Hanya eritrosit matur',
    },
    correctOption: 'A',
    scientificExplanation:
      'Buffy coat terletak di antara plasma dan lapisan eritrosit serta kaya leukosit dan trombosit. Fraksi ini biasanya kurang dari 1% volume darah.',
    atlmProcedureAndDecision:
      'Saat mengamati tabung darah pasca-sentrifugasi, ATLM mengidentifikasi plasma di bagian atas (~55%), buffy coat tipis di tengah (<1%), dan eritrosit pekat di bagian bawah (~45%).',
    doctorClinicalExplanation:
      'Ketebalan buffy coat yang meningkat mencolok secara makroskopis dapat menjadi petunjuk awal adanya leukositosis ekstrem atau trombositosis.',
    patientEducation:
      'Menjelaskan bahwa darah tersusun atas bagian cair (plasma), sel darah merah, serta lapisan tipis sel darah putih dan keping darah.',
    whyOthersWrong:
      'B berada di lapisan plasma atas; C dan E berada di lapisan eritrosit bawah; D tidak terbentuk karena sampel diberi antikoagulan.',
    pdfPageRef: 'Acuan: M1 (PDF ANFIS Darah Hal. 5)',
  },
  {
    questionNumber: 5,
    sectionCode: 'A',
    category: 'theory',
    topic: 'SOAL 05 | Morfologi granulosit',
    questionText:
      'Pada apusan darah tepi berpewarnaan Romanowsky, sel dengan inti bilobus dan granula jingga kemerahan menonjol paling mungkin merupakan ...',
    options: {
      A: 'Basofil',
      B: 'Limfosit',
      C: 'Neutrofil batang',
      D: 'Monosit',
      E: 'Eosinofil',
    },
    correctOption: 'E',
    scientificExplanation:
      'Eosinofil memiliki inti lazimnya bilobus dan granula sitoplasma besar yang berwarna jingga-merah. Basofil mempunyai granula gelap, neutrofil inti bersegmen dengan granula halus, dan monosit berinti berlekuk.',
    atlmProcedureAndDecision:
      'ATLM mengidentifikasi eosinofil pada hitung jenis leukosit melalui ciri khas granula kasar seragam berwarna merah-jingga terang yang mengikat zat warna asam (eosin) dan tidak menutupi inti.',
    doctorClinicalExplanation:
      'Peningkatan proporsi eosinofil (eosinofilia) berkorelasi dengan respons terhadap infeksi parasit (helmintiasis) dan reaksi hipersensitivitas/alergi.',
    patientEducation:
      'Menjelaskan fungsi sel eosinofil sebagai bagian dari sistem pertahanan tubuh terhadap alergi dan parasit.',
    whyOthersWrong:
      'A bergranula biru-ungu gelap yang menutupi inti; B agranulosit berinti bulat padat; C berinti seperti pita/huruf C atau U dengan granula halus netral; D agranulosit besar berinti ginjal.',
    pdfPageRef: 'Acuan: M1 (PDF ANFIS Darah Hal. 27); R1',
  },
  {
    questionNumber: 6,
    sectionCode: 'A',
    category: 'theory',
    topic: 'SOAL 06 | Pewarnaan retikulosit',
    questionText:
      'Prinsip pemeriksaan retikulosit manual untuk memperlihatkan sisa RNA eritrosit muda adalah penggunaan ...',
    options: {
      A: 'Pewarnaan Gram',
      B: 'Pewarnaan supravital seperti new methylene blue',
      C: 'Uji antigen D',
      D: 'Pewarnaan Ziehl-Neelsen',
      E: 'Pewarnaan khusus faktor VIII',
    },
    correctOption: 'B',
    scientificExplanation:
      'Retikulosit masih menyimpan RNA residual yang membentuk gambaran jala saat diwarnai secara supravital. Hitung retikulosit membantu menilai aktivitas eritropoiesis; tidak sama dengan sekadar menghitung eritrosit berinti pada apusan rutin.',
    atlmProcedureAndDecision:
      'ATLM mencampurkan darah segar dengan larutan supravital New Methylene Blue atau Brilliant Cresyl Blue sebelum sel difiksasi agar RNA ribosom terpresipitasi menjadi filamen biru gelap.',
    doctorClinicalExplanation:
      'Persentase dan jumlah absolut retikulosit digunakan dokter untuk membedakan anemia hiperproliferatif (hemolisis/perdarahan akut) dari anemia hipoproliferatif.',
    patientEducation:
      'Menjelaskan bahwa pemeriksaan retikulosit bertujuan melihat kemampuan sumsum tulang memproduksi sel darah merah muda.',
    whyOthersWrong:
      'A untuk bakteri; C untuk golongan darah Rhesus; D untuk basil tahan asam (Mycobacterium); E bukan metode pewarnaan retikulosit.',
    pdfPageRef: 'Acuan: M1 (PDF ANFIS Darah Hal. 17); R1',
  },
  {
    questionNumber: 7,
    sectionCode: 'A',
    category: 'theory',
    topic: 'SOAL 07 | Hasil CBC dan mekanisme ukur',
    questionText:
      'Pernyataan yang paling tepat mengenai hematology analyzer modern adalah ...',
    options: {
      A: 'Semua parameter CBC selalu dihitung langsung tanpa rumus',
      B: 'Hasil flag alat selalu merupakan diagnosis akhir',
      C: 'Hb, jumlah eritrosit, dan hematokrit harus dibaca bersama karena sebagian indeks dihitung dari parameter lain',
      D: 'MCHC ditentukan hanya dari jumlah limfosit',
      E: 'Apusan darah tidak lagi diperlukan ketika terdapat flag blast',
    },
    correctOption: 'C',
    scientificExplanation:
      'Parameter CBC saling terkait. Hb umumnya diukur secara fotometrik dengan metode yang bergantung alat, sedangkan jumlah dan karakteristik sel dihitung dengan teknologi impedansi atau optik. MCH, MCV dan MCHC saling terkait sehingga ketidaksesuaian perlu ditelaah. Flag tidak menggantikan konfirmasi.',
    atlmProcedureAndDecision:
      'ATLM wajib mengevaluasi konsistensi antardata (Hb, Hct, RBC, MCV, MCH, MCHC), membaca histogram/scattergram, dan menindaklanjuti setiap flag alat dengan telaah apusan darah tepi.',
    doctorClinicalExplanation:
      'Kombinasi parameter terukur dan terhitung pada CBC memberikan gambaran utuh kuantitas sekaligus morfologi sel darah.',
    patientEducation:
      'Menjelaskan mengapa pemeriksaan darah otomatis terkadang memerlukan konfirmasi mikroskop oleh petugas laboratorium.',
    whyOthersWrong:
      'A salah karena MCH dan MCHC dihitung dari rumus; B dan E salah karena flag alat wajib dikonfirmasi secara mikroskopis; D salah karena MCHC dihitung dari Hb dan Hct.',
    pdfPageRef: 'Acuan: R1 (Rodak’s Hematology)',
  },
  {
    questionNumber: 8,
    sectionCode: 'A',
    category: 'theory',
    topic: 'SOAL 08 | Regulasi eritropoiesis',
    questionText:
      'Penurunan oksigen jaringan terutama merangsang produksi eritropoietin oleh organ ...',
    options: {
      A: 'Ginjal',
      B: 'Pankreas',
      C: 'Limpa',
      D: 'Nodus limfa',
      E: 'Lambung',
    },
    correctOption: 'A',
    scientificExplanation:
      'Ginjal memproduksi sebagian besar eritropoietin pada orang dewasa sebagai respons terhadap hipoksia. Hormon ini merangsang pembentukan eritrosit di sumsum tulang, tetapi produksi tetap membutuhkan besi, folat, dan vitamin B12 yang cukup.',
    atlmProcedureAndDecision:
      'Saat menemukan anemia normositik normokromik dengan retikulosit rendah pada pasien gangguan fungsi ginjal, ATLM memahami kaitan patofisiologi defisiensi EPO.',
    doctorClinicalExplanation:
      'Kerusakan parenkim ginjal pada Penyakit Ginjal Kronis (CKD) menurunkan sintesis EPO sehingga menyebabkan anemia renal.',
    patientEducation:
      'Menjelaskan peran ginjal dalam menghasilkan hormon pemicu pembentukan sel darah merah.',
    whyOthersWrong:
      'B mengatur glukosa (insulin/glukagon) dan enzim pencernaan; C menghancurkan eritrosit tua dan fungsi imun; D organ limfoid; E menghasilkan faktor intrinsik untuk absorbsi B12, bukan EPO.',
    pdfPageRef: 'Acuan: M1 (PDF ANFIS Darah Hal. 18)',
  },
  {
    questionNumber: 9,
    sectionCode: 'A',
    category: 'theory',
    topic: 'SOAL 09 | Fragmen eritrosit',
    questionText: 'Pada apusan darah tepi, schistocyte adalah ...',
    options: {
      A: 'Eritrosit yang memiliki inti',
      B: 'Eritrosit berbentuk sabit akibat HbS yang selalu normal',
      C: 'Eritrosit berukuran besar dengan inti hiperlobus',
      D: 'Fragmen eritrosit akibat kerusakan mekanis yang dapat berkaitan dengan mikroangiopati trombotik',
      E: 'Sel darah putih dengan granula toksik',
    },
    correctOption: 'D',
    scientificExplanation:
      'Schistocyte merupakan fragmen eritrosit, misalnya bentuk helmet atau segitiga tidak teratur. Pada konteks klinis dan laboratorium yang sesuai, proporsi lebih dari 1% pada dewasa mencurigakan mikroangiopati trombotik, tetapi bukan diagnosis tunggal.',
    atlmProcedureAndDecision:
      'ATLM menghitung persentase schistocyte per 1.000 eritrosit pada apusan darah tepi sesuai pedoman ICSH dan segera melaporkannya bila meningkat pada pasien trombositopenia.',
    doctorClinicalExplanation:
      'Temuan schistocyte >1% bersama trombositopenia dan peningkatan LDH mengarahkan evaluasi darurat terhadap TTP, HUS, atau DIC.',
    patientEducation:
      'Menjelaskan bahwa bentuk pecahan sel darah merah dipantau untuk menilai keutuhan aliran darah di pembuluh kecil.',
    whyOthersWrong:
      'A adalah eritroblas berinti (NRBC); B adalah drepanosit (sickle cell) yang bersifat patologis; C mencampurkan makrosit dan neutrofil; E adalah perubahan reaktif neutrofil.',
    pdfPageRef: 'Acuan: R3 (ICSH Schistocyte Guideline)',
  },
  {
    questionNumber: 10,
    sectionCode: 'A',
    category: 'theory',
    topic: 'SOAL 10 | Batas kewenangan ATLM',
    questionText:
      'Saat ATLM menemukan hasil trombosit yang memenuhi kriteria nilai kritis setelah verifikasi, tindakan profesional yang paling tepat adalah ...',
    options: {
      A: 'Meresepkan transfusi trombosit secara mandiri',
      B: 'Mengubah hasil agar tidak menimbulkan kepanikan',
      C: 'Menunggu sampai pemeriksaan rutin keesokan hari',
      D: 'Menyuruh pasien menghentikan seluruh obat tanpa konsultasi',
      E: 'Melaporkan dan mendokumentasikan hasil kritis kepada dokter/unit terkait sesuai SOP, serta menyampaikan keterbatasan pemeriksaan',
    },
    correctOption: 'E',
    scientificExplanation:
      'ATLM bertanggung jawab atas mutu preanalitik, analitik dan pascaanalitik termasuk komunikasi hasil kritis. Dokter menentukan diagnosis dan terapi berdasarkan konteks pasien. Laporan harus dapat ditelusuri, memuat identitas, waktu, penerima dan konfirmasi komunikasi sesuai SOP.',
    atlmProcedureAndDecision:
      'Verifikasi bebas bekuan dan bebas clumping pada apusan, lalu lakukan pelaporan nilai kritis segera (read-back policy) kepada dokter/perawat yang merawat.',
    doctorClinicalExplanation:
      'Pelaporan nilai kritis yang cepat dan terverifikasi memungkinkan dokter mengambil keputusan pencegahan perdarahan secara tepat waktu.',
    patientEducation:
      'Menginformasikan bahwa hasil laboratorium telah diteruskan secara prioritas kepada dokter penanggung jawab.',
    whyOthersWrong:
      'A dan D melampaui batas kewenangan klinis ATLM; B melanggar integritas data laboratorium; C membahayakan keselamatan pasien.',
    pdfPageRef: 'Acuan: R1 (Rodak’s Hematology)',
  },

  // ===========================================================================
  // BAGIAN B: 15 SOAL GABUNGAN RINGAN-SEDANG (NOMOR 11 - 25)
  // Penerapan singkat CBC, hitung diferensial, hemostasis, transfusi dan QC
  // ===========================================================================
  {
    questionNumber: 11,
    sectionCode: 'B',
    category: 'combined',
    topic: 'SOAL 11 | Indikasi telaah apusan darah',
    questionText:
      'Analyzer menunjukkan pesan "blast/abnormal lymphocyte?" pada CBC. Tindakan laboratorium berikut yang paling tepat ialah ...',
    options: {
      A: 'Menandai hasil sebagai leukemia tanpa mikroskopi',
      B: 'Mengabaikan pesan alat karena Hb normal',
      C: 'Memeriksa kualitas spesimen dan melakukan telaah apusan darah sesuai kriteria review laboratorium',
      D: 'Mengganti nilai leukosit dengan nol',
      E: 'Menambahkan antibiotik ke spesimen',
    },
    correctOption: 'C',
    scientificExplanation:
      'Flag abnormalitas sel adalah pemicu telaah, bukan hasil akhir. ATLM menilai spesimen, membuat/memeriksa apusan, mencatat morfologi dan merujuk temuan mencurigakan kepada penelaah berwenang.',
    atlmProcedureAndDecision:
      'Jangan merilis hasil otomatis secara langsung saat muncul flag blast; buat Sediaan Apus Darah Tepi (SADT) dan lakukan telaah mikroskopis.',
    doctorClinicalExplanation:
      'Konfirmasi mikroskopis membedakan limfosit reaktif (infeksi virus) dari sel blas sejati (keganasan hematologi).',
    patientEducation:
      'Menjelaskan perlunya pemeriksaan mikroskopis lanjutan untuk memastikan bentuk sel darah putih.',
    whyOthersWrong:
      'A melompat ke diagnosis tanpa bukti mikroskopis; B mengabaikan peringatan kritis alat; D dan E merusak validitas spesimen dan data.',
    pdfPageRef: 'Acuan: R1',
  },
  {
    questionNumber: 12,
    sectionCode: 'B',
    category: 'combined',
    topic: 'SOAL 12 | MCV dan morfologi eritrosit',
    questionText:
      'CBC menunjukkan MCV 71 fL dan MCHC 29 g/dL. Deskripsi morfologi yang paling sesuai untuk dicari pada apusan adalah ...',
    options: {
      A: 'Makrosit normokromik',
      B: 'Mikrosit hipokromik',
      C: 'Eritrosit berinti dominan',
      D: 'Sferosit tanpa pallor dominan pasti',
      E: 'Eritrosit normal tanpa variasi',
    },
    correctOption: 'B',
    scientificExplanation:
      'MCV rendah menunjukkan volume eritrosit rerata kecil, sedangkan MCHC rendah mendukung hipokromia. Penyebabnya tetap memerlukan integrasi dengan ferritin, RDW, jumlah eritrosit dan riwayat klinis.',
    atlmProcedureAndDecision:
      'Pada apusan darah tepi, ATLM mengamati ukuran eritrosit yang lebih kecil dari inti limfosit kecil matur serta pelebaran daerah pucat sentral (central pallor > 1/3 diameter sel).',
    doctorClinicalExplanation:
      'Gambaran mikrositik hipokromik mengarahkan evaluasi diagnosis banding pada Anemia Defisiensi Besi, Thalassemia, atau Anemia Penyakit Kronis lanjut.',
    patientEducation:
      'Menjelaskan bahwa ukuran sel darah merah tampak lebih kecil dan warnanya lebih pucat karena kurangnya muatan hemoglobin.',
    whyOthersWrong:
      'A untuk MCV >100 fL dan MCHC 32–36 g/dL; C tidak ditentukan semata oleh MCV/MCHC rendah; D memiliki MCHC tinggi (>36 g/dL); E untuk MCV 80–100 fL dan MCHC 32–36 g/dL.',
    pdfPageRef: 'Acuan: M1 (PDF ANFIS Darah Hal. 23–24); R1',
  },
  {
    questionNumber: 13,
    sectionCode: 'B',
    category: 'combined',
    topic: 'SOAL 13 | Retikulosit pada anemia',
    questionText:
      'Hb seorang pasien turun menjadi 8,0 g/dL dan retikulosit relatif hanya 0,3%. Temuan ini paling mendukung ...',
    options: {
      A: 'Respons sumsum tulang belum memadai untuk derajat anemia',
      B: 'Hemolisis berat dengan kompensasi maksimal',
      C: 'Perdarahan akut yang pasti sudah pulih',
      D: 'Jumlah trombosit tinggi',
      E: 'Hiperfungsi limpa yang pasti',
    },
    correctOption: 'A',
    scientificExplanation:
      'Retikulosit rendah pada anemia menandakan respons produksi eritrosit tidak memadai. Interpretasi lebih tepat memakai hitung retikulosit absolut atau indeks produksi yang dikoreksi sesuai kondisi pasien.',
    atlmProcedureAndDecision:
      'ATLM memverifikasi hitung retikulosit dan menyertakannya bersama hasil CBC agar dokter dapat menilai status regenerasi eritropoiesis.',
    doctorClinicalExplanation:
      'Retikulositopenia (0,3%) pada kondisi Hb 8,0 g/dL menunjukkan anemia hipoproliferatif (misal defisiensi besi/B12/EPO atau kegagalan sumsum tulang).',
    patientEducation:
      'Menjelaskan bahwa produksi sel darah merah baru di sumsum tulang saat ini belum meningkat sesuai kebutuhan tubuh.',
    whyOthersWrong:
      'B dan C yang berkompensasi baik akan menunjukkan retikulositosis tinggi; D dan E tidak ditentukan dari persentase retikulosit rendah.',
    pdfPageRef: 'Acuan: M1 (PDF ANFIS Darah Hal. 17 & 38); R1',
  },
  {
    questionNumber: 14,
    sectionCode: 'B',
    category: 'combined',
    topic: 'SOAL 14 | Hitung absolut neutrofil',
    questionText:
      'Leukosit 2.000/uL dengan neutrofil segmen 20% dan batang 5%. Berapa absolute neutrophil count (ANC)?',
    options: {
      A: '100/uL',
      B: '250/uL',
      C: '400/uL',
      D: '500/uL',
      E: '1.000/uL',
    },
    correctOption: 'D',
    scientificExplanation:
      'ANC = jumlah leukosit x (persen neutrofil segmen + batang)/100 = 2.000 x 25/100 = 500/uL. Nilai ini bermakna neutropenia dan perlu dikaitkan dengan suhu pasien dan kebijakan pelaporan kritis.',
    atlmProcedureAndDecision:
      'ATLM menjumlahkan persentase neutrofil segmen (20%) dan neutrofil batang (5%) menjadi 25%, lalu mengalikan dengan total WBC (2.000/µL) = 500/µL.',
    doctorClinicalExplanation:
      'Nilai ANC ≤ 500/µL menunjukkan neutropenia berat yang meningkatkan risiko infeksi bakteri dan jamur oportunistik secara signifikan.',
    patientEducation:
      'Edukasi kewaspadaan terhadap demam dan menjaga kebersihan diri karena daya tahan sel darah putih sedang rendah.',
    whyOthersWrong:
      'A hanya menghitung 5% batang; B, C, dan E tidak sesuai dengan substitusi rumus ANC = 2.000 × (20+5)/100.',
    calculationSteps:
      'ANC = Total WBC × (% Segmen + % Batang) / 100 = 2.000 × (20 + 5) / 100 = 2.000 × 0,25 = 500/uL.',
    pdfPageRef: 'Acuan: R1',
  },
  {
    questionNumber: 15,
    sectionCode: 'B',
    category: 'combined',
    topic: 'SOAL 15 | Monosit dalam jaringan',
    questionText:
      'Pada pasien infeksi kronis, salah satu fungsi monosit setelah bermigrasi ke jaringan adalah berdiferensiasi menjadi ...',
    options: {
      A: 'Eritroblas',
      B: 'Megakariosit',
      C: 'Makrofag',
      D: 'Trombosit',
      E: 'Retikulosit',
    },
    correctOption: 'C',
    scientificExplanation:
      'Monosit sirkulasi dapat masuk ke jaringan dan berdiferensiasi menjadi makrofag yang memfagositosis serta mendukung presentasi antigen.',
    atlmProcedureAndDecision:
      'ATLM mengenali monosit sebagai leukosit terbesar di darah tepi dengan inti berbentuk ginjal/tapal kuda dan sitoplasma biru keabu-abuan.',
    doctorClinicalExplanation:
      'Monositosis di darah tepi sering menyertai infeksi intraseluler kronis (seperti TBC) atau fase pemulihan infeksi akut.',
    patientEducation:
      'Menjelaskan peran monosit dan makrofag sebagai sel pembersih jaringan dari kuman dan sisa sel mati.',
    whyOthersWrong:
      'A dan E merupakan jalur pematangan eritrosit; B dan D merupakan jalur pembentukan keping darah (trombosit).',
    pdfPageRef: 'Acuan: M1 (PDF ANFIS Darah Hal. 28)',
  },
  {
    questionNumber: 16,
    sectionCode: 'B',
    category: 'combined',
    topic: 'SOAL 16 | Membedakan anemia defisiensi besi',
    questionText:
      'Pasien anemia mikrositik dengan ferritin 5 ng/mL, CRP normal, RDW meningkat. Pola laboratorium paling menunjang ...',
    options: {
      A: 'Defisiensi besi',
      B: 'Eritrositosis primer',
      C: 'Trombofilia herediter',
      D: 'Infeksi virus tanpa anemia',
      E: 'Hipervitaminosis B12',
    },
    correctOption: 'A',
    scientificExplanation:
      'Ferritin sangat rendah dalam konteks inflamasi yang tidak meningkat mendukung cadangan besi menipis. ATLM melaporkan pola pemeriksaan; penyebab kehilangan besi dan kebutuhan terapi dievaluasi dokter.',
    atlmProcedureAndDecision:
      'Pastikan hasil CBC (mikrositik dengan RDW meningkat/anisositosis) serta hasil kimia/imunoasai (ferritin 5 ng/mL dan CRP normal) tervalidasi dengan baik.',
    doctorClinicalExplanation:
      'Kadar ferritin <15 ng/mL dengan CRP normal mengonfirmasi secara spesifik Anemia Defisiensi Besi tanpa interferensi reaksi fase akut.',
    patientEducation:
      'Menjelaskan bahwa cadangan besi tubuh terkuras sehingga diperlukan evaluasi sumber perdarahan dan pemulihan zat besi oleh dokter.',
    whyOthersWrong:
      'B ditandai peningkatan Hb/Hct; C adalah gangguan kecenderungan pembekuan darah; D dan E tidak menyebabkan anemia mikrositik dengan ferritin rendah.',
    pdfPageRef: 'Acuan: R1; R4 (WHO 2024)',
  },
  {
    questionNumber: 17,
    sectionCode: 'B',
    category: 'combined',
    topic: 'SOAL 17 | Pergeseran ke kiri',
    questionText:
      'Pada pasien dengan dugaan infeksi bakteri, neutrofil batang meningkat dan terlihat bentuk imatur granulosit. Temuan ini disebut ...',
    options: {
      A: 'Retikulositosis',
      B: 'Target cell',
      C: 'Pansitopenia',
      D: 'Aglutinasi eritrosit',
      E: 'Left shift granulosit',
    },
    correctOption: 'E',
    scientificExplanation:
      'Left shift menunjukkan peningkatan pelepasan neutrofil yang lebih muda. Temuan dapat terjadi pada inflamasi atau infeksi dan tidak cukup untuk menetapkan penyebab tanpa konteks dan pemeriksaan pendukung.',
    atlmProcedureAndDecision:
      'ATLM menghitung secara cermat proporsi neutrofil batang, metamielosit, atau mielosit pada apusan darah tepi serta mencatat adanya granula toksik atau vakuolisasi.',
    doctorClinicalExplanation:
      'Pergeseran ke kiri (left shift) menandakan sumsum tulang memobilisasi cadangan granulosit muda secara cepat untuk merespons infeksi/inflamasi akut.',
    patientEducation:
      'Menjelaskan bahwa tubuh sedang mengerahkan sel darah putih muda untuk melawan proses infeksi.',
    whyOthersWrong:
      'A adalah peningkatan eritrosit muda; B adalah poikilositosis eritrosit (codocyte); C adalah penurunan ketiga lini sel darah; D adalah penggumpalan eritrosit.',
    pdfPageRef: 'Acuan: M1; R1',
  },
  {
    questionNumber: 18,
    sectionCode: 'B',
    category: 'combined',
    topic: 'SOAL 18 | Ambang anemia WHO 2024',
    questionText:
      'Wanita 27 tahun, tidak hamil, Hb 11,5 g/dL dan berada pada ketinggian sekitar permukaan laut. Berdasarkan pedoman WHO 2024, hasil ini ...',
    options: {
      A: 'Normal karena batas anemia di bawah 10 g/dL',
      B: 'Mengarah pada anemia karena ambang wanita dewasa tidak hamil adalah Hb <12 g/dL',
      C: 'Selalu menunjukkan anemia berat',
      D: 'Menentukan diagnosis leukemia',
      E: 'Tidak dapat dinilai dari Hb',
    },
    correctOption: 'B',
    scientificExplanation:
      'WHO 2024 menetapkan ambang anemia pada wanita dewasa tidak hamil usia 15-65 tahun di bawah 12 g/dL dalam kondisi acuan. Penilaian klinis dapat mempertimbangkan kehamilan, ketinggian, kebiasaan merokok, dan kondisi lain.',
    atlmProcedureAndDecision:
      'ATLM memberikan penanda (flag rendah) sesuai rentang rujukan dewasa perempuan tidak hamil (<12,0 g/dL) dan menyertakan indeks eritrosit lengkap.',
    doctorClinicalExplanation:
      'Hb 11,5 g/dL tergolong anemia ringan pada perempuan tidak hamil dan memerlukan evaluasi indeks eritrosit serta status besi.',
    patientEducation:
      'Menjelaskan bahwa kadar Hb sedikit di bawah batas normal perempuan dewasa (12,0 g/dL) sehingga perlu dievaluasi pola makan dan siklus menstruasinya.',
    whyOthersWrong:
      'A menggunakan ambang yang salah; C salah karena anemia berat umumnya Hb <8,0 g/dL; D dan E tidak tepat secara klinis.',
    pdfPageRef: 'Acuan: R4 (WHO 2024 Guideline); PDF ANFIS Darah Hal. 41',
  },
  {
    questionNumber: 19,
    sectionCode: 'B',
    category: 'combined',
    topic: 'SOAL 19 | Trombosit raksasa',
    questionText:
      'Hitung trombosit otomatis 92.000/uL, tetapi apusan menunjukkan banyak trombosit berukuran raksasa tanpa agregat. Risiko analitiknya ialah ...',
    options: {
      A: 'Trombosit pasti terlihat sebagai eritrosit berinti',
      B: 'Hemoglobin selalu palsu tinggi',
      C: 'Alat tertentu dapat meremehkan jumlah trombosit karena trombosit besar keluar dari rentang pemisahan ukuran',
      D: 'Jumlah leukosit harus dihapus',
      E: 'Semua trombosit besar adalah artefak EDTA',
    },
    correctOption: 'C',
    scientificExplanation:
      'Hitung trombosit dengan metode tertentu dapat melewatkan trombosit raksasa. Verifikasi dapat memanfaatkan metode optik/fluoresensi dan korelasi apusan sesuai kemampuan alat. Hasil tidak boleh dilaporkan sebagai final bila interferensi belum ditangani.',
    atlmProcedureAndDecision:
      'Pada metode impedansi elektrik, giant platelet yang berukuran mendekati eritrosit dapat tidak terhitung di kanal trombosit. ATLM wajib melakukan estimasi trombosit pada apusan atau memakai kanal PLT-O/PLT-F.',
    doctorClinicalExplanation:
      'Informasi adanya giant platelets membantu dokter memahami bahwa jumlah trombosit fungsional pasien mungkin lebih tinggi dari angka impedansi alat.',
    patientEducation:
      'Menjelaskan bahwa pemeriksaan apusan mikroskop dilakukan untuk memastikan jumlah dan ukuran keping darah secara akurat.',
    whyOthersWrong:
      'A salah karena eritrosit berinti mengganggu hitung WBC, bukan definisi giant platelet; B, D, dan E salah secara analitik.',
    pdfPageRef: 'Acuan: R1; R5',
  },
  {
    questionNumber: 20,
    sectionCode: 'B',
    category: 'combined',
    topic: 'SOAL 20 | Tabung sitrat kurang terisi',
    questionText:
      'Sampel PT/aPTT dalam tabung natrium sitrat hanya terisi sekitar separuh tanda minimal. Risiko paling penting adalah ...',
    options: {
      A: 'PT selalu menjadi lebih pendek',
      B: 'Pengaruh sitrat berlebih relatif terhadap plasma sehingga waktu pembekuan dapat tampak memanjang palsu',
      C: 'Tidak ada dampak bila tabung telah dikocok',
      D: 'Kadar hemoglobin meningkat palsu secara pasti',
      E: 'Jumlah eosinofil menjadi nol',
    },
    correctOption: 'B',
    scientificExplanation:
      'Perbandingan darah dan sitrat harus tepat. Pada tabung yang kurang terisi, sitrat relatif berlebih dapat mengganggu reaksi penambahan kalsium pada uji koagulasi. Gunakan kriteria penerimaan sampel dalam SOP dan minta pengambilan ulang bila tidak memenuhi.',
    atlmProcedureAndDecision:
      'Tolak sampel sitrat yang kurang isi (underfilled <90% tanda batas) dan minta pengambilan sampel ulang (recollect) sesuai SOP pra-analitik koagulasi.',
    doctorClinicalExplanation:
      'Pelaporan PT/aPTT yang memanjang palsu akibat underfilling dapat menyebabkan kesalahan fatal berupa penghentian antikoagulan atau pemberian transfusi plasma yang tidak perlu.',
    patientEducation:
      'Menjelaskan secara sopan perlunya pengambilan sampel ulang karena volume darah pada tabung pertama belum mencapai batas takaran alat.',
    whyOthersWrong:
      'A terbalik karena sitrat berlebih justru memperpanjang waktu koagulasi; C salah karena pengocokan tidak memperbaiki rasio 9:1; D dan E tidak relevan.',
    pdfPageRef: 'Acuan: R2',
  },
  {
    questionNumber: 21,
    sectionCode: 'B',
    category: 'combined',
    topic: 'SOAL 21 | Spesimen CBC mengalami pembekuan',
    questionText:
      'ATLM menemukan bekuan kecil pada sampel EDTA yang diminta untuk CBC. Tindakan paling tepat ialah ...',
    options: {
      A: 'Membuang bekuan dan melaporkan hasil tetap sah',
      B: 'Menambah antikoagulan sesudah bekuan muncul',
      C: 'Memanaskan tabung supaya bekuan hilang',
      D: 'Menolak sampel untuk CBC dan meminta pengambilan ulang sesuai SOP',
      E: 'Mengganti nilai trombosit dengan angka perkiraan',
    },
    correctOption: 'D',
    scientificExplanation:
      'Bekuan mengonsumsi/mengurung trombosit dan leukosit sehingga hasil dapat salah. Mengambil bekuan tidak memperbaiki sampel. Perlu recollect dan dokumentasi ketidaksesuaian spesimen.',
    atlmProcedureAndDecision:
      'Jangan memasukkan sampel berbekuan ke Hematology Analyzer karena akan menyumbat probe dan menghasilkan trombositopenia/leukopenia palsu. Lakukan penolakan sampel di LIS dan minta sampel baru.',
    doctorClinicalExplanation:
      'Penolakan sampel beku mencegah kesalahan diagnosis trombositopenia atau anemia palsu.',
    patientEducation:
      'Menjelaskan bahwa terdapat penggumpalan mikro pada sampel darah sehingga diperlukan pengambilan darah ulang demi keakuratan hasil.',
    whyOthersWrong:
      'A salah karena sel sudah terperangkap di dalam jaring fibrin bekuan; B dan C tidak dapat mengembalikan sel yang sudah membeku; E adalah manipulasi data.',
    pdfPageRef: 'Acuan: R1',
  },
  {
    questionNumber: 22,
    sectionCode: 'B',
    category: 'combined',
    topic: 'SOAL 22 | ABO dalam bank darah',
    questionText:
      'Pasien golongan darah B memiliki pola antigen dan antibodi ABO normal berupa ...',
    options: {
      A: 'Antigen B pada eritrosit dan anti-A dalam plasma',
      B: 'Antigen A dan anti-B dalam plasma',
      C: 'Antigen A/B dan anti-A/anti-B bersama',
      D: 'Tanpa antigen A/B dan tanpa antibodi',
      E: 'Antigen D selalu ada tanpa pengecualian',
    },
    correctOption: 'A',
    scientificExplanation:
      'Pada fenotipe B, eritrosit menampilkan antigen B dan plasma mengandung anti-A. Interpretasi akhir golongan darah untuk transfusi memakai uji forward dan reverse sesuai kebijakan serta mengevaluasi diskrepansi.',
    atlmProcedureAndDecision:
      'Pada pemeriksaan golongan darah ABO, ATLM mencocokkan hasil cell grouping (Anti-B positif) dengan serum grouping (sel A positif karena adanya anti-A di plasma pasien).',
    doctorClinicalExplanation:
      'Kesesuaian antigen B dan antibodi anti-A menjadi dasar pemilihan komponen darah yang kompatibel untuk mencegah reaksi hemolitik akut.',
    patientEducation:
      'Menjelaskan karakteristik antigen dan antibodi alami pada pemilik golongan darah B.',
    whyOthersWrong:
      'B adalah golongan darah A; C dan D tidak mungkin terjadi secara normal menurut Hukum Landsteiner; E salah karena status antigen D (Rhesus) bersifat independen dari sistem ABO.',
    pdfPageRef: 'Acuan: M1 (PDF ANFIS Darah Hal. 42–44); R6',
  },
  {
    questionNumber: 23,
    sectionCode: 'B',
    category: 'combined',
    topic: 'SOAL 23 | Kontrol mutu internal analyzer',
    questionText:
      'Dua level bahan kontrol CBC sama-sama bergeser ke arah tinggi dibanding rata-rata historis setelah penggantian reagen. Langkah awal yang tepat ialah ...',
    options: {
      A: 'Melaporkan semua pasien agar TAT terjaga',
      B: 'Menggeser sendiri nilai rujukan pasien',
      C: 'Menahan pelaporan parameter terdampak, menelusuri QC, kalibrasi, reagen dan instrumen sesuai SOP',
      D: 'Membuang grafik QC dan memulai grafik baru tanpa investigasi',
      E: 'Mengurangi nilai pasien sebesar 10% secara manual',
    },
    correctOption: 'C',
    scientificExplanation:
      'Pergeseran QC pada beberapa level mengarah pada bias sistematik. Tindakan mencakup menahan hasil terdampak, investigasi akar masalah, tindakan korektif, dan menilai ulang hasil pasien yang mungkin terkena dampak.',
    atlmProcedureAndDecision:
      'Terapkan aturan Westgard pada grafik Levey-Jennings; periksa nomor lot reagen baru, suhu, masa kedaluwarsa, bubble pada saluran, dan faktor kalibrasi sebelum menjalankan sampel pasien.',
    doctorClinicalExplanation:
      'Pengendalian mutu internal yang ketat memastikan perubahan hasil laboratorium pasien mencerminkan kondisi klinis sejati, bukan pergeseran alat.',
    patientEducation:
      'Menjelaskan bahwa laboratorium selalu melakukan pengecekan mutu alat sebelum mengeluarkan hasil pemeriksaan pasien.',
    whyOthersWrong:
      'A berisiko merilis hasil pasien yang bias/salah; B, D, dan E melanggar prinsip manajemen mutu laboratorium medik (ISO 15189).',
    pdfPageRef: 'Acuan: R1',
  },
  {
    questionNumber: 24,
    sectionCode: 'B',
    category: 'combined',
    topic: 'SOAL 24 | Hemostasis primer',
    questionText:
      'Komponen yang terutama menjembatani adhesi trombosit ke kolagen subendotel yang terpapar adalah ...',
    options: {
      A: 'Albumin dan bilirubin',
      B: 'Hemoglobin dan heme',
      C: 'Eritropoietin dan trombopoietin',
      D: 'Fibrinogen tanpa bantuan trombosit',
      E: 'Faktor von Willebrand dan reseptor trombosit GPIb',
    },
    correctOption: 'E',
    scientificExplanation:
      'Faktor von Willebrand mengikat kolagen yang terpapar dan berinteraksi dengan reseptor GPIb pada trombosit. Proses ini merupakan langkah penting hemostasis primer dan berbeda dari pembentukan fibrin pada hemostasis sekunder.',
    atlmProcedureAndDecision:
      'ATLM memahami bahwa gangguan pada faktor von Willebrand (vWF) atau reseptor GPIb akan mengganggu pembentukan sumbat trombosit awal meskipun jumlah trombosit normal.',
    doctorClinicalExplanation:
      'Defisiensi atau disfungsi vWF menyebabkan penyakit von Willebrand yang ditandai perdarahan mukokutan (mimisan, menoragia, perdarahan gusi).',
    patientEducation:
      'Menjelaskan bagaimana keping darah menempel pada dinding pembuluh darah yang luka menggunakan jembatan protein khusus.',
    whyOthersWrong:
      'A, B, dan C tidak berperan dalam adhesi trombosit; D salah karena fibrinogen menjembatani agregasi antar-trombosit melalui GPIIb/IIIa dan diubah menjadi fibrin pada hemostasis sekunder.',
    pdfPageRef: 'Acuan: M1 (PDF ANFIS Darah Hal. 35); R1',
  },
  {
    questionNumber: 25,
    sectionCode: 'B',
    category: 'combined',
    topic: 'SOAL 25 | RDW dan populasi eritrosit campuran',
    questionText:
      'MCV 88 fL tetapi RDW 21%, dan pada histogram eritrosit muncul pelebaran distribusi. Langkah analitik yang paling tepat adalah ...',
    options: {
      A: 'Menyimpulkan seluruh eritrosit normal',
      B: 'Meninjau apusan untuk anisitosis atau populasi dimorfik meski MCV rata-rata normal',
      C: 'Menyatakan trombositopenia berat',
      D: 'Menghapus hasil RDW',
      E: 'Langsung mendiagnosis leukemia',
    },
    correctOption: 'B',
    scientificExplanation:
      'MCV adalah rerata sehingga dua populasi eritrosit berukuran kecil dan besar dapat menghasilkan MCV normal. RDW meningkat menandai variasi ukuran. Apusan dapat menunjukkan anisitosis atau pola dimorfik untuk korelasi.',
    atlmProcedureAndDecision:
      'Periksa histogram RBC (apakah tampak bimodal/dua puncak atau kaki kurva melebar) dan konfirmasi pada apusan darah tepi adanya campuran mikrosit dan makrosit.',
    doctorClinicalExplanation:
      'Populasi eritrosit dimorfik dengan MCV normal dan RDW tinggi (21%) sering dijumpai pada defisiensi campuran (besi + folat/B12) atau pasien anemia mikrositik pasca-transfusi PRC.',
    patientEducation:
      'Menjelaskan bahwa meskipun ukuran rata-rata sel darah merah tampak normal, terdapat variasi ukuran sel yang perlu diamati di mikroskop.',
    whyOthersWrong:
      'A mengabaikan nilai RDW 21% (normal ~11,5–14,5%); C, D, dan E tidak sesuai dengan makna klinis RDW.',
    pdfPageRef: 'Acuan: R1',
  },

  // ===========================================================================
  // BAGIAN C: 20 SOAL KASUS SANGAT SULIT (NOMOR 26 - 45)
  // Dilengkapi Anamnesis, Pemeriksaan Fisik, Catatan Dokter, Hasil Lab & Konteks Obat
  // ===========================================================================
  {
    questionNumber: 26,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 26 | Anemia mikrositik pada perdarahan menstruasi',
    caseTable: {
      anamnesis:
        'Perempuan 28 tahun mengeluh lemah, berdebar, suka mengunyah es, dan menstruasi sangat banyak sejak 8 bulan. Tidak ada demam atau riwayat transfusi.',
      physicalExam:
        'Konjungtiva pucat, kuku rapuh, nadi 106/menit, tekanan darah 105/65 mmHg.',
      doctorOrder:
        'Dokter umum meminta CBC, retikulosit, ferritin, dan CRP. Dokter sedang mempertimbangkan terapi zat besi serta evaluasi sumber perdarahan.',
      labResults:
        'EDTA tidak membeku. Hb 7,8 g/dL; Ht 25%; RBC 3,5 juta/uL; MCV 71 fL; MCH 22 pg; RDW 20%; trombosit 480.000/uL; retikulosit 0,5%; ferritin 6 ng/mL; CRP normal. Apusan: mikrositosis, hipokromia, anisopoikilositosis.',
      medicationContext:
        'Belum mendapat obat besi. Pasien bertanya apakah harus membeli obat sendiri dan perlu transfusi.',
    },
    questionText:
      'Pertanyaan: Sebagai ATLM, kombinasi penilaian hasil, tindak lanjut laboratorium, dan komunikasi yang paling tepat ialah ...',
    options: {
      A: 'Melaporkan Hb tanpa pemeriksaan konsistensi dan mengatakan transfusi pasti diperlukan.',
      B: 'Memverifikasi CBC dan apusan, melaporkan pola anemia mikrositik-hipokromik dengan ferritin rendah, mengomunikasikan Hb menurut batas kritis SOP, dan mengarahkan keputusan besi/transfusi kepada dokter.',
      C: 'Menyimpulkan talasemia mayor hanya dari MCV yang rendah dan menghapus ferritin.',
      D: 'Mengubah RBC menjadi 4,5 juta/uL supaya sesuai dengan Hb.',
      E: 'Memberikan resep besi intravena dan menentukan dosis secara mandiri.',
    },
    correctOption: 'B',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Ferritin sangat rendah (6 ng/mL) bersama Hb turun (7,8 g/dL), MCV/MCH rendah (71 fL / 22 pg), RDW tinggi (20%) dan riwayat kehilangan darah mendukung defisiensi besi. Retikulosit yang belum meningkat (0,5%) mengindikasikan respons eritropoiesis belum memadai.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Lakukan QC, periksa identitas/kondisi EDTA, pastikan kesesuaian indeks dengan histogram dan apusan, lalu validasi hasil. Nilai Hb dilaporkan melalui jalur kritis bila memenuhi ketentuan institusi; laporan morfologi bersifat deskriptif, tidak menggantikan diagnosis dokter.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Terapi besi oral/intravena serta kemungkinan transfusi ditentukan dokter berdasarkan gejala, stabilitas dan etiologi. ATLM tidak memilih obat atau dosis. Hemoglobin saja tidak cukup sebagai perintah transfusi.',
    patientEducation:
      '4. Edukasi dan komunikasi: Jelaskan proses pengambilan darah, tujuan pemeriksaan lanjutan dan pentingnya membawa hasil ke dokter untuk menilai perdarahan menstruasi serta memantau respons terapi.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: A dan E melampaui kewenangan/menyimpulkan terapi tanpa asesmen; C mengabaikan ferritin; D melanggar integritas data.',
    pdfPageRef: 'Acuan: M1; R1; R4; R7 (Halaman 10 & 38)',
  },
  {
    questionNumber: 27,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 27 | Mikrositosis familial: talasemia trait atau defisiensi besi?',
    caseTable: {
      anamnesis:
        'Laki-laki 20 tahun mengikuti skrining kesehatan. Sejak remaja hasil Hb sedikit rendah tetapi tidak pernah menjalani transfusi. Kakak memiliki gambaran darah serupa.',
      physicalExam:
        'Keadaan umum baik, tidak pucat berat, tanpa hepatosplenomegali.',
      doctorOrder:
        'Dokter meminta telaah CBC dan apusan darah untuk memutuskan apakah diperlukan pemeriksaan hemoglobinopati atau suplemen besi.',
      labResults:
        'Hb 11,8 g/dL; RBC 6,20 juta/uL; MCV 62 fL; MCH 19 pg; RDW 12,9%; ferritin 82 ng/mL; CRP normal. Apusan: banyak target cell dan mikrositosis relatif seragam. Mentzer index = 62/6,2 = 10.',
      medicationContext:
        'Tidak mengonsumsi zat besi. Pasien ingin minum suplemen besi dosis tinggi karena selalu diberi tahu "anemia".',
    },
    questionText:
      'Pertanyaan: Interpretasi dan rekomendasi pemeriksaan lanjutan ATLM yang paling bertanggung jawab adalah ...',
    options: {
      A: 'Pola ini lebih mengarah pada trait talasemia; verifikasi data dan sarankan pemeriksaan hemoglobinopati melalui dokter, sambil menjelaskan bahwa suplementasi besi tidak otomatis diperlukan jika defisiensi besi belum terbukti.',
      B: 'Mendiagnosis anemia defisiensi besi berdasarkan MCV saja dan menyarankan besi tanpa batas waktu.',
      C: 'Menyatakan Hb normal sempurna karena RBC tinggi sehingga pemeriksaan tidak diperlukan.',
      D: 'Menyimpulkan talasemia beta mayor dan menyarankan transfusi bulanan.',
      E: 'Menetapkan diagnosis pasti talasemia alfa hanya dengan RDW.',
    },
    correctOption: 'A',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Mikrositosis berat (62 fL) dengan RBC relatif tinggi (6,20 juta/uL), RDW hampir normal (12,9%), ferritin memadai (82 ng/mL), target cell, dan Mentzer index rendah (10) mendukung pola trait talasemia lebih kuat daripada defisiensi besi murni. Namun indeks diskriminan bukan tes konfirmasi.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Validasi CBC dan morfologi. Komunikasikan kemungkinan hemoglobinopati untuk pemeriksaan konfirmasi seperti HPLC/elektroforesis hemoglobin berdasarkan permintaan klinisi. HbA2 dapat mendukung beta-talasemia trait, sedangkan alfa-talasemia dapat memerlukan pendekatan berbeda.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Pemberian zat besi bergantung bukti defisiensi yang dinilai dokter; suplemen tidak diberikan semata-mata karena nilai MCV rendah.',
    patientEducation:
      '4. Edukasi dan komunikasi: Jelaskan arti temuan laboratorium dan pentingnya konsultasi serta kemungkinan konseling keluarga bila diagnosis akhirnya dikonfirmasi.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: B mengabaikan status besi; C mengabaikan Hb dan MCV; D menyamakan trait dengan bentuk berat; E terlalu pasti untuk alat skrining.',
    calculationSteps: 'Mentzer Index = MCV / RBC = 62 / 6,20 = 10 (< 13 mengarah pada trait talasemia).',
    pdfPageRef: 'Acuan: R1; R7 (Halaman 11 & 39)',
  },
  {
    questionNumber: 28,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 28 | Anemia makrositik dengan neuropati',
    caseTable: {
      anamnesis:
        'Perempuan 64 tahun memiliki pola makan vegan ketat dan mengeluh kesemutan tungkai, gangguan berjalan, serta cepat lelah sejak 4 bulan.',
      physicalExam:
        'Lidah licin kemerahan, pucat, penurunan sensasi getar pada kedua tungkai, nadi 96/menit.',
      doctorOrder:
        'Dokter meminta CBC, apusan, retikulosit, vitamin B12 dan folat. Dokter mempertimbangkan terapi vitamin setelah hasil diterima.',
      labResults:
        'Hb 8,2 g/dL; RBC 2,1 juta/uL; MCV 121 fL; trombosit 125.000/uL; retikulosit 0,4%; vitamin B12 90 pg/mL (rendah); folat normal. Apusan: macro-ovalocyte dan neutrofil hipersegmentasi.',
      medicationContext:
        'Pasien memiliki tablet asam folat di rumah dan bertanya apakah tablet tersebut cukup.',
    },
    questionText:
      'Pertanyaan: Sikap ATLM yang paling tepat terhadap hasil dan pertanyaan obat adalah ...',
    options: {
      A: 'Menyebutnya anemia hemolitik karena terdapat anemia dan trombosit sedikit turun.',
      B: 'Mengabaikan perubahan neurologis karena tidak termasuk hematologi.',
      C: 'Memberikan asam folat dosis tinggi sebagai satu-satunya terapi di laboratorium.',
      D: 'Memvalidasi pola anemia megaloblastik dan B12 rendah, melapor ke dokter, serta menjelaskan bahwa pemberian folat saja tidak menggantikan evaluasi/terapi defisiensi B12 terutama jika ada gejala neurologis.',
      E: 'Menetapkan leukemia akut dari satu hasil MCV.',
    },
    correctOption: 'D',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Makro-ovalosit dan neutrofil hipersegmentasi adalah pola khas megaloblastik; B12 sangat rendah (90 pg/mL) dengan gejala neurologis membuat defisiensi B12 sangat mungkin. Retikulosit rendah (0,4%) mencerminkan produksi tidak efektif.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Periksa flag analyzer, apusan dan konsistensi hasil; laporkan morfologi dan hasil B12 dengan ketentuan mutu pemeriksaan. Penilaian etiologi tambahan, misalnya malabsorpsi, dilakukan klinisi.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Dokter memutuskan rute, dosis dan jadwal vitamin B12. Folat sendiri dapat memperbaiki aspek hematologis sementara gangguan neurologis akibat defisiensi B12 tetap berlangsung.',
    patientEducation:
      '4. Edukasi dan komunikasi: Anjurkan pasien berkonsultasi segera mengenai kesemutan dan gangguan berjalan, serta tidak mengandalkan obat yang ada di rumah tanpa penilaian dokter.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: A, B, dan E tidak didukung data; C adalah terapi tanpa kewenangan dan mengabaikan risiko neurologis.',
    pdfPageRef: 'Acuan: M1; R1; R7 (Halaman 12 & 40)',
  },
  {
    questionNumber: 29,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 29 | Hemolisis imun dan pemeriksaan DAT',
    caseTable: {
      anamnesis:
        'Perempuan 47 tahun dengan lupus mengalami lemas mendadak, mata kuning, dan urine gelap 3 hari. Tidak ada perdarahan luar.',
      physicalExam: 'Ikterus sklera, pucat, nadi 112/menit, suhu 37,5 C.',
      doctorOrder:
        'Dokter mencurigai anemia hemolitik dan meminta CBC, retikulosit, bilirubin fraksi, LDH, haptoglobin, DAT, serta persiapan transfusi bila diperlukan.',
      labResults:
        'Hb 6,9 g/dL; retikulosit 9%; LDH 960 U/L; bilirubin indirek meningkat; haptoglobin tidak terdeteksi; DAT positif IgG; apusan menunjukkan sferosit. Tidak ada aglutinasi saat pengujian suhu ruang.',
      medicationContext:
        'Pasien baru menggunakan obat imunosupresif atas resep dokter. Tim klinis sedang menilai kortikosteroid dan kebutuhan komponen darah.',
    },
    questionText: 'Pertanyaan: Respons ATLM pada kasus ini yang paling tepat adalah ...',
    options: {
      A: 'Melaporkan "hemolisis imun mungkin" beserta hasil DAT tervalidasi, segera mengomunikasikan Hb kritis, berkoordinasi dengan bank darah bila transfusi diminta dan tidak menentukan kortikosteroid secara mandiri.',
      B: 'Menyimpulkan anemia defisiensi besi dan membatalkan DAT.',
      C: 'Memberi steroid oral dan memulangkan pasien.',
      D: 'Mengganti hasil DAT menjadi negatif agar crossmatch lebih mudah.',
      E: 'Menilai semua sferosit pasti akibat keturunan, mengabaikan DAT.',
    },
    correctOption: 'A',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Hb rendah (6,9 g/dL), retikulositosis (9%), LDH dan bilirubin indirek tinggi, haptoglobin rendah, DAT IgG positif serta sferosit mendukung anemia hemolitik autoimun pada konteks ini. DAT perlu ditafsirkan bersama riwayat obat dan transfusi.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Verifikasi identitas, sampel dan hasil DAT menggunakan kontrol reagen. Komunikasikan nilai kritis dan temuan hemolisis; jika ada kebutuhan transfusi, rujuk prosedur kompatibilitas dan konsultasi dokter bank darah.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Keputusan kortikosteroid, imunosupresi maupun transfusi dilakukan dokter. Kesulitan uji silang dapat memerlukan strategi bank darah sesuai risiko klinis, bukan manipulasi hasil.',
    patientEducation:
      '4. Edukasi dan komunikasi: Pasien perlu mendapat penjelasan dokter mengenai pemantauan anemia, tanda memburuk seperti sesak/gelap urine, dan kepatuhan kontrol.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: B dan E mengabaikan bukti hemolisis imun; C melakukan terapi di luar kewenangan; D memalsukan pemeriksaan.',
    pdfPageRef: 'Acuan: R1; R6; R7 (Halaman 13 & 41)',
  },
  {
    questionNumber: 30,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 30 | Mikroangiopati trombotik dan schistocyte',
    caseTable: {
      anamnesis:
        'Perempuan 39 tahun datang dengan bingung akut, lemas, dan urin berkurang. Sejak sehari ada bintik perdarahan di kulit.',
      physicalExam:
        'Tampak letargis, petekie, nadi 120/menit, tekanan darah 145/95 mmHg.',
      doctorOrder:
        'Dokter meminta CBC STAT, apusan schistocyte, LDH, bilirubin, PT/aPTT, kreatinin, dan ADAMTS13 untuk evaluasi TTP/TMA.',
      labResults:
        'Hb 8,1 g/dL; trombosit 14.000/uL; schistocyte 4% dari eritrosit yang ditelaah menurut prosedur morfologi; LDH 1.250 U/L; kreatinin 2,2 mg/dL; PT/aPTT dalam batas rujukan. Sampel EDTA tidak menggumpal.',
      medicationContext:
        'Dokter mempertimbangkan pertukaran plasma dan tata laksana kegawatdaruratan; pasien belum memperoleh terapi.',
    },
    questionText: 'Pertanyaan: Manakah prioritas tindakan dan pelaporan ATLM paling tepat?',
    options: {
      A: 'Mengesampingkan schistocyte karena PT normal.',
      B: 'Menunda semua hasil sampai ADAMTS13 selesai beberapa hari.',
      C: 'Memverifikasi dan mendokumentasikan jumlah schistocyte, mengomunikasikan trombosit kritis dan temuan TMA segera, serta memfasilitasi sampel ADAMTS13 bila diminta tanpa menunda komunikasi darurat.',
      D: 'Meresepkan antikoagulan dan transfusi trombosit rutin.',
      E: 'Menyimpulkan pasti DIC hanya karena trombosit turun.',
    },
    correctOption: 'C',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Schistocyte jauh di atas 1% (4%), hemolisis, trombositopenia berat (14.000/uL), gangguan ginjal dan manifestasi neurologis mencurigakan TMA. PT/aPTT normal dapat ditemukan pada TTP, berbeda dengan beberapa bentuk DIC.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Hitung/konfirmasi schistocyte memakai kriteria ICSH, periksa kualitas apusan, validasi CBC dan komunikasikan hasil mendesak. Pemeriksaan ADAMTS13 diproses sesuai ketersediaan, tetapi diagnosis dan tindakan darurat tidak boleh bergantung pada laboratorium rujukan yang lambat.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Pertukaran plasma dan terapi spesifik diputuskan dokter hematologi. Trombosit tidak otomatis ditransfusikan secara profilaksis pada dugaan TTP; pengecualian ditetapkan klinisi.',
    patientEducation:
      '4. Edukasi dan komunikasi: Komunikasikan kepada tim medis bahwa hasil membutuhkan penanganan segera; edukasi pasien/keluarga tentang kondisi dilakukan dokter penanggung jawab.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: A, B menunda respons berbahaya; D melewati kewenangan; E tidak sesuai pola koagulasi.',
    pdfPageRef: 'Acuan: R3; R7 (Halaman 14 & 42)',
  },
  {
    questionNumber: 31,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 31 | Flag blast pada hitung darah otomatis',
    caseTable: {
      anamnesis:
        'Laki-laki 19 tahun mengalami demam berulang, nyeri tulang, lelah, dan mimisan selama 2 minggu.',
      physicalExam: 'Pucat, petekie, pembesaran kelenjar leher, suhu 38,3 C.',
      doctorOrder:
        'Dokter meminta CBC dan apusan segera; konsultasi hematologi direncanakan jika ada sel imatur mencurigakan.',
      labResults:
        'WBC 78.000/uL; Hb 7,4 g/dL; trombosit 24.000/uL. Analyzer memberi flag blast. Apusan terdapat sekitar 45% sel imatur besar dengan kromatin halus dan nukleolus nyata. Kontrol analyzer valid.',
      medicationContext:
        'Belum memakai obat sitotoksik. Dokter akan menentukan pemeriksaan imunofenotip dan terapi lanjutan.',
    },
    questionText: 'Pertanyaan: Langkah ATLM yang paling aman dan informatif adalah ...',
    options: {
      A: 'Melaporkan hasil leukosit saja tanpa catatan karena flag alat tidak memiliki nilai klinis.',
      B: 'Mengidentifikasi subtipe leukemia pasti hanya dari angka WBC.',
      C: 'Mengeluarkan resep kemoterapi setelah menemukan blast.',
      D: 'Mengulang pemeriksaan pada hari lain tanpa melapor.',
      E: 'Melakukan verifikasi hitung dan apusan, mendokumentasikan sel imatur/dugaan blast, menghubungi dokter segera sesuai SOP, lalu mendukung pemeriksaan konfirmasi yang diminta seperti flow cytometry.',
    },
    correctOption: 'E',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Leukositosis tinggi (78.000/uL) dengan anemia, trombositopenia dan proporsi sel imatur besar yang dominan (45%) sangat mencurigakan leukemia akut. Penentuan lini dan subtipe perlu imunofenotip, sitogenetik atau molekuler.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Pastikan sampel benar dan alat berkinerja baik, lakukan review smear oleh tenaga kompeten, catat persentase sel imatur secara hati-hati, dan laporkan hasil kritis melalui prosedur komunikasi.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Tatalaksana kemoterapi dan profilaksis komplikasi ditetapkan dokter; ATLM memastikan pemeriksaan penunjang dan integritas hasil sebelum/sesudah terapi.',
    patientEducation:
      '4. Edukasi dan komunikasi: Sampaikan kepada tim bahwa hasil perlu ditindaklanjuti cepat. Edukasi klinis khusus diberikan oleh dokter/perawat yang merawat.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: A dan D menunda komunikasi; B terlalu pasti; C tidak termasuk kewenangan ATLM.',
    pdfPageRef: 'Acuan: R1; R7 (Halaman 15 & 43)',
  },
  {
    questionNumber: 32,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 32 | Dugaan leukemia promielositik akut dan DIC',
    caseTable: {
      anamnesis:
        'Perempuan 24 tahun datang dengan perdarahan gusi terus-menerus, memar spontan, dan kelelahan selama 5 hari.',
      physicalExam:
        'Petekie menyeluruh, perdarahan mukosa aktif, tekanan darah 95/60 mmHg.',
      doctorOrder:
        'Dokter menulis "suspek acute promyelocytic leukemia (APL), mohon CBC, smear STAT, PT, aPTT, fibrinogen dan D-dimer; tes PML::RARA jika indikasi".',
      labResults:
        'Hb 9,1 g/dL; WBC 2.400/uL; trombosit 18.000/uL; smear menunjukkan promielosit abnormal dengan banyak granula/Auer rods. PT memanjang; fibrinogen 85 mg/dL; D-dimer sangat meningkat.',
      medicationContext:
        'Tim dokter menyebut kemungkinan pemberian ATRA segera sebagai terapi emergensi sebelum konfirmasi molekuler.',
    },
    questionText: 'Pertanyaan: Keputusan ATLM yang paling tepat ialah ...',
    options: {
      A: 'Melepas hasil tanpa verifikasi dan menyarankan pasien pulang karena WBC rendah.',
      B: 'Memastikan kualitas sampel sitrat dan apusan, segera melaporkan temuan sel mencurigakan beserta gangguan koagulasi kritis, serta memproses konfirmasi molekuler tanpa menunda peringatan kepada dokter.',
      C: 'Mengganti hitung trombosit menjadi normal agar transfusi dapat ditunda.',
      D: 'Memberikan ATRA dengan dosis yang ditentukan laboratorium.',
      E: 'Menunggu hasil PML::RARA sebelum memberi tahu klinisi tentang fibrinogen rendah.',
    },
    correctOption: 'B',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Promielosit abnormal (Auer rods) dan koagulopati konsumtif dengan fibrinogen sangat rendah (85 mg/dL) merupakan keadaan yang sangat mencurigakan APL disertai koagulopati berat. Perdarahan dapat berlangsung cepat.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Validasi preparat, aturan penerimaan sitrat, QC koagulasi dan nilai kritis, lalu lakukan komunikasi dua arah yang terdokumentasi. Konfirmasi PML::RARA penting tetapi tidak boleh menghalangi laporan keadaan mendesak.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Dokter menentukan ATRA dan transfusi komponen hemostatik sesuai kebutuhan. ATLM tidak menetapkan dosis atau memulai terapi.',
    patientEducation:
      '4. Edukasi dan komunikasi: Keterangan kepada pasien/keluarga mengenai kondisi dan obat adalah tanggung jawab tim klinis; laboratorium dapat menjelaskan perlunya sampel lanjutan.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: A, C, D melanggar keselamatan dan kewenangan; E menunda informasi kritis.',
    pdfPageRef: 'Acuan: R1; R2; R7 (Halaman 16 & 44)',
  },
  {
    questionNumber: 33,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 33 | Trombositopenia palsu akibat EDTA',
    caseTable: {
      anamnesis:
        'Laki-laki 34 tahun menjalani skrining praoperasi. Tidak pernah mudah memar atau mimisan. Hasil trombosit 6 bulan lalu 235.000/uL.',
      physicalExam:
        'Tidak tampak petekie, tanda perdarahan negatif, parameter vital normal.',
      doctorOrder:
        'Dokter bedah melihat trombosit 18.000/uL dan meminta klarifikasi sebelum memutuskan pembatalan operasi atau transfusi trombosit.',
      labResults:
        'CBC EDTA: trombosit 18.000/uL dengan flag "platelet clump"; Hb/WBC normal. Apusan memperlihatkan agregat trombosit besar di tepi dan ekor preparat. Sampel tidak membeku. Ulangan tabung sitrat menunjukkan hasil mendekati normal setelah validasi metode, koreksi pengenceran dan pemeriksaan apusan.',
      medicationContext:
        'Tidak mengonsumsi aspirin, heparin ataupun obat antiplatelet. Dokter mempertimbangkan trombosit berdasarkan hasil awal.',
    },
    questionText: 'Pertanyaan: Apa respons terbaik ATLM?',
    options: {
      A: 'Menganggap 18.000/uL sebagai trombositopenia sejati tanpa catatan.',
      B: 'Meminta dokter langsung memberi transfusi trombosit tanpa pemeriksaan ulang.',
      C: 'Menghapus semua hasil awal dari sistem tanpa audit trail.',
      D: 'Menahan/menandai hasil yang terinterferensi, mengonfirmasi agregasi pada apusan dan hasil alternatif yang tervalidasi, kemudian melapor bahwa terdapat dugaan pseudotrombositopenia EDTA.',
      E: 'Mengganti Hb menjadi rendah untuk memperkuat indikasi transfusi.',
    },
    correctOption: 'D',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Agregasi trombosit in vitro menyebabkan hitung trombosit otomatis rendah palsu. Ketiadaan gejala dan nilai historis normal mendukung dugaan, tetapi konfirmasi laboratorium tetap diperlukan.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Tinjau smear sampai area feathered edge; gunakan alternatif metode/antikoagulan tervalidasi bila tersedia. Tabung sitrat tidak selalu memperbaiki agregasi, jadi hasil alternatif tetap perlu telaah dan koreksi pengenceran sesuai prosedur. Dokumentasikan revisi.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Transfusi atau pengubahan obat adalah keputusan dokter setelah menerima hasil yang benar; trombositopenia palsu bukan indikasi transfusi.',
    patientEducation:
      '4. Edukasi dan komunikasi: Jelaskan kepada pasien bahwa pengulangan sampel ditujukan untuk memastikan akurasi, bukan berarti kondisi telah pasti berbahaya.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: A, B akan memicu terapi tak perlu; C dan E melanggar tata kelola hasil.',
    pdfPageRef: 'Acuan: R5 (Halaman 17 & 45)',
  },
  {
    questionNumber: 34,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 34 | Curiga trombositopenia akibat heparin',
    caseTable: {
      anamnesis:
        'Laki-laki 60 tahun dirawat setelah operasi ortopedi dan mendapat heparin profilaksis 7 hari. Kaki tiba-tiba nyeri dan bengkak.',
      physicalExam:
        'Edema tungkai unilateral; tidak ada perdarahan mukosa; suhu 37,2 C.',
      doctorOrder:
        'Dokter mencurigai heparin-induced thrombocytopenia (HIT) dan meminta serial CBC, apusan, serta pemeriksaan anti-PF4/heparin jika skor klinis mendukung.',
      labResults:
        'Trombosit hari 1: 245.000/uL; hari 7: 88.000/uL. Ulang sampel EDTA dan apusan menegaskan penurunan tanpa agregat. Hb 12,5 g/dL; WBC 10.500/uL. PT/aPTT tidak menunjukkan gangguan berat.',
      medicationContext:
        'Pasien masih memakai heparin. Dokter akan menilai skor 4Ts dan alternatif antikoagulan.',
    },
    questionText: 'Pertanyaan: Pernyataan dan langkah ATLM terbaik adalah ...',
    options: {
      A: 'Penurunan trombosit >50% setelah paparan heparin perlu dikomunikasikan; verifikasi tren dan artefak, dukung uji immunoassay anti-PF4 sesuai permintaan, serta ingatkan bahwa hasil positif perlu diintegrasikan dengan probabilitas klinis dan tes fungsional.',
      B: 'HIT tersingkir hanya karena PT normal.',
      C: 'ATLM secara mandiri memutuskan heparin diteruskan 7 hari lagi.',
      D: 'Semua trombositopenia setelah operasi pasti DIC.',
      E: 'Anti-PF4 positif selalu membuktikan HIT klinis tanpa memandang probabilitas.',
    },
    correctOption: 'A',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Trombosit turun lebih dari 50% (dari 245.000 ke 88.000/uL) sekitar hari 5–10 sejak heparin, disertai kecurigaan trombosis, sesuai pola yang menuntut penilaian HIT. Namun penyebab lain, skor 4Ts dan karakteristik uji harus dipertimbangkan.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Periksa delta check, identitas dan smear untuk menyingkirkan clumping. Komunikasikan penurunan bermakna; lakukan uji anti-PF4 bila indikasi dan tersedia. Tes fungsional dapat diperlukan untuk konfirmasi di laboratorium rujukan.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Keputusan menghentikan heparin dan menggunakan antikoagulan non-heparin ditetapkan dokter karena risiko trombosis dan perdarahan.',
    patientEducation:
      '4. Edukasi dan komunikasi: Jelaskan bahwa waktu pengambilan sampel dan daftar obat perlu akurat agar dokter dapat menilai sebab perubahan trombosit.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: B tidak mengevaluasi HIT; C melampaui kewenangan; D berlebihan; E mengabaikan kemungkinan positif palsu.',
    pdfPageRef: 'Acuan: R1; R7 (Halaman 18 & 46)',
  },
  {
    questionNumber: 35,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 35 | Koagulopati konsumtif pada sepsis',
    caseTable: {
      anamnesis:
        'Laki-laki 53 tahun mengalami pneumonia berat, penurunan kesadaran, dan perdarahan dari bekas venipungsi.',
      physicalExam:
        'Tekanan darah 82/50 mmHg, suhu 39,1 C, akral dingin, petekie dan ekimosis.',
      doctorOrder:
        'Dokter ICU meminta CBC serial, PT, aPTT, fibrinogen, dan D-dimer untuk evaluasi DIC. Spesimen koagulasi tiba tepat waktu dengan volume tabung sesuai batas.',
      labResults:
        'Trombosit turun 170.000 menjadi 54.000/uL; PT 25 detik (kontrol 12); aPTT 64 detik; fibrinogen 90 mg/dL; D-dimer 9,5 mg/L FEU. Hasil QC normal dan tabung sitrat terisi baik.',
      medicationContext:
        'Dokter memberi terapi infeksi dan mempertimbangkan produk darah berdasarkan perdarahan dan hasil koagulasi.',
    },
    questionText:
      'Pertanyaan: Pilihan pelaporan dan tindak lanjut ATLM yang paling tepat adalah ...',
    options: {
      A: 'Menganggap PT/aPTT panjang pasti artefak walaupun tabung baik.',
      B: 'Menganjurkan antibiotik tertentu sebagai resep ATLM.',
      C: 'Menghapus nilai fibrinogen karena dokter sudah tahu sepsis.',
      D: 'Menunda nilai kritis sampai semua pemeriksaan ulang keesokan hari.',
      E: 'Memastikan akurasi spesimen dan QC, melaporkan pola koagulopati konsumtif beserta penurunan serial trombosit serta menyampaikan nilai kritis kepada tim ICU segera.',
    },
    correctOption: 'E',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Sepsis berat dengan trombosit menurun, PT/aPTT memanjang, fibrinogen rendah (90 mg/dL) dan D-dimer meningkat (9,5 mg/L FEU) sangat mendukung proses koagulasi konsumtif. Tren serial memperkuat temuan, tetapi diagnosis DIC tetap didasarkan evaluasi klinis dan skor yang sesuai.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Periksa integritas spesimen sitrat, waktu, QC dan potensi heparin/obat pengganggu; nilai pada kasus sudah tervalidasi. Dokumentasikan hasil kritis fibrinogen/trombosit menurut SOP serta pastikan penerima jelas.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Dokter menangani infeksi, resusitasi dan penggunaan plasma/fibrinogen/trombosit bila diindikasikan. ATLM menyediakan pemeriksaan pemantauan, bukan resep obat.',
    patientEducation:
      '4. Edukasi dan komunikasi: Sampaikan kepada perawat/dokter perlunya seri pemeriksaan sesuai instruksi. Keluarga mendapat konseling klinis dari tim perawat/dokter.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: A, C, D mengabaikan bukti kuat; B di luar kewenangan ATLM.',
    pdfPageRef: 'Acuan: R1; R2; R7 (Halaman 19 & 47)',
  },
  {
    questionNumber: 36,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 36 | Hemofilia A pada anak dengan hemartrosis',
    caseTable: {
      anamnesis:
        'Anak laki-laki 12 tahun dengan pembengkakan lutut berulang setelah trauma ringan. Paman dari garis ibu memiliki riwayat perdarahan.',
      physicalExam:
        'Sendi lutut bengkak nyeri tanpa petekie luas, tanda vital stabil.',
      doctorOrder:
        'Dokter anak meminta PT, aPTT, mixing test, aktivitas faktor VIII dan IX. Tabung sitrat 3,2% diisi sampai batas, hematokrit 38%.',
      labResults:
        'PT normal; aPTT 81 detik (rujukan 25-35); mixing test 1:1 terkoreksi segera dan tetap terkoreksi setelah inkubasi; aktivitas FVIII 1%; FIX 94%; trombosit normal.',
      medicationContext:
        'Dokter mempertimbangkan pemberian konsentrat faktor VIII untuk episode perdarahan sendi.',
    },
    questionText:
      'Pertanyaan: Interpretasi laboratorium dan langkah ATLM yang paling tepat adalah ...',
    options: {
      A: 'Menyimpulkan DIC karena satu uji koagulasi memanjang.',
      B: 'Mendiagnosis hemofilia B karena pasien laki-laki.',
      C: 'Memverifikasi pemeriksaan koagulasi dan melaporkan pola defisiensi FVIII yang mendukung hemofilia A, dengan mixing test terkoreksi; pelaksanaan terapi faktor adalah keputusan dokter.',
      D: 'Memberikan faktor VIII melalui prosedur laboratorium tanpa perintah dokter.',
      E: 'Menetapkan lupus anticoagulant sebagai penyebab tunggal meskipun mixing test terkoreksi dan FVIII rendah.',
    },
    correctOption: 'C',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: aPTT yang memanjang (81 detik) dengan PT normal dan koreksi pada mixing test mendukung defisiensi faktor jalur intrinsik. FVIII sangat rendah (1%) dan FIX normal (94%) kuat mengarah pada hemofilia A dalam konteks klinis/familial.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Cek kecukupan volume tabung sitrat, kemungkinan heparin, QC dan pemrosesan plasma platelet-poor sesuai SOP. Hasil aktivitas faktor sangat rendah perlu komunikasi tepat waktu.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Terapi faktor VIII dan pilihan profilaksis sesuai penilaian hematolog; ATLM membantu pemeriksaan monitoring yang dipesan.',
    patientEducation:
      '4. Edukasi dan komunikasi: Informasikan perlunya konsultasi dokter atas perdarahan sendi dan penanganan sampel keluarga bila diperlukan untuk evaluasi lanjutan.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: A tidak sesuai profil; B bertentangan dengan FIX normal; D bukan tugas ATLM; E bertentangan dengan pola mixing test.',
    pdfPageRef: 'Acuan: R2; R7 (Halaman 20 & 48)',
  },
  {
    questionNumber: 37,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 37 | Inhibitor faktor VIII didapat',
    caseTable: {
      anamnesis:
        'Perempuan 72 tahun sebelumnya tidak pernah mengalami gangguan perdarahan. Dalam sepekan timbul hematoma luas spontan di otot dan kulit.',
      physicalExam:
        'Ekimosis luas, pucat ringan, tanpa riwayat hemartrosis sejak kecil.',
      doctorOrder:
        'Dokter meminta PT, aPTT, mixing test segera dan setelah inkubasi 2 jam, kadar FVIII dan Bethesda inhibitor.',
      labResults:
        'PT normal; aPTT 96 detik; mixing test segera 52 detik dan setelah inkubasi 90 detik; FVIII <1%; Bethesda tinggi. Spesimen tidak terkontaminasi heparin menurut evaluasi.',
      medicationContext:
        'Dokter merencanakan konsultasi hematologi untuk penanganan perdarahan dan eliminasi inhibitor.',
    },
    questionText: 'Pertanyaan: Manakah simpulan ATLM yang paling tepat?',
    options: {
      A: 'Koreksi parsial awal lalu memanjang kembali setelah inkubasi dapat mencerminkan inhibitor bergantung waktu; verifikasi dan sampaikan segera hasil inhibitor FVIII yang sangat mungkin, tanpa menetapkan sendiri obat hemostatik.',
      B: 'Semua hasil membuktikan defisiensi FVIII herediter sederhana.',
      C: 'Hasil aPTT harus dianggap normal karena PT normal.',
      D: 'ATLM meresepkan vitamin K sebagai terapi spesifik.',
      E: 'Kadar FVIII yang sangat rendah bisa diabaikan karena pasien lanjut usia.',
    },
    correctOption: 'A',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Mixing test yang tidak mempertahankan koreksi setelah inkubasi (52 detik menjadi 90 detik) dapat menunjukkan inhibitor terhadap faktor, termasuk autoantibodi FVIII. FVIII sangat rendah (<1%) bersama titer inhibitor tinggi mendukung hemofilia A didapat.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Pastikan prosedur mixing test, inkubasi, QC, dan interferensi antikoagulan telah dievaluasi. Komunikasikan segera hasil kritis dan dokumentasikan bahwa pola mendukung inhibitor, dengan interpretasi akhir oleh dokter spesialis.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Pemilihan agen hemostatik dan terapi imunosupresif berisiko tinggi dan harus diputuskan oleh tim klinis.',
    patientEducation:
      '4. Edukasi dan komunikasi: Pasien perlu diberi informasi oleh dokter bahwa memar/perdarahan spontan memerlukan evaluasi cepat, serta penting melaporkan penggunaan antikoagulan atau obat lain.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: B bertentangan dengan riwayat dan hasil inhibitor; C menyesatkan; D dan E tidak aman.',
    pdfPageRef: 'Acuan: R2; R7 (Halaman 21 & 49)',
  },
  {
    questionNumber: 38,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 38 | INR tinggi palsu akibat tabung sitrat kurang isi',
    caseTable: {
      anamnesis:
        'Laki-laki 70 tahun memakai warfarin untuk fibrilasi atrium, menjalani pemeriksaan INR rutin. Dua hari sebelumnya INR 2,5.',
      physicalExam:
        'Tidak ada perdarahan gusi, melena, memar baru atau perubahan tanda vital.',
      doctorOrder:
        'Dokter meminta PT/INR untuk penyesuaian obat. Petugas phlebotomy mencatat kesulitan venipungsi dan volume sampel hanya sekitar 60% tanda pada tabung sitrat.',
      labResults:
        'Analyzer memberi INR 5,4. QC laboratorium normal. Tabung sitrat terlihat jelas kurang terisi; hematokrit 43%; tidak tersedia sampel valid lain.',
      medicationContext:
        'Pasien bertanya apakah dosis warfarin harus langsung dihentikan saat itu juga.',
    },
    questionText: 'Pertanyaan: Tindakan ATLM terbaik ialah ...',
    options: {
      A: 'Segera mengubah dosis warfarin pasien berdasarkan angka 5,4.',
      B: 'Mengabaikan catatan phlebotomy karena QC alat baik.',
      C: 'Melaporkan INR 5,4 sebagai final tanpa komentar.',
      D: 'Mengidentifikasi sampel koagulasi tidak memenuhi kriteria volume, meminta pengambilan ulang segera dan memberitahu klinisi bahwa hasil awal berpotensi artifisial; keputusan obat tetap oleh dokter.',
      E: 'Menambahkan saline agar volume tabung tampak penuh lalu ulang analisis.',
    },
    correctOption: 'D',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Tabung sitrat kurang terisi (60%) mengubah perbandingan plasma dan sitrat sehingga uji koagulasi dapat tampak memanjang palsu (INR 5,4). QC alat yang baik tidak dapat mengatasi kesalahan preanalitik.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Tolak/nyatakan tidak dapat diterima menurut SOP, lakukan pencatatan insiden pengambilan, komunikasikan kepada dokter mengingat pasien memakai warfarin, dan ulang sampel yang terisi benar.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Penghentian atau perubahan dosis warfarin dilakukan dokter setelah memperoleh informasi sah dan menilai risiko trombosis/perdarahan.',
    patientEducation:
      '4. Edukasi dan komunikasi: Jelaskan kepada pasien perlunya sampel ulang dan minta pasien tidak mengubah obat berdasarkan hasil yang belum tervalidasi.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: A, C menggunakan hasil invalid; B salah menilai QC; E mengubah komposisi sampel secara tidak sah.',
    pdfPageRef: 'Acuan: R2 (Halaman 22 & 50)',
  },
  {
    questionNumber: 39,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 39 | PT normal pada pasien memakai apixaban',
    caseTable: {
      anamnesis:
        'Perempuan 76 tahun menggunakan apixaban karena fibrilasi atrium. Ia datang dengan melena dan kelemahan, lalu tim darurat menanyakan keberadaan efek antikoagulan.',
      physicalExam: 'Pucat, tekanan darah 93/60 mmHg, nadi 115/menit.',
      doctorOrder:
        'Dokter meminta CBC, PT/INR, aPTT dan jika ada, anti-faktor Xa yang dikalibrasi untuk apixaban. Waktu dosis terakhir ditelusuri.',
      labResults:
        'Hb 7,3 g/dL; PT/INR mendekati normal; aPTT mendekati normal; sampel sitrat terisi sesuai dan tidak hemolisis. Metode PT/aPTT lokal kurang sensitif terhadap apixaban.',
      medicationContext:
        'Dosis apixaban terakhir sekitar 4 jam sebelum darah diambil. Dokter akan memutuskan intervensi dan kemungkinan reversal sesuai derajat perdarahan.',
    },
    questionText:
      'Pertanyaan: Pernyataan ATLM yang paling tepat ketika menghubungi dokter adalah ...',
    options: {
      A: 'PT normal membuktikan apixaban tidak ada dalam darah.',
      B: 'PT/aPTT normal tidak dapat menyingkirkan efek apixaban; informasikan keterbatasan uji dan siapkan pemeriksaan anti-Xa terkalibrasi obat jika tersedia, sambil memprioritaskan laporan Hb sesuai SOP.',
      C: 'INR selalu setara dengan konsentrasi apixaban.',
      D: 'ATLM memerintahkan antidot segera tanpa konsultasi.',
      E: 'Kadar Hb tidak berhubungan dengan kebutuhan komunikasi hasil.',
    },
    correctOption: 'B',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Respons PT/aPTT terhadap direct factor Xa inhibitor (apixaban) bervariasi menurut reagen. Hasil normal tidak membuktikan tidak ada kadar obat bermakna. Waktu dosis (4 jam lalu), fungsi ginjal dan metode uji perlu diperhitungkan.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Laporkan keterbatasan metode kepada peminta; gunakan pemeriksaan drug-calibrated anti-Xa jika tersedia/terindikasi, dan pastikan hasil Hb (7,3 g/dL) ditangani sesuai nilai kritis lokal. Catat waktu dosis dalam permintaan.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Keputusan menunda antikoagulan, pemberian reversal atau transfusi adalah wewenang tim klinis.',
    patientEducation:
      '4. Edukasi dan komunikasi: Jelaskan bahwa satu hasil PT/INR normal tidak cukup untuk menyimpulkan keamanan obat dan tindak lanjut bergantung dokter.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: A dan C menyalahgunakan indikator; D melampaui wewenang; E mengabaikan keselamatan.',
    pdfPageRef: 'Acuan: R2; R7 (Halaman 23 & 51)',
  },
  {
    questionNumber: 40,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 40 | MCHC sangat tinggi pada cold agglutinin',
    caseTable: {
      anamnesis:
        'Laki-laki 66 tahun memiliki keluhan jari membiru saat cuaca dingin. Sampel darah diantar melalui jalur yang dingin.',
      physicalExam:
        'Akral tampak pucat kebiruan, tidak ada perdarahan aktif.',
      doctorOrder:
        'Dokter meminta CBC untuk anemia. Analyzer menunjukkan flag RBC agglutination dan ketidaksesuaian antar-indeks.',
      labResults:
        'Hb 11,6 g/dL; RBC 1,9 juta/uL; Ht 20%; MCV 124 fL; MCHC 58 g/dL. Apusan awal menunjukkan gerombol eritrosit. Hemolisis tidak menonjol.',
      medicationContext:
        'Belum ada terapi. Dokter akan mengevaluasi cold agglutinin dan hemolisis jika hasil darah mendukung.',
    },
    questionText: 'Pertanyaan: Tindakan analitik ATLM terbaik adalah ...',
    options: {
      A: 'Menyimpulkan eritrosit hiperkromik sejati dengan MCHC 58 g/dL.',
      B: 'Mengganti Hb menjadi 15 g/dL agar rumus lebih sesuai.',
      C: 'Memproses ulang sesuai prosedur tervalidasi, termasuk pemanasan sampel ke 37 C bila cocok untuk alat/metode dan telaah apusan, lalu mendokumentasikan perbedaan sebelum dan sesudah koreksi.',
      D: 'Mengabaikan flag karena hematokrit tetap tercetak.',
      E: 'Meresepkan kortikosteroid dari nilai MCHC.',
    },
    correctOption: 'C',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Cold agglutinin dapat menyebabkan penggumpalan RBC in vitro yang menurunkan jumlah eritrosit terhitung (1,9 juta/uL) dan mengubah MCV/Ht sehingga MCH/MCHC tampak sangat tinggi (58 g/dL). Nilai MCHC ekstrem adalah petunjuk interferensi.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Evaluasi suhu, waktu dan metode pengukuran, lakukan langkah penghangatan/re-run (inkubasi 37°C) yang sudah tervalidasi, periksa smear dan dokumentasikan hasil yang layak dilaporkan. Bila tidak dapat diperbaiki, laporkan keterbatasan.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Penilaian penyakit cold agglutinin dan pilihan obat adalah ranah klinisi; koreksi analitik tidak sama dengan mengobati pasien.',
    patientEducation:
      '4. Edukasi dan komunikasi: Edukasi bahwa pengambilan dan pengangkutan sampel mungkin membutuhkan prosedur khusus (dijaga hangat); pasien tidak perlu menafsirkan sendiri angka awal yang terinterferensi.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: A gagal mengenali artefak; B memalsukan data; D mengabaikan QC; E di luar kompetensi.',
    pdfPageRef: 'Acuan: R1 (Halaman 24 & 52)',
  },
  {
    questionNumber: 41,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 41 | Lipemia berat mengganggu pengukuran Hb',
    caseTable: {
      anamnesis:
        'Perempuan 52 tahun dengan diabetes dan hipertrigliseridemia menjalani CBC untuk pemeriksaan kesehatan. Tidak ada keluhan hipoksia berat.',
      physicalExam:
        'Keadaan umum stabil, tidak tampak plethoric dan tidak ada tanda dehidrasi nyata.',
      doctorOrder:
        'Dokter meminta konfirmasi Hb yang tidak sesuai hasil sebelumnya 12,8 g/dL.',
      labResults:
        'Hb fotometrik 18,4 g/dL; RBC 4,1 juta/uL; Ht 36%; MCHC 51,1 g/dL. Plasma setelah sentrifugasi tampak sangat keruh/milky. QC alat memadai, tidak terlihat agregat RBC.',
      medicationContext:
        'Pasien belum memakai obat baru. Dokter mempertimbangkan evaluasi lipid dan ulang darah sebelum menilai polisitemia.',
    },
    questionText: 'Pertanyaan: Pendekatan ATLM yang paling tepat adalah ...',
    options: {
      A: 'Mencurigai interferensi kekeruhan/lipemia pada pengukuran Hb, menggunakan prosedur koreksi yang tervalidasi untuk instrumen bila tersedia dan mengomunikasikan hasil yang belum valid ke dokter.',
      B: 'Menetapkan polisitemia vera dari Hb saja.',
      C: 'Mengurangi nilai Hb 30% dengan perkiraan tanpa validasi.',
      D: 'Mengganti hasil RBC dari 4,1 menjadi 6,1 juta/uL.',
      E: 'Memberi obat penurun trigliserida kepada pasien.',
    },
    correctOption: 'A',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Kekeruhan (lipemia berat) dapat mengganggu pembacaan optik/fotometrik pada metode Hb tertentu sehingga Hb terbaca tinggi palsu (18,4 g/dL). MCHC jauh di atas kisaran fisiologis (51,1 g/dL) dan diskrepansi dengan Ht (36%)/RBC (4,1 juta/uL) memicu evaluasi interferensi, bukan diagnosis polisitemia.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Periksa keadaan sampel, hematokrit dan parameter analyzer. Ikuti prosedur terkualifikasi, misalnya penggantian plasma isovolumetrik (plasma replacement) atau metode alternatif bila disetujui instrumen/laboratorium. Jangan gunakan perbaikan arbitrer.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Pemilihan terapi dislipidemia atau evaluasi eritrositosis dilakukan dokter setelah data laboratorium sah tersedia.',
    patientEducation:
      '4. Edukasi dan komunikasi: Terangkan bahwa pemeriksaan ulang atau metode tambahan bertujuan mencegah keputusan medis berdasarkan angka yang mungkin palsu.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: B mengabaikan diskrepansi; C/D memalsukan hasil; E melampaui kompetensi.',
    pdfPageRef: 'Acuan: R1; R8 (Halaman 25 & 53)',
  },
  {
    questionNumber: 42,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 42 | Uji silang positif pada persiapan transfusi',
    caseTable: {
      anamnesis:
        'Perempuan 35 tahun dengan anemia simptomatik dan riwayat transfusi setelah persalinan sebelumnya. Kini dirawat karena Hb rendah.',
      physicalExam: 'Pucat, nadi 108/menit, tekanan darah 103/70 mmHg.',
      doctorOrder:
        'Dokter meminta golongan darah dan skrining antibodi sebelum menyiapkan PRC. Tidak ada perintah pelepasan darah darurat tanpa crossmatch.',
      labResults:
        'Golongan O RhD positif. Antibody screen IAT positif. Uji silang dengan unit donor O positif yang dipilih menunjukkan inkompatibilitas pada fase antiglobulin. Identitas sampel pasien telah dikonfirmasi.',
      medicationContext:
        'Pasien mengatakan sebelumnya pernah mengalami reaksi setelah transfusi. Dokter akan menilai urgensi transfusi.',
    },
    questionText:
      'Pertanyaan: Keputusan ATLM/bank darah yang paling aman ialah ...',
    options: {
      A: 'Melepas unit inkompatibel karena ABO sama.',
      B: 'Menyatakan semua antibodi tak bermakna karena RhD positif.',
      C: 'Mencampur sampel pasien dengan darah donor lalu memutuskan secara visual saja.',
      D: 'Memastikan identitas/ABO, melakukan identifikasi antibodi dan pemilihan unit antigen-negatif yang kompatibel sesuai SOP, serta berkoordinasi dengan dokter bank darah dan klinisi mengenai ketersediaan waktu.',
      E: 'Memberikan premedikasi secara mandiri lalu mengizinkan unit inkompatibel.',
    },
    correctOption: 'D',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Kesamaan ABO/RhD tidak menyingkirkan aloantibodi ireguler terhadap antigen eritrosit lain (misal Kell, Duffy, Kidd, MNS) akibat sensitisasi transfusi/kehamilan sebelumnya. Skrining antibodi positif dan crossmatch inkompatibel harus diselidiki sebelum produk diberikan, kecuali prosedur darurat khusus disahkan dokter.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Konfirmasi identitas, lakukan uji panel identifikasi antibodi dan pemilihan unit donor antigen-negatif yang kompatibel, serta dokumentasikan komunikasi dan status produk.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Terapi transfusi, urgensi dan medikasi terkait diputuskan oleh dokter. ATLM tidak boleh melepas unit inkompatibel berdasarkan penilaian sendiri.',
    patientEducation:
      '4. Edukasi dan komunikasi: Jelaskan kepada pasien bahwa pemeriksaan kecocokan tambahan dapat memakan waktu untuk menurunkan risiko reaksi transfusi.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: A/B mengabaikan antibodi ireguler; C tidak valid; E tidak mengatasi inkompatibilitas.',
    pdfPageRef: 'Acuan: R6; R7 (Halaman 26 & 54)',
  },
  {
    questionNumber: 43,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 43 | Reaksi hemolitik akut selama transfusi',
    caseTable: {
      anamnesis:
        'Laki-laki 55 tahun menjalani transfusi PRC. Setelah sekitar 15 menit mengeluh nyeri pinggang, menggigil, sesak dan urine menjadi gelap.',
      physicalExam:
        'Demam naik, tekanan darah turun dari 120/75 menjadi 85/55 mmHg, nadi 130/menit.',
      doctorOrder:
        'Dokter menghentikan transfusi dan meminta pemeriksaan reaksi transfusi, termasuk ulang ABO/crossmatch, DAT, penanda hemolisis, dan bila sesuai kultur komponen/pasien.',
      labResults:
        'Pra-transfusi DAT negatif; pasca-transfusi DAT positif. Plasma pasca-transfusi kemerahan; LDH dan bilirubin meningkat. Label kantong dan identitas sampel perlu audit ulang.',
      medicationContext:
        'Tim klinis memberikan suportif dan mempertimbangkan tata laksana syok; transfusi tidak dilanjutkan.',
    },
    questionText: 'Pertanyaan: Apa langkah ATLM prioritas?',
    options: {
      A: 'Menyuruh pasien menunggu karena semua demam transfusi ringan.',
      B: 'Memverifikasi identitas pasien-kantong-sampel dan menjalankan algoritme investigasi reaksi transfusi, termasuk ulang pemeriksaan ABO/crossmatch dan DAT serta hemolisis, sambil segera melapor kepada dokter bank darah.',
      C: 'Mengulang transfusi dari kantong yang sama agar cepat selesai.',
      D: 'Memberikan antibiotik secara mandiri sebelum evaluasi produk darah.',
      E: 'Menyatakan penyebab pasti adalah alergi ringan tanpa pemeriksaan.',
    },
    correctOption: 'B',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Hipotensi, nyeri pinggang, hemoglobinuria/plasma kemerahan serta DAT baru positif dan penanda hemolisis menunjang kecurigaan reaksi transfusi hemolitik akut. Ketidaksesuaian ABO akibat salah identitas (clerical error) harus diselidiki cepat.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Segera amankan/serahkan sisa komponen darah dan sampel sesuai SOP, cek identitas secara terpisah, lakukan pengujian ulang ABO/Rh, crossmatch, DAT, serta dokumentasikan hasil dan komunikasi. Kultur diindikasikan jika ada kecurigaan kontaminasi bakteri.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Menghentikan transfusi dan tata laksana syok/ginjal pada pasien dilakukan tim klinis. ATLM mendukung investigasi, bukan meresepkan obat.',
    patientEducation:
      '4. Edukasi dan komunikasi: Edukasi pasien oleh dokter mencakup dokumentasi reaksi pada rekam medis dan penyampaian riwayat reaksi pada kunjungan berikutnya.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: A/C berbahaya; D bukan tugas ATLM; E mengabaikan bukti hemolisis.',
    pdfPageRef: 'Acuan: R6; R9 (Halaman 27 & 55)',
  },
  {
    questionNumber: 44,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 44 | Malaria dan pelaporan parasitemia mendesak',
    caseTable: {
      anamnesis:
        'Laki-laki 30 tahun baru pulang dari daerah endemis malaria. Selama 4 hari mengalami demam menggigil, nyeri kepala dan muntah.',
      physicalExam:
        'Suhu 39,5 C, nadi 120/menit, sklera agak ikterik, tampak lemah.',
      doctorOrder:
        'Dokter meminta RDT malaria, apusan darah tebal-tipis STAT, CBC dan penilaian kepadatan parasit; terapi akan ditentukan sesudah penilaian tingkat keparahan.',
      labResults:
        'RDT malaria negatif, tetapi apusan tipis berkualitas baik menunjukkan parasit malaria pada 6% eritrosit yang dihitung; apusan tebal positif. Hb 9,4 g/dL, trombosit 68.000/uL. Spesies sedang diverifikasi.',
      medicationContext:
        'Pasien belum mengonsumsi antimalaria. Tim klinis mempertimbangkan tata laksana malaria berat berdasarkan parasitemia dan kondisi.',
    },
    questionText: 'Pertanyaan: Pilihan tindakan ATLM terbaik adalah ...',
    options: {
      A: 'Memprioritaskan konfirmasi mikroskopis, menghitung dan melaporkan parasitemia 6% serta kecurigaan malaria kepada dokter segera; RDT negatif tidak membatalkan apusan positif yang valid.',
      B: 'Mengeluarkan hasil "malaria negatif" karena RDT negatif.',
      C: 'Menunda seluruh informasi sampai pemeriksaan PCR di laboratorium rujukan selesai.',
      D: 'Memberikan kombinasi antimalaria langsung dari laboratorium.',
      E: 'Mengabaikan hitung trombosit karena malaria hanya berkaitan dengan eritrosit.',
    },
    correctOption: 'A',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: Apusan darah mikroskopis (baku emas) positif mengonfirmasi infeksi parasit malaria meski RDT negatif (misal akibat prozone effect, mutasi delesi pfhrp2/3, atau jenis antigen RDT). Parasit pada 6% eritrosit menunjukkan beban parasit tinggi (hiperparasitemia) yang berpotensi memenuhi kriteria malaria berat.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Verifikasi spesies dan kuantifikasi parasitemia oleh mikroskopis kompeten, gunakan apusan tebal-tipis sesuai standar, laporkan hasil STAT dan minta pemeriksaan konfirmasi bila perlu tanpa menunda tindakan.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Dokter memilih obat antimalaria dan rute pemberian berdasarkan spesies, keparahan, serta kebijakan setempat; pada malaria berat terapi segera sangat penting.',
    patientEducation:
      '4. Edukasi dan komunikasi: Jelaskan perlunya pemeriksaan apusan serial sesuai instruksi dokter untuk memantau penurunan kepadatan parasit dan bahwa hasil RDT negatif tidak otomatis meniadakan penyakit.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: B/C menunda pengenalan infeksi darurat; D di luar kewenangan; E mengabaikan data trombositopenia terkait.',
    pdfPageRef: 'Acuan: R10 (CDC Malaria Diagnosis — Halaman 28 & 56)',
  },
  {
    questionNumber: 45,
    sectionCode: 'C',
    category: 'clinical_case',
    topic: 'KASUS 45 | Demam neutropenia pascakemoterapi',
    caseTable: {
      anamnesis:
        'Perempuan 43 tahun hari ke-10 setelah kemoterapi mengalami menggigil dan demam sejak pagi, disertai sariawan.',
      physicalExam:
        'Suhu 39,2 C, tekanan darah 90/55 mmHg, nadi 125/menit, mukosa mulut meradang.',
      doctorOrder:
        'Dokter UGD meminta CBC diferensial STAT, kultur darah dan tes infeksi lain sesuai penilaian. Dokter mempertimbangkan antibiotik empiris segera.',
      labResults:
        'WBC 700/uL; neutrofil segmen 15% dan batang 5%, sehingga ANC = 140/uL; Hb 9,2 g/dL; trombosit 35.000/uL. Tidak ada clump, QC valid.',
      medicationContext:
        'Pasien menjalani kemoterapi sitotoksik, belum diberi antibiotik dalam episode ini.',
    },
    questionText: 'Pertanyaan: Prioritas ATLM yang paling tepat ialah ...',
    options: {
      A: 'Menunggu hari berikutnya karena leukopenia diharapkan setelah kemoterapi.',
      B: 'Menganggap ANC tinggi karena neutrofil 20% tampak normal secara persentase.',
      C: 'Menyarankan antibiotik yang tersedia di rumah tanpa menilai alergi.',
      D: 'Menghitung/mengecek ANC, memverifikasi sampel dan segera mengomunikasikan neutropenia berat beserta hasil kritis kepada dokter; membantu kultur sesuai order tanpa menunda penatalaksanaan klinis.',
      E: 'Mengabaikan tanda vital karena hanya hasil laboratorium yang relevan.',
    },
    correctOption: 'D',
    scientificExplanation:
      '1. Dasar penalaran laboratorium: ANC = 700 × (15+5)/100 = 140/uL, yaitu neutropenia berat (<500/uL). Demam (39,2°C) dan hipotensi dalam kondisi ini mengarah pada kegawatan infeksi (febrile neutropenia). Persentase neutrofil tidak boleh dinilai tanpa hitung absolut.',
    atlmProcedureAndDecision:
      '2. Prosedur dan keputusan ATLM: Periksa CBC dan morfologi bila flag, pastikan nilai ANC benar serta hasil kritis disampaikan segera dan tercatat. Kultur diambil sesuai permintaan dan protokol asepsis, tetapi kerja laboratorium tidak boleh menyebabkan penundaan antibiotik yang diputuskan dokter.',
    doctorClinicalExplanation:
      '3. Hubungan dengan terapi/obat dokter: Dokter memilih antibiotik empiris spektrum luas segera dan perawatan berdasarkan kondisi pasien, alergi, pola resistensi dan protokol. ATLM memantau hematologi dan kultur.',
    patientEducation:
      '4. Edukasi dan komunikasi: Berikan informasi proses pemeriksaan kepada pasien dan anjurkan segera melaporkan demam, menggigil, perdarahan, atau gejala infeksi kepada tim perawatan.',
    whyOthersWrong:
      '5. Mengapa pilihan lain keliru: A/B salah menilai ANC; C melampaui kewenangan; E mengabaikan kegawatan.',
    calculationSteps: 'ANC = 700 × (15 + 5) / 100 = 700 × 0,20 = 140/uL (< 500/uL → Neutropenia Berat).',
    pdfPageRef: 'Acuan: R1; R7 (Halaman 29 & 57)',
  },

  // ===========================================================================
  // BAGIAN D: 5 SOAL PERHITUNGAN MCV, MCH, MCHC (NOMOR 46 - 50)
  // Kerjakan ketiganya sekaligus; telaah apakah hasil dapat divalidasi
  // ===========================================================================
  {
    questionNumber: 46,
    sectionCode: 'D',
    category: 'calculation',
    topic: 'SOAL 46 | Hitung tiga indeks: anemia mikrositik',
    questionText:
      'Hasil CBC yang sudah lolos QC: Hb 9,0 g/dL; hematokrit 30%; eritrosit 4,00 juta/uL. Hitung MCV, MCH dan MCHC, lalu pilih klasifikasi yang benar.',
    options: {
      A: 'MCV 90 fL; MCH 22,5 pg; MCHC 30 g/dL, normositik',
      B: 'MCV 75 fL; MCH 30 pg; MCHC 22,5 g/dL',
      C: 'MCV 75 fL; MCH 22,5 pg; MCHC 30 g/dL, mikrositik-hipokromik',
      D: 'MCV 30 fL; MCH 9 pg; MCHC 75 g/dL',
      E: 'MCV 100 fL; MCH 33,3 pg; MCHC 30 g/dL',
    },
    correctOption: 'C',
    scientificExplanation:
      'MCV (fL) = Ht (%) × 10 / RBC (juta/uL) = 30 × 10 / 4,00 = 75 fL (<80 fL → mikrositik). MCH (pg) = Hb (g/dL) × 10 / RBC = 9,0 × 10 / 4,00 = 22,5 pg. MCHC (g/dL) = Hb × 100 / Ht (%) = 9,0 × 100 / 30 = 30 g/dL (<32 g/dL → hipokromik). MCV <80 dan MCHC rendah mendukung mikrositik-hipokromik.',
    atlmProcedureAndDecision:
      'Cek apusan darah tepi untuk mengonfirmasi mikrositosis hipokromik serta laporkan ketiga indeks yang telah tervalidasi.',
    doctorClinicalExplanation:
      'Ketiga indeks tidak menegakkan etiologi sendirian; dokter mengintegrasikannya dengan pemeriksaan ferritin, profil besi, atau elektroforesis Hb.',
    patientEducation:
      'Menjelaskan bahwa ukuran dan kepekatan warna sel darah merah berada di bawah rentang acuan dewasa.',
    whyOthersWrong:
      'A salah menghitung MCV; B menukar nilai MCH dan MCHC; D tidak mengalikan faktor 10 dan 100; E salah menghitung MCV dan MCH.',
    calculationSteps:
      'MCV = (30 × 10) / 4,00 = 75 fL | MCH = (9,0 × 10) / 4,00 = 22,5 pg | MCHC = (9,0 × 100) / 30 = 30 g/dL (Mikrositik-Hipokromik).',
    pdfPageRef: 'Acuan: M1 (PDF ANFIS Darah Hal. 23 & 40); R1 (Halaman 30 & 58)',
  },
  {
    questionNumber: 47,
    sectionCode: 'D',
    category: 'calculation',
    topic: 'SOAL 47 | Hitung tiga indeks: anemia makrositik',
    questionText:
      'Pada sampel valid diperoleh Hb 11,5 g/dL; hematokrit 33%; eritrosit 3,00 juta/uL. Hasil perhitungan indeks yang benar adalah ...',
    options: {
      A: 'MCV 90 fL; MCH 32,0 pg; MCHC 36 g/dL',
      B: 'MCV 33 fL; MCH 11,5 pg; MCHC 3 g/dL',
      C: 'MCV 110 fL; MCH 34,8 pg; MCHC 38,3 g/dL',
      D: 'MCV 100 fL; MCH 20 pg; MCHC 30 g/dL',
      E: 'MCV 110 fL; MCH 38,3 pg; MCHC 34,8 g/dL, makrositik dengan konsentrasi Hb eritrosit relatif normal',
    },
    correctOption: 'E',
    scientificExplanation:
      'MCV = 33 × 10 / 3,00 = 110 fL (>100 fL → makrositik). MCH = 11,5 × 10 / 3,00 = 38,33 pg (~38,3 pg). MCHC = 11,5 × 100 / 33 = 34,85 g/dL (~34,8 g/dL, berada dalam kisaran normal 32–36 g/dL). MCH dapat tinggi karena ukuran eritrosit besar, sementara MCHC masih normal; jangan menukar kedua parameter.',
    atlmProcedureAndDecision:
      'Periksa makro-ovalosit, neutrofil hipersegmentasi pada apusan darah, serta hitung retikulosit dan status B12/folat bila diindikasikan.',
    doctorClinicalExplanation:
      'Anemia makrositik normokromik (MCV 110 fL, MCHC 34,8 g/dL) mengarahkan evaluasi klinis pada anemia megaloblastik atau makrositosis non-megaloblastik.',
    patientEducation:
      'Menjelaskan bahwa ukuran rata-rata sel darah merah lebih besar dari normal namun konsentrasi hemoglobin per volume sel tetap normal.',
    whyOthersWrong:
      'A dan D tidak sesuai perhitungan; B tidak memakai rumus faktor pengali; C menukar hasil MCH (38,3 pg) dengan MCHC (34,8 g/dL).',
    calculationSteps:
      'MCV = (33 × 10) / 3,00 = 110 fL | MCH = (11,5 × 10) / 3,00 = 38,3 pg | MCHC = (11,5 × 100) / 33 = 34,8 g/dL.',
    pdfPageRef: 'Acuan: M1; R1 (Halaman 30 & 58)',
  },
  {
    questionNumber: 48,
    sectionCode: 'D',
    category: 'calculation',
    topic: 'SOAL 48 | Hitung tiga indeks: hipokromia berat',
    questionText:
      'CBC: Hb 9,6 g/dL, hematokrit 32%, eritrosit 4,80 juta/uL. Berapa MCV, MCH, MCHC?',
    options: {
      A: '66,7 fL; 20 pg; 30 g/dL',
      B: '100 fL; 20 pg; 30 g/dL',
      C: '66,7 fL; 30 pg; 20 g/dL',
      D: '80 fL; 24 pg; 34 g/dL',
      E: '32 fL; 4,8 pg; 9,6 g/dL',
    },
    correctOption: 'A',
    scientificExplanation:
      'MCV = 32 × 10 / 4,80 = 66,67 fL (~66,7 fL). MCH = 9,6 × 10 / 4,80 = 20 pg. MCHC = 9,6 × 100 / 32 = 30 g/dL. Ketiganya menunjukkan eritrosit kecil (mikrositik) dengan Hb sel rendah (hipokromik).',
    atlmProcedureAndDecision:
      'Susun laporan deskriptif morfologi apusan darah dan dukung pemeriksaan lanjutan ferritin, profil besi, atau evaluasi hemoglobinopati sesuai order dokter.',
    doctorClinicalExplanation:
      'MCV 66,7 fL dengan RBC 4,80 juta/uL memerlukan pembedaan antara defisiensi besi dan trait talassemia.',
    patientEducation:
      'Menjelaskan hasil perhitungan indeks sel darah merah sebagai dasar penelusuran penyebab anemia.',
    whyOthersWrong:
      'B salah menghitung MCV; C menukar nilai MCH dan MCHC; D dan E tidak sesuai substitusi angka.',
    calculationSteps:
      'MCV = (32 × 10) / 4,80 = 66,7 fL | MCH = (9,6 × 10) / 4,80 = 20 pg | MCHC = (9,6 × 100) / 32 = 30 g/dL.',
    pdfPageRef: 'Acuan: M1; R1 (Halaman 30 & 58)',
  },
  {
    questionNumber: 49,
    sectionCode: 'D',
    category: 'calculation',
    topic: 'SOAL 49 | Hitung tiga indeks: normositik normokromik',
    questionText:
      'Pasien sehat: Hb 14,0 g/dL, hematokrit 42%, eritrosit 4,50 juta/uL. Pilihan yang paling tepat adalah ...',
    options: {
      A: '42 fL; 14 pg; 4,5 g/dL',
      B: '93,3 fL; 31,1 pg; 33,3 g/dL, normositik-normokromik',
      C: '120 fL; 31,1 pg; 33,3 g/dL',
      D: '93,3 fL; 20 pg; 22 g/dL',
      E: '93,3 fL; 33,3 pg; 31,1 g/dL, makrositik',
    },
    correctOption: 'B',
    scientificExplanation:
      'MCV = 42 × 10 / 4,50 = 93,33 fL (~93,3 fL). MCH = 14,0 × 10 / 4,50 = 31,11 pg (~31,1 pg). MCHC = 14,0 × 100 / 42 = 33,33 g/dL (~33,3 g/dL). Nilai tersebut konsisten dengan pola normositik-normokromik (MCV 80–100 fL, MCHC 32–36 g/dL).',
    atlmProcedureAndDecision:
      'Perhatikan bahwa Rule of Three juga terpenuhi (Hb 14 × 3 = Hct 42%), menandakan konsistensi internal parameter eritrosit yang sangat baik.',
    doctorClinicalExplanation:
      'Profil eritrosit dan ketiga indeks berada dalam batas fisiologis normal dewasa.',
    patientEducation:
      'Menyampaikan bahwa ukuran, bobot muatan hemoglobin, dan kepekatan warna sel darah merah berada dalam kisaran sehat.',
    whyOthersWrong:
      'A hanya menyalin angka mentah; C dan D salah hitung; E menukar nilai MCH dan MCHC serta salah mengklasifikasikan 93,3 fL sebagai makrositik.',
    calculationSteps:
      'MCV = (42 × 10) / 4,50 = 93,3 fL | MCH = (14,0 × 10) / 4,50 = 31,1 pg | MCHC = (14,0 × 100) / 42 = 33,3 g/dL (Normositik-Normokromik).',
    pdfPageRef: 'Acuan: M1; R1 (Halaman 30, 58–59)',
  },
  {
    questionNumber: 50,
    sectionCode: 'D',
    category: 'calculation',
    topic: 'SOAL 50 | Hitung tiga indeks sekaligus menilai interferensi',
    questionText:
      'Sebuah analyzer menghasilkan Hb 12,0 g/dL, hematokrit 30%, eritrosit 4,80 juta/uL. Hitung MCV, MCH, MCHC. Karena salah satu indeks tampak tidak fisiologis, pilih langkah ATLM terbaik.',
    options: {
      A: 'MCV 80 fL; MCH 25 pg; MCHC 30 g/dL. Lapor tanpa pemeriksaan.',
      B: 'MCV 100 fL; MCH 40 pg; MCHC 25 g/dL. Berikan vitamin B12.',
      C: 'MCV 62,5 fL; MCH 40 pg; MCHC 25 g/dL. Transfusi segera.',
      D: 'MCV 30 fL; MCH 4,8 pg; MCHC 12 g/dL. Tidak ada interferensi.',
      E: 'MCV 62,5 fL; MCH 25 pg; MCHC 40 g/dL. Telusuri interferensi/spesimen dan ulang melalui metode tervalidasi sebelum validasi hasil.',
    },
    correctOption: 'E',
    scientificExplanation:
      'MCV = 30 × 10 / 4,80 = 62,5 fL. MCH = 12,0 × 10 / 4,80 = 25 pg. MCHC = 12,0 × 100 / 30 = 40 g/dL. MCHC sebesar 40 g/dL (>36 g/dL) tidak fisiologis dan perlu memicu verifikasi, misalnya hemolisis in vitro, lipemia, aglutinasi eritrosit (cold agglutinin) atau ketidakcocokan pengukuran Hb/Ht. Jangan langsung menganggapnya kelainan hiperkromik sejati.',
    atlmProcedureAndDecision:
      'Cek kondisi visual plasma sampel (apakah lisis atau keruh/milky), periksa grafik histogram, flag alat, QC, dan apusan darah tepi (melihat sferosit atau aglutinasi), lalu lakukan pengukuran ulang/koreksi sesuai SOP sebelum merilis hasil.',
    doctorClinicalExplanation:
      'Verifikasi pra-analitik dan analitik terhadap MCHC >36 g/dL mencegah pelaporan kadar Hb atau Hct yang bias akibat interferensi.',
    patientEducation:
      'Menjelaskan bahwa laboratorium melakukan verifikasi mutu terhadap sampel untuk memastikan hasil bebas dari gangguan kekeruhan atau hemolisis.',
    whyOthersWrong:
      'A, B, C, dan D salah dalam perhitungan matematis dan mengabaikan protokol investigasi interferensi MCHC tinggi.',
    calculationSteps:
      'MCV = (30 × 10) / 4,80 = 62,5 fL | MCH = (12,0 × 10) / 4,80 = 25 pg | MCHC = (12,0 × 100) / 30 = 40 g/dL (> 36 g/dL → Curigai Interferensi!).',
    pdfPageRef: 'Acuan: M1; R1 (Halaman 31 & 59)',
  },
];
