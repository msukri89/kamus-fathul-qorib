# V2 Prototype — Catatan Uji Thaharah

Dataset `data-v2-thaharah-test.json` dibuat untuk menguji prinsip referensi lafaz.

## Yang diuji

1. `ماء` muncul berkali-kali tetapi data sharaf leksikal hanya satu kali pada `LEX_MA_001`.
2. Setiap kemunculan `ماء` tetap boleh memiliki fungsi nahwu dan catatan konteks yang berbeda.
3. Lafaz turunan seperti `مُطَهِّر`, `مُشَمَّس`, dan `مُسْتَعْمَل` memiliki data sharaf sendiri karena bentuk derivatifnya memang membawa informasi morfologis penting.
4. Istilah fiqih khusus seperti `الماء المطلق` belum dipaksa menjadi analisis sharaf baru; statusnya dicatat sebagai kebutuhan lexeme istilah pada tahap berikutnya.
5. Referensi tidak hanya berbunyi `lihat Bab Thaharah`, tetapi menunjuk ke `lexeme_id` sehingga nantinya UI dapat membuka analisis asal secara langsung.

## Prinsip yang dipertahankan

- Sharaf disimpan terpusat pada lexeme.
- Nahwu disimpan per kemunculan.
- Makna fiqih/konteks disimpan per penggunaan bila memang berbeda.
- Tidak mengulang analisis hanya karena lafaz muncul lagi.
- Tidak memaksakan analisis yang belum terverifikasi.

## Status

Prototype test saja. Belum dihubungkan ke aplikasi utama dan belum menggantikan `data-bab*.json`.
