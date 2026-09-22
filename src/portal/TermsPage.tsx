import LegalPage from '@/portal/LegalPage';

/**
 * Syarat & Ketentuan + Kebijakan Pengembalian Dana — route `/ketentuan`,
 * area ORANG TUA.
 *
 * Kebijakan refund SENGAJA satu halaman dengan S&K, bukan route ketiga:
 * platform penjualan (Lynk.id/Mayar.id) meminta satu tautan "syarat" dan satu
 * tautan "privasi", dan orang tua yang mencari aturan refund mencarinya di
 * halaman syarat. Bagian 8 di bawah punya judulnya sendiri supaya tetap mudah
 * ditunjuk.
 *
 * ANGKA YANG PERLU DIPUTUSKAN PEMILIK (ditulis di sini sebagai usulan yang
 * masuk akal, BUKAN keputusan yang sudah diambil — lihat catatan di kaki
 * halaman dan laporan sesi):
 *   - jangka waktu refund 7 hari (bagian 8);
 *   - batas 3 perangkat sudah final (CLAUDE.md), jadi itu bukan usulan.
 */
export default function TermsPage() {
  return (
    <LegalPage title="Syarat & Ketentuan" updated="16 September 2026">
      <div className="legal-summary">
        <h2>Ringkasnya</h2>
        <ul>
          <li>
            Yang dibeli adalah <strong>kode akses digital</strong> untuk satu kelompok
            permainan — <strong>sekali bayar, bisa dimainkan selamanya</strong>, tanpa tagihan
            bulanan.
          </li>
          <li>
            Satu kode <strong>hanya bisa dipakai sekali</strong>, dan terikat pada akun pertama
            yang memakainya.
          </li>
          <li>
            Satu akun boleh dipakai di <strong>maksimal 3 perangkat</strong>, dan Anda bisa
            melepas perangkat sendiri kapan saja.
          </li>
          <li>
            Perbaikan bug selalu gratis. Paket konten besar yang baru adalah{' '}
            <strong>ekspansi terpisah</strong> dan sifatnya pilihan.
          </li>
        </ul>
      </div>

      <h2>1. Ini perjanjian dengan siapa</h2>
      <p>
        Dengan mendaftar akun atau memakai Petualangan Pintar, Anda menyetujui ketentuan ini.
        Layanan ini disediakan oleh pengembang perorangan di Indonesia. Kalau Anda tidak setuju
        dengan salah satu butir di bawah, mohon jangan memakai layanan ini.
      </p>
      <p>
        Yang boleh membeli dan mendaftar akun adalah <strong>orang dewasa (orang tua atau
        wali)</strong>. Anak memakai layanan ini di bawah pengawasan Anda, dengan akun Anda.
      </p>

      <h2>2. Yang Anda beli</h2>
      <p>
        Yang dijual adalah <strong>AKSES</strong>, bukan berkas. Anda mendapat izin pribadi,
        tidak eksklusif, dan tidak bisa dipindahtangankan untuk memainkan permainan pada satu
        kelompok jenjang (misalnya “Playgroup dan TK”) memakai akun Anda.
      </p>
      <p>
        Pembayaran dilakukan sekali. Tidak ada langganan, tidak ada perpanjangan otomatis, dan
        tidak ada tagihan yang muncul belakangan. Akses berlaku selama layanan ini masih
        berjalan (lihat bagian 9).
      </p>
      <p>
        Permainan yang ditandai <strong>GRATIS</strong> bisa dimainkan penuh tanpa mendaftar dan
        tanpa membayar. Itu memang dimaksudkan supaya Anda bisa mencoba dulu sebelum membeli.
      </p>

      <h2>3. Kode aktivasi</h2>
      <ul>
        <li>
          Kode dikirim oleh platform penjualan (Lynk.id / Mayar.id) segera setelah pembayaran
          Anda selesai.
        </li>
        <li>
          <strong>Satu kode sekali pakai.</strong> Begitu ditukar, kode itu terikat permanen pada
          akun yang memakainya dan tidak bisa dipindahkan ke akun lain.
        </li>
        <li>
          Huruf besar/kecil dan tanda hubung tidak masalah saat mengetik kode — yang penting
          huruf dan angkanya benar.
        </li>
        <li>
          Simpan kode Anda. Kode yang hilang <strong>sebelum</strong> ditukar bisa kami carikan
          kalau Anda punya bukti pembelian; kode yang sudah ditukar tidak perlu disimpan lagi,
          karena aksesnya sudah menempel di akun Anda.
        </li>
        <li>
          Memasukkan kode secara acak berulang kali akan ditahan sementara (maksimal 10
          percobaan gagal per jam).
        </li>
      </ul>

      <h2>4. Akun dan batas 3 perangkat</h2>
      <p>
        Anda bertanggung jawab menjaga email dan kata sandi akun Anda. Satu akun bisa dipakai di
        sampai <strong>3 perangkat</strong> — cukup untuk HP Ayah, HP Bunda, dan tablet di rumah,
        supaya anak bisa main bergantian tanpa beli ulang.
      </p>
      <p>
        Kalau perangkatnya sudah penuh, layar batas perangkat menampilkan daftarnya dan Anda bisa{' '}
        <strong>melepas salah satu sendiri</strong>. Anda tidak perlu menghubungi kami untuk itu.
      </p>
      <p>
        Lupa kata sandi bisa diselesaikan sendiri lewat tautan “Lupa kata sandi” di halaman
        masuk. Untuk bisa menukar kode aktivasi, alamat email akun perlu diverifikasi lebih dulu
        — supaya akun dengan email salah ketik tidak menjadi akses berbayar yang tidak bisa
        dipulihkan. Bermain tidak pernah menunggu verifikasi.
      </p>
      <p>
        Anda juga bisa masuk dengan <strong>akun Google</strong>. Alamat email akun Google sudah
        terverifikasi sejak awal, jadi kode aktivasi bisa langsung ditukar tanpa menunggu email
        verifikasi.
      </p>

      <h2>5. Yang tidak boleh dilakukan</h2>
      <ul>
        <li>
          <strong>Membagikan akun atau kode</strong> ke luar keluarga Anda — termasuk
          menyebarkannya di grup WhatsApp, forum, atau media sosial.
        </li>
        <li>
          <strong>Menjual kembali</strong> kode atau akses, atau memakainya untuk keperluan
          komersial (lembaga kursus, sekolah, playgroup) tanpa izin terpisah dari kami. Untuk
          pemakaian di kelas, silakan hubungi kami.
        </li>
        <li>
          Mengambil, menyalin, atau menyebarkan ulang gambar, suara, teks soal, dan program dari
          layanan ini.
        </li>
        <li>
          Mencoba menembus pembatasan akses, menebak kode orang lain, atau mengganggu jalannya
          layanan.
        </li>
      </ul>
      <p>
        Kalau ketentuan ini dilanggar secara jelas dan berulang, kami dapat menghentikan akses
        akun tersebut. Untuk pelanggaran yang tampak seperti kekeliruan, kami akan menghubungi
        Anda lebih dulu.
      </p>

      <h2>6. Hak atas karya</h2>
      <p>
        Seluruh gambar, narasi suara, soal, dan program dalam layanan ini adalah milik kami dan
        dilindungi hak cipta. Membeli akses tidak memindahkan hak itu kepada Anda.
      </p>

      <h2>7. Pembaruan dan konten baru</h2>
      <p>
        <strong>Perbaikan bug dan perbaikan kecil selalu gratis</strong> untuk kelompok yang sudah
        Anda beli. Kalau nanti kami menerbitkan paket konten besar yang baru, itu{' '}
        <strong>ekspansi terpisah</strong> yang dijual sendiri — Anda bebas memilih untuk tidak
        membelinya, dan yang sudah Anda beli tetap bisa dimainkan.
      </p>
      <p>
        Harga dan potongan harga perkenalan dapat berubah kapan saja. Perubahan harga{' '}
        <strong>tidak berlaku mundur</strong>: yang sudah Anda bayar tidak akan ditagih tambahan,
        dan tidak ada pengembalian selisih kalau nanti harganya turun.
      </p>

      <h2>8. Kebijakan Pengembalian Dana (Refund)</h2>
      <p>
        Produk ini adalah <strong>kode akses digital yang dikirim seketika</strong>. Karena kode
        langsung bisa dipakai, pengembalian dana diatur seperti berikut:
      </p>

      <h3>Dana dikembalikan penuh apabila:</h3>
      <ul>
        <li>
          <strong>Kode belum pernah ditukar</strong> dan Anda mengajukan dalam{' '}
          <strong>7 hari</strong> sejak pembelian. Kode itu kami batalkan, lalu dana
          dikembalikan.
        </li>
        <li>
          <strong>Kode tidak bisa dipakai</strong> karena kesalahan di pihak kami, dan kami tidak
          berhasil memperbaikinya.
        </li>
        <li>
          <strong>Anda membayar dua kali</strong> untuk kelompok yang sama, atau terkirim kode
          ganda.
        </li>
        <li>
          Ada <strong>gangguan teknis dari pihak kami</strong> yang membuat permainan tidak bisa
          dimainkan sama sekali dan tidak selesai dalam waktu wajar setelah Anda melaporkannya.
        </li>
      </ul>

      <h3>Dana tidak dapat dikembalikan apabila:</h3>
      <ul>
        <li>
          <strong>Kode sudah ditukar dan permainannya sudah terbuka</strong>, lalu Anda berubah
          pikiran. Akses digital tidak bisa “dikembalikan” seperti barang.
        </li>
        <li>
          Anda membeli kelompok yang <strong>tidak sesuai umur anak</strong> padahal umur dan isi
          tiap kelompok sudah tertulis di halaman penjualan. Silakan mencoba permainan gratisnya
          lebih dulu — itu memang disediakan untuk ini.
        </li>
        <li>
          Kendalanya di perangkat atau koneksi Anda (HP tidak mendukung, internet tidak stabil,
          memori penuh). Kami tetap akan membantu mencari jalan keluarnya.
        </li>
        <li>
          Anda kehilangan akses karena membagikan akun atau kode ke luar keluarga (lihat bagian
          5).
        </li>
      </ul>

      <h3>Cara mengajukan</h3>
      <p>
        Hubungi kami lewat WhatsApp atau email dengan menyertakan{' '}
        <strong>bukti pembelian</strong> (tangkapan layar pesanan atau nomor pesanan dari
        Lynk.id / Mayar.id) dan alasan singkatnya. Kami balas paling lama{' '}
        <strong>7 hari kerja</strong>. Kalau disetujui, dana dikembalikan lewat jalur yang sama
        dengan pembayaran Anda; waktu pengembalian mengikuti platform pembayaran yang dipakai.
      </p>
      <p>
        Platform penjualan (Lynk.id / Mayar.id) juga punya kebijakannya sendiri. Kalau
        kebijakan mereka lebih menguntungkan Anda pada suatu kasus, yang berlaku adalah yang
        lebih menguntungkan Anda. Ketentuan ini juga tidak mengurangi hak Anda sebagai konsumen
        menurut <strong>UU No. 8 Tahun 1999 tentang Perlindungan Konsumen</strong>.
      </p>

      <h2>9. Ketersediaan layanan</h2>
      <p>
        Layanan ini berjalan di browser dan dibuat oleh satu orang. Kami berusaha menjaganya
        tetap hidup, tetapi tidak bisa menjanjikan layanan bebas gangguan sepanjang waktu.
        Permainan gratis dan permainan yang sudah terbuka umumnya berjalan tanpa perlu online
        terus, tetapi <strong>mendaftar, masuk akun, dan menukar kode membutuhkan
        internet</strong>.
      </p>
      <p>
        Kalau suatu saat layanan ini harus dihentikan, kami akan memberi tahu lewat pengumuman di
        dalam aplikasi <strong>sekurang-kurangnya 30 hari sebelumnya</strong>, dan
        membicarakan jalan keluar yang adil bagi pembeli yang baru saja membayar.
      </p>

      <h2>10. Batas tanggung jawab</h2>
      <p>
        Layanan ini disediakan sebagaimana adanya untuk keperluan belajar sambil bermain. Kami
        bertanggung jawab atas hal-hal yang memang berada dalam kendali kami — dan sebesar-besarnya
        sejumlah yang Anda bayarkan untuk kelompok yang bersangkutan. Kami tidak bertanggung
        jawab atas kerugian yang timbul dari hal di luar kendali kami, seperti kerusakan
        perangkat, gangguan jaringan, atau pemakaian di luar ketentuan ini. Ketentuan ini tidak
        menghapus tanggung jawab yang menurut hukum tidak boleh dihapus.
      </p>

      <h2>11. Hukum yang berlaku</h2>
      <p>
        Ketentuan ini tunduk pada hukum Republik Indonesia. Kalau ada perselisihan, kami minta
        Anda menghubungi kami lebih dulu — hampir semua hal bisa diselesaikan lewat percakapan.
      </p>

      <h2>12. Perubahan ketentuan</h2>
      <p>
        Ketentuan ini dapat diperbarui; tanggal “berlaku sejak” di atas ikut berubah. Perubahan
        yang penting kami sampaikan lewat pengumuman di dalam aplikasi. Akses yang sudah Anda
        beli tidak akan dicabut oleh perubahan ketentuan.
      </p>
    </LegalPage>
  );
}
