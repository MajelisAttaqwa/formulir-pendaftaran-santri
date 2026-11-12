/* ==========================================================
   script.js — Formulir Pendaftaran Santri At-Taqwa
   Mengirim data ke Google Apps Script (Web App) → Google Sheet
   ========================================================== */

// ⚠️ GANTI dengan URL Web App dari Apps Script (berakhiran /exec)
const APPS_SCRIPT_URL = '   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/GANTI_DENGAN_ID_DEPLOYMENT/exec';';

const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli',
               'Agustus','September','Oktober','November','Desember'];

const form     = document.getElementById('formDaftar');
const btnKirim = document.getElementById('btnKirim');
const modal    = document.getElementById('modal');
const modalNo  = document.getElementById('modalNo');
const btnTutup = document.getElementById('btnTutup');

/* ---------- Isi pilihan tanggal lahir ---------- */
function isiPilihanTanggal() {
  const hari = document.getElementById('tglHari');
  const bulan = document.getElementById('tglBulan');
  const tahun = document.getElementById('tglTahun');

  hari.innerHTML  = '<option value="">Tgl</option>' +
    Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');

  bulan.innerHTML = '<option value="">Bulan</option>' +
    BULAN.map((b, i) => `<option value="${i + 1}">${b}</option>`).join('');

  const thisYear = new Date().getFullYear();
  tahun.innerHTML = '<option value="">Tahun</option>' +
    Array.from({ length: thisYear - 1950 + 1 }, (_, i) => thisYear - i)
      .map(y => `<option value="${y}">${y}</option>`).join('');
}
isiPilihanTanggal();

/* ---------- Validasi nomor WhatsApp ---------- */
function normalisasiWa(raw) {
  return String(raw || '').replace(/[\s\-()]/g, '');
}
function nomorValid(no) {
  return /^(\+?62|0)\d{8,13}$/.test(no);
}

/* ---------- Kirim formulir ---------- */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;

  const v = id => document.getElementById(id).value.trim();

  const noWa = normalisasiWa(v('noWa'));
  if (!nomorValid(noWa)) {
    alert('Nomor WhatsApp belum valid. Contoh: 081234567890');
    return;
  }

  const tanggalLahir = `${v('tglTahun')}-${String(v('tglBulan')).padStart(2, '0')}-${String(v('tglHari')).padStart(2, '0')}`;

  const payload = {
    namaLengkap:     v('namaLengkap'),
    namaPanggilan:   v('namaPanggilan'),
    tempatLahir:     v('tempatLahir'),
    tanggalLahir,
    jenisKelamin:    v('jenisKelamin'),
    alamat:          v('alamat'),
    pendidikan:      v('pendidikan'),
    namaAyah:        v('namaAyah'),
    namaIbu:         v('namaIbu'),
    pekerjaanAyah:   v('pekerjaanAyah'),
    pekerjaanIbu:    v('pekerjaanIbu'),
    noWa
  };

  btnKirim.disabled = true;
  btnKirim.textContent = 'Mengirim…';

  try {
    // text/plain menghindari preflight CORS; Apps Script tetap membaca JSON di doPost
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    if (json.status !== 'success') throw new Error(json.message || 'Terjadi kesalahan');

    modalNo.textContent = 'No. Pendaftaran: ' + json.noDaftar;
    modal.classList.remove('hidden');
    form.reset();
    isiPilihanTanggal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    alert('Maaf, pengiriman gagal. Silakan coba lagi.\n\nDetail: ' + err.message);
  } finally {
    btnKirim.disabled = false;
    btnKirim.textContent = 'Kirim Pendaftaran';
  }
});

/* ---------- Tutup konfirmasi ---------- */
btnTutup.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
