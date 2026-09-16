/**
 * Isi halaman Kebijakan Privasi & Syarat/Ketentuan (termasuk refund).
 *
 * BUKAN NASIHAT HUKUM. Ini draf yang ditulis supaya jujur menggambarkan apa
 * yang benar-benar dilakukan aplikasi ini — bukan salinan template. Pemilik
 * WAJIB membacanya ulang sebelum berjualan, terutama angka-angka yang
 * mengikat (tenggat refund, lama tanggapan) dan identitas penjual.
 *
 * Teksnya sengaja di sini, bukan di komponen: satu tempat untuk diperiksa
 * ulang, dan komponennya tinggal merender. Pola yang sama dengan config game.
 *
 * KALAU APLIKASINYA BERUBAH, DOKUMEN INI IKUT BERUBAH — beserta `UPDATED`,
 * di hari yang sama. Ini bukan peringatan teoretis: bagian "Progres bermain
 * anak" sempat menyatakan bintang hanya tersimpan di perangkat, dan menjadi
 * keliru sehari kemudian begitu sinkron Firestore dipasang (2026-09-16).
 * Yang berikutnya menyusul: verifikasi email dan analytics.
 */

/** Satu paragraf (string) atau satu daftar berbutir (array of string). */
export type LegalBlock = string | string[];

export type LegalSection = {
  /** Judul bagian. */
  h: string;
  body: LegalBlock[];
};

export type LegalDoc = {
  title: string;
  /** Kalimat pembuka, satu-dua baris. */
  lead: string;
  /** Tanggal terakhir diperbarui, ditulis untuk dibaca orang tua. */
  updated: string;
  sections: LegalSection[];
};

/**
 * Nama penjual yang tampil di Syarat & Ketentuan.
 *
 * Sekarang masih nama produk, karena penjualnya kreator perorangan tanpa
 * badan usaha. Kalau nanti pemilik mendaftarkan CV/PT atau punya NIB, ganti
 * jadi nama resminya — halaman ketentuan adalah tempat pembeli mencari tahu
 * dengan siapa sebenarnya mereka bertransaksi.
 */
const SELLER = 'Petualangan Pintar';

const UPDATED = '16 September 2026';

export const privacyDoc: LegalDoc = {
  title: 'Kebijakan Privasi',
  lead: 'Aplikasi ini dipakai anak-anak. Karena itu kami mengumpulkan sesedikit mungkin — dan tidak satu pun datanya milik anak.',
  updated: UPDATED,
  sections: [
    {
      h: 'Ringkasnya',
      body: [
        [
          'Tidak ada iklan dan tidak ada pelacak pihak ketiga.',
          'Kami tidak pernah meminta nama, umur, foto, atau suara anak.',
          'Yang tersimpan hanya data orang tua: email, kata sandi (teracak), dan catatan kelompok yang sudah dibeli.',
          'Kami tidak pernah menjual atau menyewakan data siapa pun.',
        ],
      ],
    },
    {
      h: 'Data yang kami kumpulkan',
      body: [
        'Selama Anda hanya mencoba game gratis, kami tidak mengumpulkan apa pun. Tidak perlu daftar, tidak perlu masuk akun.',
        'Begitu Anda membuat akun untuk membuka kelompok berbayar, yang tersimpan adalah:',
        [
          'Alamat email — dipakai untuk masuk ke akun dan memulihkan kata sandi.',
          'Kata sandi — disimpan dalam bentuk teracak (hash) oleh Firebase Authentication. Kami sendiri tidak bisa melihatnya.',
          'Kode aktivasi dan kelompok yang terbuka — supaya game yang sudah Anda bayar bisa dibuka lagi kapan pun.',
          'Penanda perangkat acak — deretan huruf dan angka acak yang dibuat di perangkat Anda, dipakai hanya untuk menjaga batas 3 perangkat per akun. Ini bukan nomor IMEI, bukan nomor HP, dan tidak bisa dipakai mengenali Anda di luar aplikasi ini.',
          'Catatan bintang — nama game, nomor level, dan jumlah bintang (1 sampai 3). Penjelasannya di bagian berikutnya.',
        ],
        'Kami tidak meminta nomor HP, alamat rumah, lokasi, atau akses ke kamera, mikrofon, kontak, maupun galeri Anda.',
      ],
    },
    {
      h: 'Progres bermain anak',
      body: [
        'Bintang dan tahap maskot disimpan di perangkat itu sendiri lewat penyimpanan browser, dan itu tetap sumber utamanya. Anak bisa bermain tanpa akun dan tanpa sinyal sama sekali.',
        'Kalau Anda masuk akun, catatan bintang itu juga disalin ke akun Anda sebagai cadangan — supaya berganti HP tidak menghapus kemajuan yang sudah dikumpulkan anak. Yang tersimpan hanya nama game, nomor level, dan jumlah bintang. Tidak ada nama anak, umur, foto, suara, maupun catatan kapan dan berapa lama ia bermain.',
        'Satu akun menyimpan satu kumpulan bintang. Kalau dua anak memakai akun yang sama, bintangnya digabung menjadi satu — kami sengaja tidak membuat profil terpisah per anak, jadi kami juga tidak perlu tahu ada berapa anak di rumah Anda.',
        'Selama Anda tidak masuk akun, catatan itu tidak pernah meninggalkan perangkat. Dan kalau Anda meminta akun dihapus, cadangan bintangnya ikut terhapus.',
      ],
    },
    {
      h: 'Pembayaran',
      body: [
        'Pembelian diproses oleh platform penjualan (Lynk.id atau Mayar.id). Data kartu, rekening, dan e-wallet Anda masuk ke sistem mereka — tidak pernah melewati maupun tersimpan di aplikasi ini.',
        'Yang kami terima hanyalah kode aktivasi yang kemudian Anda masukkan sendiri di portal. Untuk bagian pembayaran, kebijakan privasi platform tersebut yang berlaku.',
      ],
    },
    {
      h: 'Siapa lagi yang menyimpan data ini',
      body: [
        'Akun dan catatan pembelian disimpan di Firebase (layanan Google Cloud) di pusat data wilayah Jakarta. Google bertindak sebagai pengolah data atas nama kami, dan tidak memakai data itu untuk keperluannya sendiri.',
        'Seperti layanan web pada umumnya, penyedia server mencatat hal teknis seperti alamat IP dan jenis peramban di log sementara, untuk keamanan dan mengatasi gangguan. Kami tidak memakai log itu untuk membuat profil siapa pun.',
        'Gambar, narasi suara, dan isi game disajikan sebagai berkas biasa — memutarnya tidak mengirimkan data apa pun tentang Anda.',
      ],
    },
    {
      h: 'Anak-anak',
      body: [
        'Akun di sini adalah akun orang tua. Anak tidak pernah diminta mendaftar, mengisi nama, atau menuliskan apa pun tentang dirinya.',
        'Area bermain juga sengaja dibuat tertutup: tanpa iklan, tanpa tautan keluar, dan tanpa pembelian di dalamnya. Halaman akun dan pembelian dipisah di area orang tua.',
      ],
    },
    {
      h: 'Hak Anda',
      body: [
        'Sesuai Undang-Undang Perlindungan Data Pribadi No. 27 Tahun 2022, Anda berhak meminta salinan data Anda, meminta perbaikannya kalau ada yang keliru, menarik persetujuan, dan meminta akun beserta datanya dihapus.',
        'Ajukan lewat kontak di bawah halaman ini. Permintaan kami tanggapi selambat-lambatnya 14 hari kerja.',
        'Satu hal yang perlu Anda tahu sebelum meminta penghapusan: menghapus akun berarti menghapus juga catatan kelompok yang sudah dibeli, dan kode aktivasi yang sudah terpakai tidak bisa dipakai ulang.',
      ],
    },
    {
      h: 'Berapa lama data disimpan',
      body: [
        'Selama akun Anda masih ada. Kalau Anda meminta penghapusan, akun dan datanya kami hapus.',
        'Catatan transaksi pembelian ada di platform penjualan dan tunduk pada aturan penyimpanan mereka, termasuk kewajiban pembukuan dan pajak.',
      ],
    },
    {
      h: 'Kalau kebijakan ini berubah',
      body: [
        'Tanggal di atas ikut berubah, dan perubahan pentingnya kami umumkan lewat lonceng pengumuman di halaman depan.',
      ],
    },
  ],
};

export const termsDoc: LegalDoc = {
  title: 'Syarat & Ketentuan',
  lead: `Dengan membeli dan memakai ${SELLER}, Anda menyetujui ketentuan di bawah ini. ${SELLER} dikelola oleh kreator perorangan di Indonesia.`,
  updated: UPDATED,
  sections: [
    {
      h: 'Yang Anda beli adalah akses',
      body: [
        'Pembelian satu kelompok memberi akun Anda hak membuka semua game di kelompok itu. Yang dijual adalah aksesnya, bukan berkas game yang diunduh dan disimpan sendiri.',
        'Game dimainkan lewat browser di HP atau tablet. Koneksi internet dibutuhkan saat masuk akun dan saat membuka game berbayar.',
      ],
    },
    {
      h: 'Sekali bayar, main selamanya',
      body: [
        'Satu kelompok cukup dibayar sekali dan bisa dimainkan selamanya. Tidak ada tagihan bulanan.',
        'Perbaikan bug dan penyempurnaan game yang sudah ada selalu gratis untuk pembeli.',
        'Kalau nanti ada paket konten besar yang benar-benar baru, itu ekspansi terpisah yang sifatnya pilihan — bukan biaya wajib bagi Anda yang sudah membeli.',
      ],
    },
    {
      h: 'Kode aktivasi',
      body: [
        [
          'Kode dikirim oleh platform penjualan setelah pembayaran Anda berhasil.',
          'Satu kode hanya bisa dipakai sekali, untuk satu akun, dan hanya membuka kelompok yang tertulis pada kode itu.',
          'Kode yang sudah dipakai tidak bisa dipindahkan ke akun lain, jadi masukkan di akun yang memang akan Anda pakai.',
        ],
        'Kalau kode tidak kunjung sampai atau tidak bisa dipakai, hubungi kami lewat kontak di bawah dan sertakan bukti pembelian dari platform. Ini kami bantu sampai selesai.',
      ],
    },
    {
      h: 'Batas 3 perangkat',
      body: [
        'Satu akun bisa dipakai di maksimal 3 perangkat, supaya anak tetap bisa main bergantian di HP dan tablet yang ada di rumah.',
        'Kalau batasnya penuh, akan muncul daftar perangkat yang sedang terdaftar dan Anda bisa melepas salah satunya sendiri, lalu perangkat baru bisa masuk. Tidak perlu menghubungi kami untuk itu.',
      ],
    },
    {
      h: 'Yang tidak diperbolehkan',
      body: [
        [
          'Membagikan akun atau kode aktivasi kepada orang di luar rumah Anda.',
          'Menjual kembali, menyewakan, atau menyebarluaskan akses maupun isi game.',
          'Menyalin gambar, suara, atau materi game untuk dipakai di produk lain.',
          'Mencoba membuka game berbayar tanpa membelinya.',
        ],
        'Akun yang terbukti melanggar dapat kami nonaktifkan tanpa pengembalian dana.',
      ],
    },
    {
      h: 'Hak cipta',
      body: [
        `Seluruh gambar, narasi suara, musik, tulisan, dan isi soal di dalam ${SELLER} adalah milik pembuatnya dan dilindungi hak cipta. Pembelian memberi Anda hak memakainya untuk keperluan pribadi di rumah, bukan hak atas materinya.`,
      ],
    },
    {
      h: 'Ketersediaan layanan',
      body: [
        'Kami berusaha menjaga layanan tetap berjalan, tetapi tidak dapat menjanjikan bebas gangguan sepenuhnya. Gangguan pada penyedia server atau pada koneksi internet Anda sendiri berada di luar kendali kami.',
        'Daftar game dan harga dapat berubah sewaktu-waktu. Perubahan harga tidak berlaku surut: yang sudah Anda beli tetap milik Anda dengan harga yang sudah dibayar.',
      ],
    },
    {
      h: 'Pengembalian dana (refund)',
      body: [
        'Yang dijual berupa kode akses digital, dan ada beberapa game gratis yang bisa dimainkan penuh tanpa daftar. Kami sarankan mencobanya dulu di HP yang akan dipakai anak, supaya Anda tahu persis apa yang dibeli.',
        'Dana dikembalikan penuh bila:',
        [
          'Kode aktivasi tidak pernah Anda terima, atau tidak bisa dipakai, dan kami tidak berhasil memperbaikinya.',
          'Ada masalah teknis yang membuat kelompok yang Anda beli sama sekali tidak bisa dimainkan, dan belum selesai dalam 7 hari sejak Anda melapor.',
          'Anda tidak sengaja membeli kelompok yang sama dua kali, dan kode keduanya belum dipakai.',
        ],
        'Dana tidak dapat dikembalikan bila:',
        [
          'Kode sudah dipakai dan game berjalan normal — aksesnya sudah menyala dan tidak bisa ditarik kembali.',
          'Alasannya karena anak kurang menyukai isinya, sementara game gratis sudah tersedia untuk dicoba lebih dahulu.',
          'Perangkat Anda tidak dapat menjalankan game, padahal game gratis di perangkat yang sama pun sudah tidak dapat dijalankan sebelum Anda membeli.',
        ],
        'Ajukan paling lambat 7 hari setelah pembelian lewat kontak di bawah, sertakan bukti pembelian. Dana dikembalikan melalui jalur pembayaran yang sama, paling lama 14 hari kerja setelah permintaan disetujui.',
        'Platform penjualan mungkin memiliki ketentuan refund sendiri. Bila ketentuan mereka lebih menguntungkan Anda sebagai pembeli, ketentuan merekalah yang berlaku.',
      ],
    },
    {
      h: 'Hukum yang berlaku',
      body: [
        'Ketentuan ini tunduk pada hukum Republik Indonesia. Bila terjadi perselisihan, kami mengutamakan penyelesaian secara musyawarah lewat kontak di bawah.',
      ],
    },
    {
      h: 'Kalau ketentuan ini berubah',
      body: [
        'Tanggal di atas ikut berubah, dan perubahan pentingnya kami umumkan lewat lonceng pengumuman di halaman depan.',
      ],
    },
  ],
};
