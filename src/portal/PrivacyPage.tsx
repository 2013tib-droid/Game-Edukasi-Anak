import LegalPage from '@/portal/LegalPage';

/**
 * Kebijakan Privasi — route `/privasi`, area ORANG TUA.
 *
 * ATURAN MENULIS HALAMAN INI: setiap kalimat di bawah harus bisa ditunjuk ke
 * kode yang benar-benar berjalan. Kalau suatu saat ada data baru yang
 * dikumpulkan (mis. nama anak, foto, mikrofon, pelacak), halaman ini WAJIB
 * ikut diubah di commit yang sama — kebijakan privasi yang ketinggalan lebih
 * buruk daripada tidak ada, karena ia jadi janji yang dilanggar.
 *
 * Daftar "apa yang dikumpulkan" di bawah dicocokkan ke:
 *   - email & kata sandi ......... src/auth/AuthContext.tsx (Firebase Auth)
 *   - id perangkat acak .......... src/auth/entitlements.ts (getDeviceId)
 *   - label perangkat ............ src/auth/entitlements.ts (describeDevice)
 *   - bintang per level .......... src/auth/progressSync.ts
 *   - kode aktivasi terpakai ..... functions/src/index.ts (redeemActivationCode)
 *   - hitungan percobaan gagal ... functions/src/index.ts (redeem_attempts)
 *   - penghitung kunjungan ....... functions/src/index.ts (catatStat)
 */
export default function PrivacyPage() {
  return (
    <LegalPage title="Kebijakan Privasi" updated="16 September 2026">
      <div className="legal-summary">
        <h2>Ringkasnya</h2>
        <ul>
          <li>
            <strong>Tidak ada iklan</strong> dan <strong>tidak ada pelacak pihak ketiga</strong>{' '}
            di mana pun, termasuk di halaman ini.
          </li>
          <li>
            <strong>Kami tidak mengumpulkan data apa pun tentang anak</strong> — tidak nama,
            tidak umur, tidak foto, tidak suara. Akunnya milik orang tua.
          </li>
          <li>
            Aplikasi ini <strong>tidak pernah meminta akses kamera, mikrofon, kontak, maupun
            lokasi.</strong>
          </li>
          <li>
            Yang benar-benar disimpan cuma empat hal: <strong>email</strong>,{' '}
            <strong>kata sandi (tersimpan teracak / hashed oleh Firebase)</strong>,{' '}
            <strong>id perangkat berupa angka acak</strong>, dan{' '}
            <strong>bintang hasil bermain</strong>.
          </li>
          <li>
            Data tidak dijual, tidak disewakan, dan tidak dibagikan ke siapa pun untuk
            pemasaran.
          </li>
        </ul>
      </div>

      <h2>1. Siapa kami</h2>
      <p>
        “Petualangan Pintar” adalah kumpulan permainan edukasi untuk anak, dibuat dan dijalankan
        oleh seorang pengembang perorangan di Indonesia. Kebijakan ini berlaku untuk aplikasi web
        Petualangan Pintar dan halaman penjualannya.
      </p>
      <p>
        Pemrosesan data pribadi di sini mengikuti <strong>Undang-Undang No. 27 Tahun 2022
        tentang Pelindungan Data Pribadi (UU PDP)</strong>.
      </p>

      <h2>2. Data yang kami kumpulkan — dan tidak lebih dari ini</h2>
      <ul className="legal-data">
        <li>
          <b>Alamat email</b>
          Dipakai untuk masuk ke akun, mengirim tautan verifikasi, dan mengirim tautan setel
          ulang kata sandi. Hanya diberikan saat orang tua mendaftar.
        </li>
        <li>
          <b>Kata sandi</b>
          Disimpan dalam bentuk <strong>teracak (hashed)</strong> oleh layanan Firebase
          Authentication milik Google. Kami tidak pernah bisa melihat kata sandi Anda, dan tidak
          menyimpan salinannya sendiri.
        </li>
        <li>
          <b>Id perangkat berupa angka acak</b>
          Saat Anda membuka permainan berbayar, perangkat ini diberi <strong>nomor acak</strong>{' '}
          yang disimpan di browser Anda. Nomor itu dipakai untuk menghitung batas 3 perangkat per
          akun. Ini <strong>bukan</strong> sidik jari perangkat: kami tidak mengukur layar, font,
          canvas, atau apa pun tentang HP Anda. Kalau data browser dibersihkan, nomornya hilang
          dan perangkat itu terhitung baru — itulah sebabnya ada tombol “Lepas” pada daftar
          perangkat.
        </li>
        <li>
          <b>Nama perangkat yang umum</b>
          Bersama nomor acak itu disimpan satu label kasar seperti “Android · Chrome”, supaya
          Anda bisa mengenali perangkat mana yang ingin dilepas. Label ini tidak memuat nomor
          seri, nomor telepon, atau id iklan.
        </li>
        <li>
          <b>Bintang hasil bermain</b>
          Nomor level dan jumlah bintang (1–3) per level. Ini yang membuat kemajuan anak tidak
          hilang saat ganti HP. Isinya hanya angka — tidak ada nama anak, tidak ada catatan
          jawaban salah, tidak ada rekaman.
        </li>
        <li>
          <b>Kode aktivasi yang sudah dipakai</b>
          Saat kode ditukar, kami mencatat bahwa kode itu terpakai oleh akun Anda dan kapan.
          Ini bukti pembelian dan yang membuat satu kode tidak bisa dipakai dua kali.
        </li>
        <li>
          <b>Hitungan percobaan kode yang gagal</b>
          Kalau kode salah dimasukkan berulang kali, jumlah kegagalan per jam disimpan
          sementara. Gunanya menahan orang yang mencoba menebak kode orang lain.
        </li>
        <li>
          <b>Penghitung kunjungan yang tidak bisa dilacak</b>
          Kami menyimpan <strong>angka jumlah</strong> — misalnya berapa kali halaman depan
          dibuka hari ini. Yang bertambah hanya angkanya. Tidak ada cookie, tidak ada id
          pengunjung, tidak ada riwayat per orang, dan angka itu tidak bisa ditelusuri balik ke
          siapa pun. Supaya satu orang tidak terhitung berulang kali, browser Anda menyimpan{' '}
          <strong>tanggal hari ini</strong> saja sebagai penanda — sebuah tanggal, bukan nomor
          pengenal, dan penanda itu tidak pernah dikirim ke mana pun.{' '}
          <strong>Tidak ada penghitung apa pun di dalam area anak.</strong>
        </li>
      </ul>

      <h3>Yang TIDAK kami kumpulkan</h3>
      <p>
        Nama anak, tanggal lahir, jenis kelamin, sekolah, foto, rekaman suara, daftar kontak,
        lokasi, nomor telepon, dan data iklan. Aplikasi ini juga tidak memuat SDK iklan, tidak
        memuat piksel media sosial, dan tidak memasang cookie pelacak.
      </p>

      <h2>3. Kenapa kami memerlukannya (dasar pemrosesan)</h2>
      <ul>
        <li>
          <strong>Untuk menjalankan perjanjian:</strong> email, kata sandi, id perangkat, dan
          catatan kode aktivasi — tanpa itu, akses yang Anda bayar tidak bisa diberikan atau
          dipulihkan.
        </li>
        <li>
          <strong>Kepentingan yang sah, terbatas:</strong> hitungan percobaan kode gagal (menahan
          penyalahgunaan) dan penghitung kunjungan berupa angka jumlah (mengetahui apakah
          halaman jualannya berguna).
        </li>
        <li>
          <strong>Kenyamanan Anda:</strong> bintang hasil bermain dicadangkan supaya kemajuan
          anak tidak hilang saat ganti perangkat.
        </li>
      </ul>

      <h2>4. Di mana data disimpan, dan siapa yang ikut memprosesnya</h2>
      <p>
        Aplikasi ini memakai layanan <strong>Google Firebase</strong> (Authentication, Cloud
        Firestore, Cloud Functions, Hosting). Basis data dan fungsi servernya dijalankan di
        region <strong>Jakarta (asia-southeast2)</strong>. Layanan autentikasi Google berjalan di
        infrastruktur globalnya, sehingga sebagian pemrosesan email dapat terjadi di luar
        Indonesia. Google bertindak sebagai pemroses data atas nama kami.
      </p>
      <p>
        Seperti semua layanan web, penyedia server mencatat permintaan teknis (termasuk alamat IP
        dan waktu) di log operasionalnya. Log itu milik penyedia, dipakai untuk keamanan dan
        penelusuran gangguan, dan tidak kami pakai untuk membuat profil siapa pun.
      </p>
      <p>
        Suara narasi Bahasa Indonesia <strong>sudah dibuat lebih dulu</strong> menjadi berkas
        audio biasa sebelum aplikasi diterbitkan. Saat anak bermain, tidak ada apa pun yang
        dikirim ke layanan suara — berkasnya hanya diunduh seperti gambar.
      </p>
      <p>
        Pembayaran dilakukan di platform penjualan (Lynk.id / Mayar.id), <strong>bukan di
        aplikasi ini</strong>. Kami tidak pernah menerima atau menyimpan nomor kartu, PIN, atau
        data dompet digital Anda. Data pembayaran diproses oleh platform tersebut menurut
        kebijakan mereka sendiri.
      </p>

      <h2>5. Yang disimpan di HP Anda sendiri</h2>
      <p>
        Beberapa hal disimpan di penyimpanan lokal browser dan <strong>tidak pernah dikirim ke
        mana pun</strong> kecuali disebut lain di atas: bintang hasil bermain, posisi “lanjutkan
        permainan”, nomor acak perangkat, pengumuman yang sudah dibaca, penanda tanggal
        penghitung kunjungan, dan pengaturan penguji.
        Menghapus data situs di browser akan menghapus semuanya dari HP itu; bintang yang sudah
        tercadang tetap bisa kembali saat Anda masuk lagi.
      </p>

      <h2>6. Berapa lama disimpan</h2>
      <ul>
        <li>
          <strong>Data akun</strong> (email, kata sandi teracak, perangkat, bintang): selama akun
          masih ada.
        </li>
        <li>
          <strong>Hitungan percobaan kode gagal</strong>: dihapus segera setelah kode berhasil
          ditukar, dan jendela hitungannya hanya satu jam.
        </li>
        <li>
          <strong>Catatan kode aktivasi terpakai</strong>: disimpan sebagai bukti pembelian
          walaupun akunnya dihapus, supaya kode yang sama tidak bisa dipakai ulang oleh orang
          lain. Catatan ini bisa dipisahkan dari identitas Anda bila Anda meminta akun dihapus.
        </li>
        <li>
          <strong>Penghitung kunjungan</strong>: hanya angka jumlah, tidak terikat siapa pun,
          jadi tidak ada yang bisa dihapus per orang.
        </li>
      </ul>

      <h2>7. Hak Anda</h2>
      <p>Sesuai UU PDP, Anda berhak:</p>
      <ul>
        <li>meminta salinan data pribadi Anda yang kami simpan;</li>
        <li>meminta data yang salah diperbaiki;</li>
        <li>meminta akun dan data pribadi Anda dihapus;</li>
        <li>menarik persetujuan dan berhenti memakai layanan ini;</li>
        <li>mengajukan keberatan atas cara data Anda diproses.</li>
      </ul>
      <p>
        Cukup hubungi kami lewat WhatsApp atau email di bawah. Permintaan penghapusan akun kami
        kerjakan secepatnya, paling lama <strong>30 hari</strong>. Perlu diketahui dengan jujur:{' '}
        <strong>menghapus akun juga menghapus akses yang sudah dibeli</strong>, dan kode aktivasi
        yang sudah terpakai tidak bisa dipakai lagi — jadi mintalah penghapusan hanya kalau Anda
        memang tidak ingin memakai layanan ini lagi.
      </p>

      <h2>8. Anak-anak</h2>
      <p>
        Aplikasi ini dibuat untuk dimainkan anak, tetapi <strong>akunnya milik orang
        tua/wali</strong> dan hanya orang dewasa yang boleh mendaftar. Kami tidak meminta anak
        memasukkan data apa pun — anak hanya mengetuk gambar dan mendengar suara. Area anak
        sengaja tidak punya link keluar, tidak punya pembelian di dalamnya, dan tidak punya
        penghitung apa pun.
      </p>
      <p>
        Kalau Anda merasa ada data anak yang masuk ke sistem kami secara tidak sengaja (misalnya
        nama anak diketik sebagai alamat email), hubungi kami dan kami hapus.
      </p>

      <h2>9. Keamanan</h2>
      <p>
        Kata sandi disimpan teracak oleh Firebase, sambungan selalu memakai HTTPS, dan aturan
        keamanan basis data disusun supaya <strong>satu akun hanya bisa membaca datanya
        sendiri</strong>. Kode aktivasi tidak bisa dibaca sama sekali dari HP. Meski begitu,
        tidak ada sistem yang benar-benar kebal; kalau terjadi kebocoran data pribadi, kami akan
        memberi tahu Anda dan pihak berwenang sebagaimana diwajibkan UU PDP.
      </p>

      <h2>10. Perubahan kebijakan ini</h2>
      <p>
        Kalau suatu saat ada yang berubah, tanggal “berlaku sejak” di atas ikut berubah. Kalau
        perubahannya besar — misalnya ada jenis data baru yang dikumpulkan — kami sampaikan lewat
        pengumuman di dalam aplikasi.
      </p>
    </LegalPage>
  );
}
